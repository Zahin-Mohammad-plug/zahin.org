"use client"

import { useState, useCallback, useEffect, useRef } from "react"
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

        // Swap page mid-flight so Passions can settle in as overlay finishes
        setTimeout(() => {
          setTransitionDirection("out")
          setIsTransitioning(true)
          setCurrentPage(newPage)
          setTransitionDirection("in")
        }, TRANSITION_CONSTANTS.CINEMATIC_SWITCH)

        // Allow passions to render behind the overlay before it lifts
        setTimeout(() => {
          setIsTransitioning(false)
        }, TRANSITION_CONSTANTS.CINEMATIC_UNVEIL)

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
    <div className="pointer-events-none fixed inset-0 z-30 bg-black">
      <div
        className="absolute animate-monitor-zoom"
        style={{
          left: "56.4%",
          top: "34.3%",
          width: "24%",
          height: "23%",
          transformOrigin: "top left",
        }}
      >
        <div
          className="absolute inset-0 animate-star-pan"
          style={{
            backgroundImage: "url('/images/projectspagebackground.png')",
            backgroundSize: "320px 320px",
            backgroundRepeat: "repeat",
            backgroundPosition: "center 92%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>
    </div>
  )
}
