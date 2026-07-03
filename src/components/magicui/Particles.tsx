'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '../../lib/cn'

interface ParticlesProps {
  className?: string
  count?: number
  color?: string
  speed?: number
}

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  fadeDirection: number
  maxOpacity: number
}

export function Particles({
  className,
  count = 50,
  color = '#ffd166',
  speed = 0.3,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 })
  const animationRef = useRef<number>(0)

  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 209, b: 102 }
  }, [])

  const createParticle = useCallback(
    (width: number, height: number, randomY = true): Particle => ({
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + Math.random() * 20,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * speed + speed * 0.5),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0,
      fadeDirection: 1,
      maxOpacity: Math.random() * 0.6 + 0.2,
    }),
    [speed]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    resizeCanvas()

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    )

    const rgb = hexToRgb(color)

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouse = mouseRef.current

      particlesRef.current.forEach((p) => {
        // Fade in/out
        if (p.fadeDirection === 1) {
          p.opacity += 0.005
          if (p.opacity >= p.maxOpacity) {
            p.fadeDirection = -1
          }
        } else {
          p.opacity -= 0.003
        }

        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          p.x += (dx / dist) * force * 2
          p.y += (dy / dist) * force * 2
        }

        // Move
        p.x += p.speedX
        p.y += p.speedY

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, p.opacity)})`
        ctx.fill()

        // Reset if off screen or fully faded out
        if (p.y < -10 || p.opacity <= 0) {
          Object.assign(p, createParticle(canvas.width, canvas.height, false))
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [count, color, speed, createParticle, hexToRgb])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('pointer-events-auto absolute inset-0 h-full w-full', className)}
    />
  )
}
