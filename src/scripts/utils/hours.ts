/**
 * Opening-hours helpers, evaluated in the café's own time zone so the status is
 * correct wherever the visitor is.
 */
import type { ServiceHours, Weekday } from '@data/hours';

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Current weekday and minutes since midnight in `timeZone`. */
export function nowIn(timeZone: string, date = new Date()): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')) as Weekday;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function formatTime(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const suffix = h >= 12 && h < 24 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
}

export interface OpenStatus {
  open: boolean;
  label: string;
}

/** Open/closed status for a service, handling closing times after midnight. */
export function openStatus(service: ServiceHours, timeZone: string, date = new Date()): OpenStatus {
  const { day, minutes } = nowIn(timeZone, date);
  const prevDay = ((day + 6) % 7) as Weekday;

  // Still open from yesterday's late shift?
  const prev = service.days[prevDay];
  if (prev) {
    const [o, c] = prev.map(toMinutes) as [number, number];
    if (c <= o && minutes < c) return { open: true, label: `Open now — until ${formatTime(prev[1])}` };
  }

  const today = service.days[day];
  if (today) {
    const [o, c] = today.map(toMinutes) as [number, number];
    const closesAfterMidnight = c <= o;
    if (minutes >= o && (closesAfterMidnight || minutes < c)) {
      return { open: true, label: `Open now — until ${formatTime(today[1])}` };
    }
    if (minutes < o) return { open: false, label: `Closed — opens at ${formatTime(today[0])}` };
  }

  // Find the next opening day.
  for (let i = 1; i <= 7; i++) {
    const d = ((day + i) % 7) as Weekday;
    const next = service.days[d];
    if (next) {
      const when =
        i === 1
          ? 'tomorrow'
          : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d];
      return { open: false, label: `Closed — opens ${when} at ${formatTime(next[0])}` };
    }
  }
  return { open: false, label: 'Closed' };
}
