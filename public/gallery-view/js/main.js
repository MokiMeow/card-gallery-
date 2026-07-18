import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const COLS = 18;
const ROWS = 7;
const RADIUS = 30;
const LAT_SPAN = Math.PI * 0.66;
const SENS = 0.0034;
const EASE = 0.07;
const FRICTION = 0.945;
const DRIFT = 0.00028;
const BASE_FOV = 68;
const DRAG_FOV = 74;
const CARD_W = 4.6;
const CARD_H = 5.8;

const ACHIEVEMENT_ASSETS = [
  {
    src: '/hackathon/github-profile-badge.webp', title: 'GitHub Identity', kind: 'Milestone', year: 2026,
    description: "A physical badge connecting Mohith's developer identity with the open-source work and experiments shared through GitHub.",
    note: 'A small object that represents a much larger habit: building in public and leaving useful work behind.'
  },
  {
    src: '/hackathon/nexovate-team-at-work.webp', title: 'Nexovate Build Session', kind: 'Hackathon', year: 2025,
    description: 'A focused build session at Nexovate 2025, where the team shaped the idea, divided the work and turned it into a working prototype.',
    note: 'The strongest part of the day was not the pitch. It was the quiet stretch where everyone solved a different part of the same problem.'
  },
  {
    src: '/hackathon/nexovate-2025-stage.webp', title: 'Nexovate 2025', kind: 'Hackathon', year: 2025,
    description: 'The Nexovate 2025 stage at Presidency University, marking the start of a day built around fast decisions, teamwork and practical experimentation.',
    note: 'A reminder of where the project began before the first line of the final build was ready.'
  },
  {
    src: '/hackathon/central-India-2025-winners.webp', title: 'Central India Winners', kind: 'Achievement', year: 2025,
    description: 'My team after being recognised at the Central India Hackathon 2025 for the strength of our idea and execution.',
    note: 'The award captures the finish, but the real result came from the decisions, revisions and teamwork behind it.'
  },
  {
    src: '/hackathon/central-India-hackathon-team.webp', title: 'Central India Team', kind: 'Hackathon', year: 2025,
    description: 'The Central India Hackathon team together between build sessions, with the project moving from a rough direction toward a clear demonstration.',
    note: 'A team portrait from the middle of the process, before the final outcome was certain.'
  },
  {
    src: '/hackathon/central-India-hackathon-pitch.webp', title: 'Central India Pitch', kind: 'Hackathon', year: 2025,
    description: 'Mohith presenting the project at the Central India Hackathon, translating the technical work into a clear problem, approach and product story.',
    note: 'Good engineering mattered, but so did making the value understandable in a few focused minutes.'
  },
  {
    src: '/hackathon/nagarjuna-hackathon-first-place-award.webp', title: 'Nagarjuna First Place', kind: 'Achievement', year: 2025,
    description: 'My team receiving first place at the Nagarjuna hackathon after presenting a complete working solution to the judging panel.',
    note: 'The result recognised both the final build and the discipline required to make it convincing under time pressure.'
  },
  {
    src: '/hackathon/nagarjuna-hackathon-first-place-certificate.webp', title: 'Nagarjuna Certificate', kind: 'Achievement', year: 2025,
    description: "The first-place certificate awarded to Mohith at Nagarjuna College of Engineering and Technology's technical event.",
    note: 'A formal record of a project that moved from an idea to a winning demonstration.'
  },
  {
    src: '/hackathon/central-India-hackathon-certificate.webp', title: 'Central India Certificate', kind: 'Achievement', year: 2025,
    description: "Mohith's certificate from the Central India Hackathon, recognising the team's participation and completed project presentation.",
    note: 'One document from a much longer process of building, testing and explaining the work.'
  },
  {
    src: '/hackathon/openai-outskill-hackathon-winner.webp', title: 'OpenAI x Outskill Winner', kind: 'Achievement', year: 2026,
    description: 'PatchPilot won the OpenAI x Outskill AI Builders Hackathon. The project uses AI to identify vulnerabilities, analyse codebases and help produce verified fixes.',
    note: 'It stood out through the strength of its technical implementation and its focus on making security engineering more actionable.'
  },
  {
    src: '/hackathon/central-innovation-hackathon-second-runner-up.webp', title: 'CIH 2026 Runner-Up', kind: 'Achievement', year: 2026,
    description: 'My team secured 2nd Runner-Up at CIH 2026, earning recognition for a project developed and presented under hackathon constraints.',
    note: 'The result reflects a complete team effort, from the earliest idea to the final demonstration.'
  },
  {
    src: '/hackathon/central-innovation-hackathon-award-ceremony.webp', title: 'CIH 2026 Award Ceremony', kind: 'Achievement', year: 2026,
    description: 'The CIH 2026 award ceremony, where my team received the 2nd Runner-Up prize for our completed project.',
    note: 'A closing moment that records the people behind the work as clearly as the result itself.'
  }
];

