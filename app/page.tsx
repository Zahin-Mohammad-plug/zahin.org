"use client"

import { useState, useCallback, useEffect } from "react"
import Navigation from "@/components/navigation"
import ContactLinks from "@/components/contact-links"
import AboutPage from "@/components/pages/about-page"
import PassionsPage from "@/components/pages/passions-page"
import ProjectsPage from "@/components/pages/projects-page"
import StackPage from "@/components/pages/stack-page"
import TiledBackground from "@/components/tiled-background"

type PageType = "about" | "passions" | "projects" | "stack"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("about")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"in" | "out">("in")
  const [isCinematic, setIsCinematic] = useState(false)

  const pageOrder: PageType[] = ["about", "passions", "projects", "stack"]
  const CINEMATIC_DURATION = 2800 // Extended to allow galaxy scroll and smooth entry
  const CINEMATIC_SWITCH = 2400 // Swap page after overlay fully fills screen and galaxy scrolls
  const CINEMATIC_UNVEIL = 2800 // Unveil new page exactly as overlay ends

  const handlePageChange = useCallback(
    (newPage: PageType) => {
      if (newPage === currentPage || isTransitioning) return

      const currentIndex = pageOrder.indexOf(currentPage)
      const newIndex = pageOrder.indexOf(newPage)

      // Cinematic hand-off from About -> any galaxy page (passions, projects, stack)
      if (currentPage === "about" && (newPage === "passions" || newPage === "projects" || newPage === "stack")) {
        setIsCinematic(true)
        setTransitionDirection("out")
        setIsTransitioning(true)

        // Keep about page visible until overlay is nearly full screen, then swap
        setTimeout(() => {
          setCurrentPage(newPage)
          setTransitionDirection("in")
        }, CINEMATIC_SWITCH)

        // Allow next page to render behind the overlay before it lifts
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
  const [initialPos, setInitialPos] = useState({ 
    left: 0, 
    top: 0, 
    width: 0, 
    height: 0,
    zoomScale: 4,
    zoomX: 0,
    zoomY: 0
  })

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
      
      // Calculate zoom transform values
      const zoomScale = Math.max(vw / width, vh / height)
      const zoomX = (vw / 2 - (left + width / 2)) / zoomScale
      const zoomY = (vh / 2 - (top + height / 2)) / zoomScale
      
      // Store initial position for animation
      if (initialPos.width === 0) {
        setInitialPos({ 
          left, 
          top, 
          width, 
          height,
          zoomScale,
          zoomX,
          zoomY
        })
      }
    }
    
    calculateMonitorPosition()
    window.addEventListener('resize', calculateMonitorPosition)
    return () => window.removeEventListener('resize', calculateMonitorPosition)
  }, [initialPos])

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* Monitor zoom container - starts at monitor position */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${initialPos.left}px`,
          top: `${initialPos.top}px`,
          width: `${initialPos.width}px`,
          height: `${initialPos.height}px`,
          transformOrigin: "center center",
          border: "3px solid #00ff00",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          animation: "monitor-zoom-transform 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          // CSS custom properties for zoom animation
          ['--zoom-scale' as string]: initialPos.zoomScale || '4',
          ['--zoom-x' as string]: `${initialPos.zoomX || 0}px`,
          ['--zoom-y' as string]: `${initialPos.zoomY || 0}px`,
        }}
      >
        {/* Galaxy background behind text - scrolls during transition */}
        <div 
          className="absolute inset-0"
          style={{
            animation: "galaxy-scroll 2.8s ease-out forwards",
          }}
        >
          <TiledBackground
            sceneReady={true}
            sizeMultiplier={1.0}
            tileOffset={0}
            extraTiles={4}
            handleResize={true}
            className="absolute inset-0"
            imageSrc="/images/projectspagebackground.png"
          />
        </div>

        {/* Monitor content (About Me text) - scrolls WITH galaxy and fades out */}
        <div 
          className="absolute inset-0 flex flex-col justify-start z-10"
          style={{
            padding: "min(1.2vw, 1.1rem)",
            animation: "fade-monitor-content 2.8s ease-out forwards, galaxy-scroll 2.8s ease-out forwards",
            opacity: 1,
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
        
        {/* Gradient overlay that fades as we zoom - subtle, doesn't block about image */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent opacity-100 z-20 pointer-events-none"
          style={{
            animation: "fade-out-gradient 2.8s ease-out forwards",
          }}
        />
      </div>
    </div>
  )
}
