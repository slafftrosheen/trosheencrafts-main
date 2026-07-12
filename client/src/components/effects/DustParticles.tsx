import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface DustParticlesProps {
  density?: number;
  color?: string;
  interactive?: boolean;
}

export function DustParticles({
  density = 50,
  color = 'rgba(139, 115, 85, 0.3)',
  interactive = false
}: DustParticlesProps) {
  // DISABLE ON MOBILE FOR PERFORMANCE
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) return null; // Don't render on mobile

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to create a particle
    const createParticle = (x?: number, y?: number): Particle => {
      return {
        x: x ?? Math.random() * canvas.width,
        y: y ?? Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: Math.random() * 200 + 100,
      };
    };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
          canvas.width = rect.width;
          canvas.height = rect.height;
      } else {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < density; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Create dust particles around cursor occasionally
      if (interactive && Math.random() > 0.9) {
         particlesRef.current.push(createParticle(mouseRef.current.x, mouseRef.current.y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      // Filter out dead particles and update living ones
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life++;

        // Interactive: particles avoid mouse
        if (interactive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            particle.x -= Math.cos(angle) * 2;
            particle.y -= Math.sin(angle) * 2;
          }
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
        }

        // Fade out based on life
        const lifeFraction = particle.life / particle.maxLife;
        const currentOpacity = Math.max(0, particle.opacity * (1 - lifeFraction));

        // Draw particle
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Keep particle if still alive
        return particle.life < particle.maxLife;
      });

      // Maintain particle count
      while (particlesRef.current.length < density) {
        particlesRef.current.push(createParticle());
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [density, color, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
