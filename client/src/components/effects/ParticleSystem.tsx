import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'float' | 'burst';
  color: string;
}

interface ParticleSystemProps {
  /** Number of floating particles */
  particleCount?: number;
  /** Base color for particles (hex) */
  baseColor?: string;
  /** Enable floating dust */
  enableFloating?: boolean;
  /** Z-index for the canvas */
  zIndex?: number;
}

// Global event emitter for burst effects
type BurstCallback = (x: number, y: number, count?: number) => void;
let globalBurstCallback: BurstCallback | null = null;

export function triggerParticleBurst(x: number, y: number, count: number = 15) {
  if (globalBurstCallback) {
    globalBurstCallback(x, y, count);
  }
}

// Hook for easy button integration
export function useParticleBurst() {
  return useCallback((event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    triggerParticleBurst(x, y, 20);
  }, []);
}

export function ParticleSystem({
  particleCount = 30,
  baseColor = '#D4A574', // Warm accent color matching theme
  enableFloating = true,
  zIndex = 1,
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const reduceMotion = useReducedMotion();
  const initializedRef = useRef(false);

  // Parse base color to RGB
  const parseColor = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 212, g: 165, b: 116 };
  }, []);

  const rgb = parseColor(baseColor);

  // Create a floating particle
  const createFloatingParticle = useCallback((width: number, height: number): Particle => {
    const variation = 30;
    const r = Math.min(255, Math.max(0, rgb.r + (Math.random() - 0.5) * variation));
    const g = Math.min(255, Math.max(0, rgb.g + (Math.random() - 0.5) * variation));
    const b = Math.min(255, Math.max(0, rgb.b + (Math.random() - 0.5) * variation));
    
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.3, // Gentle upward drift
      size: 1 + Math.random() * 2.5,
      opacity: 0.1 + Math.random() * 0.25,
      life: Math.random() * 1000,
      maxLife: 800 + Math.random() * 400,
      type: 'float',
      color: `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, `,
    };
  }, [rgb]);

  // Create burst particles
  const createBurstParticle = useCallback((x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    const variation = 40;
    const r = Math.min(255, Math.max(0, rgb.r + (Math.random() - 0.5) * variation));
    const g = Math.min(255, Math.max(0, rgb.g + (Math.random() - 0.5) * variation));
    const b = Math.min(255, Math.max(0, rgb.b + (Math.random() - 0.5) * variation));
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Bias upward
      size: 2 + Math.random() * 4,
      opacity: 0.6 + Math.random() * 0.4,
      life: 0,
      maxLife: 60 + Math.random() * 40,
      type: 'burst',
      color: `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, `,
    };
  }, [rgb]);

  // Register burst callback
  const handleBurst = useCallback((x: number, y: number, count: number = 15) => {
    if (reduceMotion) return;
    
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createBurstParticle(x, y + window.scrollY));
    }
  }, [createBurstParticle, reduceMotion]);

  // Register global burst callback
  useEffect(() => {
    globalBurstCallback = handleBurst;
    return () => {
      globalBurstCallback = null;
    };
  }, [handleBurst]);

  // Main effect for initialization and animation
  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Update dimensions
    const updateDimensions = () => {
      dimensionsRef.current = {
        width: window.innerWidth,
        height: Math.max(document.documentElement.scrollHeight, window.innerHeight),
      };
      canvas.width = dimensionsRef.current.width;
      canvas.height = dimensionsRef.current.height;
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Initialize floating particles only once
    if (!initializedRef.current && enableFloating) {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createFloatingParticle(dimensionsRef.current.width, dimensionsRef.current.height));
      }
      initializedRef.current = true;
    }

    let lastTime = performance.now();
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(animate);

      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      lastTime = currentTime - (deltaTime % frameInterval);

      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      const scrollY = window.scrollY;
      const viewportTop = scrollY;
      const viewportBottom = scrollY + window.innerHeight;

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life++;

        if (particle.type === 'float') {
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Wrap around screen
          if (particle.x < 0) particle.x = width;
          if (particle.x > width) particle.x = 0;
          if (particle.y < 0) particle.y = height;
          if (particle.y > height) {
            particle.y = 0;
            particle.x = Math.random() * width;
          }

          // Subtle oscillation
          particle.vx += (Math.random() - 0.5) * 0.02;
          particle.vx = Math.max(-0.5, Math.min(0.5, particle.vx));

          // Only draw if in or near viewport
          const isVisible = particle.y > viewportTop - 100 && particle.y < viewportBottom + 100;
          if (isVisible) {
            const pulseFactor = 0.8 + 0.2 * Math.sin(particle.life * 0.02);
            const finalOpacity = particle.opacity * pulseFactor;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color + finalOpacity + ')';
            ctx.fill();
          }

          return true;
        } else {
          // Burst particles
          particle.vy += 0.15;
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          particle.x += particle.vx;
          particle.y += particle.vy;

          const lifeRatio = particle.life / particle.maxLife;
          const fadeOpacity = particle.opacity * (1 - lifeRatio);
          const shrinkSize = particle.size * (1 - lifeRatio * 0.5);

          if (particle.life < particle.maxLife) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, shrinkSize, 0, Math.PI * 2);
            ctx.fillStyle = particle.color + fadeOpacity + ')';
            ctx.fill();
            return true;
          }
          return false;
        }
      });

      // Maintain floating particle count
      if (enableFloating) {
        const floatingCount = particlesRef.current.filter(p => p.type === 'float').length;
        const needed = particleCount - floatingCount;
        for (let i = 0; i < Math.min(needed, 2); i++) {
          particlesRef.current.push(createFloatingParticle(width, height));
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, createFloatingParticle, reduceMotion, enableFloating]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
}

export default ParticleSystem;
