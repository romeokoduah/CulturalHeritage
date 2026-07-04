import HeritageTimeline from '../features/timeline/HeritageTimeline'
import { useMemo, useState } from 'react'
import { COUNTRIES } from '../data/countries'
import { TIMELINE_EVENTS } from '../data/timeline'
import { cn } from '../lib/cn'

export function TimelinePage() {
  const [filter, setFilter] = useState<string | undefined>(undefined)

  // Only offer filters for countries that actually have timeline events, and
  // label each with its event count — no dead filters that lead to blank views.
  const filterable = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of TIMELINE_EVENTS) counts.set(e.countryId, (counts.get(e.countryId) ?? 0) + 1)
    return COUNTRIES.filter((c) => counts.has(c.id)).map((c) => ({ c, count: counts.get(c.id)! }))
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16">
      <div className="mt-6 mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400/80">
          Through the Ages
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
          Heritage <span className="gradient-text">Timeline</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
          Trace the evolution of cultural heritage across civilizations, from Bronze Age petroglyphs to modern UNESCO inscriptions.
        </p>
        <p className="mt-2 text-xs text-white/35">
          {TIMELINE_EVENTS.length} moments · {filterable.length} civilizations
        </p>
      </div>

      {/* Country filter — a single scrollable row, not a wall of buttons */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:flex-wrap sm:justify-center sm:overflow-visible">
        <button
          onClick={() => setFilter(undefined)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm transition',
            !filter
              ? 'bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10',
          )}
        >
          All · {TIMELINE_EVENTS.length}
        </button>
        {filterable.map(({ c, count }) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm transition',
              filter === c.id
                ? 'bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10',
            )}
          >
            {c.emojiFlag} {c.name}{' '}
            <span className="text-white/30">{count}</span>
          </button>
        ))}
      </div>

      <HeritageTimeline countryId={filter} />
    </div>
  )
}
