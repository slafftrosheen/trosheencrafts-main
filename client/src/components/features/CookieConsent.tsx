import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

type ConsentStatus = 'necessary' | 'analytics' | 'all';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<{
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  }>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
      // Show banner after 1 second
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = { necessary: true, analytics: true, marketing: true };
    saveConsent(allConsent);
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = { necessary: true, analytics: false, marketing: false };
    saveConsent(necessaryOnly);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    setIsVisible(false);
  };

  const saveConsent = (consentData: typeof consent) => {
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));

    // Initialize analytics based on consent
    if (consentData.analytics) {
      initializeAnalytics();
    }

    // Initialize marketing scripts based on consent
    if (consentData.marketing) {
      initializeMarketing();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] pointer-events-none"
          />

          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100]"
          >
            <div className="bg-background border-2 border-border rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 pb-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Cookie className="text-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold mb-2">
                    We use cookies 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content.
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Details Panel */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                        <div>
                          <p className="font-semibold text-sm">Necessary</p>
                          <p className="text-xs text-muted-foreground">Required for site functionality</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="w-5 h-5"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors">
                        <div>
                          <p className="font-semibold text-sm">Analytics</p>
                          <p className="text-xs text-muted-foreground">Help us improve the site</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={consent.analytics}
                          onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors">
                        <div>
                          <p className="font-semibold text-sm">Marketing</p>
                          <p className="text-xs text-muted-foreground">Personalized ads and content</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={consent.marketing}
                          onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                          className="w-5 h-5"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="p-6 pt-2 space-y-2">
                {showDetails ? (
                  <>
                    <Button
                      onClick={handleSavePreferences}
                      className="w-full rounded-2xl font-bold"
                      size="lg"
                    >
                      Save Preferences
                    </Button>
                    <Button
                      onClick={() => setShowDetails(false)}
                      variant="ghost"
                      className="w-full rounded-2xl"
                    >
                      Close
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleAcceptAll}
                      className="w-full rounded-2xl font-bold"
                      size="lg"
                    >
                      Accept All
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAcceptNecessary}
                        variant="outline"
                        className="flex-1 rounded-2xl"
                      >
                        Necessary Only
                      </Button>
                      <Button
                        onClick={() => setShowDetails(true)}
                        variant="outline"
                        className="flex-1 rounded-2xl gap-2"
                      >
                        <Settings size={16} />
                        Customize
                      </Button>
                    </div>
                  </>
                )}

                <p className="text-xs text-center text-muted-foreground pt-2">
                  Read our{' '}
                  <Link href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link href="/cookies" className="underline hover:text-foreground">
                    Cookie Policy
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function initializeAnalytics() {
  // Initialize analytics scripts here
  console.log('Analytics initialized');

  // Example: Load Plausible
  // const script = document.createElement('script');
  // script.defer = true;
  // script.src = 'https://plausible.io/js/script.js';
  // script.setAttribute('data-domain', 'trosheen.shop');
  // document.head.appendChild(script);
}

function initializeMarketing() {
  // Initialize marketing scripts here
  console.log('Marketing initialized');
}
