"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import SparkleOverlay from "@/components/sparkle-overlay"
import TiledBackground from "@/components/tiled-background"
import { TRANSITION_CONSTANTS } from "@/constants/transitions"

interface StackPageProps {
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


interface TechItem {
  name: string
  icon: string
  hasDarkIcon?: boolean // Icons that need a light background
}

const techStack = {
  inner: [
    { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
    {
      name: "JavaScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-plain.svg",
    },
    {
      name: "TypeScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
    },
    { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
    { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
  ],
  middle: [
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
    {
      name: "Next.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
      hasDarkIcon: true,
    },
    {
      name: "Three.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg",
      hasDarkIcon: true,
    },
    { name: "FastAPI", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg" },
    {
      name: "Flask",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg",
      hasDarkIcon: true,
    },
    {
      name: "Express",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
      hasDarkIcon: true,
    },
    { name: "PyTorch", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg" },
  ],
  outer: [
    { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
    {
      name: "PostgreSQL",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    },
    { name: "Redis", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg" },
    { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
    { name: "Nginx", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg" },
    {
      name: "Linux",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg",
      hasDarkIcon: true,
    },
  ],
}

const orbitLabels = {
  inner: "Languages",
  middle: "Frameworks",
  outer: "Tools",
}

export default function StackPage({
  isActive,
  isTransitioning,
  transitionDirection,
  gridDensity = 8,
  transitionGridDensity,
  transitionProgress = 0,
  parallaxMultiplier = 2.0,
  parallaxOffset = { x: 0, y: 0 },
  isSkipTransition = false,
  contentTransform = { scale: 1, x: 0, y: 0 },
}: StackPageProps) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null)
  const [hoveredCore, setHoveredCore] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isOverOrbitArea, setIsOverOrbitArea] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [radii, setRadii] = useState({ inner: 95, middle: 175, outer: 270 })
  const containerRef = useRef<HTMLDivElement>(null)
  const orbitsRef = useRef<HTMLDivElement>(null)

  // Function to update radii based on actual container size
  const updateRadii = useCallback(() => {
    if (!orbitsRef.current || typeof window === "undefined") return
    
    const width = window.innerWidth
    setIsMobile(width < 768)
    
    // Use actual rendered container size for precise calculations
    const rect = orbitsRef.current.getBoundingClientRect()
    const containerSize = rect.width || Math.min(width * 0.9, 800)
    
    // Orbit rings are 30%, 55%, 85% of container, so radii are half of those percentages
    // Inner: 30% / 2 = 15% of container, Middle: 55% / 2 = 27.5%, Outer: 85% / 2 = 42.5%
    setRadii({
      inner: containerSize * 0.15,
      middle: containerSize * 0.275,
      outer: containerSize * 0.425,
    })
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update radii when scene is ready and container is available
  useEffect(() => {
    if (sceneReady && orbitsRef.current && isActive) {
      // Small delay to ensure container is fully rendered
      const timer = setTimeout(() => {
        updateRadii()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [sceneReady, isActive, updateRadii])

  // Track window width changes for mobile detection and update radii
  useEffect(() => {
    if (typeof window === "undefined") return

    let resizeTimer: NodeJS.Timeout | null = null
    
    const handleResize = () => {
      // Debounce resize to avoid excessive recalculations
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        updateRadii()
      }, 100)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [updateRadii])

  useEffect(() => {
    // Only set scene ready when page is active and not transitioning
    if (isActive && !isTransitioning) {
      const revealTimer = setTimeout(() => setSceneReady(true), TRANSITION_CONSTANTS.SCENE_REVEAL_DELAY)
      return () => clearTimeout(revealTimer)
    }
    // Reset scene ready when page becomes inactive
    setSceneReady(false)
  }, [isActive, isTransitioning])

  // Entrance animation state
  const [entranceScale, setEntranceScale] = useState(0)
  
  useEffect(() => {
    if (sceneReady && isActive && !isTransitioning) {
      // Animate orbits expanding from center
      const startTime = Date.now()
      const duration = 800
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setEntranceScale(eased)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    } else {
      setEntranceScale(0)
    }
  }, [sceneReady, isActive, isTransitioning])

  // Wheel zoom handler - only zoom when over orbit area
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleWheel = (e: WheelEvent) => {
      // Only zoom if hovering over orbit area or tech icons
      if (isOverOrbitArea || hoveredTech) {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY * -0.001
        setZoom((prev) => Math.max(0.5, Math.min(2.5, prev + delta)))
      }
    }

    const container = containerRef.current
    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [isActive, isOverOrbitArea, hoveredTech])

  // Mouse/touch drag handlers for panning - memoized to prevent unnecessary re-renders
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX - panOffset.x, y: clientY - panOffset.y })
  }, [panOffset])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return
    setPanOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setPinchStartDistance(null)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow dragging when zoomed in or on mobile
    if (zoom > 1 || isMobile) {
      handleDragStart(e.clientX, e.clientY)
    }
  }, [zoom, isMobile, handleDragStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }, [handleDragMove])

  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null)
  const [pinchStartZoom, setPinchStartZoom] = useState(1)

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault()
      e.stopPropagation()
      const distance = getDistance(e.touches[0], e.touches[1])
      setPinchStartDistance(distance)
      setPinchStartZoom(zoom)
      setIsDragging(false)
    } else if (e.touches.length === 1) {
      // Single touch drag
      e.preventDefault()
      e.stopPropagation()
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
    }
  }, [zoom, handleDragStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance !== null) {
      // Pinch zoom
      e.preventDefault()
      e.stopPropagation()
      const distance = getDistance(e.touches[0], e.touches[1])
      const scale = distance / pinchStartDistance
      const newZoom = Math.max(0.5, Math.min(2.5, pinchStartZoom * scale))
      setZoom(newZoom)
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch drag
      e.preventDefault()
      e.stopPropagation()
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 1) {
      // Prevent page scroll when interacting with stack
      e.preventDefault()
      e.stopPropagation()
    }
  }, [pinchStartDistance, pinchStartZoom, isDragging, handleDragMove])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isDragging || pinchStartDistance !== null) {
      e.preventDefault()
      e.stopPropagation()
    }
    handleDragEnd()
  }, [isDragging, pinchStartDistance, handleDragEnd])

  // Helper function to get orbit key for a tech name
  const getOrbitForTech = (techName: string): string | null => {
    if (techStack.inner.some(tech => tech.name === techName)) return "inner"
    if (techStack.middle.some(tech => tech.name === techName)) return "middle"
    if (techStack.outer.some(tech => tech.name === techName)) return "outer"
    return null
  }

  // Zone-based orbit detection accounting for zoom and pan
  const handleOrbitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!orbitsRef.current) return

    // If a tech item is hovered, use its orbit instead of distance-based calculation
    if (hoveredTech) {
      const orbit = getOrbitForTech(hoveredTech)
      if (orbit) {
        setHoveredOrbit(orbit)
        return
      }
    }

    const rect = orbitsRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX
    const mouseY = e.clientY

    // Calculate distance from center
    const dx = mouseX - centerX
    const dy = mouseY - centerY
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)
    
    // Account for zoom when calculating normalized distance
    // The rendered size is affected by zoom, so we need to adjust
    const baseRadius = rect.width / 2
    const normalizedDistance = distanceFromCenter / (baseRadius * zoom)

    // Define orbit zones based on normalized distance
    // Inner: 0-0.15, Middle: 0.15-0.35, Outer: 0.35-0.50
    if (normalizedDistance < 0.15) {
      setHoveredOrbit("inner")
    } else if (normalizedDistance < 0.35) {
      setHoveredOrbit("middle")
    } else if (normalizedDistance < 0.50) {
      setHoveredOrbit("outer")
    } else {
      setHoveredOrbit(null)
    }
  }

  const [rotations, setRotations] = useState({ inner: 0, middle: 0, outer: 0 })

  useEffect(() => {
    // Only run animations when page is active, not transitioning, and mounted (client-side)
    // Pause when core is hovered
    if (!isActive || isTransitioning || !mounted || hoveredCore) return

    const interval = setInterval(() => {
      setRotations((prev) => ({
        inner: prev.inner + 0.25,
        middle: prev.middle - 0.18,
        outer: prev.outer + 0.12,
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [isActive, isTransitioning, mounted, hoveredCore])


  const renderOrbitItems = (items: TechItem[], radius: number, rotation: number, orbitKey: string) => {
    // Don't render during SSR - only render after mount to prevent hydration mismatch
    if (!mounted) return null

    return items.map((tech, index) => {
      const angle = (index / items.length) * 360 + rotation
      const radian = (angle * Math.PI) / 180
      const x = Math.cos(radian) * radius
      const y = Math.sin(radian) * radius

      const isOrbitHovered = hoveredOrbit === orbitKey

      return (
        <div
          key={tech.name}
          className="absolute transition-transform duration-100 pointer-events-auto"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: "translate(-50%, -50%)",
            zIndex: hoveredTech === tech.name ? 60 : 50,
          }}
          onMouseEnter={() => {
            setHoveredTech(tech.name)
            setHoveredOrbit(orbitKey)
          }}
          onMouseLeave={() => {
            setHoveredTech(null)
            // Don't clear orbit here - let handleOrbitMouseMove update it based on mouse position
          }}
        >
          {/* Subtle trail effect */}
          {hoveredTech === tech.name && (
            <div
              className="absolute -z-10 w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full animate-orbit-trail"
              style={{
                background: `radial-gradient(circle, ${orbitKey === "inner" ? "rgba(168, 85, 247, 0.15)" : orbitKey === "middle" ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)"}, transparent)`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
          <div
            className={cn(
              "w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
              tech.hasDarkIcon ? "bg-white/90 p-1 sm:p-1.5" : "bg-transparent",
              hoveredTech === tech.name && "scale-150",
            )}
            style={{
              willChange: "transform",
            }}
          >
            <img
              src={tech.icon || "/placeholder.svg"}
              alt={tech.name}
              className="w-full h-full drop-shadow-md"
              crossOrigin="anonymous"
            />
          </div>
          {/* Tooltip on hover */}
          <div
            className={cn(
              "absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800/95 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-200 shadow-lg border border-slate-600/50 z-50",
              hoveredTech === tech.name ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
            )}
          >
            {tech.name}
          </div>
        </div>
      )
    })
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out overflow-hidden",
        isActive
          ? "opacity-100 translate-y-0 z-10"
          : transitionDirection === "out"
            ? "opacity-0 scale-150 pointer-events-none z-0"
            : "opacity-0 translate-y-[20%] pointer-events-none z-0",
        isDragging ? "cursor-grabbing" : zoom > 1 || isMobile ? "cursor-grab" : "",
      )}
      style={{
        // Smooth fade in during cinematic transition from about page
        transition: isTransitioning && transitionDirection === "in" 
          ? "opacity 1.5s ease-out 0.7s, transform 1.5s ease-out 0.7s"
          : undefined,
        touchAction: "none", // Allow pinch zoom and pan
      }}
      data-interactive="true"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background without parallax */}
      <div className={cn(
        "absolute inset-0 overflow-hidden transition-opacity duration-300",
        isActive && !isTransitioning ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute inset-0 bg-black" />
        {/* Increased buffer on mobile to ensure full coverage */}
        <div className={cn(
          "absolute",
          isMobile ? "inset-[-100px]" : "inset-[-60px]"
        )}>
          <TiledBackground
            sceneReady={sceneReady}
            sizeMultiplier={1.0}
            extraSize={isMobile ? 300 : 200}
            tileOffset={-640}
            extraTiles={isMobile ? 6 : 4}
            handleResize={true}
            className="absolute inset-0 w-full h-full"
            gridDensity={gridDensity}
            transitionToDensity={transitionGridDensity}
            transitionProgress={transitionProgress}
            isSkipTransition={isSkipTransition}
            parallaxOffset={parallaxOffset}
            parallaxSpeed={parallaxMultiplier}
          />
        </div>
        <div className="absolute inset-0 bg-black/70" />
        <SparkleOverlay count={55} />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <div
          ref={orbitsRef}
          className="relative transition-transform duration-200 ease-out pointer-events-auto"
          data-interactive="true"
          style={{
            width: "min(90vw, 800px)",
            height: "min(90vw, 800px)",
            transform: `scale(${zoom * entranceScale}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            opacity: entranceScale,
            willChange: "transform, opacity",
            touchAction: "none",
          }}
          onMouseMove={handleOrbitMouseMove}
          onMouseEnter={() => setIsOverOrbitArea(true)}
          onMouseLeave={() => {
            setHoveredOrbit(null)
            setIsOverOrbitArea(false)
          }}
        >
          {/* Inner orbit - Languages */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border transition-all duration-300 pointer-events-none",
              hoveredOrbit === "inner" ? "border-purple-400 border-2" : "border-purple-500/30",
            )}
          >
            <span
              className={cn(
                "absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium transition-all duration-300",
                hoveredOrbit === "inner" ? "text-purple-300 opacity-100" : "text-purple-500/50 opacity-50",
              )}
            >
              {orbitLabels.inner}
            </span>
          </div>

          {/* Middle orbit - Frameworks */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full border transition-all duration-300 pointer-events-none",
              hoveredOrbit === "middle" ? "border-blue-400 border-2" : "border-blue-500/30",
            )}
          >
            <span
              className={cn(
                "absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium transition-all duration-300",
                hoveredOrbit === "middle" ? "text-blue-300 opacity-100" : "text-blue-500/50 opacity-50",
              )}
            >
              {orbitLabels.middle}
            </span>
          </div>

          {/* Outer orbit - Tools */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full border transition-all duration-300 pointer-events-none",
              hoveredOrbit === "outer" ? "border-emerald-400 border-2" : "border-emerald-500/30",
            )}
          >
            <span
              className={cn(
                "absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium transition-all duration-300",
                hoveredOrbit === "outer" ? "text-emerald-300 opacity-100" : "text-emerald-500/50 opacity-50",
              )}
            >
              {orbitLabels.outer}
            </span>
          </div>

          {/* Central glowing orb */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto cursor-pointer"
            onMouseEnter={() => setHoveredCore(true)}
            onMouseLeave={() => setHoveredCore(false)}
          >
            <div className="relative">
              <div className={cn(
                "rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse-glow-enhanced transition-transform duration-200 hover:scale-110",
                "w-10 h-10 sm:w-12 sm:h-12 md:w-18 md:h-18 lg:w-20 lg:h-20"
              )} 
                style={{
                  animation: hoveredCore ? "none" : "pulse-glow-enhanced 4s ease-in-out infinite",
                  willChange: "transform, filter",
                }}
              />
              <div className="absolute inset-[-6px] rounded-full bg-purple-400/20 blur-lg animate-pulse transition-opacity duration-200" 
                style={{
                  animation: hoveredCore ? "none" : "pulse 3s ease-in-out infinite",
                  opacity: hoveredCore ? 0.5 : 1,
                }}
              />
              <div
                className="absolute inset-[-12px] rounded-full bg-pink-400/15 blur-xl animate-pulse transition-opacity duration-200"
                style={{ 
                  animationDelay: "0.5s",
                  animation: hoveredCore ? "none" : "pulse 3.5s ease-in-out infinite",
                  opacity: hoveredCore ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          {renderOrbitItems(techStack.inner, radii.inner, rotations.inner, "inner")}
          {renderOrbitItems(techStack.middle, radii.middle, rotations.middle, "middle")}
          {renderOrbitItems(techStack.outer, radii.outer, rotations.outer, "outer")}
        </div>
      </div>

      {/* Zoom indicator for mobile/desktop */}
      {(zoom !== 1 || (isMobile && mounted)) && (
        <div className="absolute bottom-4 right-4 z-50 px-3 py-2 bg-slate-800/90 border border-slate-600/50 rounded-lg text-white text-xs backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
            {isMobile && <span className="text-slate-400">• Pinch or drag to explore</span>}
          </div>
        </div>
      )}
    </div>
  )
}
