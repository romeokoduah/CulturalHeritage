'use client'

import { cn } from '../../lib/cn'

interface RetroGridProps {
  className?: string
  angle?: number
}

export function RetroGrid({ className, angle = 65 }: RetroGridProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]',
        className
      )}
    >
      <div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${angle}deg)` }}
      >
        <div
          className={cn(
            'absolute inset-[-200%]',
            '[background-image:linear-gradient(to_right,var(--retro-grid-color,rgba(255,209,102,0.3))_1px,transparent_0),linear-gradient(to_bottom,var(--retro-grid-color,rgba(255,209,102,0.3))_1px,transparent_0)]',
            '[background-size:60px_60px]',
            '[transform-origin:100%_0_0]',
            'animate-retro-grid'
          )}
        />
      </div>
      {/* Fade overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white dark:from-neutral-950 dark:via-transparent dark:to-neutral-950" />
      <style>{`
        @keyframes retro-grid-scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(60px);
          }
        }
        .animate-retro-grid {
          animation: retro-grid-scroll 4s linear infinite;
        }
      `}</style>
    </div>
  )
}
