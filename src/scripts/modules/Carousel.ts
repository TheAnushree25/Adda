/**
 * Draggable carousel (Embla) with prev/next buttons and a "Drag" cursor
 * bubble on devices with a fine pointer.
 */
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';
import { gsap } from '@scripts/core/gsap';
import { hasFinePointer, prefersReducedMotion } from '@scripts/core/motion';
import { qs } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Carousel implements AppModule {
  private embla: EmblaCarouselType | null = null;
  private prev: HTMLButtonElement | null;
  private next: HTMLButtonElement | null;
  private viewport: HTMLElement | null;
  private cursor: HTMLElement | null;
  private xTo: gsap.QuickToFunc | null = null;
  private yTo: gsap.QuickToFunc | null = null;

  constructor(el: HTMLElement) {
    this.viewport = qs<HTMLElement>('[data-carousel-viewport]', el);
    this.prev = qs<HTMLButtonElement>('[data-carousel-prev]', el);
    this.next = qs<HTMLButtonElement>('[data-carousel-next]', el);
    this.cursor = qs<HTMLElement>('[data-carousel-cursor]', el);
    if (!this.viewport) return;

    this.embla = EmblaCarousel(this.viewport, {
      align: 'start',
      containScroll: 'trimSnaps',
      skipSnaps: true,
      dragFree: el.dataset.free !== undefined,
      duration: prefersReducedMotion() ? 10 : 32,
    });

    this.prev?.addEventListener('click', this.onPrev);
    this.next?.addEventListener('click', this.onNext);
    this.embla
      .on('select', this.updateButtons)
      .on('reInit', this.updateButtons)
      .on('init', this.updateButtons);
    this.updateButtons();

    if (this.cursor && hasFinePointer()) {
      this.xTo = gsap.quickTo(this.cursor, 'x', { duration: 0.5, ease: 'power3' });
      this.yTo = gsap.quickTo(this.cursor, 'y', { duration: 0.5, ease: 'power3' });
      this.viewport.addEventListener('pointerenter', this.onEnter);
      this.viewport.addEventListener('pointerleave', this.onLeaveVp);
      this.viewport.addEventListener('pointermove', this.onMove);
      this.embla.on('pointerDown', () => this.cursor?.classList.add('is-down'));
      this.embla.on('pointerUp', () => this.cursor?.classList.remove('is-down'));
    }
  }

  private onPrev = () => this.embla?.scrollPrev();
  private onNext = () => this.embla?.scrollNext();

  private updateButtons = () => {
    if (!this.embla) return;
    if (this.prev) this.prev.disabled = !this.embla.canScrollPrev();
    if (this.next) this.next.disabled = !this.embla.canScrollNext();
  };

  private onEnter = (e: PointerEvent) => {
    if (!this.cursor || !this.viewport) return;
    const r = this.viewport.getBoundingClientRect();
    gsap.set(this.cursor, { x: e.clientX - r.left, y: e.clientY - r.top });
    gsap.to(this.cursor, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' });
  };

  private onLeaveVp = () => {
    if (this.cursor) gsap.to(this.cursor, { scale: 0.4, autoAlpha: 0, duration: 0.3 });
  };

  private onMove = (e: PointerEvent) => {
    if (!this.viewport) return;
    const r = this.viewport.getBoundingClientRect();
    this.xTo?.(e.clientX - r.left);
    this.yTo?.(e.clientY - r.top);
  };

  destroy() {
    this.prev?.removeEventListener('click', this.onPrev);
    this.next?.removeEventListener('click', this.onNext);
    this.viewport?.removeEventListener('pointerenter', this.onEnter);
    this.viewport?.removeEventListener('pointerleave', this.onLeaveVp);
    this.viewport?.removeEventListener('pointermove', this.onMove);
    this.embla?.destroy();
  }
}
