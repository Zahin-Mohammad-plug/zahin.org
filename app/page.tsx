"use client"

import { useState, useCallback, useEffect } from "react"
import Navigation from "@/components/navigation"
import ContactLinks from "@/components/contact-links"
import AboutPage from "@/components/pages/about-page"
import PassionsPage from "@/components/pages/passions-page"
import ProjectsPage from "@/components/pages/projects-page"
import StackPage from "@/components/pages/stack-page"

type PageType = "about" | "passions" | "projects" | "stack"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("about")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"in" | "out">("in")
  const [isCinematic, setIsCinematic] = useState(false)

  const pageOrder: PageType[] = ["about", "passions", "projects", "stack"]
  const CINEMATIC_DURATION = 2200
  const CINEMATIC_SWITCH = 1250
  const CINEMATIC_UNVEIL = 1500

  const handlePageChange = useCallback(
    (newPage: PageType) => {
      if (newPage === currentPage || isTransitioning) return

      const currentIndex = pageOrder.indexOf(currentPage)
      const newIndex = pageOrder.indexOf(newPage)

      // Cinematic hand-off from About -> Passions
      if (currentPage === "about" && newPage === "passions") {
        setIsCinematic(true)

        // Swap page mid-flight so Passions can settle in as overlay finishes
        setTimeout(() => {
          setTransitionDirection("out")
          setIsTransitioning(true)
          setCurrentPage(newPage)
          setTransitionDirection("in")
        }, CINEMATIC_SWITCH)

        // Allow passions to render behind the overlay before it lifts
        setTimeout(() => {
          setIsTransitioning(false)
        }, CINEMATIC_UNVEIL)

        setTimeout(() => {
          setIsCinematic(false)
        }, CINEMATIC_DURATION)

        return
      }

      setTransitionDirection(newIndex > currentIndex ? "out" : "in")
      setIsTransitioning(true)

      setTimeout(() => {
        setCurrentPage(newPage)
        setIsTransitioning(false)
      }, 700)
    },
    [currentPage, isTransitioning],
  )

  useEffect(() => {
    let lastScrollTime = 0
    const scrollCooldown = 1000

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastScrollTime < scrollCooldown || isTransitioning) return

      const currentIndex = pageOrder.indexOf(currentPage)

      if (e.deltaY > 20 && currentIndex < pageOrder.length - 1) {
        lastScrollTime = now
        handlePageChange(pageOrder[currentIndex + 1])
      } else if (e.deltaY < -20 && currentIndex > 0) {
        lastScrollTime = now
        handlePageChange(pageOrder[currentIndex - 1])
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [currentPage, isTransitioning, handlePageChange])

  // Touch swipe navigation (mobile)
  useEffect(() => {
    let touchStartY = 0
    let touchStartX = 0
    const threshold = 50 // minimum vertical movement to trigger

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartY = touch.clientY
      touchStartX = touch.clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isTransitioning) return
      const touch = e.changedTouches[0]
      const deltaY = touch.clientY - touchStartY
      const deltaX = Math.abs(touch.clientX - touchStartX)

      // ignore mostly horizontal swipes
      if (deltaX > Math.abs(deltaY)) return

      const currentIndex = pageOrder.indexOf(currentPage)
      if (deltaY < -threshold && currentIndex < pageOrder.length - 1) {
        handlePageChange(pageOrder[currentIndex + 1])
      } else if (deltaY > threshold && currentIndex > 0) {
        handlePageChange(pageOrder[currentIndex - 1])
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [currentPage, isTransitioning, handlePageChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return

      const currentIndex = pageOrder.indexOf(currentPage)

      if ((e.key === "ArrowDown" || e.key === "PageDown") && currentIndex < pageOrder.length - 1) {
        handlePageChange(pageOrder[currentIndex + 1])
      } else if ((e.key === "ArrowUp" || e.key === "PageUp") && currentIndex > 0) {
        handlePageChange(pageOrder[currentIndex - 1])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage, isTransitioning, handlePageChange])

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Navigation */}
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      {/* Contact Links */}
      <ContactLinks />

      {/* Page Container */}
      <div className="h-full w-full">
        <AboutPage
          isActive={currentPage === "about"}
          isTransitioning={isTransitioning && (currentPage === "about" || transitionDirection === "out")}
          transitionDirection={currentPage === "about" ? transitionDirection : "in"}
        />
        <PassionsPage
          isActive={currentPage === "passions"}
          isTransitioning={isTransitioning && (currentPage === "passions" || transitionDirection === "out")}
          transitionDirection={currentPage === "passions" ? transitionDirection : "in"}
        />
        <ProjectsPage
          isActive={currentPage === "projects"}
          isTransitioning={isTransitioning && (currentPage === "projects" || transitionDirection === "out")}
          transitionDirection={currentPage === "projects" ? transitionDirection : "in"}
        />
        <StackPage
          isActive={currentPage === "stack"}
          isTransitioning={isTransitioning && (currentPage === "stack" || transitionDirection === "out")}
          transitionDirection={currentPage === "stack" ? transitionDirection : "in"}
        />
      </div>

      {isCinematic ? <CinematicOverlay /> : null}
    </main>
  )
}

function CinematicOverlay() {
  const [monitorPos, setMonitorPos] = useState({ left: 0, top: 0, width: 0, height: 0 })

  useEffect(() => {
    const calculateMonitorPosition = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      
      const imgWidth = 1536
      const imgHeight = 1024
      const imgAspect = imgWidth / imgHeight
      
      const monitorLeft = 848
      const monitorTop = 354
      const monitorWidth = 398
      const monitorHeight = 229
      
      const viewportAspect = vw / vh
      
      let displayWidth, displayHeight, offsetX, offsetY
      
      if (viewportAspect > imgAspect) {
        displayWidth = vw
        displayHeight = vw / imgAspect
        offsetX = 0
        offsetY = (vh - displayHeight) / 2
      } else {
        displayHeight = vh
        displayWidth = vh * imgAspect
        offsetX = (vw - displayWidth) / 2
        offsetY = 0
      }
      
      const scale = displayWidth / imgWidth
      
      const left = offsetX + (monitorLeft * scale)
      const top = offsetY + (monitorTop * scale)
      const width = monitorWidth * scale
      const height = monitorHeight * scale
      
      setMonitorPos({ left, top, width, height })
    }
    
    calculateMonitorPosition()
    window.addEventListener('resize', calculateMonitorPosition)
    return () => window.removeEventListener('resize', calculateMonitorPosition)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 bg-black">
      <div
        className="absolute animate-monitor-zoom"
        style={{
          left: `${monitorPos.left}px`,
          top: `${monitorPos.top}px`,
          width: `${monitorPos.width}px`,
          height: `${monitorPos.height}px`,
          transformOrigin: "top left",
          border: "3px solid #00ff00",
          boxSizing: "border-box",
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
