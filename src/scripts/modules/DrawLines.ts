/**
 * Self-drawing strokes: every <path data-draw> is traced (stroke-dashoffset)
 * as its own section scrolls into view. Works for visible strokes and for
 * stroke paths inside <mask>s that reveal filled shapes.
 */
import { gsap } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class DrawLines implements AppModule {
  private ctx: gsap.Context;

  constructor(root: HTMLElement) {
    this.ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const paths = qsa<SVGPathElement>('[data-draw]', root);
      const order = new Map<Element, number>();
      paths.forEach((p) => {
        const trigger = p.closest('section, footer, [data-draw-scope]') ?? root;
        const i = order.get(trigger) ?? 0;
        order.set(trigger, i + 1);
        const len = p.getTotalLength() || 1000;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: `top ${Math.max(60, 92 - i * 6)}%`,
            end: 'center 45%',
            scrub: 1.2,
          },
        });
      });
    }, root);
  }

  destroy() {
    this.ctx.revert();
  }
}
