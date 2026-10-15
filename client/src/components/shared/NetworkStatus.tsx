import { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/lib/LanguageContext";

export function NetworkStatus() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [showAlert, setShowAlert] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
    const handleOnline = () => {
      clear();
      setIsOnline(true);
      setShowAlert(true);
      timer.current = setTimeout(() => setShowAlert(false), 3000);
    };
    const handleOffline = () => {
      clear();
      setIsOnline(false);
      setShowAlert(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    handleOfflineIfNeeded();
    function handleOfflineIfNeeded() {
      if (!navigator.onLine) handleOffline();
    }
    return () => {
      clear();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-sm sm:left-auto sm:right-6">
      <Alert variant={isOnline ? "default" : "destructive"} className="border border-border bg-card text-foreground shadow-lg">
        {isOnline ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
        <AlertDescription>
          {isOnline ? t("network.restored") : t("network.offline")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
