'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '../../lib/cn'

interface NumberTickerProps {
  value: number
  duration?: number
  delay?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function formatNumber(num: number, decimals: number): string {
  const fixed = num.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted
}

export function NumberTicker({
  value,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number>(0)

  const startAnimation = useCallback(() => {
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      setDisplayValue(easedProgress * value)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick)
      }
    }

    animationRef.current = requestAnimationFrame(tick)
  }, [value, duration])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          if (delay > 0) {
            setTimeout(startAnimation, delay)
          } else {
            startAnimation()
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [hasStarted, delay, startAnimation])

  return (
    <span
      ref={ref}
      className={cn('tabular-nums tracking-tight', className)}
    >
      {prefix}
      {formatNumber(displayValue, decimals)}
      {suffix}
    </span>
  )
}
