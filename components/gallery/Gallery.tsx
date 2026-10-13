"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { FORMATIONS, UNWRITTEN, WRITTEN, type CardInfo, type FormationId } from "@/lib/cards"
import type { GalleryEngine } from "./engine/mountGallery"
import styles from "./gallery.module.css"

type Shown = { info: CardInfo; order: number }

const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * The gallery: one room of cards. The twelve milestones ring the visitor at eye
 * level; the unwritten universes fill the rest. The same deck can be re-hung as
 * a spiral or a wall. The canvas is driven by ./engine (Three.js + Anime.js).
 */
export function Gallery() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLElement>(null)
  const engineRef = useRef<GalleryEngine | null>(null)
  const revealRef = useRef<((root: Element, calm: boolean) => () => void) | null>(null)

  const calm = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<"loading" | "ready" | "failed">("loading")
  const [formation, setFormation] = useState<FormationId>("room")
  const [focus, setFocus] = useState<Shown | null>(null)
  const [opened, setOpened] = useState<Shown | null>(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let engine: GalleryEngine | null = null

    void import("./engine/mountGallery")
      .then(({ mountGallery, revealCopy }) => {
        if (disposed) return
        revealRef.current = revealCopy
        engine = mountGallery({
          canvas,
          written: WRITTEN,
          unwritten: UNWRITTEN,
          calm: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onProgress: setProgress,
          onReady: () => setStage("ready"),
          onFocus: (info, order) => setFocus({ info, order }),
          onHover: setHovering,
          onOpen: (info, order) => setOpened(info ? { info, order } : null),
        })
        if (!engine) setStage("failed")
        engineRef.current = engine
      })
      .catch(() => {
        if (!disposed) setStage("failed")
      })

    return () => {
      disposed = true
      engineRef.current = null
      engine?.dispose()
    }
  }, [])

  // Copy rises in whenever the card it describes changes.
  useEffect(() => {
    const node = captionRef.current
    if (!node || !focus || !revealRef.current) return
    return revealRef.current(node, calm)
  }, [focus, calm])

  useEffect(() => {
    const node = detailRef.current
    if (!node || !opened || !revealRef.current) return
    const revert = revealRef.current(node, calm)
    node.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true })
    return revert
  }, [opened, calm])

  const hang = (id: FormationId) => {
    setFormation(id)
    engineRef.current?.setFormation(id)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const engine = engineRef.current
      if (!engine) return
      if (event.key === "Escape") engine.close()
      else if (event.key === "ArrowRight") engine.step(1)
      else if (event.key === "ArrowLeft") engine.step(-1)
      else if (event.key === "Enter" && event.target === document.body) engine.openFocused()
      else if (event.key >= "1" && event.key <= String(FORMATIONS.length)) {
        const next = FORMATIONS[Number(event.key) - 1].id
        setFormation(next)
        engine.setFormation(next)
      } else return
      event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const percent = Math.round(progress * 100)

  return (
    <div ref={rootRef} className={styles.gallery} data-stage={stage} data-open={opened !== null} data-hover={hovering}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="A room of cards. Drag to look around, select a card to open it." role="img" />

      <header className={styles.header}>
        <p className={styles.logo}>
          Mohith <span>Gallery</span>
        </p>
        <div className={styles.formations} role="radiogroup" aria-label="How the cards are hung">
          {FORMATIONS.map((item, index) => (
            <button key={item.id} type="button" role="radio" aria-checked={formation === item.id} title={item.hint} onClick={() => hang(item.id)}>
              <span aria-hidden="true">{index + 1}</span>
              {item.label}
            </button>
          ))}
        </div>
      </header>


      {stage === "loading" && (
        <div className={styles.loader} role="status" aria-live="polite">
          <p className={styles.loaderLabel}>Mohith · Selected moments</p>
          <p className={styles.loaderNumber}>{percent}</p>
          <span className={styles.loaderBar}>
            <span style={{ transform: `scaleX(${progress})` }} />
          </span>
        </div>
      )}

      {stage === "failed" && (
        <main className={styles.fallback}>
          <h1>Mohith · Gallery</h1>
          <ol>
            {WRITTEN.map((card) => (
              <li key={card.id}>
                <strong>{card.title}</strong> {card.kind}, {card.year}. {card.description}
              </li>
            ))}
          </ol>
        </main>
      )}

      {stage === "ready" && focus && !opened && (
        <div ref={captionRef} className={styles.caption} key={focus.info.id + focus.order}>
          <p className={styles.captionMeta} data-rise>
            {focus.order >= 0 ? (
              <>
                <b>{pad(focus.order + 1)}</b> / {pad(WRITTEN.length)}
              </>
            ) : (
              <b>Unwritten</b>
            )}
            <span>
              {focus.info.kind} · {focus.info.year}
            </span>
          </p>
          <h1 className={styles.captionTitle} data-split>
            {focus.info.title}
          </h1>
        </div>
      )}

      {stage === "ready" && !opened && <p className={styles.hint}>{formation === "tunnel" ? "Scroll or drag to fly" : "Drag or scroll to look around"} · Select a card to open it</p>}

      {opened && (
        <aside ref={detailRef} className={styles.detail} key={opened.info.id + opened.order} aria-label={opened.info.title}>
          <p className={styles.kicker} data-rise>
            {opened.order >= 0 ? `${pad(opened.order + 1)} / ${pad(WRITTEN.length)}` : "Unwritten"}
            <span>
              {opened.info.kind} · {opened.info.year}
            </span>
          </p>
          <h2 className={styles.detailTitle} data-split>
            {opened.info.title}
          </h2>
          <p className={styles.detailBody} data-rise>
            {opened.info.description}
          </p>
          <p className={styles.detailNote} data-rise>
            {opened.info.note}
          </p>
          <div className={styles.detailNav} data-rise>
            <button type="button" onClick={() => engineRef.current?.step(-1)} aria-label="Previous milestone">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M19 12H5m6-6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={() => engineRef.current?.step(1)} aria-label="Next milestone">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className={styles.close} data-close onClick={() => engineRef.current?.close()}>
              Back to the room
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
