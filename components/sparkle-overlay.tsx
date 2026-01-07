"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  twinkleDelay: number
  driftDelay: number
  driftDuration: number
}

interface SparkleOverlayProps {
  count?: number
  className?: string
}

export default function SparkleOverlay({ count = 30, className = "" }: SparkleOverlayProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const newSparkles: Sparkle[] = []
    for (let i = 0; i < count; i++) {
      // More dynamic size variation (0.5px to 4px)
      const baseSize = Math.random() * 3.5 + 0.5
      newSparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: baseSize,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        twinkleDelay: Math.random() * 2,
        driftDelay: Math.random() * 5,
        driftDuration: Math.random() * 15 + 15, // 15-30s drift
      })
    }
    setSparkles(newSparkles)
  }, [count])

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full bg-white animate-sparkle animate-twinkle animate-drift"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s, ${sparkle.twinkleDelay}s, ${sparkle.driftDelay}s`,
            animationDuration: `${sparkle.duration}s, 2s, ${sparkle.driftDuration}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  )
}
