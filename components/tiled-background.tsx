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
}: TiledBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track dimensions if handleResize is true or if we need extraSize
  useEffect(() => {
    if (handleResize || extraSize > 0) {
      const updateDimensions = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight })
      }
      updateDimensions()
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

    const drawBackground = () => {
      // Calculate canvas size
      const baseWidth = dimensions.width || window.innerWidth
      const baseHeight = dimensions.height || window.innerHeight
      const width = Math.ceil(baseWidth * sizeMultiplier + extraSize)
      const height = Math.ceil(baseHeight * sizeMultiplier + extraSize)

      canvas.width = width
      canvas.height = height

      // Load and draw the background image
      const img = new window.Image()
      img.src = imageSrc

      img.onload = () => {
        const tileSize = 320
        const cols = Math.ceil(width / tileSize) + extraTiles
        const rows = Math.ceil(height / tileSize) + extraTiles

        // Seed for consistent random flips during the session
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * tileSize + tileOffset
            const y = row * tileSize + tileOffset

            // Simple hash for consistent randomness per position
            const seed = col + row * 1000
            const shouldFlipX = (seed * 73 + 1) % 2 === 0
            const shouldFlipY = (seed * 97 + 1) % 2 === 0

            ctx.save()
            ctx.translate(x + tileSize / 2, y + tileSize / 2)

            if (shouldFlipX) ctx.scale(-1, 1)
            if (shouldFlipY) ctx.scale(1, -1)

            ctx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
            ctx.restore()
          }
        }
      }

      img.onerror = () => {
        console.error(`Failed to load image for drawing: ${imageSrc}`)
      }
    }

    try {
      drawBackground()
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
  }, [imgLoaded, sceneReady, dimensions, sizeMultiplier, extraSize, tileOffset, extraTiles, handleResize, imageSrc])

  // Calculate parallax transform
  const parallaxX = (parallaxOffset.x || 0) * parallaxSpeed
  const parallaxY = (parallaxOffset.y || 0) * parallaxSpeed

  return (
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
        willChange: parallaxX !== 0 || parallaxY !== 0 ? "transform" : undefined,
      }}
    />
  )
}

