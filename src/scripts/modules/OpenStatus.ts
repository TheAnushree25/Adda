/** Live "Open now / Closed" badge, refreshed every minute. */
import { openStatus } from '@scripts/utils/hours';
import { services } from '@data/hours';
import { site } from '@data/site';
import type { AppModule } from '@scripts/core/registry';

export default class OpenStatus implements AppModule {
  private el: HTMLElement;
  private timer: number;

  constructor(el: HTMLElement) {
    this.el = el;
    this.update();
    this.timer = window.setInterval(() => this.update(), 60_000);
  }

  private update() {
    const main = services[0];
    if (!main) return;
    const status = openStatus(main, site.timeZone);
    this.el.textContent = status.label;
    this.el.classList.toggle('is-open', status.open);
    this.el.classList.toggle('is-closed', !status.open);
  }

  destroy() {
    window.clearInterval(this.timer);
  }
}
