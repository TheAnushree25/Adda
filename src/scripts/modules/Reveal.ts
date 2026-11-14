/**
 * Scroll-triggered reveals. Usage:
 *   data-reveal="lines"    – split into lines that rise out of masks
 *   data-reveal="fade-up"  – fade while rising 48px
 *   data-reveal="fade"     – plain fade
 *   data-reveal="image"    – clip-path wipe with the inner media scaling down
 *   data-reveal="pop"      – scale + fade (badges, bubbles)
 *   data-reveal="stagger"  – fade-up each [data-reveal-child]
 * Optional: data-reveal-delay="0.2", data-reveal-start="top 80%".
 */
import { gsap, ScrollTrigger, SplitText } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Reveal implements AppModule {
  private ctx: gsap.Context;
  private splits: SplitText[] = [];

  constructor(root: HTMLElement) {
    const items = qsa<HTMLElement>('[data-reveal]', root);
    if (root.matches('[data-reveal]')) items.unshift(root);

    if (prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('is-revealed'));
      this.ctx = gsap.context(() => {});
      return;
    }

    this.ctx = gsap.context(() => {
      items.forEach((el) => this.setup(el));
    }, root);
  }

  private setup(el: HTMLElement) {
    const type = el.dataset.reveal ?? 'fade-up';
    const delay = Number(el.dataset.revealDelay ?? 0);
    const start = el.dataset.revealStart ?? 'top 88%';
    const trigger = { trigger: el, start, once: true };
    const done = () => el.classList.add('is-revealed');

    switch (type) {
      case 'lines': {
        const split = SplitText.create(el, {
          type: 'lines',
          linesClass: 'split-line',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(self.lines, { yPercent: 110 });
            done();
            return gsap.to(self.lines, {
              yPercent: 0,
              duration: 1.25,
              stagger: 0.09,
              delay,
              ease: 'expo.out',
              scrollTrigger: trigger,
            });
          },
        });
        this.splits.push(split);
        break;
      }
      case 'image': {
        const media = el.querySelector('img, video, canvas');
        gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
        if (media) gsap.set(media, { scale: 1.3 });
        done();
        const tl = gsap.timeline({ delay, scrollTrigger: trigger });
        tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
        if (media) tl.to(media, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.1);
        break;
      }
      case 'pop': {
        gsap.set(el, { scale: 0.6, autoAlpha: 0, rotate: -8 });
        done();
        gsap.to(el, {
          scale: 1,
          autoAlpha: 1,
          rotate: 0,
          duration: 1.4,
          delay,
          ease: 'elastic.out(1, 0.75)',
          scrollTrigger: trigger,
        });
        break;
      }
      case 'stagger': {
        const children = qsa<HTMLElement>('[data-reveal-child]', el);
        gsap.set(children, { y: 48, autoAlpha: 0 });
        done();
        gsap.to(children, {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          stagger: 0.1,
          delay,
          ease: 'expo.out',
          scrollTrigger: trigger,
        });
        break;
      }
      case 'fade': {
        gsap.set(el, { autoAlpha: 0 });
        done();
        gsap.to(el, { autoAlpha: 1, duration: 1.2, delay, ease: 'power2.out', scrollTrigger: trigger });
        break;
      }
      default: {
        gsap.set(el, { y: 48, autoAlpha: 0 });
        done();
        gsap.to(el, { y: 0, autoAlpha: 1, duration: 1.1, delay, ease: 'expo.out', scrollTrigger: trigger });
      }
    }
  }

  destroy() {
    this.splits.forEach((s) => s.revert());
    this.ctx.revert();
    ScrollTrigger.refresh();
  }
}
