# Mirabelle — café, bistro & bar

[![CI](https://github.com/TheAnushree25/Adda/actions/workflows/ci.yml/badge.svg)](https://github.com/TheAnushree25/Adda/actions/workflows/ci.yml)

A cinematic marketing site for a neighbourhood café-restaurant. All content (brand name, copy, menu, events,
photos) is **placeholder** and lives in `src/data/` and `src/assets/images/` so it can be swapped quickly.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | [Astro 7](https://astro.build) (static output) | Ships zero JS by default, pre-renders every page, optimises images at build time |
| Motion | [GSAP 3](https://gsap.com) (ScrollTrigger, SplitText, MotionPath, CustomEase) | Timeline-grade scroll, reveal and lettering animations |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering) | Inertia scrolling, synced to GSAP's ticker |
| Page transitions | [Swup 4](https://swup.js.org) + JS, Head and Preload plugins | Curtain transitions between pages without a SPA framework |
| WebGL | [OGL](https://github.com/oframe/ogl) | ~10 kB WebGL wrapper for the hero's organic mask, lens and grain |
| Carousels | [Embla Carousel](https://www.embla-carousel.com) | Small, accessible, MIT-licensed drag carousel |
| Fonts | Fraunces, Newsreader, Nunito via Fontsource; the hero lettering is pre-built SVG (no font download) | Self-hosted fonts (no third-party requests) |
| Quality | TypeScript (strict), ESLint, Prettier, `astro check` | |

## Getting started

Requires **Node 22.23+** (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:4321
```

On Windows PowerShell with script execution disabled, use `npm.cmd run dev`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the production build (Astro) |
| `npm run lettering` | Regenerates the hero's SVG lettering from `scripts/build-lettering.mjs` |
| `npm run serve` | Serves `dist/` with plain Node and the production security headers (no native binaries needed) |
| `npm run check` | Type-checks `.astro` and `.ts` files |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run verify` | check + lint + build |

## Project structure

```
public/                 Static files copied as-is (favicon, manifest, security headers, boot script)
src/
  assets/images/        Photography (optimised to responsive WebP at build) + CREDITS.md
  components/
    layout/             Header, mobile menu, quick-action bar + sheets, footer, hours card, transition curtain
    sections/home/      One component per homepage section
    sections/shared/    Pieces reused across pages (event card, stat bubbles)
    ui/                 Buttons, icons, logo, monogram, curved titles, brush band, gift-card art…
  data/                 All editable content: site settings, hours, menus, events, specials, rooms, jobs, stats
  layouts/              BaseLayout (SEO, Open Graph, JSON-LD, fonts, page shell)
  lib/                  Build-time helpers (organic SVG shape generators, formatting)
  pages/                Routes: /, /menu, /about, /events, /private-dining, /privacy, 404, robots.txt
  scripts/
    app.ts              Entry: boots scrolling, registers modules, wires page transitions
    core/               GSAP setup, Lenis, module registry, Swup transitions, motion preferences
    modules/            Behaviour attached via data-module="…" (header, hero, reveals, parallax, carousel…)
    gl/                 Hero WebGL scene + GLSL shaders
    utils/              DOM helpers, opening-hours logic
  styles/               Design tokens, reset, typography, layout primitives, shared components
```

### How behaviour is attached

Any element with `data-module="name"` gets an instance of `src/scripts/modules/<Name>.ts`. Modules clean up
after themselves (`destroy()`), so they are torn down before Swup swaps the page and re-created for the new one.
Heavier modules (WebGL hero, carousels, menu filters) are code-split and only load on pages that use them.

Scroll reveals are declarative: `data-reveal="lines" | "fade-up" | "fade" | "image" | "pop" | "stagger"`, with
optional `data-reveal-delay`. Parallax: `data-parallax="12"` (percent drift), `data-parallax-zoom`,
`data-parallax-rotate`.

## Editing content

- **Brand, address, phone, navigation, banner messages** → `src/data/site.ts`
- **Opening hours** (drives the live "Open now" badge, the footer card and JSON-LD) → `src/data/hours.ts`
  (times are read in `site.timeZone`)
- **Menus, prices, dietary tags** → `src/data/menu.ts`
- **Events** → `src/data/events.ts` · **Daily specials** → `src/data/specials.ts`
- **Private rooms & the About page moods** → `src/data/rooms.ts` · **Jobs** → `src/data/jobs.ts`
- **Photos** → replace files in `src/assets/images/` (keep the names, or update the imports)
- **Colours, type scale, spacing, easing** → `src/styles/settings/tokens.css` (palette from the brand Figma file: plum `#4b2b32`, deep plum `#321c22`, mauve `#7a4a54`, blush `#d9c4c8`, paper `#f7f6f4`, ink `#46181a`)
- **Hero lettering** → SVG artwork generated from Playfair Display (SIL OFL) by `scripts/build-lettering.mjs`: edit the words and each line's envelope (baseline wave, height swell, width rhythm) in `LINES`, then run `npm run lettering` to rewrite `src/data/lettering.json`. On load every letter travels along its own GSAP MotionPath curve into place; afterwards the headline is static. The hero is sized to fit exactly one screen.
- **First-visit intro** → facade photo `src/assets/images/loader-facade.jpg`; its light regions (percentages of the image) and sequence live in `src/components/layout/Intro.astro` and `src/scripts/modules/Intro.ts`. It plays once per browser session; open a new tab or clear session storage to see it again. Visitors can press Skip or Escape, and it never plays with reduced motion.

## Performance & accessibility

- Static HTML; images are resized to several widths and served as WebP with `srcset`/`sizes`.
- The hero WebGL scene renders only while visible, caps its pixel ratio, refuses software renderers, and steps
  down (lower resolution, then a static masked photo) if frames run slow.
- `prefers-reduced-motion` turns off smooth scrolling, page-transition and scroll animations; content stays visible
  without JavaScript.
- Landmarks, skip link, visible focus states, accessible accordions, dialogs (focus trap + Escape) and carousels.

## Security

- No inline scripts: everything loads from `/_astro` or `/js`, so the Content-Security-Policy can use
  `script-src 'self'`.
- Security headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame blocking)
  are configured in `public/_headers` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel).
- No cookies, trackers or third-party requests; fonts are self-hosted.

## Windows Smart App Control

On machines where Smart App Control or WDAC blocks unsigned native binaries, Astro's native compiler can't load. `npm run dev`, `build` and `check` run `scripts/ensure-compiler.mjs` first, which installs Astro's official WebAssembly compiler build (`@astrojs/compiler-binding-wasm32-wasi`) only when the native one is blocked; Astro then uses it automatically. Elsewhere the script does nothing.

## Deploying

The site is fully static: `npm run build` writes everything to `dist/`.

- **Vercel / Netlify / Cloudflare Pages** — import the repository; build command `npm run build`, output `dist`.
  Set `SITE_URL` to the real domain (used for canonical URLs, Open Graph and the sitemap). The security headers in
  `vercel.json` and `public/_headers` are picked up automatically.
- **GitHub Pages** — one-time setup: *Settings → Pages → Source: GitHub Actions*. Then open *Actions → Deploy to
  GitHub Pages → Run workflow*. It builds with the repository's sub-path as Astro's `base`
  (`https://<user>.github.io/Adda/`). Pages cannot send custom headers, so the CSP in `_headers` does not apply there.

To preview the GitHub Pages build locally:

```bash
npm run build:pages
BASE=/Adda/ npm run serve        # PowerShell: $env:BASE="/Adda/"; npm.cmd run serve
```

## GitHub workflows

- `.github/workflows/ci.yml` type-checks, lints and builds every push to `main` and every pull request.
- `.github/workflows/pages.yml` deploys to GitHub Pages, and only when started by hand.

## Credits

Placeholder photography from Unsplash — see `src/assets/images/CREDITS.md`. Simplex noise in the hero shader is
from Ashima Arts / Stefan Gustavson's `webgl-noise` (MIT).
