import { toast } from 'sonner';

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  _retry?: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private csrfToken: string | null = null;
  private csrfPromise: Promise<string> | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    
    // Prevent multiple simultaneous token requests
    if (this.csrfPromise) return this.csrfPromise;

    this.csrfPromise = fetch(`${this.baseURL}/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        this.csrfToken = data.csrfToken;
        this.csrfPromise = null;
        return data.csrfToken;
      })
      .catch(() => {
        this.csrfPromise = null;
        return '';
      });

    return this.csrfPromise;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, timeout = this.defaultTimeout, ...fetchConfig } = config;

    // Build URL with query params
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Add CSRF token for mutation methods
    const method = fetchConfig.method?.toUpperCase() || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    } as Record<string, string>;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const token = await this.getCsrfToken();
      if (token) {
        headers['X-CSRF-Token'] = token;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
        headers,
        credentials: 'include', // Include cookies for session
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText || 'An error occurred',
        }));

        // Handle CSRF token errors
        if (response.status === 403 && !config._retry) {
          const isCsrfError = 
            errorData.code === 'EBADCSRFTOKEN' || 
            (typeof errorData.message === 'string' && errorData.message.toLowerCase().includes('csrf'));
          
          if (isCsrfError) {
            this.csrfToken = null;
            return this.request<T>(endpoint, { ...config, _retry: true });
          }
        }

        throw new ApiClientError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.errors
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new ApiClientError(
          'Request timeout. Please check your connection and try again.',
          408
        );
        toast.error(timeoutError.message);
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        const networkError = new ApiClientError(
          'Network error. Please check your internet connection.',
          0
        );
        toast.error(networkError.message);
        throw networkError;
      }

      // Handle API errors
      if (error instanceof ApiClientError) {
        // Don't show toast for 401/403 (handled by auth logic)
        if (error.statusCode !== 401 && error.statusCode !== 403) {
          toast.error(error.message);
        }
        throw error;
      }

      // Unknown error
      const unknownError = new ApiClientError('An unexpected error occurred', 500);
      toast.error(unknownError.message);
      throw unknownError;
    }
  }

  public get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  public post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Upload file with progress
  public async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    _retry: boolean = false
  ): Promise<{ url: string; key: string }> {
    const token = await this.getCsrfToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new ApiClientError('Invalid response format', xhr.status));
          }
        } else if (xhr.status === 403 && !_retry) {
          // CSRF failure? Clear token and retry once
          this.csrfToken = null;
          try {
            const retryResult = await this.uploadFile(endpoint, file, onProgress, true);
            resolve(retryResult);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new ApiClientError(`Upload failed: ${xhr.statusText}`, xhr.status));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new ApiClientError('Upload failed', 0));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiClientError('Upload cancelled', 0));
      });

      // Send request
      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.withCredentials = true;
      if (token) {
        xhr.setRequestHeader('X-CSRF-Token', token);
      }
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { RequestConfig };
