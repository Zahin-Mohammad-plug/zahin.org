"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import SparkleOverlay from "@/components/sparkle-overlay"
import TiledBackground from "@/components/tiled-background"
import { TRANSITION_CONSTANTS } from "@/constants/transitions"

interface ProjectsPageProps {
  isActive: boolean
  isTransitioning: boolean
  transitionDirection?: "in" | "out"
}

interface Project {
  id: string
  name: string
  description: string
  link?: string
  linkText?: string
  tech: string[]
  pinPosition: { top: string; left: string }
  cardPosition: { top?: string; bottom?: string; left?: string; right?: string }
  pinColor: "orange" | "blue"
}


const projects: Project[] = [
  {
    id: "lilycove",
    name: "LilyCove",
    description: "Production web app aggregating listings for 18,000+ Pokémon cards, optimized for fast search.",
    link: "https://lilycove.io",
    linkText: "Built the production app",
    tech: ["React", "Python", "PostgreSQL", "Redis"],
    pinPosition: { top: "55%", left: "42%" },
    cardPosition: { top: "18%", left: "2%" },
    pinColor: "orange",
  },
  {
    id: "maple-leaf",
    name: "Maple Leaf 3D",
    description:
      "Web platform that generates instant 3D printing quotes by aliased models and computing cost for near real G-code data.",
    link: "https://mapleleaf3d.ca",
    linkText: "Visit site",
    tech: ["Next.js", "Python", "PrusaSlicer", "Three.js", "Docker"],
    pinPosition: { top: "40%", left: "58%" },
    cardPosition: { top: "5%", right: "2%" },
    pinColor: "blue",
  },
  {
    id: "latex-math",
    name: "LaTeX Math TTS",
    description:
      "Client-side tool that parses nested LaTeX expressions and converts them into synchronized spoken math for accessibility.",
    link: "https://mathtts.zahin.org/",
    linkText: "Try it out",
    tech: ["TypeScript", "React", "Parsing", "Web Speech API"],
    pinPosition: { top: "62%", left: "54%" },
    cardPosition: { top: "38%", right: "2%" },
    pinColor: "blue",
  },
]

