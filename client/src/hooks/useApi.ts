import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/apiClient';
import { toast } from 'sonner';

// Products
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | Record<string, string>;
  price: number | string;
  image?: string;
  images?: string[];
  category?: string;
  stock?: number;
  inStock: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  nameTranslations?: Record<string, string>;
  metadata?: Record<string, any>;
  compareAtPrice?: number;
}

export function useProducts(options?: Partial<UseQueryOptions<Product[], ApiClientError>>) {
  return useQuery<Product[], ApiClientError>({
    queryKey: ['products'],
    queryFn: () => apiClient.get<Product[]>('/products'),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useProduct(id: number, options?: Partial<UseQueryOptions<Product, ApiClientError>>) {
  return useQuery<Product, ApiClientError>({
    queryKey: ['products', id],
    queryFn: () => apiClient.get<Product>(`/products/${id}`),
    enabled: !!id,
    ...options,
  });
}

// Orders
export interface Order {
  id: number;
  userId?: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useOrder(id: string, options?: Partial<UseQueryOptions<Order, ApiClientError>>) {
  return useQuery<Order, ApiClientError>({
    queryKey: ['orders', id],
    queryFn: () => apiClient.get<Order>(`/orders/${id}`),
    enabled: !!id,
    ...options,
  });
}

export interface CreateOrderInput {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: Order['shippingAddress'];
  paymentMethodId?: string;
}

export function useCreateOrder(
  options?: UseMutationOptions<Order, ApiClientError, CreateOrderInput>
) {
  const queryClient = useQueryClient();

  return useMutation<Order, ApiClientError, CreateOrderInput>({
    mutationFn: (data) => apiClient.post<Order>('/orders', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    ...options,
  });
}

// Blog Posts
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function useBlogPosts(options?: Partial<UseQueryOptions<BlogPost[], ApiClientError>>) {
  return useQuery<BlogPost[], ApiClientError>({
    queryKey: ['blog-posts'],
    queryFn: () => apiClient.get<BlogPost[]>('/blog'),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useBlogPost(id: string, options?: Partial<UseQueryOptions<BlogPost, ApiClientError>>) {
  return useQuery<BlogPost, ApiClientError>({
    queryKey: ['blog-posts', id],
    queryFn: () => apiClient.get<BlogPost>(`/blog/${id}`),
    enabled: !!id,
    ...options,
  });
}

// Contact Form
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function useContactForm(
  options?: UseMutationOptions<{ success: boolean }, ApiClientError, ContactFormData>
) {
  return useMutation<{ success: boolean }, ApiClientError, ContactFormData>({
    mutationFn: (data) => apiClient.post('/contact', data),
    onSuccess: () => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
    },
    ...options,
  });
}

// Auth
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export function useCurrentUser(options?: Partial<UseQueryOptions<User | null, ApiClientError>>) {
  return useQuery<User | null, ApiClientError>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await apiClient.get<User>('/auth/me');
      } catch (error: any) {
        // Log error for debugging but handle gracefully
        if (error?.status !== 401 && error?.status !== 404) {
          console.error('Failed to fetch current user:', error);
        }
        
        // Only return null for authentication-related errors
        if (error?.status === 401 || error?.status === 404) {
          return null;
        }
        
        // Re-throw other errors so React Query can retry
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export function useLogin(
  options?: UseMutationOptions<{ user: User }, ApiClientError, LoginCredentials>
) {
  const queryClient = useQueryClient();

  return useMutation<{ user: User }, ApiClientError, LoginCredentials>({
    mutationFn: (credentials) => apiClient.post<{ user: User }>('/auth/login', credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Logged in successfully!');
    },
    ...options,
  });
}

export function useLogout(
  options?: UseMutationOptions<void, ApiClientError, void>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiClientError, void>({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    ...options,
  });
}
