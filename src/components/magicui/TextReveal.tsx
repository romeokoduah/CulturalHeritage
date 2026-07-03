'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '../../lib/cn'

interface TextRevealProps {
  text: string
  className?: string
}

export function TextReveal({ text, className }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const words = text.split(' ')

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || !isVisible) return

    const rect = container.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const containerHeight = rect.height

    // Calculate progress: 0 when top enters viewport, 1 when bottom leaves
    const scrollStart = windowHeight
    const scrollEnd = -containerHeight
    const currentPosition = rect.top
    const totalRange = scrollStart - scrollEnd
    const progress = (scrollStart - currentPosition) / totalRange

    setScrollProgress(Math.max(0, Math.min(1, progress)))
  }, [isVisible])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isVisible, handleScroll])

  return (
    <div
      ref={containerRef}
      className={cn('relative min-h-[200vh] py-40', className)}
    >
      <div className="sticky top-1/2 mx-auto max-w-4xl -translate-y-1/2 px-6">
        <p className="flex flex-wrap text-3xl font-bold leading-relaxed md:text-4xl lg:text-5xl">
          {words.map((word, i) => {
            const wordProgress = i / words.length
            const opacity = Math.max(
              0.15,
              Math.min(1, (scrollProgress - wordProgress * 0.8) / 0.2)
            )

            return (
              <span
                key={i}
                className="mr-[0.25em] transition-opacity duration-200"
                style={{ opacity }}
              >
                {word}
              </span>
            )
          })}
        </p>
      </div>
    </div>
  )
}
