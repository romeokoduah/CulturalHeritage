import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface MarqueeProps {
  children: ReactNode
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  repeat?: number
  duration?: string
}

/** MagicUI Marquee — an infinite horizontal scroller. */
export function Marquee({
  children,
  className,
  reverse,
  pauseOnHover = true,
  repeat = 4,
  duration = '32s',
}: MarqueeProps) {
  return (
    <div
      style={{ ['--duration' as string]: duration, ['--gap' as string]: '1rem' }}
      className={cn('group flex overflow-hidden [gap:var(--gap)]', className)}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
