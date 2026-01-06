"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import SparkleOverlay from "@/components/sparkle-overlay"

interface AboutPageProps {
  isActive: boolean
  isTransitioning: boolean
  transitionDirection?: "in" | "out"
}

export default function AboutPage({ isActive, isTransitioning, transitionDirection }: AboutPageProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out",
        isActive && !isTransitioning
          ? "opacity-100 scale-100 z-10"
          : transitionDirection === "out"
            ? "opacity-0 scale-110 pointer-events-none z-0"
            : "opacity-0 scale-90 pointer-events-none z-0",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/aboutmepage.png"
          alt="Zahin at desk"
          fill
          className="object-cover object-center"
          style={{ objectPosition: "50% 40%" }}
          priority
        />
      </div>

      <SparkleOverlay count={25} />

      <div
        className="absolute flex flex-col items-start justify-center"
        style={{
          // These values position the text inside the monitor screen in the image
          top: "18%",
          right: "18%",
          width: "26%",
          height: "28%",
          maxWidth: "360px",
        }}
      >
        {/* About Me heading - matching demo serif style */}
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 text-white drop-shadow-lg italic">
          About Me
        </h1>

        {/* Bio text */}
        <p className="text-xs md:text-sm lg:text-base text-white/90 leading-relaxed mb-3 drop-shadow-md">
          {
            "I'm a CS student from Ottawa, Ontario who enjoys building real apps and learning how to design systems through practice."
          }
        </p>

        {/* Icon row */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          {/* Folder icon - orange/yellow */}
          <div className="w-7 h-7 md:w-8 md:h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          {/* Spotify - green */}
          <div className="w-7 h-7 md:w-8 md:h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          {/* VS Code - blue */}
          <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
            </svg>
          </div>
          {/* Terminal - purple */}
          <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {/* Carleton University logo */}
          <div className="h-7 md:h-8 bg-white rounded-lg px-1.5 flex items-center shadow-lg">
            <Image
              src="/images/carleton-logo.png"
              alt="Carleton University"
              width={80}
              height={24}
              className="h-4 md:h-5 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
