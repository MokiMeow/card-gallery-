"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { X } from "lucide-react"
import { useCard, type Card } from "./card-context"

export default function CardModal() {
  const { selectedCard, setSelectedCard } = useCard()
  const close = useCallback(() => setSelectedCard(null), [setSelectedCard])

  if (!selectedCard) return null

  return <OpenCardModal key={selectedCard.id} card={selectedCard} onClose={close} />
}

function OpenCardModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [entered, setEntered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const frame = requestAnimationFrame(() => {
      setEntered(true)
      closeButtonRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      event.preventDefault()
      closeButtonRef.current?.focus()
    }
  }
  const handlePointerEnter = () => {
    rectRef.current = cardRef.current?.getBoundingClientRect() ?? null
  }
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = rectRef.current
    if (!rect || !cardRef.current) return
    const x = event.clientX
    const y = event.clientY
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return
      const rotateX = ((y - rect.top) / rect.height - 0.5) * -2.4
      const rotateY = ((x - rect.left) / rect.width - 0.5) * 2.4
      cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    })
  }
  const handlePointerLeave = () => {
    rectRef.current = null
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    if (cardRef.current) cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)"
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      onKeyDown={handleDialogKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 sm:p-8"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
      }}
    >
      <h2 id="card-modal-title" className="sr-only">{card.title}</h2>
      <div
        className="relative flex max-h-[92dvh] max-w-[96vw] items-center justify-center"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.975)",
          transition: "opacity 160ms ease, transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className="absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white shadow-lg outline-none transition-colors hover:border-[#31b8c6]/70 hover:bg-[#162124] focus-visible:ring-2 focus-visible:ring-[#31b8c6]"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <div
          ref={cardRef}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative flex max-h-[92dvh] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111415] p-2 shadow-[0_32px_90px_rgba(0,0,0,0.72)] transition-transform duration-300 ease-out sm:p-3"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="relative flex min-h-40 min-w-40 items-center justify-center overflow-hidden rounded-xl bg-black sm:min-h-56 sm:min-w-56">
            <div
              className="absolute inset-0 bg-[#0f1111] transition-opacity duration-200"
              style={{ opacity: imageLoaded ? 0 : 1 }}
            />
            {/* The modal preserves each local asset's intrinsic dimensions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageUrl}
              alt={card.alt}
              className="block h-auto max-h-[calc(92dvh-1.5rem)] w-auto max-w-[calc(96vw-1rem)] rounded-xl object-contain transition-opacity duration-200 sm:max-h-[calc(92dvh-2rem)] sm:max-w-[calc(96vw-1.5rem)]"
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
