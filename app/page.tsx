"use client"

import { Suspense, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ArrowUpRight, Orbit } from "lucide-react"
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

function GalleryExperience() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <Canvas
        camera={{ position: [0, 0, 38], fov: 60, near: 0.05, far: 240 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="absolute inset-0 z-10"
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <InitialSceneWarmup />
          <StarfieldBackground />
          <CardGalaxy />
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={40}
            rotateSpeed={0.5}
            zoomSpeed={1.1}
            panSpeed={0.8}
            enableDamping
            dampingFactor={0.075}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      <a
        href="/gallery-view/index.html"
        className="group fixed right-4 top-4 z-30 inline-flex min-h-12 items-center rounded-2xl border border-white/15 bg-[#0a0d0e]/90 p-1.5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.58)] backdrop-blur-md outline-none transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[#31b8c6]/50 hover:bg-[#101719]/95 active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#31b8c6] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:right-6 sm:top-6"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/8 text-[#8dd7dc]">
          <Orbit aria-hidden="true" className="h-[18px] w-[18px]" />
        </span>
        <span className="px-3 text-sm font-semibold tracking-[-0.01em]">Enter gallery</span>
        <ArrowUpRight aria-hidden="true" className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>

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
