/**
 * Home hero: the hand-set lettering cascades into place once (then stays
 * perfectly still) and the WebGL photo scene blooms open behind it.
 */
import { gsap, ScrollTrigger } from '@scripts/core/gsap';
import { prefersReducedMotion, hasFinePointer } from '@scripts/core/motion';
import { whenIntroDone } from '@scripts/core/intro';
import { qs, qsa, clamp, lerp } from '@scripts/utils/dom';
import type { HeroScene } from '@scripts/gl/HeroScene';
import type { AppModule } from '@scripts/core/registry';

const BRAND_RGB: [number, number, number] = [75 / 255, 43 / 255, 50 / 255]; // --c-plum

export default class Hero implements AppModule {
  private el: HTMLElement;
  private copy: HTMLElement | null;
  private ctx: gsap.Context;
  private scene: HeroScene | null = null;
  private progress = 0;
  private pointer = { x: -9999, y: -9999, inside: false };
  private lens = { x: 0.72, y: 0.45, k: 0 };
  private reduced = prefersReducedMotion();
  private fine = hasFinePointer();
  private ro: ResizeObserver;
  private destroyed = false;
  /** Frame-time governor: drops resolution, then WebGL, on slow devices. */
  private perf = { frames: 0, total: 0, stage: 0 };

