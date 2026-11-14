#!/usr/bin/env node
/**
 * Builds the hero lettering: each line of the headline is set in Playfair
 * Display (SIL OFL), then the glyph outlines are bent through a per-line
 * envelope (baseline wave, height swell, width rhythm and a lean that follows
 * the curve) to read like hand-set display lettering.
 *
 * Output: src/data/lettering.json — one SVG path per letter, grouped by line,
 * plus each letter's centre for animation. Re-run after editing LINES:
 *   npm run lettering
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import * as opentypeNs from 'opentype.js';

const opentype = opentypeNs.parse ? opentypeNs : opentypeNs.default;

const root = fileURLToPath(new URL('..', import.meta.url));
const fontFile = (weight) =>
  join(
    root,
    'node_modules/@fontsource/playfair-display/files',
    `playfair-display-latin-${weight}-normal.woff`,
  );

/**
 * Envelope controls are [u, value] pairs along the line (u = 0 at the first
 * letter, 1 at the last), interpolated smoothly.
 *  baseline – vertical shift in em (positive = down)
 *  height   – vertical scale of the glyphs around the baseline
 *  width    – relative horizontal density (letters spread where it is larger)
 */
const LINES = [
  {
    text: 'Pull up',
    weight: 400,
    size: 1,
    condense: 0.84,
    tracking: -0.012,
    baseline: [
      [0, 0],
      [0.5, -0.01],
      [1, -0.035],
    ],
    height: [
      [0, 1.04],
      [0.35, 1.08],
      [1, 1],
    ],
    width: [
      [0, 1],
      [1, 1],
    ],
  },
  {
    text: 'a chair',
    weight: 400,
    size: 1,
    condense: 0.8,
    tracking: -0.01,
    baseline: [
      [0, 0],
      [0.45, 0.03],
      [0.8, 0.12],
      [1, 0.2],
    ],
    height: [
      [0, 1],
      [0.4, 1.08],
      [0.75, 1.3],
      [1, 1.42],
    ],
    width: [
      [0, 0.9],
      [0.6, 1.05],
      [1, 1.25],
    ],
  },
  {
    text: 'stay awhile',
    weight: 600,
    size: 1.2,
    condense: 0.88,
    tracking: -0.015,
    baseline: [
      [0, 0.02],
      [0.2, -0.05],
      [0.38, -0.02],
      [0.6, 0.07],
      [0.8, 0.04],
      [1, -0.08],
    ],
    height: [
      [0, 1],
      [0.25, 1.08],
      [0.5, 1.2],
      [0.72, 1.12],
      [1, 1.04],
    ],
    width: [
      [0, 0.95],
      [0.5, 1.12],
      [1, 0.95],
    ],
  },
];

const LINE_GAP = 0.94; // baseline-to-baseline distance in em (before per-line size)
const LEAN = 0.65; // how much letters lean with the baseline's slope
const ROUND = (n) => Math.round(n * 10) / 10;

/** Smooth 1D interpolation through [u, v] control pairs (Catmull-Rom). */
function spline(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0]);
  return (u) => {
    if (u <= pts[0][0]) return pts[0][1];
    if (u >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
    let i = 0;
    while (u > pts[i + 1][0]) i++;
    const p0 = pts[Math.max(i - 1, 0)][1];
    const p1 = pts[i][1];
    const p2 = pts[i + 1][1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)][1];
    const t = (u - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      0.5 *
      (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    );
  };
}

/** Cumulative horizontal remap from a width-density curve, normalised to 0..1. */
function remap(density) {
  const N = 400;
  const acc = [0];
  for (let i = 1; i <= N; i++) acc.push(acc[i - 1] + density((i - 0.5) / N) / N);
  const total = acc[N];
  return (u) => {
    const x = Math.min(Math.max(u, 0), 1) * N;
    const i = Math.floor(x);
    const f = x - i;
    const a = acc[i] ?? total;
    const b = acc[Math.min(i + 1, N)];
    return (a + (b - a) * f) / total;
  };
}

