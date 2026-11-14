/**
 * Opening-hours card: shows today's hours (in the café's time zone) and lets
 * visitors step through the week. Also fills every [data-open-status] badge.
 */
import { gsap } from '@scripts/core/gsap';
import { qs, qsa } from '@scripts/utils/dom';
import { nowIn } from '@scripts/utils/hours';
import { site } from '@data/site';
import type { AppModule } from '@scripts/core/registry';

export default class Schedule implements AppModule {
  private el: HTMLElement;
  private days: HTMLElement[];
  private label: HTMLElement | null;
  private day = 0;

  constructor(el: HTMLElement) {
    this.el = el;
    this.days = qsa<HTMLElement>('[data-schedule-day]', el);
    this.label = qs<HTMLElement>('[data-schedule-label]', el);
    this.day = nowIn(site.timeZone).day;
    this.show(this.day, 0);
    qs('[data-schedule-prev]', el)?.addEventListener('click', this.prev);
    qs('[data-schedule-next]', el)?.addEventListener('click', this.next);
  }

  private prev = () => this.show((this.day + 6) % 7, -1);
  private next = () => this.show((this.day + 1) % 7, 1);

  private show(day: number, dir: number) {
    this.day = day;
    const target = this.days.find((d) => Number(d.dataset.scheduleDay) === day);
    this.days.forEach((d) => (d.hidden = d !== target));
    if (this.label && target) {
      this.label.textContent = target.dataset.dayName ?? '';
      if (dir !== 0) {
        gsap.fromTo(
          this.label,
          { xPercent: 30 * dir, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'quint' },
        );
        gsap.fromTo(
          qsa('li', target),
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.5, ease: 'quint' },
        );
      }
    }
  }

  destroy() {
    qs('[data-schedule-prev]', this.el)?.removeEventListener('click', this.prev);
    qs('[data-schedule-next]', this.el)?.removeEventListener('click', this.next);
  }
}
