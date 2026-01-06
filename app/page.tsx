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

  const pageOrder: PageType[] = ["about", "passions", "projects", "stack"]

  const handlePageChange = useCallback(
    (newPage: PageType) => {
      if (newPage === currentPage || isTransitioning) return

      const currentIndex = pageOrder.indexOf(currentPage)
      const newIndex = pageOrder.indexOf(newPage)

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
    </main>
  )
}
