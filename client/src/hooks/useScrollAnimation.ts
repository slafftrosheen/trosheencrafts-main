import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation() {
  const elementRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const elements = elementRef.current;

    elements.forEach((el, index) => {
      if (!el) return;

      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: 50,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !elementRef.current.includes(el)) {
      elementRef.current.push(el);
    }
  };

  return { addToRefs };
}
