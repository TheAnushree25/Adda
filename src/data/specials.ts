import type { ImageMetadata } from 'astro';
import coffee from '@assets/images/special-coffee.jpg';
import pasta from '@assets/images/special-pasta.jpg';
import fish from '@assets/images/special-fish.jpg';
import pizza from '@assets/images/special-pizza.jpg';
import soup from '@assets/images/special-soup.jpg';
import cocktails from '@assets/images/special-cocktails.jpg';

export interface Special {
  title: string;
  tagline: string;
  detail: string;
  image: ImageMetadata;
  alt: string;
  /** Section background while this special is centred. */
  color: string;
}

export const specials: Special[] = [
  {
    title: 'Morning Ritual',
    tagline: 'Flaky, buttery, unhurried.',
    detail: 'Every day from 7 to 11 am.',
    image: coffee,
    alt: 'A croissant beside a cup of black coffee on a pale wooden table',
    color: '#7a4a54',
  },
  {
    title: 'Lunch Club',
    tagline: 'A long lunch, a short bill.',
    detail: 'Weekdays from 11:30 am to 3 pm.',
    image: pasta,
    alt: 'A plate of spaghetti with salad on a rustic wooden table',
    color: '#4b2b32',
  },
  {
    title: 'Catch of the Day',
    tagline: 'Straight off the morning boat.',
    detail: 'Wednesdays and Fridays, while it lasts.',
    image: fish,
    alt: 'Seared fish with vegetables on a grey plate',
    color: '#5e3640',
  },
  {
    title: 'Pizza Night',
    tagline: 'Wood-fired, hand-stretched.',
    detail: 'Thursdays — two pizzas to go for $30.',
    image: pizza,
    alt: 'A colourful pizza surrounded by peppers and lemons',
    color: '#321c22',
  },
  {
    title: 'Soup & Bread',
    tagline: 'Something warm for the soul.',
    detail: 'Every weekday, a new pot at noon.',
    image: soup,
    alt: 'A bowl of creamy soup with a bread roll',
    color: '#46181a',
  },
  {
    title: 'Golden Hour',
    tagline: 'The best seat at five o’clock.',
    detail: 'Every day from 4 to 7 pm.',
    image: cocktails,
    alt: 'Four colourful cocktails seen from above on wooden slats',
    color: '#7a4a54',
  },
];
