import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  DoubleSide,
  Fog,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three"
import { animate, createTimer, splitText, stagger, utils } from "animejs"
// Side-effect import: lets animate() tween Three.js materials and uniforms by name.
import "animejs/adapters/three"
import type { CardInfo, FormationId } from "@/lib/cards"
import { buildSlots, LIMITS, ROOM_RADIUS, SPIRAL_RADIUS, SPIRAL_RISE, SPIRAL_STEP, TUNNEL, type Pose } from "./layouts"
import { cardFragment, cardVertex, skyFragment, skyVertex } from "./shaders"

export const PALETTE = { bg: "#000000", ink: "#f2f1ee", accent: "#e8c170" }

export type GalleryOptions = {
  canvas: HTMLCanvasElement
  written: CardInfo[]
  unwritten: CardInfo[]
  calm: boolean
  onProgress: (fraction: number) => void
  onReady: () => void
  /** The card nearest the centre of the view. `order` is its place among the milestones, or -1. */
  onFocus: (info: CardInfo, order: number) => void
  onHover: (hovering: boolean) => void
  onOpen: (info: CardInfo | null, order: number) => void
}

export type GalleryEngine = {
  setFormation: (id: FormationId) => void
  step: (direction: 1 | -1) => void
  openFocused: () => void
  close: () => void
  dispose: () => void
}

type CardState = { m: number; hover: number; open: number; away: number }

