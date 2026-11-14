/**
 * Scroll-linked parallax for every [data-parallax] inside the module root.
 *   data-parallax="12"       – element drifts from +12% to −12% of its height
 *   data-parallax-rotate="8" – adds a rotation drift (degrees)
 *   data-parallax-zoom       – the element (an image) is scaled up and drifts inside its frame
 */
import { gsap } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Parallax implements AppModule {
  private ctx: gsap.Context;

  constructor(root: HTMLElement) {
    this.ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const items = qsa<HTMLElement>('[data-parallax]', root);
      if (root.matches('[data-parallax]')) items.unshift(root);

      items.forEach((el) => {
        const amount = Number(el.dataset.parallax || 10);
        const rotate = Number(el.dataset.parallaxRotate || 0);
        const zoom = el.hasAttribute('data-parallax-zoom');
        const trigger = zoom ? (el.parentElement ?? el) : el;
        if (zoom) gsap.set(el, { scale: 1 + Math.abs(amount) / 50 });
        gsap.fromTo(
          el,
          { yPercent: amount, rotate: -rotate / 2 },
          {
            yPercent: -amount,
            rotate: rotate / 2,
            ease: 'none',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    }, root);
  }

  destroy() {
    this.ctx.revert();
  }
}
