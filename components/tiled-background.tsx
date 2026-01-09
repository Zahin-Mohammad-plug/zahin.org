"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TiledBackgroundProps {
  sceneReady: boolean
  /**
   * Canvas size multiplier (e.g., 1.3 for 130%, 1.0 for 100%)
   */
  sizeMultiplier?: number
  /**
   * Additional pixels to add to canvas size (e.g., 200 for extra parallax space)
   */
  extraSize?: number
  /**
   * Tile offset in pixels (e.g., -320 for passions, -640 for stack)
   */
  tileOffset?: number
  /**
   * Extra rows/cols to render beyond viewport (for panning)
   */
  extraTiles?: number
  /**
   * Whether to handle window resize and redraw
   */
  handleResize?: boolean
  /**
   * Whether to use panning animation style (130% size with -15% offset)
   */
  usePanningStyle?: boolean
  /**
   * Custom className for the canvas
   */
  className?: string
  /**
   * Image source path
   */
  imageSrc?: string
  /**
   * Parallax offset for transitions (pixels)
   */
  parallaxOffset?: { x?: number; y?: number }
  /**
   * Parallax speed multiplier (0.3 = moves at 30% speed, 1.2 = moves at 120% speed)
   */
  parallaxSpeed?: number
  /**
   * Grid density (repetition count per axis): 1 = 1x1 grid, 2 = 2x2 grid, 4 = 4x4, 8 = 8x8
   * Controls how many tiles fill the viewport (more tiles = more depth = farther away)
   */
  gridDensity?: 1 | 2 | 4 | 8
  /**
   * Target grid density for transition (used to pre-render canvas before transition)
   */
  transitionToDensity?: 1 | 2 | 4 | 8
  /**
   * Transition progress (0-1) for opacity/blur effects
   */
  transitionProgress?: number
  /**
   * Whether this is a skip transition (direct density jump with blur)
   */
  isSkipTransition?: boolean
}

