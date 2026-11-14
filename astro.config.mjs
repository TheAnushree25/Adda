// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Replace with the production domain before deploying (used for canonical URLs, OG tags and the sitemap).
const SITE_URL = process.env.SITE_URL ?? 'https://www.mirabelle.example';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    // Keep CSS in external files so the Content-Security-Policy can stay strict.
    inlineStylesheets: 'never',
    format: 'directory',
  },
  image: {
    // Generate modern formats; the <Picture> component falls back to the original JPEG.
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
  server: { port: 4321, host: true },
  vite: {
    build: {
      // Never inline scripts or assets as data URIs: keeps `script-src 'self'` valid.
      assetsInlineLimit: 0,
      cssMinify: 'lightningcss',
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        // Roughly: last 2 versions of evergreen browsers + Safari 15.4+.
        targets: { chrome: 111 << 16, edge: 111 << 16, firefox: 113 << 16, safari: (15 << 16) | (4 << 8) },
      },
    },
  },
});
