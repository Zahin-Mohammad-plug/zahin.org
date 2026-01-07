"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import SparkleOverlay from "@/components/sparkle-overlay"

interface StackPageProps {
  isActive: boolean
  isTransitioning: boolean
  transitionDirection?: "in" | "out"
}

// Component for tiled background with random flips
const TiledBackground: React.FC<{ sceneReady: boolean }> = ({ sceneReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !imgLoaded || !sceneReady || !dimensions.width) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to viewport with extra space for parallax
    const width = dimensions.width + 200
    const height = dimensions.height + 200
    canvas.width = width
    canvas.height = height

    // Load and draw the background image
    const img = new window.Image()
    img.src = "/images/projectspagebackground.png"

    img.onload = () => {
      const tileSize = 320
      const cols = Math.ceil(width / tileSize) + 4
      const rows = Math.ceil(height / tileSize) + 4

      // Seed for consistent random flips during the session
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * tileSize - tileSize * 2
          const y = row * tileSize - tileSize * 2

          // Simple hash for consistent randomness per position
          const seed = col + row * 1000
          const shouldFlipX = (seed * 73 + 1) % 2 === 0
          const shouldFlipY = (seed * 97 + 1) % 2 === 0

          ctx.save()
          ctx.translate(x + tileSize / 2, y + tileSize / 2)

          if (shouldFlipX) ctx.scale(-1, 1)
          if (shouldFlipY) ctx.scale(1, -1)

          ctx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
          ctx.restore()
        }
      }
    }
  }, [imgLoaded, sceneReady, dimensions])

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setImgLoaded(true)
    img.src = "/images/projectspagebackground.png"
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 transition-all duration-1000", sceneReady ? "opacity-100" : "opacity-0")}
    />
  )
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
  const containerRef = useRef<HTMLDivElement>(null)
  const orbitsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isActive && !isTransitioning) {
      const revealTimer = setTimeout(() => setSceneReady(true), 180)
      return () => clearTimeout(revealTimer)
    }
    setSceneReady(false)
  }, [isActive, isTransitioning])

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
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging when zoomed in or on mobile
    if (zoom > 1 || window.innerWidth < 768) {
      handleDragStart(e.clientX, e.clientY)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
    }
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
    if (!isActive) return

    const interval = setInterval(() => {
      setRotations((prev) => ({
        inner: prev.inner + 0.25,
        middle: prev.middle - 0.18,
        outer: prev.outer + 0.12,
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [isActive])

  const getRadius = (base: number) => {
    if (!mounted || typeof window === "undefined") return base
    const vw = Math.min(window.innerWidth, 1200)
    return (base * vw) / 1200
  }

  const renderOrbitItems = (items: TechItem[], radius: number, rotation: number, orbitKey: string) => {
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
          <div
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
              tech.hasDarkIcon ? "bg-white/90 p-1.5" : "bg-transparent",
              hoveredTech === tech.name && "scale-150",
            )}
          >
            <img
              src={tech.icon || "/placeholder.svg"}
              alt={tech.name}
              className="w-full h-full drop-shadow-lg"
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
        isActive && !isTransitioning
          ? "opacity-100 scale-100 z-10"
          : transitionDirection === "out"
            ? "opacity-0 scale-150 pointer-events-none z-0"
            : "opacity-0 scale-50 pointer-events-none z-0",
        isDragging ? "cursor-grabbing" : zoom > 1 || window.innerWidth < 768 ? "cursor-grab" : "",
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Background without parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-[-60px]">
          <TiledBackground sceneReady={sceneReady} />
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <SparkleOverlay count={55} />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <div
          ref={orbitsRef}
          className="relative transition-transform duration-200 ease-out pointer-events-auto"
          style={{
            width: "min(90vw, 800px)",
            height: "min(90vw, 800px)",
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
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
              <div className="w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 shadow-2xl shadow-purple-500/50" />
              <div className="absolute inset-[-8px] rounded-full bg-purple-400/30 blur-xl animate-pulse" />
              <div
                className="absolute inset-[-16px] rounded-full bg-pink-400/20 blur-2xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>

          {renderOrbitItems(techStack.inner, 95, rotations.inner, "inner")}
          {renderOrbitItems(techStack.middle, 175, rotations.middle, "middle")}
          {renderOrbitItems(techStack.outer, 270, rotations.outer, "outer")}
        </div>
      </div>

      {/* Zoom indicator for mobile/desktop */}
      {(zoom !== 1 || (window.innerWidth < 768 && mounted)) && (
        <div className="absolute bottom-4 right-4 z-50 px-3 py-2 bg-slate-800/90 border border-slate-600/50 rounded-lg text-white text-xs backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
            {window.innerWidth < 768 && <span className="text-slate-400">• Pinch or drag to explore</span>}
          </div>
        </div>
      )}
    </div>
  )
}
