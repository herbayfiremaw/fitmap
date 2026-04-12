import { useEffect, useRef } from 'react';

export function useReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            const children = entry.target.querySelectorAll('.reveal-child');
            children.forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useRevealAll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            const children = entry.target.querySelectorAll('.reveal-child');
            children.forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    const observe = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    observe();

    // Watch for new .reveal elements added to the DOM
    const mutation = new MutationObserver(observe);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
