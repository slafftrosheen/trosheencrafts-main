import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Navigation } from './Navigation';
import { MobileNavigation } from './MobileNavigation';
import { Footer } from './Footer';
import { NetworkStatus } from './NetworkStatus';
import { ParticleSystem } from '@/components/effects/ParticleSystem';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = location.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Optimized particle dust effect */}
      <ParticleSystem 
        particleCount={isMobile ? 15 : 25} 
        baseColor="#D4A574"
        zIndex={1}
      />
      
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <main 
        className={cn(
          "flex-1 w-full relative z-10",
          isMobile && "pb-16"
        )}
      >
        {children}
      </main>

      <Footer />
      <NetworkStatus />
    </div>
  );
}