"use client"

import { useMemo } from "react"
import { useThree } from "@react-three/fiber"
import FloatingCard, { type CardPosition } from "./floating-card"
import { useCard } from "./card-context"

export default function CardGalaxy() {
  const { cards } = useCard()
  const size = useThree((state) => state.size)
  const portrait = size.height > size.width
  const sceneScale = portrait && size.width <= 640 ? 0.72 : portrait && size.width <= 900 ? 0.84 : 1

  const layout = useMemo(() => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const positions: CardPosition[] = cards.map((_, index) => {
      const y = 1 - (index / (cards.length - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (2 * Math.PI * index) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const layerRadius = 12 + (index % 3) * 4

      return {
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationZ: Math.sin(index * 1.618) * 0.1,
      }
    })

    const sortedPositions = [...positions].sort((first, second) => second.z - first.z)
    const achievementCards = cards.filter((card) => card.imageUrl.startsWith("/hackathon/"))
    const designCards = cards.filter((card) => !card.imageUrl.startsWith("/hackathon/"))

    return [...achievementCards, ...designCards].map((card, index) => {
      const position = sortedPositions[index]
      return {
        card,
        position: card.id === "github-badge" ? { ...position, y: position.y + 2 } : position,
      }
    })
  }, [cards])

  return (
    <group scale={sceneScale}>
      {layout.map(({ card, position }) => (
        <FloatingCard key={card.id} card={card} position={position} />
      ))}
    </group>
  )
}
