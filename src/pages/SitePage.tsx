import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Check, Lightbulb, MapPin, Volume2 } from 'lucide-react'
import { SITES_BY_ID } from '../data/sites'
import { COUNTRIES_BY_ID } from '../data/countries'
import { HeritageVisual } from '../components/HeritageVisual'
import { SketchfabViewer } from '../features/site/SketchfabViewer'
import { Storyteller } from '../features/ai/Storyteller'
import { BentoCard, BentoGrid } from '../components/magicui/BentoGrid'
import { usePassport } from '../lib/passport'
import { cn } from '../lib/cn'
import { NotFound } from './NotFound'

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.85
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {
    /* not supported */
  }
}

export function SitePage() {
  const { id = '' } = useParams()
  const site = SITES_BY_ID[id]
  const { isVisited, toggleSite } = usePassport()

  if (!site) return <NotFound />
  const country = COUNTRIES_BY_ID[site.countryId]
  const visited = isVisited(site.id)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 pt-4 text-xs text-white/50">
        <Link to="/" className="flex items-center gap-1 hover:text-white">
          <ArrowLeft size={13} /> Globe
        </Link>
        <span>/</span>
        {country && (
          <Link to={`/country/${country.id}`} className="hover:text-white">
            {country.emojiFlag} {country.name}
          </Link>
        )}
      </div>

      {/* Title */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/60">
          {site.category}
        </span>
        {site.unesco && (
          <span className="rounded-full bg-gold-400/20 px-2.5 py-1 text-[10px] font-semibold text-gold-300">
            UNESCO World Heritage
          </span>
        )}
        <span className="text-[11px] text-white/40">{site.yearsLabel}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{site.name}</h1>
      {site.localName && <p className="mt-1 text-lg text-white/50">{site.localName}</p>}
      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
        <MapPin size={13} /> {site.city}
      </p>
      <p className="mt-3 max-w-2xl text-balance text-white/70">{site.tagline}</p>

      {/* Hero image */}
      {site.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-3xl">
          <img
            src={site.imageUrl}
            alt={site.name}
            className="w-full h-48 sm:h-64 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* 3D viewer */}
      <div className="mt-6">
        <SketchfabViewer site={site} />
      </div>

      {/* Visit toggle */}
      <button
        onClick={() => toggleSite(site.id, site.countryId)}
        className={cn(
          'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition',
          visited
            ? 'bg-jade-500/15 text-jade-400 ring-1 ring-jade-500/30'
            : 'bg-gradient-to-r from-gold-400 to-clay-500 text-abyss hover:brightness-105',
        )}
      >
        {visited ? (
          <>
            <Check size={18} /> Visited — badge earned
          </>
        ) : (
          <>
            <BadgeCheck size={18} /> Mark as visited & earn a badge
          </>
        )}
      </button>

      {/* Greeting */}
      <div className="mt-6 overflow-hidden rounded-3xl glass p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-400/80">Say hello in {site.greeting.language}</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold text-white">{site.greeting.phrase}</p>
            <p className="text-sm text-white/50">
              <span className="font-pixel text-[10px] text-gold-400">{site.greeting.pronounce}</span> — “{site.greeting.meaning}”
            </p>
          </div>
          <button
            onClick={() => speak(site.greeting.phrase)}
            className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Pronounce"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      {/* Story */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold">The story</h2>
        <p className="mt-3 whitespace-pre-line leading-relaxed text-white/75">{site.story}</p>
      </div>

      {/* Fun facts */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
          <Lightbulb size={18} className="text-gold-400" /> Did you know?
        </h2>
        <BentoGrid className="sm:grid-cols-3">
          {site.funFacts.map((f, i) => (
            <BentoCard key={i}>
              <div className="font-pixel text-[10px] text-gold-400">FACT {i + 1}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{f}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>

      {/* Gallery */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">Gallery</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {site.gallery.map((g, i) => (
            <figure key={i} className="overflow-hidden rounded-2xl glass group">
              {g.imageUrl ? (
                <img
                  src={g.imageUrl}
                  alt={g.caption}
                  className="aspect-square w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                />
              ) : null}
              <HeritageVisual motif={g.motif} color={site.themeColor} className={cn("aspect-square w-full", g.imageUrl && "hidden")} rounded="rounded-none" />
              <figcaption className="px-3 py-2 text-[11px] text-white/50">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Storyteller */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Chat with the Storyteller</h2>
        <Storyteller context={{ site, country }} title={site.name} />
      </div>
    </div>
  )
}
