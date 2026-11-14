/** Counts every [data-counter] up to its value when it scrolls into view. */
import { gsap } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Counter implements AppModule {
  private ctx: gsap.Context;

  constructor(root: HTMLElement) {
    this.ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      qsa<HTMLElement>('[data-counter]', root).forEach((el) => {
        const target = Number(el.dataset.counter);
        // Years count up from a nearby decade; amounts from zero.
        const from = target > 1000 ? target - 47 : 0;
        const state = { v: from };
        el.textContent = String(from);
        gsap.to(state, {
          v: target,
          duration: 2.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(state.v));
          },
        });
      });
    }, root);
  }

  destroy() {
    this.ctx.revert();
  }
}
