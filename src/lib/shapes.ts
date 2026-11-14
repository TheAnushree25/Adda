/**
 * Build-time generators for the organic artwork (blobs, swirls, brush bands,
 * waves). Everything is seeded, so the markup is identical on every build.
 */

const rand = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const f = (n: number) => Math.round(n * 10) / 10;

export type Pt = [number, number];

/** Smooth closed path through points (Catmull-Rom → cubic Bézier). */
function closedCurve(points: Pt[], tension = 1): string {
  const n = points.length;
  let d = `M${f(points[0]![0])} ${f(points[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

/** Smooth open path through points. */
function openCurve(points: Pt[], tension = 1): string {
  const n = points.length;
  let d = `M${f(points[0]![0])} ${f(points[0]![1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, n - 1)]!;
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

export interface BlobOptions {
  seed: number;
  cx?: number;
  cy?: number;
  r?: number;
  points?: number;
  wobble?: number;
  stretch?: [number, number];
}

/** Organic blob centred in a 0–100 box (or cx/cy/r if given). */
export function blob({
  seed,
  cx = 50,
  cy = 50,
  r = 40,
  points = 7,
  wobble = 0.38,
  stretch = [1, 1],
}: BlobOptions): string {
  const rnd = rand(seed);
  const pts: Pt[] = [];
  const offset = rnd() * Math.PI * 2;
  for (let i = 0; i < points; i++) {
    const a = offset + (i / points) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rnd() * wobble);
    pts.push([cx + Math.cos(a) * rr * stretch[0], cy + Math.sin(a) * rr * stretch[1]]);
  }
  return closedCurve(pts);
}

/** The same blob morphed into `count` variants (identical command structure). */
export function blobFrames(opts: BlobOptions, count = 3): string[] {
  return Array.from({ length: count }, (_, i) => blob({ ...opts, seed: opts.seed * 31 + i * 977 }));
}

/** A meandering ribbon from one side of a box to the other (for swirls & marbling). */
export function ribbon(seed: number, w = 1000, h = 600, turns = 6, amp = 0.35): string {
  const rnd = rand(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= turns; i++) {
    const x = (i / turns) * w * 1.1 - w * 0.05;
    const y = h * (0.5 + (rnd() - 0.5) * 2 * amp);
    pts.push([x, y]);
    if (i < turns && rnd() > 0.55) {
      // Occasional loop for a hand-drawn feel.
      const lx = x + (w / turns) * 0.5;
      const ly = y + (rnd() > 0.5 ? 1 : -1) * h * 0.18;
      pts.push([lx + (w / turns) * 0.15, ly], [lx - (w / turns) * 0.12, ly + h * 0.06]);
    }
  }
  return openCurve(pts, 1);
}

/** A loose spiral-ish swirl inside a box (olive swirls on dark sections). */
export function swirl(seed: number, w = 600, h = 600): string {
  const rnd = rand(seed);
  const pts: Pt[] = [];
  const cx = w / 2;
  const cy = h / 2;
  const loops = 1.6 + rnd();
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 2 * loops + rnd() * 0.3;
    const r = (0.15 + t * 0.85) * Math.min(w, h) * 0.48 * (0.85 + rnd() * 0.3);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return openCurve(pts, 1.1);
}

/** Samples a Catmull-Rom spline through `points` (ends clamped). */
function sampleSpline(points: Pt[], perSegment: number): Pt[] {
  const out: Pt[] = [];
  const n = points.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, n - 1)]!;
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const at = (k: 0 | 1) =>
        0.5 *
        (2 * p1[k] +
          (-p0[k] + p2[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
          (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([at(0), at(1)]);
    }
  }
  out.push(points[n - 1]!);
  return out;
}

export interface RibbonShape {
  /** Filled outline of the ribbon (tapered ends, round caps). */
  outline: string;
  /** Centre line, for stroke-based reveals. */
  spine: string;
}

/**
 * A thick, tapered, flowing ribbon (like a swirl of sauce) along `points`.
 * Width swells in the middle and narrows towards both rounded ends.
 */
export function ribbonShape(
  points: Pt[],
  width: number,
  { minScale = 0.42, perSegment = 16 } = {},
): RibbonShape {
  const pts = sampleSpline(points, perSegment);
  const m = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const half: number[] = [];
  for (let i = 0; i < m; i++) {
    const a = pts[Math.max(i - 1, 0)]!;
    const b = pts[Math.min(i + 1, m - 1)]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const t = i / (m - 1);
    const w = (width / 2) * (minScale + (1 - minScale) * Math.pow(Math.sin(Math.PI * t), 0.6));
    const p = pts[i]!;
    half.push(w);
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  }
  const pt = (p: Pt) => `${f(p[0])} ${f(p[1])}`;
  const endR = f(half[m - 1]!);
  const startR = f(half[0]!);
  const outline =
    `M${pt(left[0]!)} ` +
    left
      .slice(1)
      .map((p) => `L${pt(p)}`)
      .join(' ') +
    ` A${endR} ${endR} 0 0 0 ${pt(right[m - 1]!)} ` +
    right
      .slice(0, -1)
      .reverse()
      .map((p) => `L${pt(p)}`)
      .join(' ') +
    ` A${startR} ${startR} 0 0 0 ${pt(left[0]!)} Z`;
  return { outline, spine: openCurve(points, 1) };
}

/** A soft wave edge across a 0–100 × 0–100 box (filled below the wave). */
export function wave(seed: number, base = 60, amp = 18, crests = 2.2): string {
  const rnd = rand(seed);
  const pts: Pt[] = [];
  const steps = 10;
  const phase = rnd() * Math.PI * 2;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const y = base + Math.sin((i / steps) * Math.PI * 2 * crests + phase) * amp * (0.6 + rnd() * 0.4);
    pts.push([x, y]);
  }
  return `${openCurve(pts)} L100 100 L0 100 Z`;
}
