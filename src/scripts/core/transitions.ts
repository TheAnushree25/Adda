/**
 * Page transitions with Swup: a curved curtain rises over the page, the
 * content is swapped, then the curtain lifts away to reveal the new page.
 */
import Swup from 'swup';
import SwupJsPlugin from '@swup/js-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import { gsap } from './gsap';
import { prefersReducedMotion } from './motion';

interface TransitionHooks {
  beforeLeave: () => void;
  /** Runs while the old page is still in the DOM (tear modules down here). */
  beforeSwap: (container: HTMLElement) => void;
  /** Runs once the new page is in the DOM. */
  afterSwap: (container: HTMLElement) => Promise<void> | void;
  afterEnter: () => void;
}

const BULGE = 22; // curve depth of the curtain edge, in viewBox units

function curtainPaths() {
  const root = document.querySelector<HTMLElement>('[data-curtain]');
  const path = root?.querySelector<SVGPathElement>('[data-curtain-path]') ?? null;
  const mark = root?.querySelector<HTMLElement>('[data-curtain-mark]') ?? null;
  return { root, path, mark };
}

/** Curtain rising from the bottom; top edge bulges upward while moving. */
function coverPath(p: number) {
  const edge = 100 - 100 * p;
  const ctrl = edge - BULGE * Math.sin(Math.PI * p);
  return `M0 ${edge} Q50 ${ctrl} 100 ${edge} L100 100 L0 100 Z`;
}

/** Curtain leaving through the top; bottom edge bulges upward while moving. */
function revealPath(p: number) {
  const edge = 100 - 100 * p;
  const ctrl = edge - BULGE * Math.sin(Math.PI * p);
  return `M0 0 L100 0 L100 ${edge} Q50 ${ctrl} 0 ${edge} Z`;
}

export function initTransitions(hooks: TransitionHooks) {
  const reduced = prefersReducedMotion();
  const { root, path, mark } = curtainPaths();

  const animations = [
    {
      from: '(.*)',
      to: '(.*)',
      out: async () => {
        hooks.beforeLeave();
        if (reduced || !root || !path) return;
        const state = { p: 0 };
        root.classList.add('is-active');
        const tl = gsap.timeline();
        tl.to(state, {
          p: 1,
          duration: 0.85,
          ease: 'power3.inOut',
          onUpdate: () => path.setAttribute('d', coverPath(state.p)),
        });
        if (mark)
          tl.fromTo(
            mark,
            { autoAlpha: 0, yPercent: 30 },
            { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: 'quint' },
            0.4,
          );
        await tl;
      },
      in: async () => {
        if (reduced || !root || !path) {
          hooks.afterEnter();
          return;
        }
        const state = { p: 0 };
        const tl = gsap.timeline({ delay: 0.05 });
        if (mark) tl.to(mark, { autoAlpha: 0, yPercent: -30, duration: 0.45, ease: 'power2.in' }, 0);
        tl.to(
          state,
          {
            p: 1,
            duration: 0.95,
            ease: 'power3.inOut',
            onUpdate: () => path.setAttribute('d', revealPath(state.p)),
          },
          0.15,
        );
        tl.call(hooks.afterEnter, [], 0.45);
        await tl;
        root.classList.remove('is-active');
        path.setAttribute('d', coverPath(0));
      },
    },
  ];

  const swup = new Swup({
    containers: ['#swup'],
    animateHistoryBrowsing: true,
    ignoreVisit: (url, { el } = {}) => !!el?.closest('[data-no-swup]') || /\.(pdf|jpg|png|zip)$/i.test(url),
    plugins: [
      new SwupJsPlugin({ animations }),
      new SwupHeadPlugin({ persistAssets: true, awaitAssets: true }),
      new SwupPreloadPlugin({ preloadVisibleLinks: false }),
    ],
  });

  // Our own scroll handling (Lenis) replaces Swup's defaults.
  swup.hooks.replace('scroll:top', () => true);
  swup.hooks.replace('scroll:anchor', () => true);

  swup.hooks.before('content:replace', () => {
    const container = document.querySelector<HTMLElement>('#swup');
    if (container) hooks.beforeSwap(container);
  });

  swup.hooks.on('content:replace', async () => {
    const container = document.querySelector<HTMLElement>('#swup');
    if (container) await hooks.afterSwap(container);
  });

  return swup;
}
