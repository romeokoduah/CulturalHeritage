import { Suspense, lazy, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Sparkles, X } from 'lucide-react'

const GlobeExplorer = lazy(() =>
  import('../features/globe/GlobeExplorer').then((m) => ({ default: m.GlobeExplorer })),
)
import { COUNTRIES } from '../data/countries'
import { SITES } from '../data/sites'
import type { Country } from '../lib/types'
import { HeritageVisual } from '../components/HeritageVisual'
import { MascotGlobe } from '../components/PixelArt'
import { AnimatedShinyText, GradientBadge } from '../components/magicui/AnimatedGradientText'
import { ShimmerButton } from '../components/magicui/ShimmerButton'
import { Marquee } from '../components/magicui/Marquee'
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid'
import { cn } from '../lib/cn'

export function Landing() {
  const [selected, setSelected] = useState<Country | null>(null)

  return (
    <div>
      {/* ── HERO with globe ── */}
      <section className="relative h-[calc(100dvh-3.5rem)] min-h-[560px] w-full overflow-hidden bg-grid">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(106,164,255,0.15),transparent_60%)]" />
        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-gold-400" />
            </div>
          }
        >
          <GlobeExplorer onSelectCountry={setSelected} />
        </Suspense>

        {/* Hero overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-6 text-center">
          <GradientBadge className="pointer-events-auto">
            <Sparkles size={13} className="mr-1.5 text-gold-400" />
            <AnimatedShinyText className="font-medium">AI for Cultural Heritage & Storytelling</AnimatedShinyText>
          </GradientBadge>
          <h1 className="mx-auto mt-5 max-w-2xl text-balance font-display text-3xl font-extrabold leading-[1.05] text-slate-50 [text-shadow:0_2px_20px_rgba(0,0,0,0.5)] sm:text-5xl">
            Explore humanity's
            <br className="hidden sm:block" /> <span className="gradient-text">living heritage</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-balance text-sm text-slate-200/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-base">
            Spin the globe, land on a country, and let an AI storyteller bring its sites, languages and legends to life.
          </p>
        </div>

        {/* bottom hint / CTA */}
        {!selected && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-5">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="rounded-full border border-white/10 bg-ink-900/70 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition hover:border-gold-400/40 hover:text-white"
                >
                  {c.emojiFlag} {c.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">tap a glowing marker</p>
          </div>
        )}

        {/* Country preview sheet */}
        {selected && (
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 animate-fade-up px-4 pb-5">
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl glass p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0">
                  <HeritageVisual motif={selected.motif} color={selected.colors[0]} className="h-full w-full" rounded="rounded-2xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">
                      {selected.emojiFlag} {selected.name}
                    </h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">{selected.region}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-white/60">{selected.summary}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 text-white/50 hover:text-white" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <Link
                to={`/country/${selected.id}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-400 to-clay-500 py-3 font-semibold text-abyss transition hover:brightness-105"
              >
                Explore {selected.name} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Marquee of greetings ── */}
      <section className="border-y border-white/5 bg-ink-900/40 py-4">
        <Marquee pauseOnHover className="[--duration:38s]">
          {SITES.map((s) => (
            <Link
              key={s.id}
              to={`/site/${s.id}`}
              className="mx-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-gold-400/40 hover:text-white"
            >
              <span className="font-pixel text-[10px] text-gold-400">{s.greeting.phrase}</span>
              <span className="text-white/30">·</span>
              {s.name}
            </Link>
          ))}
        </Marquee>
      </section>

      {/* ── Countries ── */}
      <section id="countries" className="mx-auto w-full max-w-5xl px-4 py-14">
        <SectionHeading kicker="Seeding the world" title="Four cultures to begin" />
        <BentoGrid className="mt-8 lg:grid-cols-2">
          {COUNTRIES.map((c, i) => (
            <Link key={c.id} to={`/country/${c.id}`} className="block">
              <BentoCard className={cn('h-full', i === 0 && 'sm:col-span-2 lg:col-span-1')}>
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                    <HeritageVisual motif={c.motif} color={c.colors[0]} className="h-full w-full" rounded="rounded-2xl" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold">
                        {c.emojiFlag} {c.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-widest text-gold-400/80">{c.region}</p>
                    <p className="mt-2 line-clamp-3 text-sm text-white/60">{c.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.siteIds.length} sites ·{' '}
                      {c.languages.slice(0, 2).map((l) => (
                        <span key={l} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </BentoCard>
            </Link>
          ))}
        </BentoGrid>
      </section>

      {/* ── Mission / SDG ── */}
      <section className="border-t border-white/5 bg-gradient-to-b from-ink-900/40 to-transparent py-16">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-4 md:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading kicker="Why it matters" title="Heritage, reimagined by AI" align="left" />
            <p className="mt-4 max-w-xl text-white/60">
              CultureSphere helps preserve, interpret and share the stories, languages and community knowledge behind the
              world's heritage — making them explorable, interactive and alive for a new generation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                ['SDG 4', 'Quality Education'],
                ['SDG 8', 'Decent Work & Growth'],
                ['SDG 11', 'Sustainable Communities'],
              ].map(([n, l]) => (
                <div key={n} className="rounded-2xl glass px-3 py-2">
                  <div className="font-display text-sm font-bold text-gold-400">{n}</div>
                  <div className="text-[11px] text-white/50">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/country/ghana">
                <ShimmerButton className="font-semibold">
                  Start the journey in Ghana <ArrowRight size={16} className="ml-2" />
                </ShimmerButton>
              </Link>
            </div>
          </div>
          <div className="relative grid place-items-center">
            <div className="absolute h-40 w-40 rounded-full bg-gold-400/10 blur-3xl" />
            <MascotGlobe size={150} />
            <div className="mt-4 rounded-2xl glass px-4 py-3 text-center">
              <p className="font-pixel text-[10px] leading-relaxed text-gold-400">KOFI THE EXPLORER</p>
              <p className="mt-1 text-xs text-white/50">Your pixel guide across the globe</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function SectionHeading({
  kicker,
  title,
  align = 'center',
}: {
  kicker: string
  title: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left')}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400/80" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <MapPin size={12} /> {kicker}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-10 text-center text-xs text-white/40">
      <p className="font-display text-sm text-white/70">
        Culture<span className="gradient-text">Sphere</span>
      </p>
      <p className="mt-2">Built for the AI for Cultural Heritage & Storytelling challenge · SDG 4 · 8 · 11</p>
      <p className="mt-1">A Progressive Web App — install it on your phone for offline exploration.</p>
    </footer>
  )
}
