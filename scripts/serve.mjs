#!/usr/bin/env node
/**
 * Dependency-free static server for the production build in `dist/`.
 *
 * Use it to preview the built site when `astro preview` can't run (for example
 * when Windows Smart App Control blocks Astro's native compiler binary).
 * It mirrors the production setup: directory indexes, the custom 404 page and
 * the security/caching headers from `dist/_headers`.
 *
 *   node scripts/serve.mjs [port]        (default 4322, host 127.0.0.1)
 *
 * For a sub-path build (e.g. GitHub Pages, `npm run build:pages`), set BASE so
 * URLs are served the same way: `node scripts/serve.mjs 4322 /Adda/` (or BASE=/Adda/).
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4322);
const HOST = process.env.HOST ?? '127.0.0.1';
const BASE = `/${(process.argv[3] ?? process.env.BASE ?? '').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');

if (!existsSync(join(ROOT, 'index.html'))) {
  console.error(`No build found in ${ROOT}. Run "npm run build" first.`);
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json; charset=utf-8',
};

/** Parses Netlify-style `_headers` into [{ pattern, headers }]. */
function loadHeaderRules() {
  const file = join(ROOT, '_headers');
  if (!existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      const source = raw
        .trim()
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      current = { pattern: new RegExp(`^${source}$`), headers: {} };
      rules.push(current);
    } else if (current) {
      const i = raw.indexOf(':');
      if (i > 0) current.headers[raw.slice(0, i).trim()] = raw.slice(i + 1).trim();
    }
  }
  return rules;
}

const rules = loadHeaderRules();

function headersFor(pathname) {
  const out = {};
  for (const rule of rules) if (rule.pattern.test(pathname)) Object.assign(out, rule.headers);
  // Plain-HTTP localhost: HSTS is meaningless and upgrading requests to https would break loading.
  delete out['Strict-Transport-Security'];
  if (out['Content-Security-Policy']) {
    out['Content-Security-Policy'] = out['Content-Security-Policy'].replace(
      /;\s*upgrade-insecure-requests/,
      '',
    );
  }
  return out;
}

/** Maps a URL path to a file inside ROOT, or null if it would escape it. */
function toFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const file = resolve(ROOT, `.${decoded}`);
  return file === ROOT || file.startsWith(ROOT + sep) ? file : null;
}

function send(res, status, file, extra = {}, head = false) {
  const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  const { size } = statSync(file);
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': size, ...extra });
  if (head) return res.end();
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  const started = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - started}ms`));

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const { pathname: requested } = new URL(req.url ?? '/', 'http://localhost');
  const head = req.method === 'HEAD';

  // Sub-path builds: "/Adda" -> "/Adda/", anything outside the base is a 404.
  if (BASE !== '/' && `${requested}/` === BASE) {
    res.writeHead(301, { Location: BASE }).end();
    return;
  }
  const insideBase = requested.startsWith(BASE);
  const pathname = insideBase ? `/${requested.slice(BASE.length)}` : requested;
  const file = insideBase ? toFile(pathname) : null;
  const headers = headersFor(pathname);

  if (file && existsSync(file)) {
    const stat = statSync(file);
    if (stat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${requested}/` }).end();
        return;
      }
      const index = join(file, 'index.html');
      if (existsSync(index)) return send(res, 200, index, headers, head);
    } else if (stat.isFile() && !pathname.endsWith('/_headers')) {
      return send(res, 200, file, headers, head);
    }
  }

  const notFound = join(ROOT, '404.html');
  if (existsSync(notFound)) return send(res, 404, notFound, headersFor('/404.html'), head);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`  Local: http://localhost:${PORT}${BASE}`);
});
