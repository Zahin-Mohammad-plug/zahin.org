"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ExternalLink, Star, ChevronLeft, ChevronRight } from "lucide-react"
import SparkleOverlay from "@/components/sparkle-overlay"
import TiledBackground from "@/components/tiled-background"
import { TRANSITION_CONSTANTS } from "@/constants/transitions"

interface ProjectsPageProps {
  isActive: boolean
  isTransitioning: boolean
  transitionDirection?: "in" | "out"
  gridDensity?: 1 | 2 | 4 | 8
  transitionGridDensity?: 1 | 2 | 4 | 8
  transitionProgress?: number
  parallaxMultiplier?: number
  parallaxOffset?: { x: number; y: number }
  isSkipTransition?: boolean
  contentTransform?: { scale: number; x: number; y: number }
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
  pinColor: "orange" | "blue" | "green" | "purple" | "red"
  starred?: boolean
}

// Color mapping helpers
const PIN_COLORS: Record<Project["pinColor"], { fill: string; border: string; cta: string; ctaHover: string; dot: string }> = {
  orange: { fill: "fill-orange-500", border: "border-orange-500/30", cta: "text-orange-400", ctaHover: "hover:text-orange-300", dot: "bg-orange-400" },
  blue:   { fill: "fill-blue-500",   border: "border-blue-500/30",   cta: "text-blue-400",   ctaHover: "hover:text-blue-300",   dot: "bg-blue-400" },
  green:  { fill: "fill-emerald-500",border: "border-emerald-500/30",cta: "text-emerald-400",ctaHover: "hover:text-emerald-300",dot: "bg-emerald-400" },
  purple: { fill: "fill-violet-500", border: "border-violet-500/30", cta: "text-violet-400", ctaHover: "hover:text-violet-300", dot: "bg-violet-400" },
  red:    { fill: "fill-rose-500",   border: "border-rose-500/30",   cta: "text-rose-400",   ctaHover: "hover:text-rose-300",   dot: "bg-rose-400" },
}

