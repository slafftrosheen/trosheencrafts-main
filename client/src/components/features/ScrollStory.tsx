import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ScrollStoryPhotos } from '@/lib/imageAssets';

interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  imageUrl: string;
  imagePosition: 'left' | 'right' | 'center';
  backgroundColor?: string;
  textColor?: string;
}

interface ScrollStoryProps {
  theme?: 'light' | 'dark' | 'sepia';
}

function ChapterSection({
  chapter,
  index
}: {
  chapter: StoryChapter;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  const imageY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.2]);

  return (
    <div
      ref={(node) => {
        ref.current = node;
        inViewRef(node);
      }}
      className="relative min-h-screen flex items-center py-12 sm:py-16 md:py-24 lg:py-32"
      style={{ backgroundColor: chapter.backgroundColor || 'transparent' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${
          chapter.imagePosition === 'right' ? 'lg:grid-flow-dense' : ''
        }`}>
          <motion.div
            style={{ opacity, y }}
            className={`space-y-6 sm:space-y-8 ${chapter.imagePosition === 'right' ? 'lg:col-start-1' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-block mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary/20">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-[0.9]" style={{ color: chapter.textColor }}>
                {chapter.title}
              </h2>

              {chapter.subtitle && (
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium italic mb-6 sm:mb-8">
                  {chapter.subtitle}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-4 sm:space-y-6"
            >
              {chapter.content.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                  className="text-base sm:text-lg lg:text-xl leading-relaxed text-foreground/90"
                  style={{ color: chapter.textColor }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            style={{ scale }}
            className={`relative ${chapter.imagePosition === 'right' ? 'lg:col-start-2' : ''} ${
              chapter.imagePosition === 'center' ? 'lg:col-span-2' : ''
            }`}
          >
            <motion.div
              style={{ y: imageY }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[4rem] aspect-[4/5] shadow-2xl"
            >
              <motion.img
                style={{ scale: imageScale }}
                src={chapter.imageUrl}
                alt={chapter.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20"
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        style={{ scaleY: scrollYProgress }}
        className="absolute left-0 top-0 w-1 h-full bg-primary origin-top"
      />
    </div>
  );
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'heritage',
    title: 'A Family of Makers',
    subtitle: 'Where it all began',
    content: [
      'In Daugavpils, there is a backyard where the seasons mark time—not by calendars, but by the concrete drying in winter cold and summer heat.',
      'Our story was never about starting a business. It was about Oleg\'s hands, tired from factory work, finding rest in shaping wire and concrete. About his grandfather\'s old brushes that still hang on the workshop wall. About children learning that beauty can emerge from dust and patience.',
    ],
    imageUrl: ScrollStoryPhotos.chapter1_heritage,
    imagePosition: 'left',
  },
  {
    id: 'materials',
    title: 'Materials Tell Stories',
    subtitle: 'Every piece is unique',
    content: [
      'We don\'t buy pigments from catalogs. We collect them. Iron oxide from Kurzeme rust. Copper dust from old workshops. Earth tones literally from our backyard.',
      'The fern leaves pressed into stepping stones? Picked by Nikolass during weekend forest walks. The mica flakes? Found near Daugava River. When someone buys a piece, they\'re not getting product—they\'re getting Latvia.',
    ],
    imageUrl: ScrollStoryPhotos.chapter2_materials,
    imagePosition: 'right',
  },
  {
    id: 'crafting',
    title: 'Slow Hands, Deep Craft',
    subtitle: 'Three weeks per piece',
    content: [
      'We can\'t make hundreds. Physics won\'t allow it. Concrete needs time to cure properly—minimum 28 days for full strength. Patinas oxidize at their own pace. Burnishing an edge until it catches light takes 30 minutes of meditation.',
      'This isn\'t inefficiency. It\'s respect for material. Every heart candle spends more time in our hands than it will burn in yours. That ratio feels important.',
    ],
    imageUrl: ScrollStoryPhotos.chapter3_crafting,
    imagePosition: 'left',
  },
  {
    id: 'family',
    title: 'Small Hands, Big Dreams',
    subtitle: 'The next generation',
    content: [
      'Alisija is 14 now. She can mix concrete by eye—knows when aggregate ratios are wrong by texture. Nikolass, 11, has better color instincts than any of us. His copper patina experiments have become our signature finish.',
      'They don\'t see this as "work." To them, it\'s Saturday mornings with Dad. They\'re learning a language most kids will never speak: the language of making things that last.',
    ],
    imageUrl: ScrollStoryPhotos.chapter4_family,
    imagePosition: 'right',
  },
  {
    id: 'mastery',
    title: 'Not Perfect, Better',
    subtitle: '30 years of refinement',
    content: [
      'Oleg still makes mistakes. Last month, he misjudged cure time and a fountain cracked. He kept it. It sits on his desk as a reminder that mastery isn\'t about perfection—it\'s about respect.',
      'Every piece we ship carries 30 years of learning. Some have fingerprints in the texture (we try to smooth them, don\'t always succeed). Some have color variations (concrete is alive, responds to humidity). These aren\'t flaws. They\'re signatures. Proof that humans, not machines, made this.',
    ],
    imageUrl: ScrollStoryPhotos.chapter5_mastery,
    imagePosition: 'left',
  },
];

export function ScrollStory({ theme = 'light' }: ScrollStoryProps) {
  return (
    <div className={`relative ${theme === 'dark' ? 'bg-background' : theme === 'sepia' ? 'bg-amber-50' : 'bg-background'}`}>
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {STORY_CHAPTERS.map((chapter, index) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={index} />
        ))}
      </div>
    </div>
  );
}
