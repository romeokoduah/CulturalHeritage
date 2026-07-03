import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** MagicUI Animated Shiny Text — a light sweep across text. */
export function AnimatedShinyText({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      style={{ backgroundSize: '200% 100%' }}
      className={cn(
        'bg-clip-text text-transparent animate-shimmer',
        'bg-[linear-gradient(110deg,#a0a7c4,45%,#ffffff,55%,#a0a7c4)]',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** A pill badge with an animated conic gradient border. */
export function GradientBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'group relative mx-auto inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm',
        'glass shadow-[inset_0_-8px_10px_#ffffff1f] transition-shadow duration-500 hover:shadow-[inset_0_-5px_10px_#ffffff3f]',
        className,
      )}
    >
      <span
        className="absolute inset-0 block h-full w-full animate-shimmer rounded-[inherit] bg-gradient-to-r from-transparent via-gold-400/40 to-transparent p-px"
        style={{ backgroundSize: '300% 100%' }}
      />
      {children}
    </div>
  )
}
