"use client"

import type React from "react"

import { useEffect, useState, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import SparkleOverlay from "@/components/sparkle-overlay"
import TiledBackground from "@/components/tiled-background"
import { TRANSITION_CONSTANTS } from "@/constants/transitions"

interface PassionsPageProps {
  isActive: boolean
  isTransitioning: boolean
  transitionDirection?: "in" | "out"
}

interface Passion {
  id: string
  title: string
  description: string
  // Position relative to the house image container (percentages)
  pinPosition: { top: string; left: string }
  cardOffset: { x: number; y: number }
  pinColor: "orange" | "blue"
}


const passions: Passion[] = [
  {
    id: "3d-printing",
    title: "3D Printing",
    description:
      'I may have misunderstood "software engineering" and spent too long learning CAD, slicing, and how designs fail physically.',
    pinPosition: { top: "72%", left: "18%" }, // On the 3D printer area
    cardOffset: { x: -180, y: -160 },
    pinColor: "orange",
  },
  {
    id: "cars",
    title: "Cars",
    description:
      "I've always been drawn to cars, partly for how they work, partly for how many problems they hide until you look closely.",
    pinPosition: { top: "38%", left: "82%" }, // On the BMW car
    cardOffset: { x: 30, y: -80 },
    pinColor: "orange",
  },
  {
    id: "gym",
    title: "Gym",
    description:
      "The gym is where I go when debugging stops making sense and problems are better solved one rep at a time.",
    pinPosition: { top: "68%", left: "72%" }, // On the gym equipment area
    cardOffset: { x: 30, y: -60 },
    pinColor: "blue",
  },
  {
    id: "homelab",
    title: "Homelab",
    description:
      "I keep a home server mostly to learn what actually happens when systems are left running without supervision.",
    pinPosition: { top: "70%", left: "48%" }, // On the server rack area
    cardOffset: { x: -100, y: 40 },
    pinColor: "blue",
  },
]

export default function PassionsPage({ isActive, isTransitioning, transitionDirection }: PassionsPageProps) {
  const [hoveredPassion, setHoveredPassion] = useState<string | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [pinsVisible, setPinsVisible] = useState(false)

  useEffect(() => {
    // Only set scene ready when page is active and not transitioning
    if (isActive && !isTransitioning) {
      const revealTimer = setTimeout(() => setSceneReady(true), TRANSITION_CONSTANTS.SCENE_REVEAL_DELAY)
      const pinsTimer = setTimeout(() => setPinsVisible(true), TRANSITION_CONSTANTS.PINS_REVEAL_DELAY)
      return () => {
        clearTimeout(revealTimer)
        clearTimeout(pinsTimer)
      }
    }

    // Reset scene state when page becomes inactive
    setSceneReady(false)
    setPinsVisible(false)
  }, [isActive, isTransitioning])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * 8, y: -x * 8 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out",
        isActive && !isTransitioning
          ? "opacity-100 translate-y-0 z-10"
          : transitionDirection === "out"
            ? "opacity-0 -translate-y-[30%] pointer-events-none z-0"
            : "opacity-0 translate-y-full pointer-events-none z-0",
      )}
    >
      <div className={cn(
        "absolute inset-0 overflow-hidden transition-opacity duration-300",
        isActive && !isTransitioning ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute inset-0 bg-black" />
        <TiledBackground
          sceneReady={sceneReady}
          sizeMultiplier={1.0}
          tileOffset={-320}
          extraTiles={2}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-black/70" />
        <SparkleOverlay count={40} />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col items-center justify-center transition-all duration-900",
          sceneReady ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        )}
      >
        {/* Title badge */}
        <div
          className={cn(
            "absolute top-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-900",
            sceneReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <div className="px-10 py-3 rounded-2xl bg-slate-800/80 border border-slate-600/50 backdrop-blur-sm">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-white tracking-wide italic">Passions</h1>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative mt-16"
          style={{
            width: "min(80vw, 650px)",
            perspective: "1000px",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src="/images/passionpage.png"
              alt="Passion house visualization"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority
            />

            {passions.map((passion) => (
              <div key={passion.id}>
                {/* Pin marker */}
                <div
                  className="absolute cursor-pointer z-20 transition-transform duration-200 hover:scale-150"
                  style={{
                    top: passion.pinPosition.top,
                    left: passion.pinPosition.left,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setHoveredPassion(passion.id)}
                  onMouseLeave={() => setHoveredPassion(null)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-lg transition-all",
                      pinsVisible ? "opacity-100 scale-100" : "opacity-0 scale-50",
                      passion.pinColor === "orange"
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : "bg-gradient-to-br from-sky-400 to-blue-500",
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "absolute z-50 transition-all duration-300",
                    hoveredPassion === passion.id ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
                  )}
                  style={{
                    top: passion.pinPosition.top,
                    left: passion.pinPosition.left,
                    transform: `translate(calc(-50% + ${passion.cardOffset.x}px), calc(-50% + ${passion.cardOffset.y}px))`,
                  }}
                >
                  <div
                    className={cn(
                      "w-64 sm:w-72 lg:w-80 backdrop-blur-md rounded-xl transition-all duration-300",
                      "bg-slate-900/75 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
                      passion.pinColor === "orange"
                        ? "border border-orange-500/30"
                        : "border border-blue-500/30",
                    )}
                  >
                    {/* Title */}
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3">
                      <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                        {passion.title}
                      </h3>
                    </div>

                    {/* Content */}
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <p className="text-xs sm:text-sm lg:text-base text-gray-200 leading-relaxed">{passion.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
