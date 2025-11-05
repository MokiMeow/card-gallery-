"use client"

import { useMemo } from "react"
import { Sphere } from "@react-three/drei"
import FloatingCard from "./floating-card"
import { useCard } from "./card-context"

export default function CardGalaxy() {
  const { cards } = useCard()

  // Generate perfect spherical positions using Fibonacci sphere algorithm
  const cardPositions = useMemo(() => {
    const positions = []
    const numCards = cards.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numCards; i++) {
      // Use Fibonacci sphere for even distribution
      const y = 1 - (i / (numCards - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y)

      const theta = (2 * Math.PI * i) / goldenRatio

      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      // Scale up the sphere and add multiple radius layers for depth
      const layerRadius = 12 + (i % 3) * 4 // 3 different radius layers: 12, 16, 20

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)), // Point towards center
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2, // Slight random tilt
      })
    }

    return positions
  }, [cards.length])

  // Place real hackathon photos (local files) on forward-facing positions (largest Z)
  const realCards = cards.filter((c: any) => typeof c.imageUrl === "string" && c.imageUrl.startsWith("/hackathon"))
  const placeholderCards = cards.filter((c: any) => !(typeof c.imageUrl === "string" && c.imageUrl.startsWith("/hackathon")))
  const positionsSorted = [...cardPositions].sort((a, b) => b.z - a.z)
  const orderedCards = [...realCards, ...placeholderCards]

  return (
    <>
      {/* Central Globe - visible reference */}
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>

      {/* Outer reference spheres to show the card layers */}
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.05} wireframe />
      </Sphere>

      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.03} wireframe />
      </Sphere>

      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>

      {/* Spherically Distributed Cards */}
      {orderedCards.map((card, index) => {
        let pos = positionsSorted[index]
        // Nudge the Git card slightly upward for better framing
        if (typeof (card as any).imageUrl === "string" && (card as any).imageUrl.endsWith("/git.png")) {
          pos = { ...pos, y: pos.y + 2 }
        }
        return <FloatingCard key={(card as any).id} card={card as any} position={pos} />
      })}
    </>
  )
}
