// Monitor Core Web Vitals
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Report Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      if (isEntryTypeSupported('largest-contentful-paint')) {
        const lcpObserver = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1] as any;
              if (lastEntry) {
                reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
              }
            }
          } catch (err) {
            console.warn('[Performance] Error reporting LCP:', err);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    } catch (e) {
      console.warn('[Performance] LCP observation failed:', e);
    }

    try {
      // First Input Delay (FID)
      if (isEntryTypeSupported('first-input')) {
        const fidObserver = new PerformanceObserver((list) => {
          try {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry) {
                reportMetric('FID', entry.processingStart - entry.startTime);
              }
            });
          } catch (err) {
             console.warn('[Performance] Error reporting FID:', err);
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      }
    } catch (e) {
      console.warn('[Performance] FID observation failed:', e);
    }

    try {
      // Cumulative Layout Shift (CLS)
      if (isEntryTypeSupported('layout-shift')) {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          try {
            for (const entry of list.getEntries() as any[]) {
              if (entry && !entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
            reportMetric('CLS', clsScore);
          } catch (err) {
             console.warn('[Performance] Error reporting CLS:', err);
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }
    } catch (e) {
      console.warn('[Performance] CLS observation failed:', e);
    }
  }

  // Track page load time
  window.addEventListener('load', () => {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const loadTime = navEntries[0].loadEventEnd - navEntries[0].fetchStart;
      reportMetric('PageLoad', loadTime);
    }
  });

  // Track Time to Interactive (TTI)
  if ('PerformanceObserver' in window) {
    try {
      if (isEntryTypeSupported('paint')) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              reportMetric('FCP', entry.startTime);
            }
          }
        });
        observer.observe({ type: 'paint', buffered: true });
      }
    } catch (e) {
      console.warn('[Performance] FCP observation failed:', e);
    }
  }
}

function isEntryTypeSupported(type: string): boolean {
  if (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes
  ) {
    return PerformanceObserver.supportedEntryTypes.includes(type);
  }
  // If supportedEntryTypes is not available, we assume true but rely on try-catch
  return true;
}

function reportMetric(metric: string, value: number) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric}:`, value);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to your analytics service
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ metric, value, timestamp: Date.now() }),
    // });

    // Or use analytics library
    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric,
        value: Math.round(value),
        non_interaction: true,
      });
    }
  }

  // Thresholds (Core Web Vitals)
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
  };

  const threshold = thresholds[metric as keyof typeof thresholds];
  if (threshold) {
    const rating = value <= threshold.good ? 'good' : value <= threshold.poor ? 'needs-improvement' : 'poor';
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric} rating:`, rating);
    }
  }
}

// Monitor long tasks
export function monitorLongTasks() {
  if ('PerformanceObserver' in window) {
    try {
      if (isEntryTypeSupported('longtask')) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
        observer.observe({ type: 'longtask', buffered: true });
      }
    } catch (e) {
      console.warn('[Performance] Long task monitoring failed:', e);
    }
  }
}

// Check if page was loaded from cache
export function checkCacheStatus() {
  if (typeof performance === 'undefined') return;

  const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (perfEntries.length > 0) {
    const navTiming = perfEntries[0];
    const cacheStatus = navTiming.transferSize === 0 ? 'cache' : 'network';
    console.log('[Performance] Page loaded from:', cacheStatus);
    return cacheStatus;
  }
}
