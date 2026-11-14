/**
 * "Daily rituals": the section pins while the row of plates travels sideways.
 * The background blends between each dish's colour and the plates roll like
 * wheels as they move.
 */
import { gsap, ScrollTrigger } from '@scripts/core/gsap';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qs, qsa, clamp } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Specials implements AppModule {
  private ctx: gsap.Context;

  constructor(el: HTMLElement) {
    this.ctx = gsap.context(() => {
      const track = qs<HTMLElement>('[data-specials-track]', el);
      const items = qsa<HTMLElement>('[data-special]', el);
      const plates = qsa<HTMLElement>('[data-special-plate]', el);
      if (!track || !items.length) return;

      const colors = items.map((i) => i.dataset.color ?? '#4b2b32');
      el.style.setProperty('--specials-bg', colors[0]!);

      if (prefersReducedMotion()) {
        el.classList.add('is-static');
        return;
      }

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const setBg = (v: string) => el.style.setProperty('--specials-bg', v);

      // Layout is measured once per refresh, not on every frame.
      let centres: number[] = [];
      let radius = 1;
      const measure = () => {
        centres = items.map((it) => it.offsetLeft + it.offsetWidth / 2);
        radius = (plates[0]?.offsetWidth ?? 2) / 2 || 1;
      };
      const rotators = plates.map((p) => gsap.quickSetter(p, 'rotate', 'deg') as (v: number) => void);
      let active = -1;

      // Runs on every rendered frame of the (smoothed) scrub, so colour and
      // rotation always match where the track actually is.
      const render = () => {
        const x = Number(gsap.getProperty(track, 'x'));
        const centre = window.innerWidth / 2 - x;
        let f = 0;
        for (let i = 0; i < centres.length - 1; i++) {
          const a = centres[i]!;
          const b = centres[i + 1]!;
          if (centre >= a && centre <= b) {
            f = i + (centre - a) / (b - a);
            break;
          }
          if (centre > b) f = i + 1;
        }
        f = clamp(f, 0, colors.length - 1);
        const i0 = Math.floor(f);
        const i1 = Math.min(i0 + 1, colors.length - 1);
        setBg(gsap.utils.interpolate(colors[i0]!, colors[i1]!, f - i0));
        const nearest = Math.round(f);
        if (nearest !== active) {
          active = nearest;
          items.forEach((it, i) => it.classList.toggle('is-active', i === nearest));
        }
        // Roll the plates like wheels: travelled distance / radius.
        const deg = (((x / radius) * 180) / Math.PI) * 0.55;
        rotators.forEach((set) => set(deg));
      };

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        onUpdate: render,
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onRefresh: () => {
            measure();
            render();
          },
        },
      });

      // Titles drift a touch slower than the plates for depth.
      items.forEach((it) => {
        const copy = qs('[data-special-copy]', it);
        if (!copy) return;
        gsap.fromTo(
          copy,
          { x: 60 },
          {
            x: -60,
            ease: 'none',
            scrollTrigger: {
              trigger: it,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    }, el);
  }

  destroy() {
    this.ctx.revert();
  }
}
