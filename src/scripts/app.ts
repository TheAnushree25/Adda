/**
 * Application entry. Boots smooth scrolling, registers modules, mounts them for
 * the current page and keeps everything in sync across Swup page transitions.
 */
import { gsap, ScrollTrigger } from './core/gsap';
import { initScroll, scroll } from './core/scroll';
import { register, mount, unmount } from './core/registry';
import { initTransitions } from './core/transitions';
import { prefersReducedMotion } from './core/motion';
import { introRunning, whenIntroDone } from './core/intro';

// Lightweight modules ship in the main bundle; heavier ones load on demand.
import Header from './modules/Header';
import BurgerMenu from './modules/BurgerMenu';
import QuickNav from './modules/QuickNav';
import Sheet from './modules/Sheet';
import Reveal from './modules/Reveal';
import Parallax from './modules/Parallax';
import Counter from './modules/Counter';
import CurvedText from './modules/CurvedText';
import Accordion from './modules/Accordion';
import Schedule from './modules/Schedule';
import OpenStatus from './modules/OpenStatus';
import Morph from './modules/Morph';
import DrawLines from './modules/DrawLines';
import Intro from './modules/Intro';

const eager = {
  Header,
  BurgerMenu,
  QuickNav,
  Sheet,
  Reveal,
  Parallax,
  Counter,
  CurvedText,
  Accordion,
  Schedule,
  OpenStatus,
  Morph,
  DrawLines,
  Intro,
};
const asModule = <T>(m: T) => Promise.resolve({ default: m });

register('intro', () => asModule(eager.Intro));
register('header', () => asModule(eager.Header));
register('burger', () => asModule(eager.BurgerMenu));
register('quick-nav', () => asModule(eager.QuickNav));
register('sheet', () => asModule(eager.Sheet));
register('reveal', () => asModule(eager.Reveal));
register('parallax', () => asModule(eager.Parallax));
register('counter', () => asModule(eager.Counter));
register('curved-text', () => asModule(eager.CurvedText));
register('accordion', () => asModule(eager.Accordion));
register('schedule', () => asModule(eager.Schedule));
register('open-status', () => asModule(eager.OpenStatus));
register('morph', () => asModule(eager.Morph));
register('draw', () => asModule(eager.DrawLines));
register('hero', () => import('./modules/Hero'));
register('specials', () => import('./modules/Specials'));
register('carousel', () => import('./modules/Carousel'));
register('menu-page', () => import('./modules/MenuPage'));

const root = document.documentElement;

function emit(name: string, detail?: unknown) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Scrolls to the URL hash (if any) once the page is laid out. */
function scrollToHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target) scroll.to(target, { offset: -120, immediate: true });
}

async function boot() {
  initScroll();
  await mount(document);
  root.classList.add('is-ready');
  emit('app:page');
  // Fonts and lazy images change layout: refresh measurements when they settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    scrollToHash();
  });

  if (!prefersReducedMotion()) {
    // Header and quick bar arrive with the page: right away, or as the intro dissolves.
    const waiting = introRunning();
    if (waiting) {
      gsap.set('[data-intro-header]', { y: -24, autoAlpha: 0 });
      gsap.set('[data-intro-nav]', { yPercent: 160 });
    }
    const delay = waiting ? 0.35 : 0.25;
    void whenIntroDone().then(() => {
      gsap.fromTo(
        '[data-intro-header]',
        { y: -24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.2, ease: 'quint', stagger: 0.06, delay },
      );
      gsap.fromTo(
        '[data-intro-nav]',
        { yPercent: 160 },
        { yPercent: 0, duration: 1.2, ease: 'quint', delay: delay + 0.65 },
      );
    });
  }

  initTransitions({
    beforeLeave: () => emit('app:leave'),
    beforeSwap: (container) => {
      unmount(container);
      // Anything left behind by the outgoing page (pin spacers, triggers) goes too.
      ScrollTrigger.getAll().forEach((t) => {
        const trig = t.trigger as Element | undefined;
        if (!trig || container.contains(trig)) t.kill(true);
      });
    },
    afterSwap: async (container) => {
      scroll.to(0, { immediate: true });
      await mount(container);
      emit('app:page');
      ScrollTrigger.refresh();
      scrollToHash();
    },
    afterEnter: () => emit('app:entered'),
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else void boot();
