/** A card: its photograph, rounded, with a rim that lights when it is under the pointer. */
export const cardVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const cardFragment = /* glsl */ `
uniform sampler2D map;
uniform vec2 uSize;
uniform float uDim;
uniform float uHover;
uniform float uOpen;
uniform float uGhost;
uniform float uLoaded;
uniform float uFade;
uniform float uSweep;
uniform vec2 uGlare;
uniform vec3 uAccent;
uniform vec3 uInk;
uniform vec3 uBg;
varying vec2 vUv;

float roundedBox(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = roundedBox(p, uSize * 0.5, 0.18);
  float aa = fwidth(d) + 0.0001;
  float mask = 1.0 - smoothstep(-aa, aa, d);
  if (mask < 0.004) discard;

  vec3 photo = texture2D(map, vUv).rgb;
  float luma = dot(photo, vec3(0.2126, 0.7152, 0.0722));
  // Unwritten cards are drained toward the room's own colour until they are opened.
  float ghost = uGhost * (1.0 - max(uHover * 0.7, uOpen));
  photo = mix(photo, vec3(luma) * 0.8, ghost * 0.85);

  vec3 col = mix(vec3(0.012), photo, uLoaded);
  float lift = max(uHover, uOpen);
  col *= mix(uDim, 1.0, lift);

  // A band of light crosses the card once when it is first touched.
  float band = smoothstep(0.16, 0.0, abs(vUv.x + vUv.y * 0.35 - (uSweep * 1.9 - 0.45)));
  col += uInk * band * 0.16 * (1.0 - uGhost * 0.5);

  // Under the pointer the card catches the light where it is touched.
  vec2 toGlare = (vUv - uGlare) * uSize;
  col += uInk * exp(-dot(toGlare, toGlare) * 0.22) * 0.16 * uHover;

  float rim = smoothstep(-0.11, -0.012, d);
  col += uAccent * rim * (uHover * 0.95 + uOpen * 0.25);
  col += uInk * rim * 0.05 * uDim;

  if (!gl_FrontFacing) {
    col = vec3(0.02) + uInk * rim * 0.1 + uAccent * rim * 0.2;
  }

  gl_FragColor = vec4(col, mask * uFade);
  #include <colorspace_fragment>
}
`

export const skyVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

/**
 * Deep space. Every pixel is turned into a direction in the sky, so the stars
 * stay where they are and the visitor's view moves across them. Three layers
 * of round stars of different magnitude and temperature, a faint band of the
 * galaxy, and almost nothing else: space is mostly black.
 */
export const skyFragment = /* glsl */ `
uniform vec2 uLook;
uniform float uAspectX;
uniform float uTanHalfFov;
uniform float uTime;
uniform float uOpen;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    amp *= 0.5;
  }
  return v;
}

// One layer of stars on a grid over the sky. Most cells are empty.
vec3 stars(vec2 sky, float density, float rarity, float size, float gain) {
  vec2 grid = sky * density;
  vec2 cell = floor(grid);
  float seed = hash(cell);
  if (seed < rarity) return vec3(0.0);
  vec2 centre = cell + 0.5 + (vec2(hash(cell + 7.7), hash(cell + 3.3)) - 0.5) * 0.7;
  float d = length(grid - centre);
  float magnitude = pow(hash(cell + 11.1), 5.0);
  float twinkle = 0.86 + 0.14 * sin(uTime * (0.6 + hash(cell + 5.5) * 1.8) + seed * 60.0);
  float core = exp(-d * d / (size * size * (0.35 + magnitude))) * (0.18 + magnitude) * twinkle;
  // Star colour by temperature: most are white, a few run blue or warm.
  float temperature = hash(cell + 19.9);
  vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.86, 0.7), smoothstep(0.25, 0.85, temperature));
  tint = mix(vec3(1.0), tint, 0.55);
  return tint * core * gain;
}

void main() {
  vec2 ndc = (vUv - 0.5) * 2.0;
  vec3 ray = normalize(vec3(ndc.x * uTanHalfFov * uAspectX, ndc.y * uTanHalfFov, -1.0));
  // Turn the ray by the camera's pitch, then its yaw.
  float cp = cos(uLook.y), sp = sin(uLook.y);
  ray = vec3(ray.x, ray.y * cp - ray.z * sp, ray.y * sp + ray.z * cp);
  float cy = cos(uLook.x), sy = sin(uLook.x);
  ray = vec3(ray.x * cy + ray.z * sy, ray.y, -ray.x * sy + ray.z * cy);

  vec2 sky = vec2(atan(ray.x, -ray.z), asin(clamp(ray.y, -1.0, 1.0)));

  vec3 col = vec3(0.0);
  col += stars(sky, 11.0, 0.8, 0.075, 1.9);
  col += stars(sky + 3.7, 24.0, 0.86, 0.085, 1.0);
  col += stars(sky + 9.1, 52.0, 0.9, 0.1, 0.5);

  col *= 1.0 - uOpen * 0.55;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`
