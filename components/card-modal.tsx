"use client"

import type React from "react"

import { useState, useRef, useEffect, type MouseEvent } from "react"
import { X } from "lucide-react"
import { useCard } from "./card-context"

export default function CardModal() {
  const { selectedCard, setSelectedCard } = useCard()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  // favorite state removed (no favorite button in modal)
  const [imgLoaded, setImgLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  // Close on Escape for better UX — must be before any conditional return
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCard(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setSelectedCard])

  // Subtle entrance animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (!selectedCard) return null

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })

    // Calculate rotation based on mouse position
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  // no-op (buttons removed)

  const handleClose = () => {
    setSelectedCard(null)
  }

  // (Escape handler is declared above to keep hook order consistent.)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full mx-4 max-w-sm sm:max-w-md"
        style={{
          willChange: "transform, opacity",
          transform: entered ? "scale(1)" : "scale(0.98)",
          opacity: entered ? 1 : 0,
          transition: "transform 140ms ease, opacity 140ms ease",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Card */}
        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-[16px] bg-[#1F2121] p-4 transition-all duration-300 ease-out w-full max-h-[85vh] overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              boxShadow:
                "rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px",
              willChange: "transform",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main image */}
            <div className="relative w-full mb-4" style={{ aspectRatio: "3 / 4" }}>
              {selectedCard.imageUrl.startsWith("/placeholder") ? (
                <div
                  className="absolute inset-0 rounded-[16px] flex items-center justify-center text-white/85 text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #0a0c0c 0%, #121414 60%), radial-gradient(1200px 400px at -10% -10%, rgba(49,184,198,0.25), rgba(0,0,0,0) 60%), radial-gradient(800px 300px at 110% 110%, rgba(49,184,198,0.2), rgba(0,0,0,0) 60%)",
                    border: "1px solid rgba(49,184,198,0.35)",
                    boxShadow: "0 30px 60px rgba(49,184,198,0.35)",
                  }}
                >
                  Many more to come
                </div>
              ) : (
                <>
                  <div
                    className="absolute inset-0 rounded-[16px] bg-[#0f1111]"
                    style={{ opacity: imgLoaded ? 0 : 1, transition: "opacity 200ms ease" }}
                  />
                  <img
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover"
                    alt={selectedCard.alt}
                    src={encodeURI(selectedCard.imageUrl) || "/placeholder.svg"}
                    onLoad={() => setImgLoaded(true)}
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                      opacity: imgLoaded ? 1 : 0,
                      transition: "opacity 200ms ease",
                    }}
                  />
                </>
              )}
              {/* Vignette overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[16px]"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </div>

            {/* No title below the image */}

            {/* No action buttons for both real and placeholder cards. */}
            {!(selectedCard.imageUrl || "").startsWith("/hackathon") && (
              <p className="text-white/90 text-center text-sm">Many more to come</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
