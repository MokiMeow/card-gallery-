import { Object3D, Quaternion, Vector3 } from "three"
import type { CardInfo, FormationId } from "@/lib/cards"

export type Pose = {
  position: Vector3
  quaternion: Quaternion
  /** Brightness when at rest. Unwritten cards sit back so the milestones read first. */
  dim: number
  /** Where the camera looks to face this card. */
  yaw: number
  pitch: number
  climb: number
}

export type Slot = { info: CardInfo; width: number; height: number; poses: Record<FormationId, Pose>; scatter: Pose }

export type Limits = {
  yaw: [number, number] | null
  pitch: [number, number]
  /** How far the camera rises per radian of yaw (the Spiral). */
  climbPerYaw: number
  /** How far the camera travels forward per radian of yaw (the Tunnel). */
  advance: number
  /** 1 when yaw turns the camera, 0 when it only moves it. */
  turn: number
  home: { yaw: number; pitch: number }
}

export const TUNNEL = { advance: 30, first: 18, gap: 10, radius: 6.4, stop: 17 }

export const ROOM_RADIUS = 24
export const SPIRAL_RADIUS = 20
export const SPIRAL_STEP = (34 * Math.PI) / 180
export const SPIRAL_RISE = 2.5

/** How many milestones the limits below are sized for. Kept in step with the deck by buildSlots. */
let milestones = 15

export const LIMITS: Record<FormationId, Limits> = {
  room: { yaw: null, pitch: [-0.92, 0.92], climbPerYaw: 0, advance: 0, turn: 1, home: { yaw: 0, pitch: 0 } },
  // Cards run left to right, which is toward negative yaw.
  spiral: { yaw: [-SPIRAL_STEP * (milestones - 1) - 0.5, 0.5], pitch: [-0.5, 0.5], climbPerYaw: -SPIRAL_RISE / SPIRAL_STEP, advance: 0, turn: 1, home: { yaw: 0, pitch: 0 } },
  wall: { yaw: [-0.95, 0.95], pitch: [-0.5, 0.5], climbPerYaw: 0, advance: 0, turn: 1, home: { yaw: 0, pitch: 0 } },
  // Here yaw is distance: dragging or scrolling flies the visitor down the tunnel.
  tunnel: {
    yaw: [(-(TUNNEL.first + TUNNEL.gap * (milestones - 1)) + TUNNEL.stop - 8) / TUNNEL.advance, 0.25],
    pitch: [-0.22, 0.22],
    climbPerYaw: 0,
    advance: TUNNEL.advance,
    turn: 0,
    home: { yaw: 0, pitch: 0 },
  },
}

const helper = new Object3D()

/** A card on a cylinder of the given radius, facing the axis. Yaw 0 is straight ahead. */
function onCylinder(radius: number, yaw: number, y: number, dim: number, climb = 0): Pose {
  helper.position.set(-Math.sin(yaw) * radius, y, -Math.cos(yaw) * radius)
  helper.lookAt(0, y, 0)
  return {
    position: helper.position.clone(),
    quaternion: helper.quaternion.clone(),
    dim,
    yaw,
    pitch: Math.atan2(y - climb, radius),
    climb,
  }
}

/** A card on the inside of the room's sphere, facing the visitor at the centre. */
function onSphere(radius: number, yaw: number, pitch: number, dim: number): Pose {
  const flat = Math.cos(pitch) * radius
  helper.position.set(-Math.sin(yaw) * flat, Math.sin(pitch) * radius, -Math.cos(yaw) * flat)
  helper.lookAt(0, 0, 0)
  return { position: helper.position.clone(), quaternion: helper.quaternion.clone(), dim, yaw, pitch, climb: 0 }
}

