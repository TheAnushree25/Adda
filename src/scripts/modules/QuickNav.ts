/**
 * Floating quick-action bar at the bottom of the viewport. Slides away while
 * scrolling down and returns when scrolling up or near the page edges.
 */
import { scroll } from '@scripts/core/scroll';
import type { AppModule } from '@scripts/core/registry';

export default class QuickNav implements AppModule {
  private el: HTMLElement;
  private off: () => void;
  private hidden = false;

  constructor(el: HTMLElement) {
    this.el = el;
    this.off = scroll.on(({ y, direction }) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const nearEdge = y < 80 || y > max - 120;
      const forceShow = document.documentElement.classList.contains('sheet-open');
      this.setHidden(!forceShow && !nearEdge && direction === 1);
    });
  }

  private setHidden(hidden: boolean) {
    if (hidden === this.hidden) return;
    this.hidden = hidden;
    this.el.classList.toggle('is-hidden', hidden);
  }

  destroy() {
    this.off();
  }
}
