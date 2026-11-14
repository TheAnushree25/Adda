import { site } from '@data/site';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: site.currency,
  minimumFractionDigits: 2,
});

/** "$14.50" — prices always show cents, like a printed menu. */
export const formatPrice = (amount: number) => money.format(amount);

/** Turns "Golden Hour" into "golden-hour" for ids. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
