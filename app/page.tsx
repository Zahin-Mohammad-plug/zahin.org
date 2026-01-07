"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Navigation from "@/components/navigation"
import ContactLinks from "@/components/contact-links"
import AboutPage from "@/components/pages/about-page"
import PassionsPage from "@/components/pages/passions-page"
import ProjectsPage from "@/components/pages/projects-page"
import StackPage from "@/components/pages/stack-page"
import TiledBackground from "@/components/tiled-background"
import { TRANSITION_CONSTANTS } from "@/constants/transitions"

type PageType = "about" | "passions" | "projects" | "stack"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("about")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"in" | "out">("in")
  const [isCinematic, setIsCinematic] = useState(false)
  const [showSharedBackground, setShowSharedBackground] = useState(false)

  // Use refs for values that don't need to trigger listener re-registration
  const currentPageRef = useRef<PageType>(currentPage)
  const isTransitioningRef = useRef<boolean>(isTransitioning)

  // Keep refs in sync with state
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])

  const pageOrder: PageType[] = ["about", "passions", "projects", "stack"]

  const handlePageChange = useCallback(
    (newPage: PageType) => {
      // Use refs to get current values without creating dependency
      if (newPage === currentPageRef.current || isTransitioningRef.current) return

      const currentIndex = pageOrder.indexOf(currentPageRef.current)
      const newIndex = pageOrder.indexOf(newPage)

      // Cinematic hand-off from About -> Passions
      if (currentPageRef.current === "about" && newPage === "passions") {
        setIsCinematic(true)
        setIsTransitioning(true)
        setTransitionDirection("out")

        // Show Passions page behind the overlay early so it's ready
        setTimeout(() => {
          setCurrentPage(newPage)
          setTransitionDirection("in")
        }, TRANSITION_CONSTANTS.CINEMATIC_SWITCH)

        // Allow passions to be fully visible as overlay fades
        setTimeout(() => {
          setIsTransitioning(false)
        }, TRANSITION_CONSTANTS.CINEMATIC_UNVEIL)

        // Remove overlay after animation completes
        setTimeout(() => {
          setIsCinematic(false)
        }, TRANSITION_CONSTANTS.CINEMATIC_DURATION)

        return
      }

      // Seamless transition between Passions <-> Projects (shared background)
      // Creates "scrolling down through galaxy" effect
      if ((currentPageRef.current === "passions" && newPage === "projects") || (currentPageRef.current === "projects" && newPage === "passions")) {
        setShowSharedBackground(true)
        setTransitionDirection(newIndex > currentIndex ? "out" : "in")
        setIsTransitioning(true)

        setTimeout(() => {
          setCurrentPage(newPage)
        }, TRANSITION_CONSTANTS.STANDARD_TRANSITION_DELAY)

        setTimeout(() => {
          setIsTransitioning(false)
          setShowSharedBackground(false)
        }, TRANSITION_CONSTANTS.STANDARD_TRANSITION_DURATION)

        return
      }

      // Seamless transition between Projects <-> Stack (shared background)
      // Creates "zooming out to full galaxy view" effect
      if ((currentPageRef.current === "projects" && newPage === "stack") || (currentPageRef.current === "stack" && newPage === "projects")) {
        setShowSharedBackground(true)
        setTransitionDirection(newIndex > currentIndex ? "out" : "in")
        setIsTransitioning(true)

        setTimeout(() => {
          setCurrentPage(newPage)
        }, TRANSITION_CONSTANTS.STANDARD_TRANSITION_DELAY)

        setTimeout(() => {
          setIsTransitioning(false)
          setShowSharedBackground(false)
        }, TRANSITION_CONSTANTS.STANDARD_TRANSITION_DURATION)

        return
      }

      setTransitionDirection(newIndex > currentIndex ? "out" : "in")
      setIsTransitioning(true)

      setTimeout(() => {
        setCurrentPage(newPage)
        setIsTransitioning(false)
      }, TRANSITION_CONSTANTS.STANDARD_TRANSITION_DURATION)
    },
    [], // Empty deps - use refs instead
  )

  useEffect(() => {
    let lastScrollTime = 0

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastScrollTime < TRANSITION_CONSTANTS.SCROLL_COOLDOWN || isTransitioningRef.current) return

      const currentIndex = pageOrder.indexOf(currentPageRef.current)

      if (e.deltaY > TRANSITION_CONSTANTS.SCROLL_THRESHOLD && currentIndex < pageOrder.length - 1) {
        lastScrollTime = now
        handlePageChange(pageOrder[currentIndex + 1])
      } else if (e.deltaY < -TRANSITION_CONSTANTS.SCROLL_THRESHOLD && currentIndex > 0) {
        lastScrollTime = now
        handlePageChange(pageOrder[currentIndex - 1])
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [handlePageChange]) // Only depend on handlePageChange, which is now stable

  // Touch swipe navigation (mobile)
  useEffect(() => {
    let touchStartY = 0
    let touchStartX = 0

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartY = touch.clientY
      touchStartX = touch.clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return
      const touch = e.changedTouches[0]
      const deltaY = touch.clientY - touchStartY
      const deltaX = Math.abs(touch.clientX - touchStartX)

      // ignore mostly horizontal swipes
      if (deltaX > Math.abs(deltaY)) return

      const currentIndex = pageOrder.indexOf(currentPageRef.current)
      if (deltaY < -TRANSITION_CONSTANTS.TOUCH_THRESHOLD && currentIndex < pageOrder.length - 1) {
        handlePageChange(pageOrder[currentIndex + 1])
      } else if (deltaY > TRANSITION_CONSTANTS.TOUCH_THRESHOLD && currentIndex > 0) {
        handlePageChange(pageOrder[currentIndex - 1])
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [handlePageChange]) // Only depend on handlePageChange, which is now stable

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return

      const currentIndex = pageOrder.indexOf(currentPageRef.current)

      if ((e.key === "ArrowDown" || e.key === "PageDown") && currentIndex < pageOrder.length - 1) {
        handlePageChange(pageOrder[currentIndex + 1])
      } else if ((e.key === "ArrowUp" || e.key === "PageUp") && currentIndex > 0) {
        handlePageChange(pageOrder[currentIndex - 1])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlePageChange]) // Only depend on handlePageChange, which is now stable

  // Determine if shared background should be visible
  const isSharedBackgroundVisible = showSharedBackground || currentPage === "passions" || currentPage === "projects" || currentPage === "stack"
  const isSharedBackgroundReady = isSharedBackgroundVisible && !isTransitioning

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Navigation */}
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      {/* Contact Links */}
      <ContactLinks />

      {/* Page Container */}
      <div className="h-full w-full">
        {/* Shared background for Passions/Projects/Stack transition */}
        {isSharedBackgroundVisible && (
          <div className={cn(
            "absolute inset-0 overflow-hidden transition-opacity duration-700",
            isSharedBackgroundReady ? "opacity-100 z-0" : "opacity-0 z-0"
          )}>
            <div className="absolute inset-0 bg-black" />
            <TiledBackground
              sceneReady={isSharedBackgroundReady}
              sizeMultiplier={1.3}
              extraTiles={1}
              handleResize={true}
              usePanningStyle={true}
              className="absolute"
              parallaxSpeed={TRANSITION_CONSTANTS.PARALLAX_BACKGROUND_OFFSET}
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>
        )}

        <AboutPage
          isActive={currentPage === "about"}
          isTransitioning={isTransitioning}
          transitionDirection={currentPage === "about" ? transitionDirection : pageOrder.indexOf("about") < pageOrder.indexOf(currentPage) ? "out" : "in"}
        />
        <PassionsPage
          isActive={currentPage === "passions"}
          isTransitioning={isTransitioning}
          transitionDirection={currentPage === "passions" ? transitionDirection : pageOrder.indexOf("passions") < pageOrder.indexOf(currentPage) ? "out" : "in"}
        />
        <ProjectsPage
          isActive={currentPage === "projects"}
          isTransitioning={isTransitioning}
          transitionDirection={currentPage === "projects" ? transitionDirection : pageOrder.indexOf("projects") < pageOrder.indexOf(currentPage) ? "out" : "in"}
        />
        <StackPage
          isActive={currentPage === "stack"}
          isTransitioning={isTransitioning}
          transitionDirection={currentPage === "stack" ? transitionDirection : pageOrder.indexOf("stack") < pageOrder.indexOf(currentPage) ? "out" : "in"}
        />
      </div>

      {isCinematic ? <CinematicOverlay /> : null}
    </main>
  )
}

function CinematicOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* Black background that fades out as monitor zooms */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          animation: "fade-out-overlay 2.1s ease-out forwards",
        }}
      />
      {/* Monitor zoom container - starts at monitor position */}
      <div
        className="absolute animate-monitor-zoom overflow-hidden"
        style={{
          left: "56.4%",
          top: "34.3%",
          width: "24%",
          height: "23%",
          transformOrigin: "top left",
        }}
      >
        {/* First show the monitor content (About Me text) */}
        <div 
          className="absolute inset-0 bg-slate-900/95 flex flex-col justify-start transition-opacity duration-500"
          style={{
            padding: "min(1.2vw, 1.1rem)",
            animation: "fade-monitor-content 2.1s ease-out forwards",
          }}
        >
          <h1 className="font-serif text-[clamp(0.875rem,2.2vw,1.75rem)] font-bold mb-[clamp(0.125rem,0.3vw,0.375rem)] text-white drop-shadow-lg italic shrink-0 leading-[1.1]">
            About Me
          </h1>
          <p 
            className="text-[clamp(0.5rem,1.1vw,0.875rem)] text-white/90 leading-[1.3] drop-shadow-md shrink-0"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            I'm a CS student from Ottawa, Ontario who enjoys building real apps and learning how to design systems through practice.
          </p>
          <div className="flex-1 min-h-1 max-h-4" />
          <div className="flex items-center gap-[clamp(0.2rem,0.45vw,0.5rem)] shrink-0">
            <div className="w-[clamp(1rem,1.8vw,1.75rem)] h-[clamp(1rem,1.8vw,1.75rem)] bg-amber-500 rounded-md flex items-center justify-center shadow-lg">
              <svg className="w-[60%] h-[60%] text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div className="w-[clamp(1rem,1.8vw,1.75rem)] h-[clamp(1rem,1.8vw,1.75rem)] bg-green-500 rounded-md flex items-center justify-center shadow-lg">
              <svg className="w-[60%] h-[60%] text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <div className="w-[clamp(1rem,1.8vw,1.75rem)] h-[clamp(1rem,1.8vw,1.75rem)] bg-blue-500 rounded-md flex items-center justify-center shadow-lg">
              <svg className="w-[60%] h-[60%] text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
              </svg>
            </div>
            <div className="w-[clamp(1rem,1.8vw,1.75rem)] h-[clamp(1rem,1.8vw,1.75rem)] bg-purple-600 rounded-md flex items-center justify-center shadow-lg">
              <svg className="w-[60%] h-[60%] text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Then transition to galaxy background */}
        <div
          className="absolute inset-0 animate-star-pan opacity-0"
          style={{
            backgroundImage: "url('/images/projectspagebackground.png')",
            backgroundSize: "320px 320px",
            backgroundRepeat: "repeat",
            backgroundPosition: "center 92%",
            animation: "fade-in-galaxy 2.1s ease-out forwards",
          }}
        />
        {/* Gradient overlay that fades as we zoom */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-100"
          style={{
            animation: "fade-out-overlay 2.1s ease-out forwards",
          }}
        />
      </div>
    </div>
  )
}
