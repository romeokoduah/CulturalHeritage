import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, Globe2, Languages, MapPin } from 'lucide-react'
import { COUNTRIES_BY_ID } from '../data/countries'
import { SITES_BY_COUNTRY } from '../data/sites'
import { HeritageVisual } from '../components/HeritageVisual'
import HeritageTimeline from '../features/timeline/HeritageTimeline'
import { PixelBadge } from '../components/PixelArt'
import { Storyteller } from '../features/ai/Storyteller'
import { BentoCard, BentoGrid } from '../components/magicui/BentoGrid'
import { usePassport } from '../lib/passport'
import { cn } from '../lib/cn'
import { NotFound } from './NotFound'

export function CountryPage() {
  const { id = '' } = useParams()
  const country = COUNTRIES_BY_ID[id]
  const { state, isVisited } = usePassport()

  if (!country) return <NotFound />
  const sites = SITES_BY_COUNTRY[country.id] ?? []
  const earned = state.visitedCountries.includes(country.id)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16">
      {/* Hero */}
      <div className="relative mt-4 overflow-hidden rounded-3xl">
        <HeritageVisual motif={country.motif} color={country.colors[0]} className="h-52 w-full sm:h-64" rounded="rounded-3xl" />
        <Link
          to="/"
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-white/80 hover:text-white"
        >
          <ArrowLeft size={14} /> Globe
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/70">
                <Globe2 size={12} /> {country.region}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
                {country.emojiFlag} {country.name}
              </h1>
            </div>
            <PixelBadge colors={country.colors} emoji={country.emojiFlag} earned={earned} size={72} />
          </div>
        </div>
      </div>

      {/* Facts bento */}
      <BentoGrid className="mt-6 sm:grid-cols-2 lg:grid-cols-3">
        <BentoCard colSpan="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400/80">Heritage in brief</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{country.heritageIntro}</p>
        </BentoCard>
        <BentoCard>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400/80">
            <Languages size={12} /> Languages
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {country.languages.map((l) => (
              <span key={l} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/70">
                {l}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-widest text-white/40">Collectible</p>
          <p className="font-pixel text-[10px] leading-relaxed text-gold-400">{country.badgeLabel}</p>
        </BentoCard>
      </BentoGrid>

      {/* Sites */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Heritage sites</h2>
        <span className="text-xs text-white/40">
          {state.visitedSites.filter((s) => sites.some((x) => x.id === s)).length}/{sites.length} visited
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {sites.map((s) => (
          <Link
            key={s.id}
            to={`/site/${s.id}`}
            className="group relative flex overflow-hidden rounded-3xl glass transition hover:-translate-y-1"
          >
            <div className="w-28 shrink-0 sm:w-32 overflow-hidden">
              {s.imageUrl ? (
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                />
              ) : null}
              <HeritageVisual motif={s.motif} color={s.themeColor} className={cn("h-full w-full", s.imageUrl && "hidden")} rounded="rounded-none" />
            </div>
            <div className="min-w-0 flex-1 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                  {s.category}
                </span>
                {s.unesco && (
                  <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold text-gold-300">
                    UNESCO
                  </span>
                )}
                {isVisited(s.id) && <Check size={14} className="text-jade-400" />}
              </div>
              <h3 className="mt-1.5 font-display text-base font-bold leading-tight">{s.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-white/40">
                <MapPin size={10} /> {s.city}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-white/60">{s.tagline}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-400 opacity-0 transition group-hover:opacity-100">
                Discover <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Heritage Timeline */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold flex items-center gap-2">
          <Clock size={18} className="text-gold-400" /> Heritage Timeline
        </h2>
        <HeritageTimeline countryId={country.id} />
      </div>

      {/* AI Storyteller */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Ask about {country.name}</h2>
        <Storyteller context={{ country }} title={`${country.name} Storyteller`} />
      </div>
    </div>
  )
}
