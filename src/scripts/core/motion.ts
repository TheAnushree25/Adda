/** Motion preferences and device capabilities. */

const reducedQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const finePointerQuery =
  typeof window !== 'undefined' ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;

export const prefersReducedMotion = (): boolean => !!reducedQuery?.matches;

export const hasFinePointer = (): boolean => !!finePointerQuery?.matches;

export const isTouch = (): boolean => !hasFinePointer();
