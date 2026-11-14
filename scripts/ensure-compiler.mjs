#!/usr/bin/env node
/**
 * Makes sure Astro's compiler can load before dev/build/check run.
 *
 * Astro's compiler is a native binary. Some Windows machines (Smart App Control,
 * WDAC) refuse to load unsigned native files, so the native binding fails with
 * "An Application Control policy has blocked this file". The compiler also ships
 * a WebAssembly build that Astro falls back to automatically, but npm skips it
 * because it targets the `wasm32` CPU. This script installs that fallback only
 * when it is actually needed, and is a no-op everywhere else.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(join(root, 'package.json'));

function compilerLoads() {
  try {
    require('@astrojs/compiler-binding');
    return true;
  } catch {
    return false;
  }
}

if (compilerLoads()) process.exit(0);

const { version } = require('@astrojs/compiler-binding/package.json');
const pkg = `@astrojs/compiler-binding-wasm32-wasi@${version}`;
const dest = join(root, 'node_modules', '@astrojs', 'compiler-binding-wasm32-wasi');
console.warn(
  `[ensure-compiler] Native Astro compiler is blocked on this machine; installing ${pkg} as a fallback.`,
);

const tmp = mkdtempSync(join(tmpdir(), 'astro-wasi-'));
try {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execFileSync(npm, ['pack', pkg, '--silent', '--pack-destination', tmp], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  const tarball = readdirSync(tmp).find((f) => f.endsWith('.tgz'));
  if (!tarball) throw new Error('npm pack produced no tarball');
  mkdirSync(dest, { recursive: true });
  execFileSync('tar', ['-xzf', join(tmp, tarball), '-C', dest, '--strip-components=1'], { stdio: 'inherit' });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (!existsSync(join(dest, 'package.json')) || !compilerLoads()) {
  console.error('[ensure-compiler] The WebAssembly compiler could not be loaded either.');
  process.exit(1);
}
console.warn('[ensure-compiler] Using the WebAssembly Astro compiler.');
