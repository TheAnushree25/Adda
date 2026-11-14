/**
 * Coordinates the first-visit intro (the facade lighting up) with the page.
 * `public/js/boot.js` decides before first paint whether the intro runs
 * (html.intro-active) or is skipped; modules await `whenIntroDone()` before
 * starting their own entrance animations.
 */

let finished = false;
const waiters: Array<() => void> = [];

export const introRunning = (): boolean =>
  !finished && document.documentElement.classList.contains('intro-active');

export function whenIntroDone(): Promise<void> {
  if (!introRunning()) return Promise.resolve();
  return new Promise((resolve) => waiters.push(resolve));
}

export function markIntroDone() {
  if (finished) return;
  finished = true;
  document.documentElement.classList.remove('intro-active');
  document.documentElement.classList.add('intro-done');
  waiters.splice(0).forEach((resolve) => resolve());
  document.dispatchEvent(new CustomEvent('app:intro-done'));
}
