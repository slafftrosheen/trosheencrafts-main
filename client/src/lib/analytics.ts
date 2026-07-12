import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${metric.name}:`, metric.value);
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

export function trackPageView(path: string) {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Page View: ${path}`);
  }
}