const UNIVERSE_ASSETS = [
  '/designs/elegant-invitation.webp',
  '/designs/modern-design.webp',
  '/designs/vintage-style.webp',
  '/designs/minimalist-design.webp',
  '/designs/floral-design.webp',
  '/designs/geometric-design.webp',
  '/designs/luxury-gold.webp',
  '/designs/rustic-style.webp',
  '/designs/dark-modern.webp',
  '/designs/colorful-party.webp',
  '/designs/geometric-grid.webp',
  '/designs/luxury-gold-script.webp',
  '/designs/rustic-invitation.webp',
  '/designs/dark-modern-invitation.webp',
  '/designs/colorful-party-invitation.webp',
  '/designs/elegant-script.webp',
  '/designs/watercolor-art.webp',
  '/designs/botanical-design.webp',
  '/designs/art-deco.webp',
  '/designs/marble-luxury.webp'
].map((src, index) => ({
  src,
  title: `Untitled Universe ${String(index + 1).padStart(2, '0')}`,
  kind: 'In progress',
  year: 2026,
  description: 'This universe is still being explored. Each untitled card holds space for the next hackathon, achievement, experiment or dream waiting beyond the current horizon.',
  note: 'There is no final edge here. The universe is infinite, and these placeholders represent milestones not reached yet and possibilities still waiting to be discovered.'
}));

const CARD_ASSETS = [...ACHIEVEMENT_ASSETS, ...UNIVERSE_ASSETS];

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------
const app = document.getElementById('app');
const loaderEl = document.getElementById('loader');
const loaderNum = document.getElementById('loader-num');
const loaderFill = document.getElementById('loader-bar-fill');
const cursorEl = document.getElementById('cursor');
const ghostEl = document.getElementById('ghost');
const captionEl = document.getElementById('caption');
const captionTitle = document.getElementById('caption-title');
const captionIndex = document.getElementById('caption-index');
const detailEl = document.getElementById('detail');
const detailKicker = document.querySelector('.detail-kicker');
const detailTitle = document.getElementById('detail-title');
const detailImg = document.getElementById('detail-img');
const detailDescription = document.getElementById('detail-description');
const detailNote = document.getElementById('detail-note');
const metaClient = document.getElementById('meta-client');
const metaYear = document.getElementById('meta-year');
const metaRole = document.getElementById('meta-role');
const metaIndex = document.getElementById('meta-index');
const backBtn = document.getElementById('back');
const nextBtn = document.getElementById('next');

gsap.set('.site-header, .hint', { opacity: 0 });
gsap.set(detailEl, { autoAlpha: 0 });
gsap.set(ghostEl, { opacity: 0 });

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(BASE_FOV, innerWidth / innerHeight, 0.1, 300);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
app.appendChild(renderer.domElement);

const clock = new THREE.Clock();

// Shared uniforms: one object, referenced by every card material
const uTime = { value: 0 };
const uVel = { value: 0 };

// ---------------------------------------------------------------------------
// Living background: gradient sky sphere with horizon glow
// ---------------------------------------------------------------------------
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: { uTime },
  vertexShader: `
    varying vec3 vPos;
    void main() {
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec3 vPos;
    void main() {
      vec3 dir = normalize(vPos);
      float horizon = exp(-abs(dir.y + 0.06) * 5.0);
      vec3 col = vec3(0.0015, 0.002, 0.004);
      col += vec3(0.008, 0.018, 0.022) * horizon;
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }
  `
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(80, 48, 32), skyMat));