export default function TiledBackground({
  sceneReady,
  sizeMultiplier = 1.0,
  extraSize = 0,
  tileOffset = 0,
  extraTiles = 0,
  handleResize = false,
  usePanningStyle = false,
  className,
  imageSrc = "/images/projectspagebackground.png",
  parallaxOffset = { x: 0, y: 0 },
  parallaxSpeed = 1.0,
  gridDensity = 1,
  transitionToDensity,
  transitionProgress = 0,
  isSkipTransition = false,
}: TiledBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const transitionCanvasRef = useRef<HTMLCanvasElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track dimensions if handleResize is true or if we need extraSize
  // Always initialize dimensions to viewport size for proper canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateDimensions()
    if (handleResize || extraSize > 0) {
      window.addEventListener("resize", updateDimensions)
      return () => window.removeEventListener("resize", updateDimensions)
    }
  }, [handleResize, extraSize])

  // Load image with error handling
  useEffect(() => {
    try {
      const img = new window.Image()
      img.onload = () => setImgLoaded(true)
      img.onerror = (error) => {
        console.error(`Failed to load image: ${imageSrc}`, error)
        // Still set imgLoaded to false to prevent infinite waiting
        setImgLoaded(false)
      }
      img.src = imageSrc
    } catch (error) {
      console.error(`Error creating image for: ${imageSrc}`, error)
      setImgLoaded(false)
    }
  }, [imageSrc])

  // Draw canvas - only when sceneReady is true (prevent drawing when inactive)
  useEffect(() => {
    if (!canvasRef.current || !imgLoaded || !sceneReady) return

    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas ref is null")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Failed to get canvas 2d context")
      return
    }

    const drawBackground = (targetCanvas: HTMLCanvasElement, targetDensity: number, baseOffset: number = 0) => {
      // Calculate canvas size
      const baseWidth = dimensions.width || window.innerWidth
      const baseHeight = dimensions.height || window.innerHeight
      const width = Math.ceil(baseWidth * sizeMultiplier + extraSize)
      const height = Math.ceil(baseHeight * sizeMultiplier + extraSize)

      targetCanvas.width = width
      targetCanvas.height = height

      const targetCtx = targetCanvas.getContext("2d")
      if (!targetCtx) {
        console.error("Failed to get canvas 2d context")
        return
      }

      // Load and draw the background image
      const img = new window.Image()
      img.src = imageSrc

      img.onload = () => {
        // Calculate tile size based on grid density
        // Tile size = viewport size / grid density (ensures tiles fill viewport)
        const viewportWidth = dimensions.width || window.innerWidth
        const viewportHeight = dimensions.height || window.innerHeight
        const tileSize = Math.ceil(Math.max(viewportWidth, viewportHeight) / targetDensity)

        // Calculate number of tiles needed to cover canvas (with extra for panning)
        const cols = Math.ceil(width / tileSize) + extraTiles
        const rows = Math.ceil(height / tileSize) + extraTiles

        // Seed for consistent random flips during the session
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * tileSize + tileOffset + baseOffset
            const y = row * tileSize + tileOffset + baseOffset

            // Simple hash for consistent randomness per position
            const seed = col + row * 1000
            const shouldFlipX = (seed * 73 + 1) % 2 === 0
            const shouldFlipY = (seed * 97 + 1) % 2 === 0

            targetCtx.save()
            targetCtx.translate(x + tileSize / 2, y + tileSize / 2)

            if (shouldFlipX) targetCtx.scale(-1, 1)
            if (shouldFlipY) targetCtx.scale(1, -1)

            targetCtx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
            targetCtx.restore()
          }
        }
      }

      img.onerror = () => {
        console.error(`Failed to load image for drawing: ${imageSrc}`)
      }
    }

    try {
      // Draw main canvas with current grid density
      if (canvasRef.current) {
        drawBackground(canvasRef.current, gridDensity)
      }

      // Pre-render transition canvas if target density is specified
      // This ensures no black background during transitions
      if (transitionCanvasRef.current && transitionToDensity && transitionToDensity !== gridDensity && imgLoaded && sceneReady) {
        drawBackground(transitionCanvasRef.current, transitionToDensity)
      }
    } catch (error) {
      console.error("Error drawing background:", error)
    }

    // Handle resize if enabled
    if (handleResize) {
      const handleResizeEvent = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
        resizeTimeoutRef.current = setTimeout(drawBackground, 150)
      }

      window.addEventListener("resize", handleResizeEvent)
      return () => {
        window.removeEventListener("resize", handleResizeEvent)
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
      }
    }
  }, [
    imgLoaded,
    sceneReady,
    dimensions,
    sizeMultiplier,
    extraSize,
    tileOffset,
    extraTiles,
    handleResize,
    imageSrc,
    gridDensity,
    transitionToDensity,
  ])

  // Calculate parallax transform
  const parallaxX = (parallaxOffset.x || 0) * parallaxSpeed
  const parallaxY = (parallaxOffset.y || 0) * parallaxSpeed

  // Determine if we're in a transition
  const isTransitioning = transitionToDensity !== undefined && transitionToDensity !== gridDensity

  // Calculate blur for skip transitions (peaks at 50% progress)
  const blurAmount = isSkipTransition && isTransitioning
    ? Math.sin(transitionProgress * Math.PI) * 10 // 0 → 10 → 0
    : 0

  // Opacity for crossfade (transition canvas fades in, main canvas fades out)
  const mainOpacity = isTransitioning ? 1 - transitionProgress : 1
  const transitionOpacity = isTransitioning ? transitionProgress : 0

  return (
    <>
      {/* Main canvas (current density) */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute transition-all duration-1000",
          sceneReady ? "opacity-100" : "opacity-0",
          usePanningStyle && "animate-slow-pan",
          className,
        )}
        style={{
          ...(usePanningStyle
            ? {
                width: "130%",
                height: "130%",
                top: "-15%",
                left: "-15%",
              }
            : {}),
          transform: parallaxX !== 0 || parallaxY !== 0 ? `translate(${parallaxX}px, ${parallaxY}px)` : undefined,
          willChange: parallaxX !== 0 || parallaxY !== 0 || isTransitioning ? "transform, opacity" : undefined,
          opacity: mainOpacity,
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
          zIndex: isTransitioning && transitionOpacity < 0.5 ? 1 : 2, // Ensure smooth transition
        }}
      />
      {/* Transition canvas (target density) - pre-rendered for seamless transition */}
      {isTransitioning && (
        <canvas
          ref={transitionCanvasRef}
          className={cn(
            "absolute transition-all duration-1000",
            sceneReady ? "opacity-100" : "opacity-0",
            usePanningStyle && "animate-slow-pan",
            className,
          )}
          style={{
            ...(usePanningStyle
              ? {
                  width: "130%",
                  height: "130%",
                  top: "-15%",
                  left: "-15%",
                }
              : {}),
            transform: parallaxX !== 0 || parallaxY !== 0 ? `translate(${parallaxX}px, ${parallaxY}px)` : undefined,
            willChange: "transform, opacity",
            opacity: transitionOpacity,
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
            zIndex: transitionOpacity >= 0.5 ? 2 : 1, // Ensure smooth transition
          }}
        />
      )}
    </>
  )
}

