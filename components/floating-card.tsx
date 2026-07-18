"use client"

import { memo, useRef, useState, type KeyboardEvent } from "react"
import { Html } from "@react-three/drei"
import { useFrame, type ThreeEvent } from "@react-three/fiber"
import type * as THREE from "three"
import type { Card } from "./card-context"
import { useCard } from "./card-context"

export interface CardPosition {
  x: number
  y: number
  z: number
  rotationX?: number
  rotationY?: number
  rotationZ?: number
}

interface FloatingCardProps {
  card: Card
  position: CardPosition
  distanceFactor?: number
  compact?: boolean
}

const tealGlow = "0 25px 50px rgba(49, 184, 198, 0.5), 0 0 30px rgba(49, 184, 198, 0.3)"
const tealBorder = "2px solid rgba(49, 184, 198, 0.5)"

function FloatingCard({ card, position, distanceFactor = 10, compact = false }: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { setSelectedCard } = useCard()

  // Preserve the original globe behavior. Facing each group toward the camera
  // produces the clean radial orientation when the sphere is viewed top-down.
  useFrame(({ camera }) => {
    groupRef.current?.lookAt(camera.position)
  })

  const openCard = () => setSelectedCard(card)
  const handleCardClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    openCard()
  }
  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setHovered(true)
  }
  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setHovered(false)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openCard()
    }
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <mesh
        onClick={handleCardClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[4.4, 4.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html
        transform
        distanceFactor={distanceFactor}
        zIndexRange={[100, 0]}
        position={[0, 0, 0.01]}
        style={{
          pointerEvents: "none",
          transform: hovered ? "scale(1.055)" : "scale(1)",
          transition: "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: hovered ? "transform" : "auto",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`Open ${card.title}`}
          onKeyDown={handleKeyDown}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className={`${compact ? "w-36 p-1.5" : "w-40 p-2"} select-none overflow-hidden rounded-lg bg-[#1F2121] shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#31b8c6] focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
          style={{
            touchAction: "manipulation",
            boxShadow: hovered
              ? card.isPlaceholder
                ? tealGlow
                : "0 18px 38px rgba(0, 0, 0, 0.55)"
              : "0 15px 30px rgba(0, 0, 0, 0.6)",
            border: hovered
              ? card.isPlaceholder
                ? tealBorder
                : "1px solid rgba(255, 255, 255, 0.15)"
              : "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className={`${compact ? "h-36" : "h-40"} relative w-full overflow-hidden rounded-md bg-[#0f1111]`}>
            <div
              className="absolute inset-0 bg-[#0f1111] transition-opacity duration-200"
              style={{ opacity: imageLoaded ? 0 : 1 }}
            />
            <img
              src={card.imageUrl}
              alt={card.alt}
              className="h-full w-full rounded-md object-cover transition-opacity duration-200"
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>
        </div>
      </Html>
    </group>
  )
}

export default memo(FloatingCard)