// ---------------------------------------------------------------------------
// Loading manager drives the preloader
// ---------------------------------------------------------------------------
const manager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(manager);
loader.setCrossOrigin('anonymous');
const textureCache = new Map();

function getTexture(src) {
  if (!textureCache.has(src)) {
    const entry = { texture: null, aspect: 1, listeners: [] };
    entry.texture = loader.load(src, (texture) => {
      const image = texture.image;
      entry.aspect = image?.width && image?.height ? image.width / image.height : 1;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      entry.listeners.forEach((listener) => listener(entry.aspect));
      entry.listeners.length = 0;
    });
    textureCache.set(src, entry);
  }
  return textureCache.get(src);
}

manager.onProgress = (url, loaded, total) => {
  const p = loaded / total;
  loaderNum.textContent = Math.round(p * 100);
  gsap.to(loaderFill, { scaleX: p, duration: 0.35, ease: 'power2.out' });
};
manager.onLoad = () => beginIntro();
setTimeout(() => beginIntro(), 10000);

// ---------------------------------------------------------------------------
// Card shaders: sphere curvature, breathing, velocity lean, chromatic smear
// ---------------------------------------------------------------------------
const VERT = `
uniform float uTime;
uniform float uVel;
uniform float uHover;
uniform float uPhase;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // curve the card onto the sphere interior (edges fall away from the viewer)
  float r2 = pos.x * pos.x + pos.y * pos.y;
  pos.z -= r2 / (2.0 * ${RADIUS.toFixed(1)});

  // idle breathing float, unique phase per card
  pos.z += sin(uTime * 0.9 + uPhase) * 0.12;

  // lean + ripple into the direction of rotation velocity
  pos.z -= pos.x * uVel * 5.0;
  pos.y += sin(pos.x * 0.7 + uTime) * uVel * 1.4;

  // hover lift toward the viewer
  pos.z += uHover * 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = `
uniform sampler2D uMap;
uniform float uImageAspect;
uniform float uHover;
uniform float uOpacity;
uniform float uVel;
varying vec2 vUv;

float roundedMask(vec2 uv, vec2 size, float radius) {
  vec2 p = (uv - 0.5) * size;
  vec2 b = size * 0.5 - radius;
  vec2 q = abs(p) - b;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  return 1.0 - smoothstep(-0.008, 0.008, d);
}

void main() {
  float zoom = 1.0 - 0.025 * uHover;
  vec2 uv = (vUv - 0.5) * zoom + 0.5;
  float cardAspect = ${(CARD_W / CARD_H).toFixed(4)};
  vec2 imageUv = uv;

  // Fill the preview card without stretching the source. Wide images crop
  // evenly from the sides and tall images crop evenly from the top and bottom.
  if (uImageAspect > cardAspect) {
    float visibleWidth = cardAspect / uImageAspect;
    imageUv.x = (uv.x - 0.5) * visibleWidth + 0.5;
  } else {
    float visibleHeight = uImageAspect / cardAspect;
    imageUv.y = (uv.y - 0.5) * visibleHeight + 0.5;
  }
  imageUv = clamp(imageUv, 0.0, 1.0);

  // chromatic smear proportional to rotation speed
  float ab = clamp(abs(uVel) * 38.0, 0.0, 1.0) * 0.014;
  float rC = texture2D(uMap, clamp(imageUv + vec2(ab, 0.0), 0.0, 1.0)).r;
  float gC = texture2D(uMap, imageUv).g;
  float bC = texture2D(uMap, clamp(imageUv - vec2(ab, 0.0), 0.0, 1.0)).b;
  vec3 tex = vec3(rC, gC, bC);

  // Preserve the original image colour and use only a subtle hover lift.
  vec3 color = tex * mix(0.88, 1.03, uHover);

  float mask = roundedMask(vUv, vec2(1.0, ${(CARD_H / CARD_W).toFixed(2)}), 0.05);
  gl_FragColor = vec4(color, mask * uOpacity);
  #include <colorspace_fragment>
}
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
const cards = [];
const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 12, 12);
let idx = 0;

