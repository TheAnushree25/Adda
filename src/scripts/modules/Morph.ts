/**
 * Organic blobs that breathe and morph as the section scrolls.
 * Each <path data-morph> carries alternative shapes in data-shapes
 * (same command structure), so GSAP can interpolate the path data directly.
 */
import { gsap } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Morph implements AppModule {
  private ctx: gsap.Context;

  constructor(root: HTMLElement) {
    this.ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      qsa<SVGPathElement>('[data-morph]', root).forEach((path, i) => {
        const shapes = (path.dataset.shapes ?? '').split('|').filter(Boolean);
        if (!shapes.length) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
        shapes.forEach((d) => tl.to(path, { attr: { d }, ease: 'sine.inOut', duration: 1 }));
        // A slow idle breath on top of the scroll morph.
        gsap.to(path, {
          scale: 1.04 + (i % 3) * 0.02,
          rotate: i % 2 ? 4 : -4,
          transformOrigin: '50% 50%',
          duration: 6 + i,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      });
    }, root);
  }

  destroy() {
    this.ctx.revert();
  }
}
