export interface Stat {
  value: number;
  label: string;
  /** Bubble colour (CSS colour or variable). */
  color: string;
  /** Text colour on the bubble (defaults to paper). */
  ink?: string;
}

export const stats: Stat[] = [
  { value: 120, label: 'Seats on the terrace', color: 'var(--c-blush)', ink: 'var(--c-plum)' },
  { value: 38, label: 'People in our crew', color: 'var(--c-plum)' },
  { value: 180, label: 'Seats inside', color: 'var(--c-deep)' },
  { value: 1987, label: 'The year it all began', color: 'var(--c-mauve)' },
];