for (let r = 0; r < ROWS; r++) {
  const v = r / (ROWS - 1);
  const phi = Math.PI / 2 + (v - 0.5) * LAT_SPAN;
  const offset = (r % 2) * (Math.PI / COLS);
  for (let c = 0; c < COLS; c++) {
    const theta = (c / COLS) * Math.PI * 2 + offset;
    const assetIndex = (idx * 7 + Math.floor(idx / COLS) * 3) % CARD_ASSETS.length;
    const asset = CARD_ASSETS[assetIndex];
    const textureEntry = getTexture(asset.src);
    const tex = textureEntry.texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: tex },
        uImageAspect: { value: textureEntry.aspect },
        uHover: { value: 0 },
        uOpacity: { value: 1 },
        uPhase: { value: Math.random() * Math.PI * 2 },
        uTime,
        uVel
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true
    });
    if (textureEntry.aspect === 1 && !tex.image) {
      textureEntry.listeners.push((aspect) => {
        mat.uniforms.uImageAspect.value = aspect;
      });
    }
    const mesh = new THREE.Mesh(geo, mat);
    const base = new THREE.Vector3().setFromSphericalCoords(RADIUS, phi, theta);
    mesh.position.copy(base).multiplyScalar(0.12); // intro: start near the core
    mesh.scale.setScalar(0.001);
    mesh.lookAt(0, 0, 0);
    mesh.userData = {
      index: idx,
      title: asset.title,
      client: 'Mohith',
      role: asset.kind,
      year: asset.year,
      imageUrl: asset.src,
      description: asset.description,
      note: asset.note,
      basePos: base
    };
    scene.add(mesh);
    cards.push(mesh);
    idx++;
  }
}
const TOTAL = cards.length;

// ---------------------------------------------------------------------------
// Dust particles (parallax layer)
// ---------------------------------------------------------------------------
const pCount = 350;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  const dir = new THREE.Vector3().randomDirection();
  const dist = 9 + Math.random() * 17;
  pPos[i * 3] = dir.x * dist;
  pPos[i * 3 + 1] = dir.y * dist * 0.7;
  pPos[i * 3 + 2] = dir.z * dist;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
  color: 0x31b8c6, size: 0.07, transparent: true, opacity: 0.42, sizeAttenuation: true
}));
scene.add(points);

// ---------------------------------------------------------------------------
// Film grain
// ---------------------------------------------------------------------------
(() => {
  const gc = document.createElement('canvas');
  gc.width = gc.height = 128;
  const ctx = gc.getContext('2d');
  const img = ctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const grain = document.getElementById('grain');
  grain.style.backgroundImage = 'url(' + gc.toDataURL() + ')';
  setInterval(() => {
    grain.style.backgroundPosition = Math.floor(Math.random() * 128) + 'px ' + Math.floor(Math.random() * 128) + 'px';
  }, 90);
})();

// ---------------------------------------------------------------------------
// Custom cursor
// ---------------------------------------------------------------------------
let curX = innerWidth / 2, curY = innerHeight / 2, curTX = curX, curTY = curY;
document.querySelectorAll('[data-hover]').forEach((el) => {
  el.addEventListener('mouseenter', () => cursorEl.classList.add('is-hover'));
  el.addEventListener('mouseleave', () => cursorEl.classList.remove('is-hover'));
});

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let yaw = -1.5, pitch = 0.14;
let targetYaw = -1.5, targetPitch = 0.14;
let vYaw = 0, vPitch = 0;
let velSmooth = 0;
let fov = BASE_FOV;
let parX = 0, parY = 0; // mouse parallax
let dragging = false;
let lastX = 0, lastY = 0, downX = 0, downY = 0;
let controlsEnabled = false;
let activeCard = null;
const PITCH_LIMIT = LAT_SPAN / 2 - 0.12;

const pointerNDC = new THREE.Vector2(-2, -2);
const raycaster = new THREE.Raycaster();
let hovered = null;

