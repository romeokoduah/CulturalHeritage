import { Link } from 'react-router-dom'
import { MapPin, Sparkles, Trophy } from 'lucide-react'
import { COUNTRIES } from '../data/countries'
import { SITES, SITES_BY_ID } from '../data/sites'
import { MascotGlobe, PixelBadge } from '../components/PixelArt'
import { usePassport } from '../lib/passport'
import { HeritageVisual } from '../components/HeritageVisual'

export function PassportPage() {
  const { state } = usePassport()
  const visitedCount = state.visitedSites.length
  const total = SITES.length
  const pct = Math.round((visitedCount / total) * 100)
  const countriesEarned = state.visitedCountries.length

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Header */}
      <div className="mt-6 flex items-center gap-4 rounded-3xl glass p-5">
        <MascotGlobe size={80} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400/80">
            <Trophy size={13} /> Explorer Passport
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold">Your journey</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-semibold text-white/70">{pct}%</span>
          </div>
          <p className="mt-2 text-xs text-white/50">
            {visitedCount} of {total} sites · {countriesEarned} of {COUNTRIES.length} country badges
          </p>
        </div>
      </div>

      {/* Badges */}
      <h2 className="mb-4 mt-8 font-display text-lg font-bold">Country badges</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {COUNTRIES.map((c) => {
          const earned = state.visitedCountries.includes(c.id)
          return (
            <Link key={c.id} to={`/country/${c.id}`} className="flex flex-col items-center gap-2 rounded-3xl glass p-4 text-center transition hover:-translate-y-1">
              <PixelBadge colors={c.colors} emoji={c.emojiFlag} earned={earned} size={84} />
              <p className="font-display text-sm font-bold">{c.name}</p>
              <p className="font-pixel text-[8px] leading-relaxed text-gold-400/80">{earned ? c.badgeLabel : 'LOCKED'}</p>
            </Link>
          )
        })}
      </div>

      {/* Visited sites */}
      <h2 className="mb-4 mt-10 font-display text-lg font-bold">Places you've explored</h2>
      {visitedCount === 0 ? (
        <div className="rounded-3xl glass p-8 text-center">
          <Sparkles className="mx-auto text-gold-400" />
          <p className="mt-3 text-white/60">No stamps yet. Spin the globe and mark a site as visited to earn your first badge.</p>
          <Link to="/" className="mt-4 inline-block rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-abyss">
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.visitedSites.map((sid) => {
            const s = SITES_BY_ID[sid]
            if (!s) return null
            return (
              <Link key={sid} to={`/site/${sid}`} className="flex items-center gap-3 overflow-hidden rounded-2xl glass transition hover:-translate-y-0.5">
                <div className="h-16 w-16 shrink-0">
                  <HeritageVisual motif={s.motif} color={s.themeColor} className="h-full w-full" rounded="rounded-none" />
                </div>
                <div className="min-w-0 flex-1 py-2 pr-3">
                  <p className="truncate font-display text-sm font-bold">{s.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-white/40">
                    <MapPin size={10} /> {s.city}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
