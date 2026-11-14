import type { APIRoute } from 'astro';
import { url } from '@lib/paths';

/** robots.txt generated at build time so the sitemap URL follows `site` and `base`. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(url('/sitemap-index.xml'), site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
