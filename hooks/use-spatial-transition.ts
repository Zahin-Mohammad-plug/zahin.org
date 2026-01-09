import { useRef, useEffect, useState, useMemo } from "react"
import { DEPTH_TRANSITIONS } from "@/constants/transitions"

type PageType = "about" | "passions" | "projects" | "stack"
type TransitionType = "adjacent" | "skip-1" | "skip-2" | "special-monitor-zoom"

interface TransitionConfig {
  duration: number
  fromDensity: 1 | 2 | 4 | 8
  toDensity: 1 | 2 | 4 | 8
  isSkip: boolean
  parallaxMultiplier: number
  contentScale: { from: number; to: number }
  exitTransform: { scale: number; x: number; y: number }
  enterTransform: { scale: number; x: number; y: number }
}

interface UseSpatialTransitionProps {
  fromPage: PageType | null
  toPage: PageType | null
  isTransitioning: boolean
  prefersReducedMotion?: boolean
}

export const useSpatialTransition = ({
  fromPage,
  toPage,
  isTransitioning,
  prefersReducedMotion = false,
}: UseSpatialTransitionProps) => {
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [contentTransform, setContentTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 })

  // Calculate transition type and configuration - memoized to prevent infinite re-renders
  const config = useMemo((): TransitionConfig | null => {
    if (!fromPage || !toPage) return null

    const pageOrder: PageType[] = ["about", "passions", "projects", "stack"]
    const fromIndex = pageOrder.indexOf(fromPage)
    const toIndex = pageOrder.indexOf(toPage)
    const distance = Math.abs(toIndex - fromIndex)

    const fromDensity = DEPTH_TRANSITIONS.GRID_DENSITIES[fromPage]
    const toDensity = DEPTH_TRANSITIONS.GRID_DENSITIES[toPage]
    const parallaxMultiplier = DEPTH_TRANSITIONS.PARALLAX_MULTIPLIERS[toDensity]

    // Special case: About → Passions (monitor zoom portal)
    if (fromPage === "about" && toPage === "passions") {
      return {
        duration: DEPTH_TRANSITIONS.ADJACENT_DURATION,
        fromDensity,
        toDensity,
        isSkip: false,
        parallaxMultiplier: DEPTH_TRANSITIONS.PARALLAX_MULTIPLIERS[2],
        contentScale: DEPTH_TRANSITIONS.CONTENT_SCALES.passions,
        exitTransform: { scale: 3, x: 0, y: 0 }, // Monitor expands
        enterTransform: { scale: 1, x: 0, y: 0 }, // House scales in
      }
    }

    // Skip transitions
    if (distance > 1) {
      // Corrected: distance === 3 for FULL_JOURNEY_DURATION (About <-> Stack)
      const duration = distance === 3 ? DEPTH_TRANSITIONS.FULL_JOURNEY_DURATION : DEPTH_TRANSITIONS.SKIP_DURATION
      return {
        duration,
        fromDensity,
        toDensity,
        isSkip: true,
        parallaxMultiplier,
        contentScale: toIndex > fromIndex
          ? DEPTH_TRANSITIONS.CONTENT_SCALES[toPage as keyof typeof DEPTH_TRANSITIONS.CONTENT_SCALES] || { from: 0.1, to: 1 }
          : { from: 1, to: 0.1 },
        exitTransform: { scale: 0.3, x: toIndex > fromIndex ? 100 : -100, y: 0 },
        enterTransform: { scale: 1, x: 0, y: 0 },
      }
    }

    // Adjacent transitions
    const contentScale = toIndex > fromIndex
      ? DEPTH_TRANSITIONS.CONTENT_SCALES[toPage as keyof typeof DEPTH_TRANSITIONS.CONTENT_SCALES] || { from: 0.3, to: 1 }
      : { from: 1, to: 0.3 }

    let exitTransform = { scale: 1, x: 0, y: 0 }
    let enterTransform = { scale: 1, x: 0, y: 0 }

    // Define exit/enter transforms based on page pairs
    if (fromPage === "passions" && toPage === "projects") {
      exitTransform = { scale: 0.3, x: 0, y: 100 } // House scales down and moves down
      enterTransform = { scale: 1, x: 0, y: 0 } // Globe rises from bottom
    } else if (fromPage === "projects" && toPage === "stack") {
      exitTransform = { scale: 0.3, x: 100, y: 0 } // Globe scales down and moves right
      enterTransform = { scale: 1, x: 0, y: 0 } // Orbit expands from center
    } else if (fromPage === "projects" && toPage === "passions") {
      exitTransform = { scale: 0.3, x: 0, y: -100 } // Globe sinks down
      enterTransform = { scale: 1, x: 0, y: 0 } // House rises
    } else if (fromPage === "stack" && toPage === "projects") {
      exitTransform = { scale: 0.3, x: -100, y: 0 } // Orbit contracts left
      enterTransform = { scale: 1, x: 0, y: 0 } // Globe scales up from center
    } else if (fromPage === "passions" && toPage === "about") {
      exitTransform = { scale: 0.3, x: 0, y: -100 } // House scales down and moves up
      enterTransform = { scale: 1, x: 0, y: 0 } // Monitor expands from portal
    }

    return {
      duration: DEPTH_TRANSITIONS.ADJACENT_DURATION,
      fromDensity,
      toDensity,
      isSkip: false,
      parallaxMultiplier,
      contentScale,
      exitTransform,
      enterTransform,
    }
  }, [fromPage, toPage])

  // Animation loop - calculates both content and parallax transforms in sync
  useEffect(() => {
    if (!isTransitioning || !config || prefersReducedMotion) {
      setTransitionProgress(0)
      setContentTransform({ scale: 1, x: 0, y: 0 })
      setParallaxOffset({ x: 0, y: 0 })
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      startTimeRef.current = null
      return
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / config.duration, 1)

      // Easing function (ease-out for most transitions)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setTransitionProgress(easedProgress)

      // Calculate content transform based on progress
      const scale = config.contentScale.from + (config.contentScale.to - config.contentScale.from) * easedProgress
      const x = config.enterTransform.x * (1 - easedProgress) + config.exitTransform.x * easedProgress
      const y = config.enterTransform.y * (1 - easedProgress) + config.exitTransform.y * easedProgress

      setContentTransform({ scale, x, y })

      // Calculate parallax transform synchronized with content transform
      // Parallax moves MORE than content (multiplier > 1)
      const parallaxX = x * config.parallaxMultiplier
      const parallaxY = y * config.parallaxMultiplier

      setParallaxOffset({ x: parallaxX, y: parallaxY })

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = null
        startTimeRef.current = null
      }
    }

    startTimeRef.current = null
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      startTimeRef.current = null
    }
  }, [isTransitioning, config, prefersReducedMotion])

  return {
    transitionProgress,
    contentTransform,
    parallaxOffset,
    config,
  }
}
