/**
 * Menu page: sticky menu tabs + quick-access list with scroll-spy, and
 * dietary filters that hide non-matching dishes and update every count.
 */
import { gsap, ScrollTrigger } from '@scripts/core/gsap';
import { scroll } from '@scripts/core/scroll';
import { qs, qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class MenuPage implements AppModule {
  private el: HTMLElement;
  private observer: IntersectionObserver;
  private filters = new Set<string>();
  private chips: HTMLButtonElement[];
  private onClickLink = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-menu-jump]');
    if (!a) return;
    const id = a.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    const offset = -(qs<HTMLElement>('[data-menu-tabs]', this.el)?.offsetHeight ?? 0) - 24;
    scroll.to(target, { offset });
    history.replaceState(null, '', `#${id}`);
  };

  constructor(el: HTMLElement) {
    this.el = el;
    this.chips = qsa<HTMLButtonElement>('[data-filter]', el);
    this.chips.forEach((c) => c.addEventListener('click', this.onChip));
    qs('[data-filter-reset]', el)?.addEventListener('click', this.reset);
    el.addEventListener('click', this.onClickLink);

    // Scroll-spy: highlight the section currently in view.
    const links = qsa<HTMLAnchorElement>('a[data-menu-jump]', el);
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === `#${id}`));
          const menuId = (entry.target as HTMLElement).dataset.menuOf;
          if (menuId) {
            qsa<HTMLAnchorElement>('[data-menu-tab]', el).forEach((t) =>
              t.classList.toggle('is-current', t.dataset.menuTab === menuId),
            );
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    qsa('[data-menu-section]', el).forEach((s) => this.observer.observe(s));
    this.apply();
  }

  private onChip = (e: Event) => {
    const chip = e.currentTarget as HTMLButtonElement;
    const tag = chip.dataset.filter!;
    const on = !this.filters.has(tag);
    if (on) this.filters.add(tag);
    else this.filters.delete(tag);
    chip.setAttribute('aria-pressed', String(on));
    this.apply(true);
  };

  private reset = () => {
    this.filters.clear();
    this.chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    this.apply(true);
  };

  private apply(animate = false) {
    const wanted = [...this.filters];
    let total = 0;
    qsa<HTMLElement>('[data-menu-section]', this.el).forEach((section) => {
      let count = 0;
      qsa<HTMLElement>('[data-dish]', section).forEach((dish) => {
        const tags = (dish.dataset.tags ?? '').split(' ');
        const show = wanted.every((t) => tags.includes(t));
        const wasHidden = dish.hidden;
        dish.hidden = !show;
        if (show) count++;
        if (animate && show && wasHidden)
          gsap.fromTo(dish, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'quint' });
      });
      total += count;
      section.hidden = count === 0;
      qsa(`[data-count-for="${section.id}"]`).forEach((c) => (c.textContent = String(count)));
      const link = qs<HTMLElement>(`a[data-menu-jump][href="#${section.id}"]`, this.el);
      link?.closest('li')?.toggleAttribute('hidden', count === 0);
    });
    const status = qs('[data-filter-status]', this.el);
    if (status)
      status.textContent = `${this.filters.size} filter${this.filters.size === 1 ? '' : 's'} active · ${total} dishes`;
    qs('[data-menu-empty]', this.el)?.toggleAttribute('hidden', total > 0);
    if (animate) ScrollTrigger.refresh();
  }

  destroy() {
    this.observer.disconnect();
    this.chips.forEach((c) => c.removeEventListener('click', this.onChip));
    qs('[data-filter-reset]', this.el)?.removeEventListener('click', this.reset);
    this.el.removeEventListener('click', this.onClickLink);
  }
}