function setHovered(mesh) {
  if (hovered === mesh) return;
  if (hovered) {
    gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to(hovered.material.uniforms.uHover, { value: 0, duration: 0.5, ease: 'power2.out' });
  }
  hovered = mesh;
  if (hovered) {
    gsap.to(hovered.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.5, ease: 'power2.out' });
    gsap.to(hovered.material.uniforms.uHover, { value: 1, duration: 0.5, ease: 'power2.out' });
    captionIndex.textContent = String(hovered.userData.index + 1).padStart(3, '0') + ' / ' + TOTAL;
    captionTitle.textContent = hovered.userData.title;
    gsap.fromTo(captionTitle, { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: 'power3.out' });
    captionEl.classList.add('visible');
    cursorEl.classList.add('is-hover');
    ghostEl.textContent = hovered.userData.title.replace(/\s\d+$/, '');
    gsap.to(ghostEl, { opacity: 1, duration: 0.6, ease: 'power2.out' });
  } else {
    captionEl.classList.remove('visible');
    cursorEl.classList.remove('is-hover');
    gsap.to(ghostEl, { opacity: 0, duration: 0.4, ease: 'power2.out' });
  }
}

app.addEventListener('pointerdown', (e) => {
  if (!controlsEnabled) return;
  dragging = true;
  cursorEl.classList.add('is-drag');
  lastX = downX = e.clientX;
  lastY = downY = e.clientY;
  vYaw = vPitch = 0;
});

window.addEventListener('pointermove', (e) => {
  curTX = e.clientX;
  curTY = e.clientY;
  pointerNDC.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  targetYaw += dx * SENS;
  targetPitch += dy * SENS;
  targetPitch = THREE.MathUtils.clamp(targetPitch, -PITCH_LIMIT, PITCH_LIMIT);
  vYaw = dx * SENS;
  vPitch = dy * SENS;
});

function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  cursorEl.classList.remove('is-drag');
  const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moved < 6 && hovered && controlsEnabled) openCard(hovered);
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

window.addEventListener('wheel', (e) => {
  if (!controlsEnabled) return;
  targetYaw += e.deltaY * 0.00045;
  vYaw = e.deltaY * 0.00002;
}, { passive: true });

// ---------------------------------------------------------------------------
// Detail page: card flies forward and fills the screen, then hands off
// ---------------------------------------------------------------------------
const aimDummy = new THREE.PerspectiveCamera();
aimDummy.rotation.order = 'YXZ';

function aimAt(dir, duration) {
  aimDummy.position.set(0, 0, 0);
  aimDummy.lookAt(dir);
  let yawTo = aimDummy.rotation.y;
  const pitchTo = THREE.MathUtils.clamp(aimDummy.rotation.x, -PITCH_LIMIT, PITCH_LIMIT);
  // unwrap to the nearest equivalent angle so the camera takes the short way round
  const TWO_PI = Math.PI * 2;
  while (yawTo - targetYaw > Math.PI) yawTo -= TWO_PI;
  while (yawTo - targetYaw < -Math.PI) yawTo += TWO_PI;
  if (duration === 0) {
    targetYaw = yaw = yawTo;
    targetPitch = pitch = pitchTo;
    return;
  }
  const aim = { y: targetYaw, p: targetPitch };
  gsap.to(aim, {
    y: yawTo, p: pitchTo, duration, ease: 'power3.inOut',
    onUpdate: () => { targetYaw = aim.y; targetPitch = aim.p; }
  });
}

function fillTransform(mesh) {
  const dir = mesh.userData.basePos.clone().normalize();
  return { dest: dir.multiplyScalar(9), scale: 1.18 };
}

