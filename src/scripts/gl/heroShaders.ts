/**
 * Hero shaders (WebGL2 / GLSL ES 3.0).
 * The photo is shown through an organic, slowly flowing mask built from
 * domain-warped simplex noise. A soft lens magnifies the area under the
 * pointer, and a fine grain keeps the image feeling filmic.
 */

export const heroVertex = /* glsl */ `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const heroFragment = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImage;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform float uTime;
uniform vec2 uPointer;
uniform float uLens;
uniform float uReveal;
uniform float uScroll;
uniform vec3 uColor;
uniform float uPortrait;

// --- 3D simplex noise -------------------------------------------------------
// Ashima Arts / Stefan Gustavson, "webgl-noise" (MIT License).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
// ---------------------------------------------------------------------------

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Object-fit: cover for the texture.
vec2 coverUv(vec2 uv) {
  float rs = uResolution.x / uResolution.y;
  float ri = uImageSize.x / uImageSize.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// Soft magnifying lens around the pointer.
vec2 lens(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 d = uv - uPointer;
  vec2 da = vec2(d.x * aspect, d.y);
  float radius = mix(0.34, 0.26, uPortrait);
  float k = 1.0 - smoothstep(0.0, radius, length(da));
  k = k * k * (3.0 - 2.0 * k);
  return uPointer + d * (1.0 - 0.42 * k * uLens);
}

// Signed field: > 0 shows the photo, < 0 shows the brand colour.
float field(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.05;
  vec2 q = p * mix(1.1, 1.55, uPortrait);
  vec2 w = vec2(snoise(vec3(q * 0.85, t)), snoise(vec3(q * 0.85 + 7.31, t + 3.7)));
  float n = snoise(vec3(q + w * 0.65, t * 0.7));
  n += 0.22 * snoise(vec3(q * 2.1 - w, t * 1.3));

  // Where the photo lives: right side on landscape screens, lower part on portrait ones.
  // The lettering's side stays clear so no stray islands sit beside the headline.
  float side = mix(smoothstep(0.44, 0.96, uv.x), smoothstep(0.6, 0.05, uv.y), uPortrait);
  side -= (1.0 - uPortrait) * smoothstep(0.5, 0.2, uv.x) * 0.35;
  float open = side + uScroll * 0.6;
  float f = n * 0.42 + open * 0.95 - 0.58;

  // The bottom edge always returns to the brand colour, so the one-screen hero
  // melts into the next (same-coloured) section instead of ending on a hard line.
  f -= smoothstep(mix(0.24, 0.12, uPortrait), 0.0, uv.y) * 1.4;
  // Intro: the shape blooms open.
  f -= (1.0 - uReveal) * 1.25;
  return f;
}

void main() {
  vec2 uv = lens(vUv);
  float f = field(uv);
  float aa = max(fwidth(f), 0.0015);
  float mask = smoothstep(-aa, aa, f);

  // Gentle parallax inside the mask while scrolling.
  vec2 iuv = coverUv(uv + vec2(0.0, uScroll * 0.06));
  float blur = (1.0 - uReveal) * 3.5;
  vec3 photo = texture(uImage, iuv, blur).rgb;
  // Slight warm grade so the photo sits well on the red.
  photo = mix(photo, photo * vec3(1.04, 0.98, 0.94), 0.6);

  vec3 col = mix(uColor, photo, mask);

  // Film grain.
  float g = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 100.0) - 0.5;
  col += g * 0.035;

  fragColor = vec4(col, 1.0);
}
`;
