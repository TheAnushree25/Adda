/**
 * Modal sheet (e.g. "Find us", "Book a table"). Opened by any element with
 * `data-sheet-open="<id>"`; closed by Escape, the close button or the backdrop.
 */
import { gsap } from '@scripts/core/gsap';
import { scroll } from '@scripts/core/scroll';
import { qs, qsa, trapFocus } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Sheet implements AppModule {
  private el: HTMLElement;
  private panel: HTMLElement;
  private backdrop: HTMLElement | null;
  private isOpen = false;
  private release: (() => void) | null = null;

  constructor(el: HTMLElement) {
    this.el = el;
    this.panel = qs<HTMLElement>('[data-sheet-panel]', el)!;
    this.backdrop = qs<HTMLElement>('[data-sheet-backdrop]', el);
    document.addEventListener('click', this.onDocClick);
    document.addEventListener('keydown', this.onKey);
    document.addEventListener('app:leave', this.close);
    qsa('[data-sheet-close]', el).forEach((b) => b.addEventListener('click', this.close));
    this.backdrop?.addEventListener('click', this.close);
  }

  private onDocClick = (e: MouseEvent) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-sheet-open]');
    if (!trigger || trigger.dataset.sheetOpen !== this.el.id) return;
    e.preventDefault();
    if (this.isOpen) this.close();
    else this.open(trigger);
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isOpen) this.close();
  };

  open(_trigger?: HTMLElement) {
    // Only one sheet at a time.
    document.dispatchEvent(new CustomEvent('app:sheet-opening', { detail: this.el.id }));
    this.isOpen = true;
    qsa(`[data-sheet-open="${this.el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    this.el.hidden = false;
    document.documentElement.classList.add('sheet-open');
    scroll.stop();
    gsap.killTweensOf([this.panel, this.backdrop]);
    gsap.fromTo(this.backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(
      this.panel,
      { yPercent: 40, autoAlpha: 0, clipPath: 'inset(30% 0 0 0)' },
      { yPercent: 0, autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'quint' },
    );
    gsap.fromTo(
      qsa('[data-sheet-item]', this.panel),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05, delay: 0.15, ease: 'quint' },
    );
    this.release = trapFocus(this.panel);
    document.addEventListener('app:sheet-opening', this.onOtherOpening);
  }

  private onOtherOpening = (e: Event) => {
    if ((e as CustomEvent<string>).detail !== this.el.id) this.close();
  };

  close = () => {
    if (!this.isOpen) return;
    this.isOpen = false;
    document.removeEventListener('app:sheet-opening', this.onOtherOpening);
    qsa(`[data-sheet-open="${this.el.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.documentElement.classList.remove('sheet-open');
    this.release?.();
    this.release = null;
    scroll.start();
    gsap.to(this.backdrop, { autoAlpha: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(this.panel, {
      yPercent: 30,
      autoAlpha: 0,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: () => {
        if (!this.isOpen) this.el.hidden = true;
      },
    });
  };

  destroy() {
    document.removeEventListener('click', this.onDocClick);
    document.removeEventListener('keydown', this.onKey);
    document.removeEventListener('app:leave', this.close);
    document.removeEventListener('app:sheet-opening', this.onOtherOpening);
  }
}
