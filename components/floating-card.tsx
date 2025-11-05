"use client"

import { useRef, useState } from "react"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"
import { useCard } from "./card-context"

interface FloatingCardProps {
  card: {
    id: string
    imageUrl: string
    alt: string
    title: string
    isPlaceholder?: boolean
  }
  position: {
    x: number
    y: number
    z: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }
}

export default function FloatingCard({ card, position }: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const { setSelectedCard } = useCard()

  // Original teal-accent look used previously
  const tealGlow = "0 25px 50px rgba(49, 184, 198, 0.5), 0 0 30px rgba(49, 184, 198, 0.3)"
  const tealBorder = "2px solid rgba(49, 184, 198, 0.5)"
  const tealBg = "linear-gradient(135deg, #0a0c0c 0%, #121414 60%), radial-gradient(1200px 400px at -10% -10%, rgba(49,184,198,0.25), rgba(0,0,0,0) 60%), radial-gradient(800px 300px at 110% 110%, rgba(49,184,198,0.2), rgba(0,0,0,0) 60%)"

  // Make cards always face the camera
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    setSelectedCard(card)
  }

  // Handle clicks from the DOM-based Html overlay so anywhere on the card opens
  const handleDomClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCard(card)
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>

      {/* Visual card content */}
      <Html
        transform
        distanceFactor={10}
        zIndexRange={[100, 0]}
        position={[0, 0, 0.01]}
        style={{
          transition: "transform 150ms ease, filter 150ms ease",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          // allow clicking anywhere on the visual card
          pointerEvents: "auto",
          cursor: "pointer",
          willChange: "transform, filter",
        }}
      >
        <div
          role="button"
          aria-label={`${card.title} – open`}
          onClick={handleDomClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="w-40 rounded-lg overflow-hidden shadow-2xl bg-[#1F2121] p-2 select-none"
          style={{
            boxShadow: hovered
              ? (card.isPlaceholder ? tealGlow : "0 18px 38px rgba(0, 0, 0, 0.55)")
              : "0 15px 30px rgba(0, 0, 0, 0.6)",
            border: hovered ? (card.isPlaceholder ? tealBorder : "1px solid rgba(255, 255, 255, 0.15)") : "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Image or textured placeholder */}
          <div className="w-full h-40 rounded-md overflow-hidden relative">
            {card.imageUrl.startsWith("/placeholder") ? (
              <div
                className="absolute inset-0 rounded-md"
                style={{
                  background: tealBg,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            ) : (
              <>
                <div
                  className="absolute inset-0 bg-[#0f1111]"
                  style={{ opacity: imgLoaded ? 0 : 1, transition: "opacity 200ms ease" }}
                />
                <img
                  src={encodeURI(card.imageUrl) || "/placeholder.svg"}
                  alt={card.alt}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                  style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 200ms ease" }}
                />
              </>
            )}
          </div>
          {card.imageUrl.startsWith("/placeholder") && (
            <div className="mt-1 text-center">
              <p className="text-white text-[10px] opacity-80">Many more to come</p>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}
