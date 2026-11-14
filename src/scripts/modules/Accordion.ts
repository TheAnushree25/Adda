/**
 * Accessible accordion. Markup: a [data-accordion-trigger] button with
 * aria-controls pointing to its panel. Panels animate their height.
 */
import { gsap, ScrollTrigger } from '@scripts/core/gsap';
import { qsa } from '@scripts/utils/dom';
import type { AppModule } from '@scripts/core/registry';

export default class Accordion implements AppModule {
  private triggers: HTMLButtonElement[];
  private single: boolean;

  constructor(root: HTMLElement) {
    this.triggers = qsa<HTMLButtonElement>('[data-accordion-trigger]', root);
    this.single = root.dataset.single !== undefined;
    this.triggers.forEach((t) => t.addEventListener('click', this.onClick));
  }

  private onClick = (e: Event) => {
    const trigger = e.currentTarget as HTMLButtonElement;
    const open = trigger.getAttribute('aria-expanded') !== 'true';
    if (open && this.single) {
      this.triggers
        .filter((t) => t !== trigger && t.getAttribute('aria-expanded') === 'true')
        .forEach((t) => this.set(t, false));
    }
    this.set(trigger, open);
  };

  private set(trigger: HTMLButtonElement, open: boolean) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
    if (!panel) return;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.closest('[data-accordion-item]')?.classList.toggle('is-open', open);
    gsap.killTweensOf(panel);
    if (open) {
      panel.hidden = false;
      gsap.fromTo(
        panel,
        { height: 0, autoAlpha: 0 },
        {
          height: 'auto',
          autoAlpha: 1,
          duration: 0.6,
          ease: 'quint',
          onComplete: () => ScrollTrigger.refresh(),
        },
      );
    } else {
      gsap.to(panel, {
        height: 0,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: () => {
          panel.hidden = true;
          ScrollTrigger.refresh();
        },
      });
    }
  }

  destroy() {
    this.triggers.forEach((t) => t.removeEventListener('click', this.onClick));
  }
}
