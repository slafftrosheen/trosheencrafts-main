import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error details
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = window.location.pathname.startsWith('/admin') ? '/admin' : '/';
  };

  public render() {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const copy = isAdmin
      ? {
          multipleTitle: 'Обнаружено несколько ошибок',
          multipleDescription: 'В приложении произошло несколько ошибок. Перезагрузите страницу.',
          persistentDescription: 'Если проблема повторяется, очистите кэш браузера или обратитесь к администратору.',
          reload: 'Перезагрузить страницу',
          home: 'В админ-панель',
          errorTitle: 'Произошла ошибка',
          errorDescription: 'Возникла непредвиденная ошибка. Попробуйте ещё раз или вернитесь в админ-панель.',
          details: 'Подробности ошибки (только для разработки)',
          retry: 'Попробовать снова',
        }
      : {
          multipleTitle: 'Multiple Errors Detected',
          multipleDescription: 'The application has encountered multiple errors. Please reload the page.',
          persistentDescription: 'If this problem persists, please clear your browser cache or contact support.',
          reload: 'Reload Page',
          home: 'Go Home',
          errorTitle: 'Something Went Wrong',
          errorDescription: 'An unexpected error occurred. You can try again or return to the home page.',
          details: 'Error Details (Development Only)',
          retry: 'Try Again',
        };

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Too many errors - suggest page reload
      if (this.state.errorCount >= 3) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-lg w-full border-2 border-destructive/20 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3 text-destructive mb-2">
                  <AlertTriangle className="h-8 w-8" />
                  <CardTitle className="text-2xl font-serif">{copy.multipleTitle}</CardTitle>
                </div>
                <CardDescription>
                  {copy.multipleDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {copy.persistentDescription}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={this.handleReload} className="flex-1 rounded-xl font-bold">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {copy.reload}
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1 rounded-xl font-bold">
                  <Home className="mr-2 h-4 w-4" />
                  {copy.home}
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full border-2 border-destructive/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 text-destructive mb-2">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle className="font-serif text-xl">{copy.errorTitle}</CardTitle>
              </div>
              <CardDescription>
                {copy.errorDescription}
              </CardDescription>
            </CardHeader>

            {import.meta.env.DEV && this.state.error && (
              <CardContent>
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold mb-2">
                    {copy.details}
                  </summary>
                  <div className="p-3 bg-muted rounded-md overflow-auto border">
                    <p className="font-mono text-xs text-destructive mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </CardContent>
            )}

            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} className="flex-1 rounded-xl font-bold">
                {copy.retry}
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1 rounded-xl font-bold">
                <Home className="mr-2 h-4 w-4" />
                {copy.home}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const handleError = (error: Error) => {
    throw error; // Will be caught by nearest ErrorBoundary
  };

  return handleError;
}