export default function ProjectsPage({ isActive, isTransitioning, transitionDirection }: ProjectsPageProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [pinsVisible, setPinsVisible] = useState<Record<string, boolean>>({})
  const globeContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Drag state for each card
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }> | null>(null)
  const [draggingCard, setDraggingCard] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < TRANSITION_CONSTANTS.MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isActive && !isTransitioning) {
      const revealTimer = setTimeout(() => setSceneReady(true), TRANSITION_CONSTANTS.SCENE_REVEAL_DELAY)
      
      // Stagger pin appearance
      const pinTimers: NodeJS.Timeout[] = []
      projects.forEach((project, index) => {
        const delay = TRANSITION_CONSTANTS.PINS_REVEAL_DELAY + index * TRANSITION_CONSTANTS.PIN_STAGGER_DELAY
        const timer = setTimeout(() => {
          setPinsVisible((prev) => ({ ...prev, [project.id]: true }))
        }, delay)
        pinTimers.push(timer)
      })
      
      return () => {
        clearTimeout(revealTimer)
        pinTimers.forEach(clearTimeout)
      }
    }

    setSceneReady(false)
    setPinsVisible({})
  }, [isActive, isTransitioning])

  const handleMouseDown = (e: React.MouseEvent, projectId: string) => {
    setDraggingCard(projectId)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingCard || !dragStart) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setCardPositions(prev => ({
      ...prev,
      [draggingCard]: {
        x: (prev?.[draggingCard]?.x || 0) + deltaX,
        y: (prev?.[draggingCard]?.y || 0) + deltaY,
      }
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setDraggingCard(null)
    setDragStart(null)
  }

  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out",
        isActive
          ? "opacity-100 translate-y-0 z-10"
          : transitionDirection === "out"
            ? "opacity-0 scale-90 pointer-events-none z-0"
            : "opacity-0 translate-y-[20%] pointer-events-none z-0",
      )}
      style={{
        // Smooth fade in during cinematic transition from about page
        transition: isTransitioning && transitionDirection === "in" 
          ? "opacity 1.5s ease-out 0.7s, transform 1.5s ease-out 0.7s"
          : undefined,
      }}
    >
      <div className={cn(
        "absolute inset-0 overflow-hidden transition-opacity duration-300",
        isActive && !isTransitioning ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 animate-slow-pan">
          <TiledBackground
            sceneReady={sceneReady}
            sizeMultiplier={1.3}
            extraTiles={1}
            handleResize={true}
            usePanningStyle={true}
            className="absolute"
            parallaxSpeed={TRANSITION_CONSTANTS.PARALLAX_BACKGROUND_OFFSET}
          />
        </div>
        <div className="absolute inset-0 bg-black/70" />
        <SparkleOverlay count={45} />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col transition-all duration-900",
          sceneReady ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        )}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Title badge */}
        <div
          className={cn(
            "absolute top-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-900",
            sceneReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <div className="px-10 py-3 rounded-2xl bg-slate-800/80 border border-slate-600/50 backdrop-blur-sm">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-white tracking-wide italic">Projects</h1>
          </div>
        </div>

        <div 
          ref={globeContainerRef}
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl",
            sceneReady && "animate-zoom-in-space"
          )}
          style={{ 
            marginBottom: "-8%",
            willChange: "transform, opacity",
          }}
        >
          <div 
            className="relative"
            style={{
              willChange: "transform",
            }}
          >
            <Image
              src="/images/projectspageglobe.png"
              alt="Globe"
              width={1400}
              height={900}
              className="w-full h-auto"
              priority
            />

            {/* Project pins on globe */}
            {projects.map((project) => (
              <div
                key={project.id}
                className="absolute z-20 cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ 
                  top: project.pinPosition.top, 
                  left: project.pinPosition.left,
                  transform: "translate(-50%, -100%)",
                }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 512 512"
                  className={cn(
                    "transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                    pinsVisible[project.id] ? "opacity-100 scale-100" : "opacity-0 scale-50",
                    pinsVisible[project.id] && "animate-pulse-glow-enhanced",
                    hoveredProject === project.id && "drop-shadow-[0_0_16px_currentColor]",
                  )}
                  style={{
                    willChange: "transform, opacity",
                  }}
                >
                  <path
                    d="M256,0C160.798,0,83.644,77.155,83.644,172.356c0,97.162,48.158,117.862,101.386,182.495C248.696,432.161,256,512,256,512s7.304-79.839,70.97-157.148c53.228-64.634,101.386-85.334,101.386-182.495C428.356,77.155,351.202,0,256,0z M256,231.921c-32.897,0-59.564-26.668-59.564-59.564s26.668-59.564,59.564-59.564c32.896,0,59.564,26.668,59.564,59.564S288.896,231.921,256,231.921z"
                    className={cn(
                      project.pinColor === "orange"
                        ? "fill-orange-500"
                        : "fill-blue-500",
                    )}
                  />
                </svg>
              </div>
            ))}

            {/* Project cards - positioned relative to globe */}
            {projects.map((project) => {
              // Calculate card position offset from pin
              const cardOffsetX = project.id === "lilycove" ? -280 : 50
              const cardOffsetY = project.id === "lilycove" ? -120 : project.id === "maple-leaf" ? -180 : -80
              
              // Apply drag offset if exists
              const dragOffset = cardPositions?.[project.id] || { x: 0, y: 0 }
              
              return (
                <div
                  key={`card-${project.id}`}
                  className={cn(
                    "absolute z-30",
                    draggingCard === project.id ? "cursor-grabbing" : "cursor-grab"
                  )}
                  style={{
                    top: project.pinPosition.top,
                    left: project.pinPosition.left,
                    transform: `translate(${cardOffsetX + dragOffset.x}px, ${cardOffsetY + dragOffset.y}px)`,
                  }}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onMouseDown={(e) => handleMouseDown(e, project.id)}
                >
                  <div
                    className={cn(
                      "w-64 sm:w-72 lg:w-80 backdrop-blur-md rounded-xl transition-all duration-300",
                      "bg-slate-900/75 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
                      project.pinColor === "orange"
                        ? "border border-orange-500/30"
                        : "border border-blue-500/30",
                    )}
                  >
                    {/* Title */}
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3">
                      <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                        {project.name}
                      </h3>
                    </div>

                    {/* Content always visible */}
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                      <p className="text-xs sm:text-sm lg:text-base text-gray-200 leading-relaxed">{project.description}</p>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-amber-400 text-xs sm:text-sm lg:text-base font-medium hover:text-amber-300 transition-colors"
                        >
                          {project.linkText}
                          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                        </a>
                      )}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {project.tech.map((tech, index) => (
                          <span
                            key={tech}
                            className="text-xs sm:text-sm lg:text-base text-gray-300"
                          >
                            {tech}
                            {index < project.tech.length - 1 && <span className="text-gray-500 mx-1">·</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
