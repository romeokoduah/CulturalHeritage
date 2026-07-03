import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  )
}

export function BentoCard({
  children,
  className,
  colSpan,
}: {
  children: ReactNode
  className?: string
  colSpan?: string
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl glass p-5',
        'transition-transform duration-300 hover:-translate-y-1',
        colSpan,
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
      {children}
    </div>
  )
}
