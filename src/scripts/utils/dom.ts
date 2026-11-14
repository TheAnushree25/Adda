export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);

export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/** Deterministic pseudo-random number in [0, 1) from an integer seed. */
export const seeded = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps keyboard focus inside `container` until the returned function is called. */
export function trapFocus(container: HTMLElement) {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const items = qsa<HTMLElement>(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKey);
  const firstFocusable = qs<HTMLElement>(FOCUSABLE, container);
  (firstFocusable ?? container).focus({ preventScroll: true });
  return () => {
    document.removeEventListener('keydown', onKey);
    previouslyFocused?.focus?.({ preventScroll: true });
  };
}
