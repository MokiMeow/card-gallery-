"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import StarfieldBackground from "@/components/starfield-background"
import CardGalaxy from "@/components/card-galaxy"
import CardModal from "@/components/card-modal"
import { CardProvider } from "@/components/card-context"

export default function Page() {
  return (
    <CardProvider>
      <div className="w-full h-screen relative overflow-hidden bg-black">
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          className="absolute inset-0 z-10"
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = "auto"
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />

            <CardGalaxy />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={40}
              autoRotate={false}
              rotateSpeed={0.5}
              zoomSpeed={1.1}
              panSpeed={0.8}
              enableDamping
              dampingFactor={0.08}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <CardModal />

        {/* UI Overlay (title only) */}
        <div className="absolute top-4 left-4 z-20 text-white pointer-events-none">
       
        </div>
      </div>
    </CardProvider>
  )
}
