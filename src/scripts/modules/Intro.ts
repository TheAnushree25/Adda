/**
 * First-visit intro: lights come on across the facade, then the camera pushes
 * in through the door and the page beneath is revealed. Skippable (button or
 * Escape), shown once per browser session, never blocks the page for long.
 */
import { gsap } from '@scripts/core/gsap';
import { scroll } from '@scripts/core/scroll';
import { introRunning, markIntroDone } from '@scripts/core/intro';
import { qs, qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

const SEEN_KEY = 'intro-seen';
const MAX_IMAGE_WAIT = 4000;

export default class Intro implements AppModule {
  private el: HTMLElement;
  private tl: gsap.core.Timeline | null = null;
  private failsafe = 0;
  private finished = false;
  private skipBtn: HTMLButtonElement | null;

  constructor(el: HTMLElement) {
    this.el = el;
    this.skipBtn = qs<HTMLButtonElement>('[data-intro-skip]', el);
    if (!introRunning()) {
      el.remove();
      return;
    }
    el.classList.add('is-running');
    scroll.stop();
    this.skipBtn?.addEventListener('click', this.skip);
    document.addEventListener('keydown', this.onKey);
    // Whatever happens, the visitor gets the site within 15 seconds.
    this.failsafe = window.setTimeout(() => this.skip(), 15000);
    void this.start();
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.skip();
  };

  private async start() {
    const img = qs<HTMLImageElement>('[data-intro-image]', this.el);
    if (img) {
      await Promise.race([
        img.complete
          ? Promise.resolve()
          : new Promise((r) => {
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
            }),
        new Promise((r) => setTimeout(r, MAX_IMAGE_WAIT)),
      ]);
      await img.decode?.().catch(() => undefined);
    }
    if (!this.finished) this.play();
  }

  /** Where the camera pushes in: the door on wide screens, the sign on tall ones. */
  private target() {
    return window.innerWidth / window.innerHeight >= 1 ? { x: 86, y: 71 } : { x: 46, y: 24 };
  }

  private play() {
    const el = this.el;
    const frame = qs<HTMLElement>('[data-intro-frame]', el)!;
    const stage = qs<HTMLElement>('[data-intro-stage]', el)!;
    const ui = qs<HTMLElement>('[data-intro-ui]', el);
    const caption = qs<HTMLElement>('[data-intro-caption]', el);
    const progress = qs<HTMLElement>('[data-intro-progress]', el);
    const bloom = qs<HTMLElement>('[data-intro-bloom]', el);
    const full = qs<HTMLElement>('[data-intro-full]', el);
    const glow = qs<HTMLElement>('[data-intro-glow]', el);
    const group = (name: string) => qsa<HTMLElement>(`[data-light="${name}"]`, el);
    const sconces = qsa<HTMLElement>('[data-sconce]', el);
    const { x, y } = this.target();

    frame.style.setProperty('--gx', `${x}%`);
    frame.style.setProperty('--gy', `${y}%`);
    gsap.set(frame, { scale: 1.12, transformOrigin: `${x}% ${y}%` });

    const say = (text: string) => () => {
      if (!caption) return;
      gsap.to(caption, {
        autoAlpha: 0,
        duration: 0.25,
        onComplete: () => {
          caption.textContent = text;
          gsap.to(caption, { autoAlpha: 0.85, duration: 0.4 });
        },
      });
    };

    const tl = gsap.timeline({
      onUpdate: () => {
        if (progress) progress.style.transform = `scaleX(${Math.min(1, tl.time() / 5.2)})`;
      },
    });
    this.tl = tl;

    /** Switches a light on, optionally with a neon-style stutter first. */
    const on = (
      targets: HTMLElement[] | HTMLElement,
      at: number,
      opts: { flicker?: boolean; dur?: number } = {},
    ) => {
      const list = Array.isArray(targets) ? targets : [targets];
      if (opts.flicker) {
        const seq: [number, number][] = [
          [0.55, 0.05],
          [0.05, 0.07],
          [0.85, 0.05],
          [0.2, 0.09],
          [1, 0.14],
        ];
        let t = at;
        for (const [v, d] of seq) {
          tl.to(list, { '--on': v, duration: d, ease: 'none' }, t);
          t += d;
        }
      } else {
        tl.to(list, { '--on': 1, duration: opts.dur ?? 0.6, ease: 'power2.out' }, at);
      }
    };

    // Fade up from black, camera settles slowly for the whole sequence.
    tl.fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 0);
    tl.to(frame, { scale: 1, duration: 4.8, ease: 'power1.inOut' }, 0);
    if (ui) tl.fromTo(ui, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'quint' }, 0.4);

    // 1. Next door and the café's own entrance.
    on(group('side'), 0.7, { dur: 0.5 });
    on(group('entrance-sign'), 1.0, { flicker: true });
    on(group('entrance'), 1.25, { dur: 0.7 });

    // 2. The main sign buzzes to life, with a soft halo.
    on(group('sign'), 1.7, { flicker: true });
    if (bloom) {
      tl.to(bloom, { opacity: 0.5, duration: 0.05, ease: 'none' }, 1.7)
        .to(bloom, { opacity: 0, duration: 0.07, ease: 'none' }, 1.75)
        .to(bloom, { opacity: 0.7, duration: 0.05, ease: 'none' }, 1.82)
        .to(bloom, { opacity: 0.15, duration: 0.09, ease: 'none' }, 1.87)
        .to(bloom, { opacity: 0.75, duration: 0.5, ease: 'power2.out' }, 1.96);
    }
    tl.call(say('Lights on'), [], 2.0);

    // 3. Restaurant floor, window by window, then the wall lamps.
    group('ground').forEach((w, i) => on(w, 2.35 + i * 0.2, { dur: 0.55 }));
    group('pillar').forEach((p, i) => on(p, 2.75 + i * 0.1, { dur: 0.5 }));
    tl.to(sconces, { opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 2.75);

    // 4. Upstairs.
    group('top').forEach((w, i) => on(w, 3.25 + i * 0.16, { dur: 0.6 }));

    // 5. Warm spill across the whole facade.
    if (full) tl.to(full, { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 3.9);
    if (bloom) tl.to(bloom, { opacity: 0.45, duration: 1.1 }, 3.9);
    tl.call(say('Come on in'), [], 4.4);

    // 6. Walk in through the door.
    tl.addLabel('enter', 5.2);
    if (ui) tl.to(ui, { autoAlpha: 0, duration: 0.4 }, 'enter');
    // The door grows to fill the screen while a warm light spills out of it.
    tl.to(frame, { scale: 3.8, duration: 1.6, ease: 'power2.in' }, 'enter');
    if (glow) tl.to(glow, { opacity: 1, duration: 1.1, ease: 'power1.in' }, 'enter+=0.25');
    tl.call(() => this.reveal(), [], 'enter+=1.2');
  }

  /** Dissolves the intro and lets the page start its own entrance. */
  private reveal() {
    if (this.finished) return;
    this.finished = true;
    window.clearTimeout(this.failsafe);
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage unavailable: the intro may play again next time */
    }
    markIntroDone();
    scroll.start();
    gsap.to(this.el, {
      autoAlpha: 0,
      duration: 0.75,
      ease: 'power2.out',
      onComplete: () => this.cleanup(),
    });
  }

  private skip = () => {
    if (this.finished) return;
    this.tl?.kill();
    this.reveal();
  };

  private cleanup() {
    this.tl?.kill();
    this.tl = null;
    this.el.remove();
  }

  destroy() {
    window.clearTimeout(this.failsafe);
    this.skipBtn?.removeEventListener('click', this.skip);
    document.removeEventListener('keydown', this.onKey);
    this.tl?.kill();
  }
}
