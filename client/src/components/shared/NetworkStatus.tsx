import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Alert
        variant={isOnline ? 'default' : 'destructive'}
        className={cn(
          'border-2',
          isOnline && 'border-green-500 bg-green-50 dark:bg-green-950'
        )}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {isOnline
            ? 'Connection restored'
            : 'No internet connection. Please check your network.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
