"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import SparkleOverlay from "@/components/sparkle-overlay"

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
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40
      const y = (e.clientY / window.innerHeight - 0.5) * 40
      setBgOffset({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isActive])

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

      return (
        <div
          key={tech.name}
          className="absolute transition-transform duration-100"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseEnter={() => setHoveredTech(tech.name)}
          onMouseLeave={() => setHoveredTech(null)}
        >
          <div
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
              tech.hasDarkIcon ? "bg-white/90 p-1.5" : "bg-transparent",
              hoveredTech === tech.name && "scale-150 z-50",
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
      )}
    >
      <div
        className="absolute inset-[-60px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)`,
        }}
      >
        <Image src="/images/stackpagebackground.png" alt="Space background" fill className="object-cover" priority />
      </div>

      <SparkleOverlay count={55} />

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="relative" style={{ width: "min(90vw, 800px)", height: "min(90vw, 800px)" }}>
          {/* Inner orbit - Languages */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border transition-all duration-300 cursor-pointer",
              hoveredOrbit === "inner" ? "border-purple-400 border-2" : "border-purple-500/30",
            )}
            onMouseEnter={() => setHoveredOrbit("inner")}
            onMouseLeave={() => setHoveredOrbit(null)}
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
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full border transition-all duration-300 cursor-pointer",
              hoveredOrbit === "middle" ? "border-blue-400 border-2" : "border-blue-500/30",
            )}
            onMouseEnter={() => setHoveredOrbit("middle")}
            onMouseLeave={() => setHoveredOrbit(null)}
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
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full border transition-all duration-300 cursor-pointer",
              hoveredOrbit === "outer" ? "border-emerald-400 border-2" : "border-emerald-500/30",
            )}
            onMouseEnter={() => setHoveredOrbit("outer")}
            onMouseLeave={() => setHoveredOrbit(null)}
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
    </div>
  )
}
