import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useLocation } from 'wouter';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
// Trosheen v4.3 design system (ported from Trosheen-Website-Kit-v4.3).
// Imported after Tailwind so the kit's component classes win over utilities.
import './styles/trosheen-v4.css';
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