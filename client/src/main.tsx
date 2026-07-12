import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useLocation } from 'wouter';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { initWebVitals, trackPageView } from './lib/analytics';

if (import.meta.env.PROD) {
  initWebVitals();
}

function Root() {
  const [location] = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);