const projects: Project[] = [
  {
    id: "lilycove",
    name: "LilyCove",
    description: "Production-scale Pokémon TCG marketplace aggregating 2.3M+ active listings across 20,000+ cards from eBay, Shopify, and TCGPlayer. Built a continuous scraping pipeline (~40K listings/day) with resilient rate-limited fetchers and crash-safe state persistence. Search in <100ms with dynamic pricing from historical sales data.",
    link: "https://beta.lilycove.io",
    linkText: "Visit beta",
    tech: ["React", "Python", "PostgreSQL", "Redis"],
    pinPosition: { top: "55%", left: "42%" },
    cardPosition: { top: "18%", left: "2%" },
    pinColor: "orange",
    starred: true,
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
    pinColor: "green",
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
  {
    id: "sharpstream",
    name: "SharpStream",
    description:
      "A native macOS application for viewing RTSP streams with smart frame selection, OCR text recognition, and VLC-style playback controls.",
    link: "https://github.com/Zahin-Mohammad-plug/macOS-rtsp-ocr-viewer",
    linkText: "View on GitHub",
    tech: ["Swift", "Ruby"],
    pinPosition: { top: "48%", left: "28%" },
    cardPosition: { top: "28%", left: "2%" },
    pinColor: "purple",
  },
  {
    id: "download-router",
    name: "Download Router",
    description:
      "A Chrome extension that auto-routes downloads by domain, filenames and/or file types. With companion app for OS-level file operations. Supports macOS and Windows download selection.",
    link: "https://github.com/Zahin-Mohammad-plug/Download-Router-Chrome-extension",
    linkText: "View on GitHub",
    tech: ["JavaScript", "CSS", "Electron"],
    pinPosition: { top: "35%", left: "45%" },
    cardPosition: { top: "0%", left: "2%" },
    pinColor: "red",
  },
]

export default function ProjectsPage({
  isActive,
  isTransitioning,
  transitionDirection,
  gridDensity = 4,
  transitionGridDensity,
  transitionProgress = 0,
  parallaxMultiplier = 2.0,
  parallaxOffset = { x: 0, y: 0 },
  isSkipTransition = false,
  contentTransform = { scale: 1, x: 0, y: 0 },
}: ProjectsPageProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [pinsVisible, setPinsVisible] = useState<Record<string, boolean>>({})
  const globeContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  
  // Mobile carousel state
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  
  // Drag state for each card (desktop only)
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }> | null>(null)
  const [draggingCard, setDraggingCard] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    // Check if mobile/compact
    const checkMobile = () => {
      setIsMobile(window.innerWidth < TRANSITION_CONSTANTS.MOBILE_BREAKPOINT)
      setIsCompact(window.innerWidth < TRANSITION_CONSTANTS.TABLET_BREAKPOINT) // carousel mode for < 1024px
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

  // Touch handlers for mobile drag - simplified without body scroll locking
  const handleTouchStart = (e: React.TouchEvent, projectId: string) => {
    // Check if touch started on a link - allow link clicks
    const target = e.target as HTMLElement
    if (target.closest('a')) {
      return // Allow link to work normally
    }

    if (e.touches.length === 1) {
      e.stopPropagation()
      setDraggingCard(projectId)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingCard || !dragStart || e.touches.length !== 1) return
    
    // Only prevent default if we've actually moved (started dragging)
    const deltaX = Math.abs(e.touches[0].clientX - dragStart.x)
    const deltaY = Math.abs(e.touches[0].clientY - dragStart.y)
    
    if (deltaX > 5 || deltaY > 5) {
      // User is dragging, prevent default to stop scroll
      e.preventDefault()
      e.stopPropagation()

      const moveDeltaX = e.touches[0].clientX - dragStart.x
      const moveDeltaY = e.touches[0].clientY - dragStart.y

      setCardPositions(prev => ({
        ...prev,
        [draggingCard]: {
          x: (prev?.[draggingCard]?.x || 0) + moveDeltaX,
          y: (prev?.[draggingCard]?.y || 0) + moveDeltaY,
        }
      }))

      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (draggingCard) {
      e.preventDefault()
      e.stopPropagation()
    }
    setDraggingCard(null)
    setDragStart(null)
  }

  // Mobile carousel: scroll to a specific project card
  const scrollToCard = useCallback((index: number) => {
    const carousel = carouselRef.current
    if (!carousel) return
    const card = carousel.children[index] as HTMLElement
    if (!card) return
    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    setActiveCardIndex(index)
  }, [])

  // Mobile carousel: track which card is in view on scroll
  const handleCarouselScroll = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const scrollLeft = carousel.scrollLeft
    const cardWidth = carousel.children[0]?.clientWidth || 1
    const gap = 16 // gap-4 = 1rem = 16px
    const index = Math.round(scrollLeft / (cardWidth + gap))
    setActiveCardIndex(Math.min(index, projects.length - 1))
  }, [])

  // Mobile: handle pin tap to scroll carousel
  const handlePinTap = useCallback((projectId: string) => {
    const index = projects.findIndex(p => p.id === projectId)
    if (index !== -1) {
      scrollToCard(index)
      setHoveredProject(projectId)
    }
  }, [scrollToCard])

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
            gridDensity={gridDensity}
            transitionToDensity={transitionGridDensity}
            transitionProgress={transitionProgress}
            isSkipTransition={isSkipTransition}
            parallaxOffset={parallaxOffset}
            parallaxSpeed={parallaxMultiplier}
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
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: draggingCard ? "none" : "auto" }}
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
            "absolute left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bottom-0",
            sceneReady && "animate-zoom-in-space"
          )}
          style={{ 
            marginBottom: isCompact ? "-12%" : "-8%",
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
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="absolute z-20 cursor-pointer transition-all duration-200 hover:scale-110"
                data-interactive="true"
                style={{ 
                  top: project.pinPosition.top, 
                  left: project.pinPosition.left,
                  transform: "translate(-50%, -100%)",
                  touchAction: "manipulation",
                  pointerEvents: "auto",
                }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onTouchStart={(e) => {
                  if (isCompact) {
                    e.preventDefault()
                    e.stopPropagation()
                    handlePinTap(project.id)
                  } else {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => {
                  if (isCompact) handlePinTap(project.id)
                }}
              >
                <svg
                  width={isCompact ? "24" : "32"}
                  height={isCompact ? "24" : "32"}
                  viewBox="0 0 512 512"
                  className={cn(
                    "transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                    pinsVisible[project.id] ? "opacity-100 scale-100" : "opacity-0 scale-50",
                    pinsVisible[project.id] && "animate-pulse-glow-enhanced",
                    (hoveredProject === project.id || (isCompact && activeCardIndex === index)) && "drop-shadow-[0_0_16px_currentColor] scale-125",
                  )}
                  style={{
                    willChange: "transform, opacity",
                  }}
                >
                  <path
                    d="M256,0C160.798,0,83.644,77.155,83.644,172.356c0,97.162,48.158,117.862,101.386,182.495C248.696,432.161,256,512,256,512s7.304-79.839,70.97-157.148c53.228-64.634,101.386-85.334,101.386-182.495C428.356,77.155,351.202,0,256,0z M256,231.921c-32.897,0-59.564-26.668-59.564-59.564s26.668-59.564,59.564-59.564c32.896,0,59.564,26.668,59.564,59.564S288.896,231.921,256,231.921z"
                    className={PIN_COLORS[project.pinColor].fill}
                  />
                </svg>
              </div>
            ))}

            {/* Desktop (>=1024px): Project cards positioned in two columns beside globe */}
            {!isCompact && projects.map((project, index) => {
              // Spread cards into left column (even index) and right column (odd index)
              // This prevents overlap by stacking vertically in two sides
              const isLeft = index % 2 === 0
              const verticalIndex = Math.floor(index / 2)
              const cardOffsetX = isLeft ? -320 : 80
              const cardOffsetY = -240 + verticalIndex * 280
              
              // Apply drag offset if exists
              const dragOffset = cardPositions?.[project.id] || { x: 0, y: 0 }
              
              return (
                <div
                  key={`card-${project.id}`}
                  className={cn(
                    "absolute z-30",
                    draggingCard === project.id ? "cursor-grabbing" : "cursor-grab"
                  )}
                  data-interactive="true"
                  data-dragging={draggingCard === project.id ? "true" : "false"}
                  style={{
                    top: isLeft ? "5%" : "3%",
                    left: isLeft ? "10%" : "62%",
                    transform: `translate(${dragOffset.x}px, ${verticalIndex * 280 + dragOffset.y}px)`,
                    touchAction: draggingCard === project.id ? "none" : "manipulation",
                    maxWidth: "calc(100vw - 2rem)",
                    pointerEvents: "auto",
                  }}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onMouseDown={(e) => {
                    // Don't start drag if clicking on a link
                    if ((e.target as HTMLElement).closest('a')) {
                      return
                    }
                    handleMouseDown(e, project.id)
                  }}
                  onTouchStart={(e) => handleTouchStart(e, project.id)}
                  onTouchEnd={handleTouchEnd}
                >
                  <ProjectCard project={project} hoveredProject={hoveredProject} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Compact (<1024px): Horizontal scroll carousel above globe */}
        {isCompact && (
          <div 
            className={cn(
              "absolute left-0 right-0 z-30 flex flex-col justify-center transition-all duration-700",
              sceneReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{ 
              top: isMobile ? "4.5rem" : "5rem",
              bottom: isMobile ? "30%" : "28%",
            }}
          >
            {/* Carousel with arrows */}
            <div className="relative w-full flex-1 flex items-center min-h-0">
              {/* Left arrow */}
              <button
                className={cn(
                  "absolute left-1 z-40 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-200",
                  activeCardIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-60 hover:opacity-100",
                )}
                onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
                aria-label="Previous project"
              >
                <ChevronLeft className="w-4 h-4 text-white/80" />
              </button>

              {/* Scrollable card strip */}
              <div
                ref={carouselRef}
                className={cn(
                  "flex gap-4 overflow-x-auto snap-x snap-mandatory py-1 scrollbar-hide w-full items-start",
                  isMobile ? "px-8" : "pl-40 pr-8",
                )}
                style={{ 
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                onScroll={handleCarouselScroll}
              >
                {projects.map((project) => (
                  <div
                    key={`mobile-card-${project.id}`}
                    className={cn(
                      "snap-center shrink-0",
                      isMobile ? "w-[80vw] max-w-[300px]" : "w-[60vw] max-w-[400px]",
                    )}
                  >
                    <ProjectCard project={project} hoveredProject={hoveredProject} compact={isMobile} />
                  </div>
                ))}
              </div>

              {/* Right arrow */}
              <button
                className={cn(
                  "absolute right-1 z-40 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-200",
                  activeCardIndex === projects.length - 1 ? "opacity-0 pointer-events-none" : "opacity-60 hover:opacity-100",
                )}
                onClick={() => scrollToCard(Math.min(projects.length - 1, activeCardIndex + 1))}
                aria-label="Next project"
              >
                <ChevronRight className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Scroll indicator dots */}
            <div className="flex justify-center gap-2 mt-2">
              {projects.map((project, index) => (
                <button
                  key={`dot-${project.id}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    activeCardIndex === index
                      ? cn("w-6", PIN_COLORS[project.pinColor].dot)
                      : "w-2 bg-white/30",
                  )}
                  onClick={() => scrollToCard(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Shared project card component for desktop and mobile */
function ProjectCard({ project, hoveredProject, compact = false }: { project: Project; hoveredProject: string | null; compact?: boolean }) {
  const colors = PIN_COLORS[project.pinColor]
  return (
    <div
      className={cn(
        compact ? "w-full" : "w-64 sm:w-72 lg:w-80",
        "backdrop-blur-md rounded-xl transition-all duration-300",
        "bg-slate-900/75 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "border",
        colors.border,
      )}
    >
      {/* Title */}
      <div className={cn("px-3 sm:px-4", compact ? "py-2" : "py-2.5 sm:py-3")}>
        <h3 className={cn(
          "font-serif font-bold text-white leading-tight flex items-center gap-2",
          compact ? "text-base" : "text-lg sm:text-xl lg:text-2xl",
        )}>
          {project.name}
          {project.starred && (
            <Star className={cn(
              "fill-amber-400 text-amber-400",
              compact ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5",
            )} />
          )}
        </h3>
      </div>

      {/* Content */}
      <div className={cn("px-3 sm:px-4 space-y-2", compact ? "pb-2.5" : "pb-3 sm:pb-4")}>
        <p className={cn(
          "text-gray-200 leading-relaxed break-words",
          compact ? "text-xs" : "text-xs sm:text-sm lg:text-base",
        )}>
          {project.description}
        </p>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 font-medium transition-colors",
              colors.cta, colors.ctaHover,
              compact ? "text-xs" : "text-xs sm:text-sm lg:text-base",
            )}
            onClick={(e) => {
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
          >
            {project.linkText}
            <ExternalLink className={cn(compact ? "w-3 h-3" : "w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4")} />
          </a>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {project.tech.map((tech, index) => (
            <span
              key={tech}
              className={cn(
                "text-gray-300",
                compact ? "text-[11px]" : "text-xs sm:text-sm lg:text-base",
              )}
            >
              {tech}
              {index < project.tech.length - 1 && <span className="text-gray-500 mx-1">·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
