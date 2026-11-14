/**
 * Smooth scrolling (Lenis) wired into GSAP's ticker and ScrollTrigger.
 * Falls back to native scrolling when the user prefers reduced motion.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './motion';

type Direction = 1 | -1;
type ScrollListener = (state: { y: number; direction: Direction; velocity: number }) => void;

let lenis: Lenis | null = null;
let lastY = 0;
let direction: Direction = 1;
const listeners = new Set<ScrollListener>();

function emit(y: number, velocity: number) {
  if (Math.abs(y - lastY) > 0.5) direction = y > lastY ? 1 : -1;
  lastY = y;
  listeners.forEach((fn) => fn({ y, direction, velocity }));
}

export function initScroll() {
  if (lenis || prefersReducedMotion()) {
    window.addEventListener('scroll', () => emit(window.scrollY, 0), { passive: true });
    return;
  }

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    autoRaf: false,
    anchors: false,
  });

  lenis.on('scroll', (l: Lenis) => {
    ScrollTrigger.update();
    emit(l.scroll, l.velocity);
  });

  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Handy for automated checks and debugging.
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
}

export const scroll = {
  get y() {
    return lenis ? lenis.scroll : window.scrollY;
  },
  get direction() {
    return direction;
  },
  to(
    target: number | string | HTMLElement,
    opts: { offset?: number; immediate?: boolean; duration?: number } = {},
  ) {
    if (lenis) {
      lenis.scrollTo(target, {
        offset: opts.offset ?? 0,
        immediate: opts.immediate,
        duration: opts.duration,
        force: true,
      });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    const top =
      typeof el === 'number'
        ? el
        : el
          ? el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0)
          : 0;
    window.scrollTo({ top, behavior: opts.immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
  },
  stop() {
    lenis?.stop();
  },
  start() {
    lenis?.start();
  },
  resize() {
    lenis?.resize();
  },
  on(fn: ScrollListener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
