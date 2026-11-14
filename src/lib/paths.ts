/**
 * Site-relative URLs that respect Astro's `base` option, so the site works at
 * the domain root (`/`) and under a sub-path such as GitHub Pages (`/Adda/`).
 */
const rawBase = import.meta.env.BASE_URL || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/** `url('/menu/')` → `/menu/` or `/Adda/menu/`; external links, `#hash`, `mailto:` and `tel:` pass through. */
export function url(path: string): string {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(path)) return path;
  return base + path.replace(/^\/+/, '');
}

export const basePath = base;
