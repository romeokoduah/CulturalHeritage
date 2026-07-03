import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { TIMELINE_EVENTS, TIMELINE_BY_COUNTRY } from '../../data/timeline'
import { COUNTRIES_BY_ID } from '../../data/countries'
import type { TimelineEvent } from '../../lib/types'

interface HeritageTimelineProps {
  countryId?: string
  className?: string
}

const ERA_COLORS: Record<string, string> = {
  Ancient: 'bg-amber-700/80 text-amber-100',
  Medieval: 'bg-indigo-700/80 text-indigo-100',
  Colonial: 'bg-rose-700/80 text-rose-100',
  Modern: 'bg-emerald-700/80 text-emerald-100',
}

function getCountryColor(countryId: string): string {
  return COUNTRIES_BY_ID[countryId]?.colors[0] ?? '#888'
}

function getCountryName(countryId: string): string {
  return COUNTRIES_BY_ID[countryId]?.name ?? countryId
}

function TimelineCard({
  event,
  index,
}: {
  event: TimelineEvent
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isLeft = index % 2 === 0
  const countryColor = getCountryColor(event.countryId)

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full items-start gap-6',
        /* Desktop: alternate sides. Mobile: always right of the line. */
        'md:justify-start',
        isLeft ? 'md:flex-row-reverse' : 'md:flex-row',
      )}
    >
      {/* ── Dot on the center line ── */}
      <div className="absolute left-4 top-2 z-10 md:left-1/2 md:-translate-x-1/2">
        <span
          className={cn(
            'block h-4 w-4 rounded-full border-2 border-white/80 shadow-lg transition-all duration-700',
            visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
          style={{
            backgroundColor: countryColor,
            boxShadow: visible
              ? `0 0 10px ${countryColor}88, 0 0 20px ${countryColor}44`
              : 'none',
          }}
        />
        {/* Pulse ring */}
        {visible && (
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-30"
            style={{ backgroundColor: countryColor }}
          />
        )}
      </div>

      {/* ── Card ── */}
      <div
        className={cn(
          'ml-10 w-full transition-all duration-700 ease-out md:ml-0 md:w-[calc(50%-2rem)]',
          isLeft ? 'md:mr-auto md:pr-8 md:text-right' : 'md:ml-auto md:pl-8 md:text-left',
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0',
        )}
      >
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md dark:bg-black/20">
          {/* Year badge */}
          <div className="mb-2 flex flex-wrap items-center gap-2 md:flex-nowrap"
            style={isLeft ? { justifyContent: 'flex-start' } : undefined}
          >
            <span
              className="inline-block rounded-md px-2.5 py-0.5 text-lg font-extrabold tracking-tight text-white shadow"
              style={{ backgroundColor: countryColor }}
            >
              {event.yearLabel}
            </span>

            {event.era && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  ERA_COLORS[event.era] ?? 'bg-gray-600/80 text-gray-200',
                )}
              >
                {event.era}
              </span>
            )}

            {/* Country tag when showing all */}
            <span className="text-xs font-medium text-white/50">
              {getCountryName(event.countryId)}
            </span>
          </div>

          {/* Image thumbnail */}
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="mb-3 h-36 w-full rounded-lg object-cover"
              loading="lazy"
            />
          )}

          {/* Title */}
          <h3 className="mb-1 text-base font-bold leading-snug text-white/90">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-white/60">
            {event.description}
          </p>

          {/* Site link */}
          {event.siteId && (
            <Link
              to={`/site/${event.siteId}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: countryColor }}
            >
              Visit site
              <span aria-hidden="true" className="text-xs">&rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HeritageTimeline({
  countryId,
  className,
}: HeritageTimelineProps) {
  const events: TimelineEvent[] = countryId
    ? TIMELINE_BY_COUNTRY[countryId] ?? []
    : TIMELINE_EVENTS

  if (events.length === 0) return null

  return (
    <section className={cn('relative mx-auto max-w-5xl px-4 py-16', className)}>
      {/* Section heading */}
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-white/90 md:text-4xl">
        Heritage Timeline
      </h2>

      {/* ── Glowing center line ── */}
      <div className="pointer-events-none absolute inset-y-0 left-4 w-0.5 md:left-1/2 md:-translate-x-1/2">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        {/* Glow layer */}
        <div className="absolute inset-0 w-full bg-gradient-to-b from-transparent via-white/10 to-transparent blur-sm" />
      </div>

      {/* ── Event cards ── */}
      <div className="relative flex flex-col gap-12">
        {events.map((event, i) => (
          <TimelineCard key={`${event.countryId}-${event.year}-${i}`} event={event} index={i} />
        ))}
      </div>
    </section>
  )
}
