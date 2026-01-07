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
    <>
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

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-2 z-50 flex items-center justify-center px-4 md:hidden">
        <div className="flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1.5 shadow-xl backdrop-blur-md border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1.5 text-[0.65rem] font-semibold transition-all duration-200",
                  isActive
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 active:scale-95",
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive && "text-black")} />
                <span className={cn("hidden xs:inline", isActive ? "text-black" : "text-gray-200")}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
