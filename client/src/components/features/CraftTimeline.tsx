import { useRef, useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Users, Award, Sparkles } from 'lucide-react';
import { TimelinePhotos } from '@/lib/imageAssets';
import { useLanguage } from '@/lib/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  imageUrl: string;
  icon: 'heritage' | 'milestone' | 'family' | 'achievement';
  color: string;
}

const ICON_MAP = {
  heritage: Calendar,
  milestone: Award,
  family: Users,
  achievement: Sparkles,
};

export function CraftTimeline() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeEvent, setActiveEvent] = useState(0);

  const TIMELINE_EVENTS: TimelineEvent[] = [
    {
      year: '1995',
      title: t('timeline.1995.title'),
      description: t('timeline.1995.desc'),
      imageUrl: TimelinePhotos.era1995,
      icon: 'heritage',
      color: '#8B7355',
    },
    {
      year: '2005',
      title: t('timeline.2005.title'),
      description: t('timeline.2005.desc'),
      imageUrl: TimelinePhotos.era2005,
      icon: 'milestone',
      color: '#A0826D',
    },
    {
      year: '2012',
      title: t('timeline.2012.title'),
      description: t('timeline.2012.desc'),
      imageUrl: TimelinePhotos.era2012,
      icon: 'family',
      color: '#D4AF37',
    },
    {
      year: '2015',
      title: t('timeline.2015.title'),
      description: t('timeline.2015.desc'),
      imageUrl: TimelinePhotos.era2015,
      icon: 'family',
      color: '#4A4238',
    },
    {
      year: '2019',
      title: t('timeline.2019.title'),
      description: t('timeline.2019.desc'),
      imageUrl: TimelinePhotos.era2019,
      icon: 'achievement',
      color: '#6B5D52',
    },
    {
      year: '2023',
      title: t('timeline.2023.title'),
      description: t('timeline.2023.desc'),
      imageUrl: TimelinePhotos.era2023,
      icon: 'milestone',
      color: '#8B7355',
    },
    {
      year: '2026',
      title: t('timeline.2026.title'),
      description: t('timeline.2026.desc'),
      imageUrl: TimelinePhotos.era2026,
      icon: 'achievement',
      color: '#D4AF37',
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      TIMELINE_EVENTS.forEach((_, index) => {
        ScrollTrigger.create({
          trigger: `.timeline-event-${index}`,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveEvent(index),
          onEnterBack: () => setActiveEvent(index),
        });
      });

      gsap.to('.timeline-line', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [TIMELINE_EVENTS.length]); // Updated dependency

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(139, 115, 85, ${Math.random() * 0.1})`;
        ctx.fill();
      }
    };

    drawPattern();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div ref={containerRef} className="relative py-32 bg-background overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ width: '100%', height: '100%' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 text-primary font-black uppercase text-xs tracking-widest mb-8">
              <Calendar size={16} />
              {t('timeline.tag')}
            </div>
            <h2 className="font-serif text-6xl md:text-8xl font-bold mb-8 tracking-tight">
              {t('timeline.title')}
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('timeline.description')}
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-border/40 overflow-hidden">
            <motion.div
              className="timeline-line w-full bg-gradient-to-b from-primary via-accent to-primary origin-top"
              style={{ scaleY: 0, height: '100%' }}
            />
          </div>

          <div className="space-y-32">
            {TIMELINE_EVENTS.map((event, index) => {
              const Icon = ICON_MAP[event.icon];
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={event.year}
                  className={`timeline-event-${index} relative grid lg:grid-cols-2 gap-16 items-center`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                >
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <div className="relative">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-background"
                        style={{ backgroundColor: event.color }}
                      >
                        <Icon size={32} className="text-white" />
                      </div>

                      {activeEvent === index && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-primary"
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${isLeft ? 'lg:text-right lg:pr-32' : 'lg:col-start-2 lg:pl-32'}`}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <span
                      className="inline-block text-8xl font-serif font-bold mb-4 opacity-40"
                      style={{ color: event.color }}
                    >
                      {event.year}
                    </span>
                    <h3 className="font-serif text-4xl font-bold mb-4">
                      {event.title}
                    </h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </motion.div>

                  <motion.div
                    className={`${isLeft ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="relative rounded-[3rem] overflow-hidden aspect-[4/3] shadow-2xl group">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <div className="absolute bottom-8 left-8">
                        <div
                          className="px-6 py-3 rounded-full backdrop-blur-xl border-2 border-white/20 font-serif font-bold text-2xl text-white shadow-2xl"
                          style={{ backgroundColor: `${event.color}40` }}
                        >
                          {event.year}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="text-center mt-32 pt-16 border-t border-border/40"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-serif text-3xl italic text-muted-foreground">
            {t('quote.oleg').split(',').map((part, i) => (
              <span key={i}>
                {part}{i === 0 ? ',' : ''}
                {i === 0 && <br />}
              </span>
            ))}
          </p>
          <p className="text-primary font-bold text-xl mt-6">{t('quote.author')}</p>
        </motion.div>
      </div>
    </div>
  );
}