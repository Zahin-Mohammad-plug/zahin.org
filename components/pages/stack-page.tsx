"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import SparkleOverlay from "@/components/sparkle-overlay"
import TiledBackground from "@/components/tiled-background"
import { TRANSITION_CONSTANTS } from "@/constants/transitions"

interface StackPageProps {
  isActive: boolean
  isTransitioning: boolean
  transitionDirection?: "in" | "out"
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

export default function StackPage({ isActive, isTransitioning, transitionDirection }: StackPageProps) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null)
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

  useEffect(() => {
    setMounted(true)
    // Check mobile status on mount
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768)
      // Calculate responsive radii after mount
      const vw = Math.min(window.innerWidth, 1200)
      setRadii({
        inner: (95 * vw) / 1200,
        middle: (175 * vw) / 1200,
        outer: (270 * vw) / 1200,
      })
    }
  }, [])

  // Track window width changes for mobile detection
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

  // Mouse/touch drag handlers for panning
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX - panOffset.x, y: clientY - panOffset.y })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    setPanOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setPinchStartDistance(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging when zoomed in or on mobile
    if (zoom > 1 || isMobile) {
      handleDragStart(e.clientX, e.clientY)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null)
  const [pinchStartZoom, setPinchStartZoom] = useState(1)

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
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
  }

  const handleTouchMove = (e: React.TouchEvent) => {
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
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging || pinchStartDistance !== null) {
      e.preventDefault()
      e.stopPropagation()
    }
    handleDragEnd()
  }

  // Zone-based orbit detection accounting for zoom and pan
  const handleOrbitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!orbitsRef.current) return

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
    if (!isActive || isTransitioning || !mounted) return

    const interval = setInterval(() => {
      setRotations((prev) => ({
        inner: prev.inner + 0.25,
        middle: prev.middle - 0.18,
        outer: prev.outer + 0.12,
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [isActive, isTransitioning, mounted])


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
          onMouseEnter={() => setHoveredTech(tech.name)}
          onMouseLeave={() => setHoveredTech(null)}
        >
          {/* Subtle trail effect */}
          {hoveredTech === tech.name && (
            <div
              className="absolute -z-10 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full animate-orbit-trail"
              style={{
                background: `radial-gradient(circle, ${orbitKey === "inner" ? "rgba(168, 85, 247, 0.15)" : orbitKey === "middle" ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)"}, transparent)`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
          <div
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
              tech.hasDarkIcon ? "bg-white/90 p-1.5" : "bg-transparent",
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
        <div className="absolute inset-[-60px]">
          <TiledBackground
            sceneReady={sceneReady}
            sizeMultiplier={1.0}
            extraSize={200}
            tileOffset={-640}
            extraTiles={4}
            handleResize={true}
            className="absolute inset-0"
            parallaxSpeed={TRANSITION_CONSTANTS.PARALLAX_BACKGROUND_OFFSET}
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative">
              <div className="w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse-glow-enhanced" 
                style={{
                  animation: "pulse-glow-enhanced 4s ease-in-out infinite",
                  willChange: "transform, filter",
                }}
              />
              <div className="absolute inset-[-6px] rounded-full bg-purple-400/20 blur-lg animate-pulse" 
                style={{
                  animation: "pulse 3s ease-in-out infinite",
                }}
              />
              <div
                className="absolute inset-[-12px] rounded-full bg-pink-400/15 blur-xl animate-pulse"
                style={{ 
                  animationDelay: "0.5s",
                  animation: "pulse 3.5s ease-in-out infinite",
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
