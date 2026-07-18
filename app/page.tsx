"use client"

import { Suspense, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ArrowUpRight, Orbit } from "lucide-react"
import { PerspectiveCamera, TOUCH } from "three"
import StarfieldBackground from "@/components/starfield-background"
import CardGalaxy from "@/components/card-galaxy"
import CardModal from "@/components/card-modal"
import { CardProvider } from "@/components/card-context"

function InitialSceneWarmup() {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    let remainingFrames = 8
    let animationFrame = 0

    const renderSettledFrame = () => {
      invalidate()
      remainingFrames -= 1
      if (remainingFrames > 0) animationFrame = requestAnimationFrame(renderSettledFrame)
    }

    animationFrame = requestAnimationFrame(renderSettledFrame)
    return () => cancelAnimationFrame(animationFrame)
  }, [invalidate])

  return null
}

function ResponsiveSceneCamera() {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return

    const portrait = size.height > size.width
    const phone = portrait && size.width <= 640
    const tablet = portrait && size.width <= 900

    camera.position.set(0, 0, phone ? 52 : tablet ? 45 : 38)
    camera.fov = phone ? 62 : 60
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, size.height, size.width])

  return null
}

function GalleryExperience() {
  return (
    <div className="relative h-[100dvh] w-full touch-none overflow-hidden bg-black">
      <Canvas
        camera={{ position: [0, 0, 38], fov: 60, near: 0.05, far: 240 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="absolute inset-0 z-10 touch-none"
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <InitialSceneWarmup />
          <ResponsiveSceneCamera />
          <StarfieldBackground />
          <CardGalaxy />
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={90}
            rotateSpeed={0.5}
            zoomSpeed={1.1}
            panSpeed={0.8}
            enableDamping
            dampingFactor={0.075}
            touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:bottom-auto sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right))] sm:top-[max(1rem,env(safe-area-inset-top))] sm:w-auto sm:max-w-none sm:translate-x-0">
        <a
          href="/gallery-view/index.html"
          aria-label="Enter gallery"
          className="group flex min-h-13 w-full items-center rounded-2xl border border-white/15 bg-[#0a0d0e]/92 p-1.5 text-white shadow-[0_16px_45px_rgba(0,0,0,0.62)] backdrop-blur-xl outline-none transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[#31b8c6]/50 hover:bg-[#101719]/96 active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#31b8c6] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:min-h-12 sm:w-auto"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/8 text-[#8dd7dc]">
            <Orbit aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <span className="flex-1 px-3 text-left text-sm font-semibold tracking-[-0.01em] sm:flex-none">
            Enter gallery
          </span>
          <ArrowUpRight aria-hidden="true" className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>

      <CardModal />
    </div>
  )
}

export default function Page() {
  return (
    <CardProvider>
      <GalleryExperience />
    </CardProvider>
  )
}