/** A card on the wall of the tunnel, turned to meet the visitor flying toward it. */
function inTunnel(angle: number, radius: number, z: number, dim: number, facing: number): Pose {
  helper.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.78, z)
  helper.lookAt(0, 0, z + facing)
  return { position: helper.position.clone(), quaternion: helper.quaternion.clone(), dim, yaw: (z + TUNNEL.stop) / TUNNEL.advance, pitch: 0, climb: 0 }
}

function random(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Three ways to hang the same deck.
 * Room: the milestones ring the visitor at eye level; unwritten universes fill the sky and floor.
 * Spiral: the milestones climb in the order they happened.
 * Wall: all twelve at once, the unwritten ones a mosaic behind.
 */
export function buildSlots(written: CardInfo[], unwritten: CardInfo[]): Slot[] {
  const rand = random(2026)
  const slots: Slot[] = []
  // The far ends of the Spiral and the Tunnel depend on how many milestones there are.
  milestones = written.length
  LIMITS.spiral.yaw = [-SPIRAL_STEP * (milestones - 1) - 0.5, 0.5]
  LIMITS.tunnel.yaw = [(-(TUNNEL.first + TUNNEL.gap * (milestones - 1)) + TUNNEL.stop - 8) / TUNNEL.advance, 0.25]
  const TAU = Math.PI * 2

  const scatter = (): Pose => {
    const yaw = rand() * TAU
    const pitch = (rand() - 0.5) * 2.4
    const pose = onSphere(60 + rand() * 50, yaw, pitch, 0)
    helper.quaternion.copy(pose.quaternion)
    helper.rotateX((rand() - 0.5) * 3).rotateY((rand() - 0.5) * 3)
    pose.quaternion.copy(helper.quaternion)
    return pose
  }

  written.forEach((info, index) => {
    // Equal visual weight whatever the photograph's shape.
    const height = Math.sqrt(52 / info.aspect)
    const width = height * info.aspect
    // The Wall is five across, so fifteen milestones hang as three even rows.
    const column = index % 5
    const row = Math.floor(index / 5)
    slots.push({
      info,
      width,
      height,
      scatter: scatter(),
      poses: {
        room: onSphere(ROOM_RADIUS, -(index / written.length) * TAU, 0, 1),
        spiral: onCylinder(20, -index * SPIRAL_STEP, index * SPIRAL_RISE, 1, index * SPIRAL_RISE),
        wall: onCylinder(34, (2 - column) * 0.3, (1 - row) * 9.4, 1),
        tunnel: inTunnel(index * 2.2 + 0.4, TUNNEL.radius, -(TUNNEL.first + index * TUNNEL.gap), 1, 15),
      },
    })
  })

  // Rows of unwritten cards above and below the ring.
  const rows = [
    { pitch: 0.46, count: 20 },
    { pitch: -0.46, count: 20 },
    { pitch: 0.83, count: 16 },
    { pitch: -0.83, count: 16 },
  ]
  let n = 0
  rows.forEach((row, rowIndex) => {
    for (let i = 0; i < row.count; i++, n++) {
      const info = unwritten[(n * 7 + rowIndex * 3) % unwritten.length]
      const height = 5.2
      const width = height * info.aspect
      const mosaicColumn = n % 12
      const mosaicRow = Math.floor(n / 12)
      slots.push({
        info,
        width,
        height,
        scatter: scatter(),
        poses: {
          room: onSphere(ROOM_RADIUS + 1.5, ((i + (rowIndex % 2) * 0.5) / row.count) * TAU, row.pitch, 0.3),
          spiral: onCylinder(37, -n * 0.27, -14 + n * 0.82, 0.16, (n * 0.27 * SPIRAL_RISE) / SPIRAL_STEP),
          wall: onCylinder(45, (5.5 - mosaicColumn) * 0.2, (2.5 - mosaicRow) * 8.4, 0.13),
          tunnel: inTunnel(n * 0.93, 13.5 + (n % 3) * 1.6, -(6 + n * 1.75), 0.2, 11),
        },
      })
    }
  })

  return slots
}
