import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we've already shown the preloader in this session
    const hasPreloaded = sessionStorage.getItem('trosheen_preloaded');
    if (hasPreloaded) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('trosheen_preloaded', 'true');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center pointer-events-none"
        >
          <div className="absolute inset-0 opacity-10 noise" />
          
          <div className="relative flex flex-col items-center">
            {/* Minimal line drawing of a candle/flame silhouette */}
            <motion.svg
              width="64"
              height="80"
              viewBox="0 0 64 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-8"
            >
              <motion.path
                d="M32 5C32 5 22 20 22 35C22 45 32 55 32 55C32 55 42 45 42 35C42 20 32 5 32 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="text-primary"
              />
              <motion.path
                d="M16 45V75M48 45V75M16 75H48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                className="text-foreground/80"
              />
            </motion.svg>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="overflow-hidden"
            >
              <motion.div
                className="font-serif text-2xl tracking-widest uppercase font-bold text-foreground"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Trosheen Crafts
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
