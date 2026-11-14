/**
 * Site header: rotating banner announcements, hide-on-scroll-down /
 * show-on-scroll-up behaviour, page-theme sync and active link state.
 */
import { gsap } from '@scripts/core/gsap';
import { scroll } from '@scripts/core/scroll';
import { prefersReducedMotion } from '@scripts/core/motion';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

const HIDE_AFTER = 160;
const ROTATE_EVERY = 4.5; // seconds

export default class Header implements AppModule {
  private el: HTMLElement;
  private messages: HTMLElement[];
  private current = 0;
  private timer: gsap.core.Tween | null = null;
  private offScroll: () => void;
  private hidden = false;
  private compact = false;
  private locked = false;

  constructor(el: HTMLElement) {
    this.el = el;
    this.messages = qsa<HTMLElement>('[data-header-message]', el);
    this.setupBanner();
    this.offScroll = scroll.on(({ y, direction }) => this.onScroll(y, direction));
    this.syncPage();
    document.addEventListener('app:page', this.syncPage);
    document.addEventListener('app:lock-header', this.onLock as EventListener);
  }

  /** Called after every page swap. */
  private syncPage = () => {
    const main = document.querySelector<HTMLElement>('#swup');
    this.el.dataset.theme = main?.dataset.headerTheme ?? 'paper';
    const path = location.pathname.replace(/\/?$/, '/');
    qsa<HTMLAnchorElement>('a[data-nav-link]').forEach((a) => {
      const href = new URL(a.href).pathname.replace(/\/?$/, '/');
      if (href === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    this.setState(false, false);
  };

  private onLock = (e: CustomEvent<boolean>) => {
    this.locked = e.detail;
    if (this.locked) this.setState(false, this.compact);
  };

  private onScroll(y: number, direction: 1 | -1) {
    if (this.locked) return;
    if (y < 40) return this.setState(false, false);
    if (direction === 1 && y > HIDE_AFTER) return this.setState(true, true);
    if (direction === -1) return this.setState(false, true);
  }

  private setState(hidden: boolean, compact: boolean) {
    if (hidden !== this.hidden) {
      this.hidden = hidden;
      this.el.classList.toggle('is-hidden', hidden);
    }
    if (compact !== this.compact) {
      this.compact = compact;
      this.el.classList.toggle('is-compact', compact);
    }
    // Sticky page elements (e.g. menu tabs) sit just below the visible header.
    document.documentElement.style.setProperty(
      '--header-offset',
      !this.hidden && this.compact ? 'var(--header-inner-h)' : '0px',
    );
  }

  private setupBanner() {
    if (this.messages.length < 2) return;
    gsap.set(this.messages.slice(1), { yPercent: 110, autoAlpha: 0 });
    if (prefersReducedMotion()) return;
    const next = () => {
      const out = this.messages[this.current]!;
      this.current = (this.current + 1) % this.messages.length;
      const inn = this.messages[this.current]!;
      out.setAttribute('aria-hidden', 'true');
      inn.removeAttribute('aria-hidden');
      gsap.to(out, { yPercent: -110, autoAlpha: 0, duration: 0.7, ease: 'power3.in' });
      gsap.fromTo(
        inn,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9, delay: 0.45, ease: 'quint' },
      );
      this.timer = gsap.delayedCall(ROTATE_EVERY, next);
    };
    this.timer = gsap.delayedCall(ROTATE_EVERY, next);
  }

  destroy() {
    this.timer?.kill();
    this.offScroll();
    document.removeEventListener('app:page', this.syncPage);
    document.removeEventListener('app:lock-header', this.onLock as EventListener);
  }
}
