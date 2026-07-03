'use client'

import { useMemo } from 'react'
import { cn } from '../../lib/cn'

interface MeteorsProps {
  count?: number
  className?: string
}

export function Meteors({ count = 20, className }: MeteorsProps) {
  const meteors = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 50 - 10}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 3 + 2}s`,
        size: Math.random() * 1.5 + 0.5,
      })),
    [count]
  )

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <style>{`
        @keyframes meteor-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(-45deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(300px) rotate(-45deg);
            opacity: 0;
          }
        }
      `}</style>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute"
          style={{
            left: meteor.left,
            top: meteor.top,
            width: `${meteor.size}px`,
            height: `${meteor.size * 80}px`,
            background: `linear-gradient(
              to bottom,
              var(--meteor-color, rgba(255, 209, 102, 0.8)),
              transparent
            )`,
            borderRadius: '9999px',
            animation: `meteor-fall ${meteor.duration} linear ${meteor.delay} infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
