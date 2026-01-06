"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import SparkleOverlay from "@/components/sparkle-overlay"

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
    cardPosition: { top: "30%", left: "12%" },
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
    cardPosition: { top: "15%", right: "3%" },
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
    cardPosition: { top: "50%", right: "3%" },
    pinColor: "blue",
  },
]

export default function ProjectsPage({ isActive, isTransitioning, transitionDirection }: ProjectsPageProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out",
        isActive && !isTransitioning
          ? "opacity-100 translate-y-0 z-10"
          : transitionDirection === "out"
            ? "opacity-0 scale-90 pointer-events-none z-0"
            : "opacity-0 translate-y-full pointer-events-none z-0",
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-[-10%] w-[120%] h-[120%] animate-slow-pan">
          <Image
            src="/images/projectspagebackground.png"
            alt="Space background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <SparkleOverlay count={45} />

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Title badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <div className="px-8 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-600/50 backdrop-blur-sm">
            <h1 className="font-serif text-xl md:text-2xl font-semibold text-white tracking-wide italic">Projects</h1>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl" style={{ marginBottom: "-8%" }}>
          <div className="relative">
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
                className="absolute z-20 cursor-pointer transition-transform duration-200 hover:scale-150"
                style={{ top: project.pinPosition.top, left: project.pinPosition.left }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div
                  className={cn(
                    "w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-lg",
                    project.pinColor === "orange"
                      ? "bg-gradient-to-br from-amber-400 to-orange-500"
                      : "bg-gradient-to-br from-sky-400 to-blue-500",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {projects.map((project) => (
          <div
            key={`card-${project.id}`}
            className="absolute z-20"
            style={project.cardPosition}
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
          >
            <div
              className={cn(
                "bg-slate-900/90 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-xl transition-all duration-300 overflow-hidden",
                hoveredProject === project.id ? "w-52 md:w-60" : "w-auto",
              )}
            >
              {/* Title always visible */}
              <div className="px-3 py-2">
                <h3 className="font-serif text-base md:text-lg font-bold text-white whitespace-nowrap">
                  {project.name}
                </h3>
              </div>

              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  hoveredProject === project.id ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <div className="px-3 pb-3">
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-2">{project.description}</p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium hover:text-amber-300 transition-colors mb-2"
                    >
                      {project.linkText}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {project.tech.map((tech, index) => (
                      <span
                        key={tech}
                        className={cn("text-xs", index === 0 ? "text-white font-medium" : "text-gray-400")}
                      >
                        {tech}
                        {index < project.tech.length - 1 && <span className="text-gray-500 ml-1">·</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
