import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { haptics } from '@/lib/haptics';

interface NewsletterSubscribeProps {
  variant?: 'default' | 'compact' | 'hero' | 'footer';
  className?: string;
  source?: string;
}

export function NewsletterSubscribe({ 
  variant = 'default', 
  className,
  source = 'website'
}: NewsletterSubscribeProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    marketing: true,
    productUpdates: true,
    blogUpdates: true,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      haptics.playError();
      return;
    }

    setStatus('loading');
    haptics.playInteraction('tap');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': await fetch('/api/csrf-token').then(r => r.json()).then(d => d.csrfToken).catch(() => '') 
        },
        body: JSON.stringify({ email, source, preferences }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        haptics.playSuccess();
        
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.message);
        haptics.playError();
      }
    } catch (error) {
      setStatus('error');
      setMessage('Unable to subscribe. Please try again later.');
      haptics.playError();
    }
  };

  // Compact variant for sidebar/footer
  if (variant === 'compact') {
    return (
      <div className={cn('w-full', className)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t('newsletter.email_placeholder') || 'your@email.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full h-11 rounded-xl font-bold"
            particles
            particleCount={12}
          >
            {status === 'loading' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('newsletter.subscribed') || 'Subscribed!'}
              </>
            ) : (
              <>
                {t('newsletter.subscribe_button') || 'Subscribe'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'text-xs mt-2 flex items-center gap-1.5',
                status === 'error' ? 'text-destructive' : 'text-primary'
              )}
            >
              {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
              {status === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Hero variant - large, eye-catching
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          'relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-2 border-primary/20 p-8 sm:p-12 md:p-16',
          className
        )}
      >
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 blur-[100px] rounded-full"
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-4 h-4" />
            {t('newsletter.exclusive_updates') || 'Exclusive Updates'}
          </motion.div>

          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t('newsletter.hero_title') || 'Stay in the Loop'}
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8 leading-relaxed">
            {t('newsletter.hero_subtitle') || 
              'Get early access to new collections, workshop stories, and exclusive family craft insights.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t('newsletter.email_placeholder') || 'your@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                className="pl-12 h-14 rounded-full text-base border-2 bg-background/50 backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              size="lg"
              className="h-14 px-8 rounded-full font-black uppercase tracking-wider shadow-xl shadow-primary/30"
              particles
              particleCount={20}
            >
              {status === 'loading' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {t('newsletter.subscribed') || 'Subscribed!'}
                </>
              ) : (
                <>
                  {t('newsletter.join_button') || 'Join Now'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'text-sm mt-4 flex items-center justify-center gap-2 font-medium',
                  status === 'error' ? 'text-destructive' : 'text-primary'
                )}
              >
                {status === 'error' && <AlertCircle className="w-4 h-4" />}
                {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          {status === 'idle' && (
            <p className="text-xs text-muted-foreground mt-4">
              {t('newsletter.privacy_note') || 
                'We respect your privacy. Unsubscribe anytime.'}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder={t('newsletter.email_placeholder') || 'your@email.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            className="pl-12 h-12 rounded-xl text-base"
          />
        </div>

        {/* Preferences */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
              className="rounded border-primary/30 text-primary focus:ring-primary/30"
            />
            Marketing
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={preferences.productUpdates}
              onChange={(e) => setPreferences(prev => ({ ...prev, productUpdates: e.target.checked }))}
              className="rounded border-primary/30 text-primary focus:ring-primary/30"
            />
            New Arrivals
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={preferences.blogUpdates}
              onChange={(e) => setPreferences(prev => ({ ...prev, blogUpdates: e.target.checked }))}
              className="rounded border-primary/30 text-primary focus:ring-primary/30"
            />
            Workshop Stories
          </label>
        </div>

        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          size="lg"
          className="w-full h-12 rounded-xl font-bold"
          particles
          particleCount={15}
        >
          {status === 'loading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {t('newsletter.subscribed') || 'Subscribed!'}
            </>
          ) : (
            <>
              {t('newsletter.subscribe_button') || 'Subscribe'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'text-sm mt-3 flex items-center gap-2',
              status === 'error' ? 'text-destructive' : 'text-primary'
            )}
          >
            {status === 'error' && <AlertCircle className="w-4 h-4" />}
            {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
