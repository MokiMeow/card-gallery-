"use client"

import { useMemo } from "react"

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export default function StarfieldBackground() {
  const positions = useMemo(() => {
    const random = seededRandom(2026)
    const count = 4200
    const points = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const radius = 42 + random() * 150
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      points[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      points[index * 3 + 1] = radius * Math.cos(phi)
      points[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }

    return points
  }, [])

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.16} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  )
}
