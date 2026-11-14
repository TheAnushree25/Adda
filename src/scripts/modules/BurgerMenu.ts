/**
 * Full-screen mobile menu: clip-path reveal, staggered links, focus trap,
 * Escape to close, and auto-close on navigation.
 */
import { gsap } from '@scripts/core/gsap';
import { scroll } from '@scripts/core/scroll';
import { qs, qsa, trapFocus } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class BurgerMenu implements AppModule {
  private toggle: HTMLButtonElement;
  private panel: HTMLElement;
  private open = false;
  private release: (() => void) | null = null;
  private tl: gsap.core.Timeline | null = null;

  constructor(el: HTMLElement) {
    this.toggle = el as HTMLButtonElement;
    this.panel = qs<HTMLElement>(`#${el.getAttribute('aria-controls')}`)!;
    this.toggle.addEventListener('click', this.onToggle);
    document.addEventListener('keydown', this.onKey);
    document.addEventListener('app:leave', this.close);
    qsa<HTMLAnchorElement>('a', this.panel).forEach((a) => a.addEventListener('click', this.close));
  }

  private onToggle = () => (this.open ? this.close() : this.show());

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) this.close();
  };

  private show() {
    if (this.open || !this.panel) return;
    this.open = true;
    this.toggle.setAttribute('aria-expanded', 'true');
    this.toggle.setAttribute('aria-label', 'Close menu');
    document.documentElement.classList.add('menu-open');
    this.panel.hidden = false;
    scroll.stop();
    this.tl?.kill();
    this.tl = gsap
      .timeline()
      .fromTo(
        this.panel,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' },
      )
      .fromTo(
        qsa('[data-menu-item]', this.panel),
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: 'quint' },
        0.35,
      );
    this.release = trapFocus(this.panel);
  }

  private close = () => {
    if (!this.open || !this.panel) return;
    this.open = false;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', 'Open menu');
    document.documentElement.classList.remove('menu-open');
    this.release?.();
    this.release = null;
    scroll.start();
    this.tl?.kill();
    this.tl = gsap.timeline().to(this.panel, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
      ease: 'expo.inOut',
      onComplete: () => {
        this.panel.hidden = true;
      },
    });
  };

  destroy() {
    this.toggle.removeEventListener('click', this.onToggle);
    document.removeEventListener('keydown', this.onKey);
    document.removeEventListener('app:leave', this.close);
  }
}
