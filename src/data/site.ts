import { url } from '@lib/paths';

/**
 * Brand, contact and navigation settings.
 * Everything here is placeholder content — edit this file to rebrand the site.
 */

export const site = {
  name: 'Mirabelle',
  legalName: 'Mirabelle Café & Bistro',
  tagline: 'Café · Bistro · Bar',
  since: 1987,
  description:
    'Mirabelle is a neighbourhood café, bistro and bar: slow coffee in the morning, generous plates all day and long, lively evenings with live music.',
  locale: 'en',
  /** IANA time zone the opening hours are written in. */
  timeZone: 'America/New_York',
  currency: 'USD',
  address: {
    street: '12 Market Lane',
    city: 'Old Town',
    region: 'NY',
    postalCode: '10001',
    country: 'US',
  },
  /** Placeholder 555-01xx numbers are reserved for fiction. */
  phone: { display: '(555) 010-1987', href: 'tel:+15550101987' },
  email: 'hello@mirabelle.example',
  mapsUrl: 'https://www.openstreetmap.org/search?query=12%20Market%20Lane',
  orderUrl: url('/#order'),
  giftUrl: url('/#gift-cards'),
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' },
  ],
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const navLeft: NavLink[] = [
  { label: 'Menus', href: url('/menu/') },
  { label: 'The Café', href: url('/about/') },
];

export const navRight: NavLink[] = [
  { label: 'Live Nights', href: url('/events/') },
  { label: 'Private Dining', href: url('/private-dining/') },
];

export const footerNav: NavLink[] = [{ label: 'Home', href: url('/') }, ...navLeft, ...navRight];

/** Rotating announcements in the top banner. */
export const bannerMessages = [
  { title: 'Golden Hour', detail: 'Every day from 4 to 7 pm.' },
  { title: 'Lunch Club', detail: 'Weekdays from 11:30 am to 3 pm.' },
  { title: 'Pasta Tuesday', detail: 'Fresh pasta all night, from $14.' },
  { title: 'Live music', detail: 'Fridays and Saturdays from 9 pm.' },
];