const TAU = Math.PI * 2
const wrap = (angle: number) => angle - TAU * Math.round(angle / TAU)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (lo: number, hi: number, v: number) => {
  const t = clamp((v - lo) / (hi - lo), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Rises a block of copy into place: the title letter by letter, the rest line by line. */
export function revealCopy(root: Element, calm: boolean) {
  const title = root.querySelector<HTMLElement>("[data-split]")
  const rise = Array.from(root.querySelectorAll("[data-rise]"))
  if (calm) return () => {}
  const split = title ? splitText(title, { chars: { wrap: "clip" } }) : null
  if (split?.chars.length) {
    utils.set(split.chars, { y: "108%" })
    animate(split.chars, { y: "0%", duration: 850, ease: "out(4)", delay: stagger(16) })
  }
  if (rise.length) {
    utils.set(rise, { opacity: 0, y: 18 })
    animate(rise, { opacity: 1, y: 0, duration: 700, ease: "out(3)", delay: stagger(60, { start: 160 }) })
  }
  return () => {
    if (split?.chars.length) utils.remove(split.chars)
    if (rise.length) utils.remove(rise)
    split?.revert()
  }
}

export function mountGallery(options: GalleryOptions): GalleryEngine | null {
  const { canvas } = options
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: false, powerPreference: "high-performance" })
  } catch {
    return null
  }

  const calm = options.calm
  const scene = new Scene()
  const camera = new PerspectiveCamera(62, 1, 0.1, 400)
  camera.rotation.order = "YXZ"

  const ink = new Color(PALETTE.ink)
  const accent = new Color(PALETTE.accent)
  const bg = new Color(PALETTE.bg)

  // ── Sky: one triangle behind everything.
  const skyGeometry = new BufferGeometry()
  skyGeometry.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
  const skyMaterial = new ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uLook: { value: new Vector2() },
      uAspectX: { value: 1 },
      uTanHalfFov: { value: 0.6 },
      uTime: { value: 0 },
      uOpen: { value: 0 },
    },
  })
  const sky = new Mesh(skyGeometry, skyMaterial)
  sky.frustumCulled = false
  sky.renderOrder = -10
  scene.add(sky)

  // ── The rail the milestones stand on, in the Room.
  const railPoints: number[] = []
  const railRadius = ROOM_RADIUS - 0.4
  const railY = -6.4
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * TAU
    const b = ((i + 1) / 240) * TAU
    railPoints.push(Math.sin(a) * railRadius, railY, Math.cos(a) * railRadius, Math.sin(b) * railRadius, railY, Math.cos(b) * railRadius)
  }
  const milestoneCount = options.written.length
  for (let i = 0; i < milestoneCount; i++) {
    const a = (i / milestoneCount) * TAU
    railPoints.push(-Math.sin(a) * railRadius, railY, -Math.cos(a) * railRadius, -Math.sin(a) * railRadius, railY + 1.1, -Math.cos(a) * railRadius)
  }
  const railGeometry = new BufferGeometry()
  railGeometry.setAttribute("position", new BufferAttribute(new Float32Array(railPoints), 3))
  const railMaterial = new LineBasicMaterial({ color: accent, transparent: true, opacity: 0, depthTest: false, fog: false })
  const rail = new LineSegments(railGeometry, railMaterial)
  rail.renderOrder = -4
  scene.add(rail)

  // ── The path the milestones climb, in the Spiral.
  const pathPoints: number[] = []
  const pathRadius = SPIRAL_RADIUS + 0.6
  const pathAt = (t: number) => [Math.sin(t * SPIRAL_STEP) * pathRadius, t * SPIRAL_RISE - 5.6, -Math.cos(t * SPIRAL_STEP) * pathRadius]
  for (let i = -30; i < milestoneCount * 30; i++) pathPoints.push(...pathAt(i / 30), ...pathAt((i + 1) / 30))
  for (let i = 0; i < milestoneCount; i++) {
    const [x, y, z] = pathAt(i)
    pathPoints.push(x, y, z, x, y + 1.1, z)
  }
  const pathGeometry = new BufferGeometry()
  pathGeometry.setAttribute("position", new BufferAttribute(new Float32Array(pathPoints), 3))
  const pathMaterial = new LineBasicMaterial({ color: accent, transparent: true, opacity: 0, depthTest: false, fog: false })
  const path = new LineSegments(pathGeometry, pathMaterial)
  path.frustumCulled = false
  path.renderOrder = -4
  scene.add(path)

  // ── Cards.
  const slots = buildSlots(options.written, options.unwritten)

  // ── A gate at every milestone, in the Tunnel. The one being visited is lit; distance takes the rest.
  const HOOP_SEGMENTS = 96
  const HOOP_REST = 0.3
  const hoopData: number[] = []
  for (let i = 0; i < milestoneCount; i++) {
    const z = slots[i].poses.tunnel.position.z
    for (let s = 0; s < HOOP_SEGMENTS; s++) {
      const a = (s / HOOP_SEGMENTS) * TAU
      const b = ((s + 1) / HOOP_SEGMENTS) * TAU
      hoopData.push(Math.cos(a) * TUNNEL.hoop[0], Math.sin(a) * TUNNEL.hoop[1], z, Math.cos(b) * TUNNEL.hoop[0], Math.sin(b) * TUNNEL.hoop[1], z)
    }
  }
  const hoopGeometry = new BufferGeometry()
  hoopGeometry.setAttribute("position", new BufferAttribute(new Float32Array(hoopData), 3))
  const hoopColors = new BufferAttribute(new Float32Array(hoopData.length).fill(HOOP_REST), 3)
  hoopGeometry.setAttribute("color", hoopColors)
  const hoopGlow = new Float32Array(milestoneCount).fill(HOOP_REST)
  const hoopMaterial = new LineBasicMaterial({ color: accent, vertexColors: true, transparent: true, opacity: 0, depthTest: false })
  const hoops = new LineSegments(hoopGeometry, hoopMaterial)
  hoops.frustumCulled = false
  hoops.renderOrder = -4
  scene.add(hoops)
  scene.fog = new Fog(0x000000, 26, 150)
  const plane = new PlaneGeometry(1, 1)
  const blank = new Texture()
  const states: CardState[] = []
  const meshes: Mesh<PlaneGeometry, ShaderMaterial>[] = []
  const from: Pose[] = []
  const to: Pose[] = []
  // How much of each card the Tunnel's distance leaves visible, 0 to 1.
  const veils = new Float32Array(slots.length).fill(1)
  slots.forEach((slot) => {
    const material = new ShaderMaterial({
      vertexShader: cardVertex,
      fragmentShader: cardFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        map: { value: blank },
        uSize: { value: new Vector2(slot.width, slot.height) },
        uDim: { value: 0 },
        uHover: { value: 0 },
        uOpen: { value: 0 },
        uGhost: { value: slot.info.written ? 0 : 1 },
        uLoaded: { value: 0 },
        uFade: { value: 0 },
        uVeil: { value: 1 },
        uSweep: { value: 0 },
        uGlare: { value: new Vector2(0.5, 0.5) },
        uAccent: { value: accent },
        uInk: { value: ink },
        uBg: { value: bg },
      },
    })
    const mesh = new Mesh(plane, material)
    mesh.frustumCulled = false
    scene.add(mesh)
    meshes.push(mesh)
    states.push({ m: calm ? 1 : 0, hover: 0, open: 0, away: 0 })
    from.push(slot.scatter)
    to.push(slot.poses.room)
  })

  // ── Textures, each shared by every card that shows it.
  const loader = new TextureLoader()
  const textures = new Map<string, Texture>()
  const sources = Array.from(new Set(slots.map((slot) => slot.info.src)))
  const needed = new Set(options.written.map((card) => card.src))
  let loaded = 0
  let ready = false
  let disposed = false
  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const begin = () => {
    if (ready || disposed) return
    ready = true
    options.onReady()
    animate(railMaterial, { opacity: 0.4, duration: calm ? 0 : 1800, delay: calm ? 0 : 1500, ease: "out(2)" })
    meshes.forEach((mesh, index) => {
      // Milestones arrive first, in order, and the unwritten sky follows them in.
      const delay = calm ? 0 : index < options.written.length ? index * 70 : 500 + Math.random() * 900
      animate(states[index], { m: 1, duration: calm ? 0 : 2000, delay, ease: "out(4)" })
      animate(mesh.material, { uFade: 1, duration: calm ? 0 : 900, delay, ease: "out(2)" })
    })
  }

  sources.forEach((src) => {
    loader.load(
      src,
      (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = SRGBColorSpace
        texture.anisotropy = maxAnisotropy
        textures.set(src, texture)
        slots.forEach((slot, index) => {
          if (slot.info.src !== src) return
          meshes[index].material.uniforms.map.value = texture
          animate(meshes[index].material, { uLoaded: 1, duration: calm ? 0 : 700, ease: "out(2)" })
        })
        loaded++
        needed.delete(src)
        options.onProgress(loaded / sources.length)
        if (needed.size === 0) begin()
      },
      undefined,
      () => {
        loaded++
        needed.delete(src)
        options.onProgress(loaded / sources.length)
        if (needed.size === 0) begin()
      }
    )
  })
  const fallback = window.setTimeout(begin, 9000)

  // ── View.
  let formation: FormationId = "room"
  const view = { yaw: 0, pitch: 0, climbPerYaw: 0, advance: 0, turn: 1, fov: 62 }
  // Where on the hovered card the pointer is, eased, so the card tilts toward it.
  const tilt = { x: 0.5, y: 0.5 }
  const tiltEuler = new Euler()
  const tiltQuaternion = new Quaternion()
  const velocity = { yaw: 0, pitch: 0 }
  let baseFov = 62
  let aspect = 1
  let wide = true
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  let openIndex = -1
  let hoverIndex = -1
  let focusIndex = -1
  let dragging = false
  let moved = 0
  let lastX = 0
  let lastY = 0
  let idle = 0

  function resize() {
    const w = Math.max(1, canvas.clientWidth)
    const h = Math.max(1, canvas.clientHeight)
    renderer.setSize(Math.floor(w * pixelRatio), Math.floor(h * pixelRatio), false)
    aspect = w / h
    wide = aspect > 1.05
    // Portrait screens see less of the ring, so the lens opens up.
    baseFov = wide ? 62 : 80
    camera.aspect = aspect
    skyMaterial.uniforms.uAspectX.value = aspect
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  view.fov = baseFov

  const raycaster = new Raycaster()
  const pointer = new Vector2()
  function cardAt(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -(((clientY - rect.top) / rect.height) * 2 - 1))
    raycaster.setFromCamera(pointer, camera)
    // A card that distance has nearly hidden cannot be touched.
    for (const hit of raycaster.intersectObjects(meshes, false)) {
      const index = meshes.indexOf(hit.object as (typeof meshes)[number])
      if (veils[index] < 0.4) continue
      if (hit.uv) animate(tilt, { x: hit.uv.x, y: hit.uv.y, duration: 380, ease: "out(3)" })
      return index
    }
    return -1
  }

  function setHover(index: number) {
    if (index === hoverIndex) return
    if (hoverIndex >= 0) animate(states[hoverIndex], { hover: 0, duration: 420, ease: "out(3)" })
    hoverIndex = index
    if (index >= 0) {
      animate(states[index], { hover: 1, duration: 320, ease: "out(3)" })
      animate(meshes[index].material, { uSweep: [0, 1], duration: 900, ease: "out(2)" })
    }
    options.onHover(index >= 0)
  }

  const lineFor = (id: FormationId) => (id === "room" ? railMaterial : id === "spiral" ? pathMaterial : id === "tunnel" ? hoopMaterial : null)
  const lineOpacity = (target: unknown) => (target !== lineFor(formation) ? 0 : target === hoopMaterial ? 0.7 : 0.4)
  function showLines(duration: number) {
    animate([railMaterial, pathMaterial, hoopMaterial], { opacity: lineOpacity, duration, ease: "out(2)" })
  }

  function aimAt(index: number, duration = 900) {
    const pose = slots[index].poses[formation]
    velocity.yaw = velocity.pitch = 0
    const yaw = LIMITS[formation].yaw ? pose.yaw : view.yaw + wrap(pose.yaw - view.yaw)
    animate(view, { yaw, pitch: pose.pitch, duration: calm ? 0 : duration, ease: "out(4)" })
  }

  function open(index: number) {
    if (index < 0 || index === openIndex) return
    const previous = openIndex
    openIndex = index
    setHover(-1)
    velocity.yaw = velocity.pitch = 0
    if (previous >= 0) animate(states[previous], { open: 0, away: 1, duration: calm ? 0 : 650, ease: "out(3)" })
    animate(states[index], { open: 1, away: 0, duration: calm ? 0 : 950, ease: "out(4)" })
    animate(meshes[index].material, { uSweep: [0, 1], duration: 1100, delay: 250, ease: "out(2)" })
    const others = states.filter((_, i) => i !== index && i !== previous)
    // The room steps back from the opened card, nearest neighbours first.
    animate(others, { away: 1, duration: calm ? 0 : 800, ease: "out(3)", delay: calm ? 0 : stagger(4, { from: Math.min(index, others.length - 1) }) })
    animate(skyMaterial, { uOpen: 1, duration: calm ? 0 : 800, ease: "out(2)" })
    animate([railMaterial, pathMaterial, hoopMaterial], { opacity: (target: unknown) => (target === lineFor(formation) ? 0.06 : 0), duration: 600, ease: "out(2)" })
    options.onOpen(slots[index].info, index < options.written.length ? index : -1)
  }

  function close() {
    if (openIndex < 0) return
    const index = openIndex
    openIndex = -1
    animate(states[index], { open: 0, duration: calm ? 0 : 800, ease: "inOut(3)" })
    animate(states, { away: 0, duration: calm ? 0 : 900, ease: "out(3)", delay: calm ? 0 : stagger(3, { from: index }) })
    animate(skyMaterial, { uOpen: 0, duration: calm ? 0 : 800, ease: "out(2)" })
    showLines(800)
    options.onOpen(null, -1)
  }

  // ── Pointer: drag to turn with inertia, click to open.
  const onDown = (event: PointerEvent) => {
    dragging = true
    moved = 0
    lastX = event.clientX
    lastY = event.clientY
    idle = 0
    canvas.setPointerCapture?.(event.pointerId)
  }
  const onMove = (event: PointerEvent) => {
    if (!dragging) {
      if (event.pointerType === "mouse" && openIndex < 0) setHover(cardAt(event.clientX, event.clientY))
      return
    }
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    moved += Math.abs(dx) + Math.abs(dy)
    if (openIndex >= 0) return
    // One pixel of drag turns the camera by one pixel of view: the wall follows the hand.
    const perPixel = ((view.fov * Math.PI) / 180 / Math.max(1, canvas.clientHeight)) * 1.15
    if (formation === "tunnel") {
      // In the Tunnel a drag is travel: pull the corridor toward you, or sideways, to fly.
      velocity.yaw = (Math.abs(dx) > Math.abs(dy) ? dx : -dy) * perPixel * 0.5
      velocity.pitch = 0
    } else {
      velocity.yaw = dx * perPixel
      velocity.pitch = dy * perPixel
    }
    view.yaw += velocity.yaw
    view.pitch += velocity.pitch
    if (moved > 6) setHover(-1)
  }
  const onUp = (event: PointerEvent) => {
    if (!dragging) return
    dragging = false
    if (moved > 6) return
    const hit = cardAt(event.clientX, event.clientY)
    if (openIndex >= 0) {
      if (hit !== openIndex) close()
    } else if (hit >= 0) {
      aimAt(hit, 700)
      open(hit)
    }
  }
  const onLeave = () => {
    if (!dragging) setHover(-1)
  }
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    idle = 0
    if (openIndex >= 0) return
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    velocity.yaw = clamp(velocity.yaw - delta * 0.00016, -0.09, 0.09)
  }
  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)
  canvas.addEventListener("pointercancel", onUp)
  canvas.addEventListener("pointerleave", onLeave)
  canvas.addEventListener("wheel", onWheel, { passive: false })

  // ── Frame loop, on Anime's clock.
  const position = new Vector3()
  const quaternion = new Quaternion()
  const forward = new Vector3()
  const right = new Vector3()
  const up = new Vector3()
  const toCard = new Vector3()
  const openPosition = new Vector3()
  let last = performance.now()
  let time = 0
  let frame = 0

  const timer = createTimer({
    onUpdate: () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!calm) time += dt
      frame++
      idle += dt
      const limits = LIMITS[formation]

      if (!dragging) {
        view.yaw += velocity.yaw
        view.pitch += velocity.pitch
        const friction = Math.pow(0.935, dt * 60)
        velocity.yaw *= friction
        velocity.pitch *= friction
        // Left alone, the Room keeps turning very slowly.
        if (!calm && formation === "room" && openIndex < 0 && idle > 4) view.yaw += dt * 0.014
      }
      // The Tunnel never rests between two milestones: once the flight slows, it settles on the nearest.
      if (formation === "tunnel" && !dragging && openIndex < 0 && Math.abs(velocity.yaw) < 0.003) {
        const nearest = clamp(Math.round((TUNNEL.stop - TUNNEL.first - TUNNEL.advance * view.yaw) / TUNNEL.gap), 0, milestoneCount - 1)
        const rest = (TUNNEL.stop - TUNNEL.first - nearest * TUNNEL.gap) / TUNNEL.advance
        view.yaw = lerp(view.yaw, rest, 1 - Math.pow(0.93, dt * 60))
      }
      // Soft walls: past a limit the view is pulled back, not stopped dead.
      const pull = 1 - Math.pow(0.86, dt * 60)
      if (limits.yaw) {
        if (view.yaw < limits.yaw[0]) view.yaw = lerp(view.yaw, limits.yaw[0], pull)
        if (view.yaw > limits.yaw[1]) view.yaw = lerp(view.yaw, limits.yaw[1], pull)
      }
      if (view.pitch < limits.pitch[0]) view.pitch = lerp(view.pitch, limits.pitch[0], pull)
      if (view.pitch > limits.pitch[1]) view.pitch = lerp(view.pitch, limits.pitch[1], pull)

      // The lens widens a little with speed.
      const speed = Math.min(1, (Math.abs(velocity.yaw) + Math.abs(velocity.pitch)) * 26)
      view.fov = lerp(view.fov, baseFov + (calm ? 0 : speed * 7), 1 - Math.pow(0.9, dt * 60))
      camera.fov = view.fov
      camera.updateProjectionMatrix()
      // In the Tunnel the visitor weaves: toward the right wall for one milestone, the left for the next.
      const inTunnel = view.advance / TUNNEL.advance
      const station = clamp((TUNNEL.stop - TUNNEL.first - view.advance * view.yaw) / TUNNEL.gap, 0, milestoneCount - 1)
      const weave = Math.cos(Math.PI * station) * inTunnel
      const heading = view.yaw * view.turn - (wide ? weave * 0.1 : 0)
      camera.rotation.set(view.pitch, heading, 0)
      camera.position.set(weave * (wide ? 2.6 : TUNNEL.side), view.climbPerYaw * view.yaw, view.advance * view.yaw)
      camera.updateMatrixWorld()
      camera.getWorldDirection(forward)
      right.setFromMatrixColumn(camera.matrixWorld, 0)
      up.setFromMatrixColumn(camera.matrixWorld, 1)

      skyMaterial.uniforms.uTime.value = time
      // Stars are infinitely far: only turning moves them, never travelling.
      skyMaterial.uniforms.uLook.value.set(heading, view.pitch)
      skyMaterial.uniforms.uTanHalfFov.value = Math.tan((view.fov * Math.PI) / 360)

      const distance = 12
      const viewH = 2 * distance * Math.tan((view.fov * Math.PI) / 360)
      const viewW = viewH * aspect

      if (inTunnel > 0.001) {
        const visiting = Math.round(station)
        let changed = false
        for (let i = 0; i < milestoneCount; i++) {
          const glow = lerp(hoopGlow[i], i === visiting && openIndex < 0 ? 1 : HOOP_REST, 1 - Math.pow(0.88, dt * 60))
          if (Math.abs(glow - hoopGlow[i]) < 0.0005) continue
          hoopGlow[i] = glow
          hoopColors.array.fill(glow, i * HOOP_SEGMENTS * 6, (i + 1) * HOOP_SEGMENTS * 6)
          changed = true
        }
        if (changed) hoopColors.needsUpdate = true
      }

      let best = -2
      let bestIndex = focusIndex
      for (let i = 0; i < meshes.length; i++) {
        const state = states[i]
        const slot = slots[i]
        const a = from[i]
        const b = to[i]
        const m = state.m

        position.lerpVectors(a.position, b.position, m)
        // Cards swing in toward the visitor mid-flight, so a change of formation passes through them.
        position.multiplyScalar(1 - Math.sin(Math.PI * m) * 0.22)
        quaternion.slerpQuaternions(a.quaternion, b.quaternion, m)
        let dim = lerp(a.dim, b.dim, m)
        if (!calm) position.y += Math.sin(time * 0.5 + i * 1.7) * 0.14
        position.addScaledVector(toCard.copy(camera.position).sub(position).normalize(), state.hover * 1.1)
        position.addScaledVector(toCard, -state.away * 7)
        dim *= 1 - state.away * 0.9
        // Down the Tunnel, cards come out of the dark ahead and let go as the visitor passes them.
        let veil = 1
        if (inTunnel > 0.001) {
          const ahead = camera.position.z - position.z
          veil = lerp(1, smooth(1.5, 9, ahead) * (1 - smooth(50, 150, ahead) * 0.92), inTunnel)
          veil = lerp(veil, 1, state.open)
        }
        veils[i] = veil

        let scale = 1 + state.hover * 0.035
        if (state.hover > 0.001 && state.open < 0.5) {
          tiltEuler.set((tilt.y - 0.5) * 0.5 * state.hover, (tilt.x - 0.5) * 0.62 * state.hover, 0)
          quaternion.multiply(tiltQuaternion.setFromEuler(tiltEuler))
          meshes[i].material.uniforms.uGlare.value.set(tilt.x, tilt.y)
        }
        if (state.open > 0.0001) {
          const maxH = wide ? viewH * 0.66 : viewH * 0.36
          const maxW = wide ? viewW * 0.44 : viewW * 0.86
          const openScale = Math.min(maxH / slot.height, maxW / slot.width)
          openPosition.copy(camera.position).addScaledVector(forward, distance)
          if (wide) openPosition.addScaledVector(right, -viewW * 0.22)
          else openPosition.addScaledVector(up, viewH * 0.2)
          position.lerp(openPosition, state.open)
          quaternion.slerp(camera.quaternion, state.open)
          scale = lerp(scale, openScale, state.open)
        }

        const mesh = meshes[i]
        mesh.position.copy(position)
        mesh.quaternion.copy(quaternion)
        mesh.scale.set(slot.width * scale, slot.height * scale, 1)
        mesh.renderOrder = state.open > 0.0001 ? 10 : 0
        const uniforms = mesh.material.uniforms
        uniforms.uDim.value = dim
        uniforms.uVeil.value = veil
        uniforms.uHover.value = state.hover
        uniforms.uOpen.value = state.open

        if (frame % 6 === 0 && m > 0.9) {
          toCard.copy(position).sub(camera.position)
          const away = toCard.length()
          const facing = toCard.normalize().dot(forward)
          // Milestones win a near tie, and in the Tunnel the nearer card wins over the ones far down it.
          const score = facing + (slot.info.written ? 0.02 : 0) - away * 0.0045 - (facing < 0 ? 1 : 0)
          if (score > best) {
            best = score
            bestIndex = i
          }
        }
      }
      // In the Tunnel the card in view is simply the one the visitor has reached.
      if (frame % 6 === 0 && inTunnel > 0.5) bestIndex = Math.round(station)
      if (frame % 6 === 0 && ready && bestIndex !== focusIndex && bestIndex >= 0) {
        focusIndex = bestIndex
        options.onFocus(slots[bestIndex].info, bestIndex < options.written.length ? bestIndex : -1)
      }

      renderer.render(scene, camera)
    },
  })

  const onLost = (event: Event) => event.preventDefault()
  canvas.addEventListener("webglcontextlost", onLost)

  return {
    setFormation(id) {
      if (id === formation) return
      close()
      formation = id
      idle = 0
      velocity.yaw = velocity.pitch = 0
      const nearest = focusIndex >= 0 ? focusIndex : 0
      meshes.forEach((mesh, index) => {
        // Freeze each card where it is now and send it to its new place.
        from[index] = { ...to[index], position: mesh.position.clone(), quaternion: mesh.quaternion.clone(), dim: mesh.material.uniforms.uDim.value }
        to[index] = slots[index].poses[id]
        states[index].m = calm ? 1 : 0
      })
      // The wave starts at the card being looked at and spreads through the deck.
      if (!calm) animate(states, { m: 1, duration: 1900, ease: "inOut(3)", delay: stagger(9, { from: nearest }) })
      const limits = LIMITS[id]
      view.yaw = wrap(view.yaw)
      const target = limits.yaw ? limits.home : { yaw: view.yaw, pitch: 0 }
      animate(view, {
        yaw: target.yaw,
        pitch: target.pitch,
        climbPerYaw: limits.climbPerYaw,
        advance: limits.advance,
        turn: limits.turn,
        duration: calm ? 0 : 1700,
        ease: "inOut(3)",
      })
      showLines(calm ? 0 : 1400)
    },
    step(direction) {
      const count = options.written.length
      const current = openIndex >= 0 && openIndex < count ? openIndex : focusIndex >= 0 && focusIndex < count ? focusIndex : direction > 0 ? -1 : 0
      const next = (current + direction + count) % count
      idle = 0
      aimAt(next)
      if (openIndex >= 0) open(next)
    },
    openFocused() {
      if (focusIndex < 0) return
      aimAt(focusIndex, 600)
      open(focusIndex)
    },
    close,
    dispose() {
      if (disposed) return
      disposed = true
      window.clearTimeout(fallback)
      timer.cancel()
      utils.remove([...states, view, tilt, skyMaterial, railMaterial, pathMaterial, hoopMaterial, ...meshes.map((mesh) => mesh.material)])
      observer.disconnect()
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("webglcontextlost", onLost)
      meshes.forEach((mesh) => mesh.material.dispose())
      textures.forEach((texture) => texture.dispose())
      plane.dispose()
      skyGeometry.dispose()
      skyMaterial.dispose()
      railGeometry.dispose()
      railMaterial.dispose()
      pathGeometry.dispose()
      pathMaterial.dispose()
      hoopGeometry.dispose()
      hoopMaterial.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
