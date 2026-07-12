import { useState, FormEvent } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

export function NewsletterSignup() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');

    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      setStatus('success');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 lg:p-10 border-2 border-primary/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
          <Mail className="text-primary" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-2xl lg:text-3xl font-bold mb-2">
            Workshop Notes
          </h3>
          <p className="text-muted-foreground">
            Monthly updates from our studio. Stories about craft, materials, and the slow-making process.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20"
          >
            <CheckCircle size={24} className="shrink-0" />
            <div>
              <p className="font-semibold">Thank you for subscribing!</p>
              <p className="text-sm opacity-80">Check your inbox for confirmation.</p>
            </div>
          </motion.div>
        ) : status === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 rounded-2xl text-destructive border border-destructive/20"
          >
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm opacity-80">{errorMessage}</p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="w-full px-5 py-3.5 rounded-2xl bg-background border-2 border-border focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-2xl px-8 font-bold whitespace-nowrap"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        No spam. Unsubscribe anytime.
        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        Typically 1 email per month.
      </p>
    </div>
  );
}