const fonts = new Map();
function font(weight) {
  if (!fonts.has(weight)) {
    const buf = readFileSync(fontFile(weight));
    fonts.set(weight, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return fonts.get(weight);
}

function buildLine(cfg, baselineY) {
  const f = font(cfg.weight);
  const em = f.unitsPerEm * cfg.size;
  const scale = cfg.size; // font units -> lettering units (1 em = 1000 * size)
  const glyphs = f.stringToGlyphs(cfg.text);

  // Natural layout with kerning and tracking.
  let pen = 0;
  const placed = glyphs.map((g, i) => {
    const x = pen;
    const kern = i < glyphs.length - 1 ? f.getKerningValue(g, glyphs[i + 1]) : 0;
    pen += g.advanceWidth + kern + cfg.tracking * f.unitsPerEm;
    return { g, x, char: cfg.text[i] };
  });
  const width = pen;

  const baseline = spline(cfg.baseline);
  const height = spline(cfg.height);
  const xmap = remap(spline(cfg.width));
  const slope = (u) => (baseline(Math.min(u + 0.01, 1)) - baseline(Math.max(u - 0.01, 0))) / 0.02;
  const lineWidth = width * cfg.condense * scale;

  const warp = (x, y) => {
    // x, y are in font units, y negative above the baseline.
    const u = Math.min(Math.max(x / width, 0), 1);
    const yy = y * height(u) * scale;
    const lean = -yy * slope(u) * LEAN * (em / lineWidth) * 0.6;
    return [xmap(u) * lineWidth + lean, baselineY + yy + baseline(u) * em];
  };

  const letters = placed
    .filter((p) => p.char !== ' ')
    .map(({ g, x, char }) => {
      const path = g.getPath(x, 0, f.unitsPerEm);
      let d = '';
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      const pt = (px, py) => {
        const [wx, wy] = warp(px, py);
        minX = Math.min(minX, wx);
        maxX = Math.max(maxX, wx);
        minY = Math.min(minY, wy);
        maxY = Math.max(maxY, wy);
        return `${ROUND(wx)} ${ROUND(wy)}`;
      };
      for (const c of path.commands) {
        if (c.type === 'M') d += `M${pt(c.x, c.y)}`;
        else if (c.type === 'L') d += `L${pt(c.x, c.y)}`;
        else if (c.type === 'Q') d += `Q${pt(c.x1, c.y1)} ${pt(c.x, c.y)}`;
        else if (c.type === 'C') d += `C${pt(c.x1, c.y1)} ${pt(c.x2, c.y2)} ${pt(c.x, c.y)}`;
        else if (c.type === 'Z') d += 'Z';
      }
      return { char, d, box: [ROUND(minX), ROUND(minY), ROUND(maxX), ROUND(maxY)] };
    });
  return { text: cfg.text, size: cfg.size, letters };
}

// Stack the lines.
let baselineY = 0;
const lines = LINES.map((cfg, i) => {
  if (i > 0) baselineY += LINE_GAP * 1000 * Math.max(cfg.size, LINES[i - 1].size) * 0.98;
  return buildLine(cfg, baselineY);
});

// Overall bounds -> viewBox with a little breathing room.
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const line of lines)
  for (const l of line.letters) {
    minX = Math.min(minX, l.box[0]);
    minY = Math.min(minY, l.box[1]);
    maxX = Math.max(maxX, l.box[2]);
    maxY = Math.max(maxY, l.box[3]);
  }
const pad = 24;
const viewBox = [
  ROUND(minX - pad),
  ROUND(minY - pad),
  ROUND(maxX - minX + pad * 2),
  ROUND(maxY - minY + pad * 2),
];

const out = {
  font: 'Playfair Display (SIL Open Font License)',
  em: 1000,
  viewBox,
  lines: lines.map((line) => ({
    text: line.text,
    letters: line.letters.map((l) => ({
      char: l.char,
      d: l.d,
      cx: ROUND((l.box[0] + l.box[2]) / 2),
      cy: ROUND((l.box[1] + l.box[3]) / 2),
    })),
  })),
};

const target = join(root, 'src/data/lettering.json');
writeFileSync(target, `${JSON.stringify(out)}\n`);
const count = out.lines.reduce((n, l) => n + l.letters.length, 0);
console.log(`Lettering: ${count} letters, viewBox ${viewBox.join(' ')} -> src/data/lettering.json`);