function populate(mesh) {
  const d = mesh.userData;
  detailKicker.textContent = d.role === 'In progress' ? 'Open study' : 'Milestone';
  detailTitle.textContent = d.title;
  detailImg.style.removeProperty('--image-natural-width');
  detailImg.style.removeProperty('--image-natural-height');
  detailImg.onload = () => {
    detailImg.style.setProperty('--image-natural-width', `${detailImg.naturalWidth}px`);
    detailImg.style.setProperty('--image-natural-height', `${detailImg.naturalHeight}px`);
  };
  detailImg.src = d.imageUrl;
  detailImg.alt = d.title;
  detailDescription.textContent = d.description;
  detailNote.textContent = d.note;
  metaClient.textContent = d.client;
  metaYear.textContent = d.year;
  metaRole.textContent = d.role;
  metaIndex.textContent = String(d.index + 1).padStart(3, '0') + ' / ' + TOTAL;
  detailEl.scrollTop = 0;
}

function openCard(mesh) {
  controlsEnabled = false;
  activeCard = mesh;
  setHovered(null);
  gsap.to(mesh.material.uniforms.uHover, { value: 1, duration: 0.35 });

  // aim the camera straight at the card, then let it fly forward to fill the view
  aimAt(mesh.userData.basePos, 0.42);
  const { dest, scale } = fillTransform(mesh);

  const tl = gsap.timeline();
  tl.to(mesh.position, { x: dest.x, y: dest.y, z: dest.z, duration: 0.62, ease: 'power3.inOut' }, 0.03);
  tl.to(mesh.scale, { x: scale, y: scale, z: scale, duration: 0.62, ease: 'power3.inOut' }, 0.03);

  // the rest of the sphere recedes and dims
  cards.forEach((other) => {
    if (other === mesh) return;
    const back = other.userData.basePos.clone().multiplyScalar(1.18);
    gsap.to(other.position, { x: back.x, y: back.y, z: back.z, duration: 0.65, ease: 'power3.inOut' }, 0);
    gsap.to(other.material.uniforms.uOpacity, { value: 0.04, duration: 0.5, ease: 'power2.out' });
  });

  // flash pop as the card hits full bleed, then hand off to the DOM page
  populate(mesh);
  detailEl.setAttribute('aria-hidden', 'false');
  tl.fromTo('#flash', { opacity: 0 }, { opacity: 0.04, duration: 0.14, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.3);
  tl.to(detailEl, { autoAlpha: 1, duration: 0.36, ease: 'power2.out' }, 0.34);
  tl.fromTo(detailImg, { opacity: 0.72 }, { opacity: 1, duration: 0.42, ease: 'power2.out' }, 0.34);
  tl.fromTo(detailTitle,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.44);
  tl.fromTo('.detail-kicker, .detail-meta, .detail-text, .next-btn',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.46, stagger: 0.05, ease: 'power3.out' }, 0.5);
}

function closeCard() {
  if (!activeCard) return;
  const mesh = activeCard;
  const base = mesh.userData.basePos;
  const tl = gsap.timeline({ onComplete: () => { controlsEnabled = true; } });
  tl.to(detailEl, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 0);
  tl.to(mesh.position, { x: base.x, y: base.y, z: base.z, duration: 1.0, ease: 'power3.inOut' }, 0.1);
  tl.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'power3.inOut' }, 0.1);
  tl.to(mesh.material.uniforms.uHover, { value: 0, duration: 0.6 }, 0.4);
  cards.forEach((other) => {
    if (other === mesh) return;
    const b = other.userData.basePos;
    gsap.to(other.position, { x: b.x, y: b.y, z: b.z, duration: 1.0, ease: 'power3.inOut', delay: 0.15 });
    gsap.to(other.material.uniforms.uOpacity, { value: 1, duration: 0.9, ease: 'power2.out', delay: 0.3 });
  });
  detailEl.setAttribute('aria-hidden', 'true');
  activeCard = null;
}

