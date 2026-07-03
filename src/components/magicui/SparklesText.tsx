'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '../../lib/cn'

interface Sparkle {
  id: string
  x: string
  y: string
  size: number
  delay: number
  color: string
}

interface SparklesTextProps {
  children: React.ReactNode
  className?: string
  sparkleColor?: string
}

function generateSparkle(color: string): Sparkle {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 10 + 8,
    delay: Math.random() * 600,
    color,
  }
}

function SparkleIcon({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      className="animate-sparkle-spin"
      style={style}
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </svg>
  )
}

export function SparklesText({
  children,
  className,
  sparkleColor = '#ffd166',
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  const addSparkle = useCallback(() => {
    const sparkle = generateSparkle(sparkleColor)
    setSparkles((prev) => [...prev, sparkle])

    // Remove sparkle after animation
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id))
    }, 1000)
  }, [sparkleColor])

  useEffect(() => {
    const interval = setInterval(addSparkle, 400)
    return () => clearInterval(interval)
  }, [addSparkle])

  return (
    <span className={cn('relative inline-block', className)}>
      <style>{`
        @keyframes sparkle-spin {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(90deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
        }
        .animate-sparkle-spin {
          animation: sparkle-spin 1s ease-in-out forwards;
        }
      `}</style>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="pointer-events-none absolute z-10"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <SparkleIcon
            size={sparkle.size}
            color={sparkle.color}
            style={{ animationDelay: `${sparkle.delay}ms` }}
          />
        </span>
      ))}
      <span className="relative z-0">{children}</span>
    </span>
  )
}
