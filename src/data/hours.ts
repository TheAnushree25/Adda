/**
 * Opening hours per service. Times are 24h "HH:MM" in the café's time zone
 * (see site.timeZone). A closing time past midnight is written as e.g. "01:00".
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface ServiceHours {
  label: string;
  /** [open, close] per weekday; null means closed that day. */
  days: Record<Weekday, [string, string] | null>;
}

const every = (open: string, close: string): ServiceHours['days'] => ({
  0: [open, close],
  1: [open, close],
  2: [open, close],
  3: [open, close],
  4: [open, close],
  5: [open, close],
  6: [open, close],
});

export const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The first entry drives the "open now" status. */
export const services: ServiceHours[] = [
  {
    label: 'Dining room',
    days: { ...every('07:00', '23:00'), 5: ['07:00', '00:00'], 6: ['08:00', '00:00'], 0: ['08:00', '22:00'] },
  },
  {
    label: 'Bar',
    days: { ...every('11:00', '00:00'), 5: ['11:00', '01:00'], 6: ['11:00', '01:00'], 0: ['11:00', '23:00'] },
  },
  {
    label: 'Breakfast',
    days: { ...every('07:00', '11:00'), 6: null, 0: null },
  },
  {
    label: 'Weekend brunch',
    days: { 0: ['08:00', '15:00'], 1: null, 2: null, 3: null, 4: null, 5: null, 6: ['08:00', '15:00'] },
  },
  { label: 'Golden Hour', days: every('16:00', '19:00') },
  { label: 'Takeaway', days: every('11:00', '22:00') },
  { label: 'Delivery', days: { ...every('11:00', '22:00'), 0: ['12:00', '21:00'] } },
];