function nextProject() {
  if (!activeCard) return;
  const old = activeCard;
  const next = cards[(old.userData.index + 1) % TOTAL];
  gsap.to('.detail-inner > *, .detail-hero', {
    opacity: 0, duration: 0.35, ease: 'power2.in',
    onComplete: () => {
      // reset the old card behind the covered screen
      old.position.copy(old.userData.basePos.clone().multiplyScalar(1.18));
      old.scale.setScalar(1);
      old.material.uniforms.uHover.value = 0;
      old.material.uniforms.uOpacity.value = 0.04;
      // place the new card filled, snap the camera aim to it
      activeCard = next;
      aimAt(next.userData.basePos, 0);
      const { dest, scale } = fillTransform(next);
      next.position.copy(dest);
      next.scale.setScalar(scale);
      next.material.uniforms.uHover.value = 1;
      next.material.uniforms.uOpacity.value = 1;
      populate(next);
      gsap.to('.detail-hero', { opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(detailImg, { opacity: 0.72 }, { opacity: 1, duration: 0.42, ease: 'power2.out' });
      gsap.set('.detail-inner > *', { opacity: 1 });
      gsap.fromTo(detailTitle,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.detail-kicker, .detail-meta, .detail-text, .next-btn',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.05 });
    }
  });
}

backBtn.addEventListener('click', closeCard);
nextBtn.addEventListener('click', nextProject);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });

// ---------------------------------------------------------------------------
// Intro: loader out, radial explosion from the core, camera sweep
// ---------------------------------------------------------------------------
let started = false;
function beginIntro() {
  if (started) return;
  started = true;
  const tl = gsap.timeline();
  tl.to(loaderFill, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0);
  tl.to('.loader-label, .loader-num, .loader-bar', {
    y: -28, opacity: 0, duration: 0.55, stagger: 0.07, ease: 'power2.in'
  }, 0.15);
  tl.to(loaderEl, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.2');
  tl.set(loaderEl, { display: 'none' });
  tl.add(() => {
    targetYaw = 0;
    targetPitch = 0;
    cards.forEach((m, i) => {
      const b = m.userData.basePos;
      const d = (i % COLS) * 0.018 + Math.floor(i / COLS) * 0.05;
      gsap.to(m.position, { x: b.x, y: b.y, z: b.z, duration: 1.7, ease: 'expo.out', delay: d });
      gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 1.7, ease: 'expo.out', delay: d });
    });
    gsap.delayedCall(1.1, () => { controlsEnabled = true; });
  }, '-=0.75');
  tl.to('.site-header, .hint', { opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power2.out' }, '-=0.3');
}

// ---------------------------------------------------------------------------
// Resize + render loop
// ---------------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function tick() {
  requestAnimationFrame(tick);
  uTime.value = clock.getElapsedTime();

  if (!dragging && controlsEnabled) {
    targetYaw += vYaw + DRIFT;
    targetPitch += vPitch;
    vYaw *= FRICTION;
    vPitch *= FRICTION;
    targetPitch = THREE.MathUtils.clamp(targetPitch, -PITCH_LIMIT, PITCH_LIMIT);
  }

  // lenis-style damped easing
  const prevYaw = yaw;
  yaw += (targetYaw - yaw) * EASE;
  pitch += (targetPitch - pitch) * EASE;

  // smoothed angular velocity feeds the card shaders
  velSmooth += ((yaw - prevYaw) - velSmooth) * 0.12;
  uVel.value = THREE.MathUtils.clamp(velSmooth * 14.0, -0.045, 0.045);

  // mouse parallax when idle
  const wantX = dragging || !controlsEnabled ? 0 : pointerNDC.x * 0.045;
  const wantY = dragging || !controlsEnabled ? 0 : pointerNDC.y * 0.03;
  parX += (wantX - parX) * 0.04;
  parY += (wantY - parY) * 0.04;

  camera.rotation.y = yaw - parX;
  camera.rotation.x = pitch + parY;

  // FOV kick while dragging
  const targetFov = dragging ? DRAG_FOV : BASE_FOV;
  fov += (targetFov - fov) * 0.08;
  camera.fov = fov;
  camera.updateProjectionMatrix();

  // particles parallax
  points.rotation.y = yaw * 0.35;
  points.rotation.x = pitch * 0.35;

  if (controlsEnabled && !dragging) {
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(cards);
    setHovered(hits.length ? hits[0].object : null);
  } else if (!controlsEnabled) {
    setHovered(null);
  }

  curX += (curTX - curX) * 0.22;
  curY += (curTY - curY) * 0.22;
  cursorEl.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';

  renderer.render(scene, camera);
}
tick();
