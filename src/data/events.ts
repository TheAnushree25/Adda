import type { ImageMetadata } from 'astro';
import e1 from '@assets/images/event-1.jpg';
import e2 from '@assets/images/event-2.jpg';
import e3 from '@assets/images/event-3.jpg';
import e4 from '@assets/images/event-4.jpg';
import e5 from '@assets/images/event-5.jpg';
import e6 from '@assets/images/event-6.jpg';

export interface LiveEvent {
  artist: string;
  genre: string;
  /** ISO date (YYYY-MM-DD) in the café's time zone. */
  date: string;
  time: string;
  image: ImageMetadata;
  alt: string;
}

/** Placeholder line-up — all artists are fictional. */
export const events: LiveEvent[] = [
  {
    artist: 'Nora Vale',
    genre: 'Indie folk',
    date: '2026-11-20',
    time: '9:30 pm',
    image: e1,
    alt: 'A singer performing under purple stage lights',
  },
  {
    artist: 'The Late Arrivals',
    genre: 'Classic rock',
    date: '2026-11-27',
    time: '9:30 pm',
    image: e2,
    alt: 'A rock band playing on a smoky stage',
  },
  {
    artist: 'Juno Blake',
    genre: 'Pop & soul',
    date: '2026-12-04',
    time: '9:30 pm',
    image: e3,
    alt: 'A singer with a microphone in blue light',
  },
  {
    artist: 'Sundown Social',
    genre: 'Funk & disco',
    date: '2026-12-11',
    time: '10:00 pm',
    image: e4,
    alt: 'A band on stage in front of a crowd with red and blue lights',
  },
  {
    artist: 'Lena Marlow',
    genre: 'Jazz vocals',
    date: '2026-12-18',
    time: '9:00 pm',
    image: e5,
    alt: 'A singer holding a vintage microphone',
  },
  {
    artist: 'Ruby Kane',
    genre: 'Acoustic rock',
    date: '2027-01-08',
    time: '9:30 pm',
    image: e6,
    alt: 'A guitarist singing into a microphone',
  },
];

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(new Date(`${iso}T12:00:00Z`));

export const formatEventDay = (iso: string) => fmt(iso, { day: '2-digit', month: 'long' });
export const formatEventMonth = (iso: string) => fmt(iso, { month: 'long', year: 'numeric' });

/** Groups events by "Month YYYY", preserving order. */
export function groupEventsByMonth(list: LiveEvent[]) {
  const groups = new Map<string, LiveEvent[]>();
  for (const ev of list) {
    const key = formatEventMonth(ev.date);
    groups.set(key, [...(groups.get(key) ?? []), ev]);
  }
  return [...groups.entries()].map(([month, items]) => ({ month, items }));
}
