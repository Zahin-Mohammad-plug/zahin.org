"use client"

import { Flame, Heart, Folder, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  currentPage: "about" | "passions" | "projects" | "stack"
  onPageChange: (page: "about" | "passions" | "projects" | "stack") => void
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: "about" as const, label: "ABOUT", icon: Flame },
    { id: "passions" as const, label: "PASSIONS", icon: Heart },
    { id: "projects" as const, label: "PROJECTS", icon: Folder },
    { id: "stack" as const, label: "STACK", icon: Layers },
  ]

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-full flex-col justify-center gap-6 pl-6 md:flex">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentPage === item.id

        return (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300",
              isActive
                ? "border-2 border-white/80 bg-transparent"
                : "border-2 border-transparent hover:border-white/20",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-300",
                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200",
              )}
            >
              <Icon className={cn("h-5 w-5 transition-all duration-300", isActive && "fill-white")} />
            </div>
            <span
              className={cn(
                "text-sm font-bold tracking-wider transition-all duration-300",
                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200",
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
