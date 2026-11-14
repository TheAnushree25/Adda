/**
 * Text set on an SVG arc (<textPath>). The text eases along the curve as the
 * section scrolls through the viewport and its letters spring in on entry.
 */
import { gsap } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import type { AppModule } from '@scripts/core/registry';

export default class CurvedText implements AppModule {
  private ctx: gsap.Context;

  constructor(el: HTMLElement) {
    this.ctx = gsap.context(() => {
      const textPath = el.querySelector('textPath');
      if (!textPath || prefersReducedMotion()) return;
      const drift = Number(el.dataset.drift ?? 6);
      const proxy = { o: 50 + drift };
      const apply = () => textPath.setAttribute('startOffset', `${proxy.o}%`);
      apply();
      gsap.to(proxy, {
        o: 50 - drift,
        ease: 'none',
        onUpdate: apply,
        scrollTrigger: {
          trigger: el.closest('section') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      gsap.from(el, {
        autoAlpha: 0,
        scale: 0.85,
        rotate: -6,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    }, el);
  }

  destroy() {
    this.ctx.revert();
  }
}