  constructor(el: HTMLElement) {
    this.el = el;
    this.copy = qs<HTMLElement>('[data-hero-copy]', el);

    this.ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        // 0 while the hero fills the screen, 1 once it has scrolled away.
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          this.progress = self.progress;
        },
      });
    }, el);

    this.ro = new ResizeObserver(() => this.scene?.resize());
    this.ro.observe(el);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onLeave);

    gsap.ticker.add(this.tick);
    void this.start();
  }

  private async start() {
    // WebGL warms up behind the facade intro; the visible reveal waits for it.
    const gl = this.reduced ? Promise.resolve() : this.initGL();
    await Promise.all([document.fonts?.ready, whenIntroDone()]);
    if (this.destroyed) return;
    this.playIntro();
    await gl;
    if (this.scene && !this.destroyed) this.revealGL();
  }

  /** Letters fade in one by one from a diagonal cascade and settle into the lettering. */
  /**
   * Each letter travels along its own curved motion path (GSAP MotionPathPlugin)
   * from a diagonal cascade into place, squashing back to its true shape, while
   * the whole headline glides in from the right. Afterwards it is static.
   */
  private playIntro() {
    const svg = qs<SVGSVGElement>('[data-hero-lettering]', this.el);
    const lines = qsa<SVGGElement>('[data-hero-line]', this.el);
    const fades = qsa<HTMLElement>('[data-hero-fade]', this.el);
    if (this.reduced || !svg) {
      this.el.classList.add('is-ready');
      return;
    }

    this.ctx.add(() => {
      const em = Number(svg.dataset.em) || 1000; // lettering units per em
      const letters = qsa<SVGPathElement>('[data-hero-letter]', svg);
      const master = gsap.timeline({
        onComplete: () => gsap.set(letters, { clearProps: 'transform,opacity' }),
      });

      // The headline as a whole glides in from the right.
      master.from(svg, { xPercent: 32, duration: 2.1, ease: 'expo.out' }, 0);

      lines.forEach((line, li) => {
        const glyphs = qsa<SVGPathElement>('[data-hero-letter]', line);
        const tl = gsap.timeline();
        glyphs.forEach((glyph, i) => {
          // Start further down-right the later the letter: a falling diagonal.
          const dx = (0.42 + li * 0.22 + i * 0.07) * em;
          const dy = (0.34 + li * 0.1 + i * 0.035) * em;
          const path = [
            { x: 0, y: 0 },
            { x: dx * 0.28, y: dy * 1.15 },
            { x: dx, y: dy },
          ];
          tl.from(
            glyph,
            {
              motionPath: { path, curviness: 1.4 },
              scaleY: 0.7,
              scaleX: 1.2,
              rotation: 8,
              transformOrigin: '50% 50%',
              duration: 1.9,
              ease: 'expo.out',
            },
            i * 0.028,
          ).from(glyph, { opacity: 0, duration: 0.24, ease: 'none' }, i * 0.028);
        });
        master.add(tl, 0.22 + li * 0.1);
      });

      master.fromTo(
        fades,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out' },
        0.95,
      );
      this.el.classList.add('is-ready');
    });
  }

  private async initGL() {
    const canvas = qs<HTMLCanvasElement>('[data-hero-canvas]', this.el);
    const img = qs<HTMLImageElement>('[data-hero-image]', this.el);
    if (!canvas || !img) return;
    try {
      if (!img.complete) await new Promise((r) => img.addEventListener('load', r, { once: true }));
      await img.decode().catch(() => undefined);
      const { HeroScene } = await import('@scripts/gl/HeroScene');
      if (this.destroyed) return;
      this.scene = new HeroScene({ canvas, image: img, color: BRAND_RGB });
      this.scene.uniforms.uReveal.value = 0;
      this.el.classList.add('is-gl');
    } catch (error) {
      // WebGL unavailable: the static masked photo stays in place.
      console.warn('[hero] WebGL disabled:', error);
      this.scene = null;
    }
  }

  private revealGL() {
    this.ctx.add(() => {
      gsap.fromTo(
        this.scene!.uniforms.uReveal,
        { value: 0 },
        { value: 1, duration: 2.6, ease: 'power3.inOut', delay: 0.15 },
      );
    });
  }

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    const rect = this.el.getBoundingClientRect();
    this.pointer.inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
  };

  private onLeave = () => {
    this.pointer.inside = false;
  };

  private tick = (time: number, deltaTime: number) => {
    const dt = Math.min(deltaTime / 16.67, 3);
    // Supporting copy fades as the photo opens up behind it.
    if (this.copy && !this.reduced) {
      const k = clamp((this.progress - 0.06) / 0.22, 0, 1);
      this.copy.style.opacity = String(1 - k);
      this.copy.style.transform = `translate3d(0, ${(-k * 40).toFixed(1)}px, 0)`;
    }
    this.updateScene(time, dt);
  };

  private govern(deltaMs: number) {
    const p = this.perf;
    if (p.stage > 1 || document.hidden || this.progress >= 1) return;
    p.frames++;
    p.total += deltaMs;
    if (p.frames < 90) return;
    const avg = p.total / p.frames;
    p.frames = 0;
    p.total = 0;
    if (avg < 28) return;
    if (p.stage === 0) {
      this.scene?.setPixelRatio(0.75);
      p.stage = 1;
    } else {
      p.stage = 2;
      this.el.classList.remove('is-gl');
      this.scene?.destroy();
      this.scene = null;
    }
  }

  private updateScene(t: number, dt: number) {
    const scene = this.scene;
    if (!scene) return;
    this.govern(dt * 16.67);
    let tx = 0.72;
    let ty = 0.45;
    let tk = 0;

    if (this.fine && this.pointer.inside) {
      const rect = scene.canvas.getBoundingClientRect();
      tx = (this.pointer.x - rect.left) / rect.width;
      ty = 1 - (this.pointer.y - rect.top) / rect.height;
      tk = 1;
    } else if (!this.fine) {
      // Touch screens: the lens wanders on its own.
      tx = 0.62 + Math.sin(t * 0.32) * 0.2;
      ty = 0.38 + Math.cos(t * 0.27) * 0.16;
      tk = 0.75;
    }

    this.lens.x = lerp(this.lens.x, tx, 0.085 * dt);
    this.lens.y = lerp(this.lens.y, ty, 0.085 * dt);
    this.lens.k = lerp(this.lens.k, tk, 0.06 * dt);
    scene.uniforms.uPointer.value = [this.lens.x, this.lens.y];
    scene.uniforms.uLens.value = this.lens.k;
    scene.uniforms.uScroll.value = this.progress;
    scene.render(t);
  }

  destroy() {
    this.destroyed = true;
    gsap.ticker.remove(this.tick);
    window.removeEventListener('pointermove', this.onPointer);
    document.documentElement.removeEventListener('pointerleave', this.onLeave);
    this.ro.disconnect();
    this.ctx.revert();
    this.scene?.destroy();
    this.scene = null;
  }
}
