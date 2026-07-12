import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for scroll/resize events
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) return;

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

/**
 * Performance-aware animation config
 */
export function useAnimationConfig() {
  const reduceMotion = useReducedMotion();

  return useMemo(() => ({
    initial: reduceMotion ? {} : { opacity: 0, y: 20 },
    animate: reduceMotion ? {} : { opacity: 1, y: 0 },
    transition: reduceMotion ? {} : { duration: 0.5 },
  }), [reduceMotion]);
}

/**
 * Lazy component loader
 */
export function useLazyComponent<T>(
  importFunc: () => Promise<{ default: T }>,
  delay: number = 100
) {
  const [Component, setComponent] = React.useState<T | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      importFunc().then(module => setComponent(() => module.default));
    }, delay);

    return () => clearTimeout(timer);
  }, [importFunc, delay]);

  return Component;
}
