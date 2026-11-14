import type { ImageMetadata } from 'astro';
import roundTable from '@assets/images/room-round-table.jpg';
import room2 from '@assets/images/pd-room-2.jpg';
import room3 from '@assets/images/pd-room-3.jpg';
import bistro from '@assets/images/mood-bistro.jpg';
import bar from '@assets/images/mood-bar.jpg';
import terrace from '@assets/images/mood-terrace.jpg';

export interface Room {
  name: string;
  capacity: string;
  summary: string;
  services: string[];
  features: string[];
  image: ImageMetadata;
  alt: string;
}

export const rooms: Room[] = [
  {
    name: 'The Plum Room',
    capacity: '10 to 24 guests — 380 sq ft',
    summary: 'A warm, round-table room off the main dining room, made for birthdays and family dinners.',
    services: ['Set or sharing menus', 'Wine pairing on request', 'Dedicated server'],
    features: ['Natural light', 'Private sound system', 'Step-free access'],
    image: roundTable,
    alt: 'A round dining table with cane chairs and a leather banquette',
  },
  {
    name: 'The Garden Salon',
    capacity: '20 to 40 guests — 520 sq ft',
    summary: 'Leafy, bright and just separate enough — perfect for showers, launches and team lunches.',
    services: ['Cocktail reception', 'Custom printed menus', 'Screen and projector'],
    features: ['Planter wall', 'Flexible table layout', 'Close to the terrace'],
    image: room2,
    alt: 'A dining room with leather chairs and a wall of green plants',
  },
  {
    name: 'The Fireside Lounge',
    capacity: '12 to 30 guests — 450 sq ft',
    summary: 'Velvet chairs, a crackling fireplace and a private bar for the evenings worth remembering.',
    services: ['Private bartender', 'Canapés and grazing boards', 'Live music on request'],
    features: ['Working fireplace', 'Private bar', 'Lounge seating'],
    image: room3,
    alt: 'A lounge with blue velvet armchairs around a fireplace',
  },
];

export interface Mood {
  name: string;
  text: string;
  image: ImageMetadata;
  alt: string;
}

export const moods: Mood[] = [
  {
    name: 'The bistro',
    text: 'Bright and buzzing from the first espresso to the last dessert — long tables, wine shelves and the open kitchen in view.',
    image: bistro,
    alt: 'A bistro dining room with wooden chairs and wine shelves',
  },
  {
    name: 'The bar',
    text: 'Low lights, velvet stools and a cocktail list that changes with the season. Live music every weekend.',
    image: bar,
    alt: 'A bar with blue velvet stools and arched shelves',
  },
  {
    name: 'The terrace',
    text: 'String lights, olive trees and the last of the sun — open from the first warm day to the last.',
    image: terrace,
    alt: 'An outdoor terrace lit by string lights at night',
  },
];
