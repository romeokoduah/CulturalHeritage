import HeritageTimeline from '../features/timeline/HeritageTimeline'
import { useState } from 'react'
import { COUNTRIES } from '../data/countries'
import { cn } from '../lib/cn'

export function TimelinePage() {
  const [filter, setFilter] = useState<string | undefined>(undefined)

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
      </div>

      {/* Country filter */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setFilter(undefined)}
          className={cn(
            'rounded-full px-4 py-2 text-sm transition',
            !filter
              ? 'bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10',
          )}
        >
          All Countries
        </button>
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition',
              filter === c.id
                ? 'bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10',
            )}
          >
            {c.emojiFlag} {c.name}
          </button>
        ))}
      </div>

      <HeritageTimeline countryId={filter} />
    </div>
  )
}
