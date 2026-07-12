import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Simple privacy-friendly analytics
// Replace with your preferred service: Plausible, Fathom, Simple Analytics, etc.

export function Analytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view
    trackPageView(location);
  }, [location]);

  return null;
}

function trackPageView(path: string) {
  // Example: Plausible Analytics
  if (window.plausible) {
    window.plausible('pageview', { props: { path } });
  }

  // Example: Google Analytics 4
  const GA_ID = import.meta.env.VITE_GA_ID;
  if (GA_ID && window.gtag) {
    window.gtag('config', GA_ID, {
      page_path: path,
    });
  }

  // Example: Custom analytics
  // fetch('/api/analytics/pageview', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ path, timestamp: Date.now() }),
  // });
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (window.plausible) {
    window.plausible(eventName, { props: properties });
  }

  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

// Track e-commerce events
export function trackAddToCart(productId: string, productName: string, price: number) {
  trackEvent('add_to_cart', {
    product_id: productId,
    product_name: productName,
    price,
  });
}

export function trackPurchase(orderId: string, total: number, items: any[]) {
  trackEvent('purchase', {
    transaction_id: orderId,
    value: total,
    items,
  });
}

export function trackNewsletterSignup(email: string) {
  trackEvent('newsletter_signup', { email: email.split('@')[1] }); // Only domain for privacy
}

// TypeScript declarations
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    gtag?: (...args: any[]) => void;
  }
}
