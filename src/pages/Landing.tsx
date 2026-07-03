import { Suspense, lazy, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  MapPin,
  Sparkles,
  X,
  Clock,
  Building2,
  Globe2,
  Mic2,
  BookOpen,
  TrendingUp,
  Compass,
} from 'lucide-react'
import { COUNTRIES } from '../data/countries'
import { SITES } from '../data/sites'
import type { Country } from '../lib/types'
import { HeritageVisual } from '../components/HeritageVisual'
import { ShimmerButton } from '../components/magicui/ShimmerButton'
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid'
import { Marquee } from '../components/magicui/Marquee'
import { NumberTicker } from '../components/magicui/NumberTicker'
import { RetroGrid } from '../components/magicui/RetroGrid'
// cn available if needed

const GlobeExplorer = lazy(() =>
  import('../features/globe/GlobeExplorer').then((m) => ({ default: m.GlobeExplorer })),
)

/* ── Reusable animated section wrapper ── */
function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ── Stats data ── */
const STATS = [
  { value: 150, suffix: '+', label: 'Heritage Sites', icon: Building2, color: '#ffd166' },
  { value: 45, suffix: '', label: 'Countries', icon: Globe2, color: '#a78bfa' },
  { value: 5000, suffix: '+', label: 'Years of History', icon: Clock, color: '#f97362' },
  { value: 30, suffix: '+', label: 'UNESCO Sites', icon: BookOpen, color: '#4ade80' },
]

/* ── Trending sites ── */
const TRENDING_IDS = [
  'pyramids-of-giza',
  'angkor-wat',
  'taj-mahal',
  'colosseum',
  'alhambra-granada',
  'mount-fuji',
]
const TRENDING_SITES = TRENDING_IDS.map((id) => SITES.find((s) => s.id === id)!).filter(Boolean)

/* ── Features data ── */
const FEATURES = [
  { icon: Clock, title: 'Heritage Timeline', description: 'Travel through centuries of cultural evolution across civilizations.', link: '/timeline', iconColor: '#a78bfa' },
  { icon: Building2, title: 'Lost Architecture Simulator', description: 'Witness how sites transformed over centuries.', link: '/simulator', iconColor: '#ffd166' },
  { icon: Sparkles, title: 'AI Storyteller', description: 'Chat with an AI that brings heritage to life.', link: null, iconColor: '#4ade80' },
  { icon: Mic2, title: 'Voice Synthesis', description: 'Hear greetings spoken in local languages.', link: null, iconColor: '#f97362' },
]

export function Landing() {
  const [selected, setSelected] = useState<Country | null>(null)

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════ HERO — Globe only, no flickering effects ═══════════ */}
      <section className="relative h-[calc(100dvh-3.5rem)] min-h-[560px] w-full overflow-hidden bg-ink-950">
        {/* Subtle gradient overlays */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_20%,rgba(167,139,250,0.1),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_50%_100%,rgba(7,10,20,0.7),transparent_60%)]" />

        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
            </div>
          }
        >
          <GlobeExplorer onSelectCountry={setSelected} />
        </Suspense>

        {/* Hero text overlay — static, no flickering animations */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-6 text-center">
          <div className="pointer-events-auto mx-auto inline-flex items-center gap-1.5 rounded-full border border-gold-400/20 bg-gold-400/10 px-4 py-1.5">
            <Sparkles size={13} className="text-gold-400" />
            <span className="text-xs font-semibold text-gold-400">AI for Cultural Heritage & Storytelling</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.05] text-slate-50 [text-shadow:0_4px_40px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl">
            Discover humanity's{' '}
            <span className="gradient-text">living heritage</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-balance text-sm text-slate-200/80 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-base">
            Spin the globe, click on a pin, and let an AI storyteller bring its sites, languages and legends to life.
          </p>

          <div className="pointer-events-auto mt-6">
            <Link to={`/country/${COUNTRIES[0]?.id ?? 'ghana'}`}>
              <ShimmerButton className="mx-auto font-semibold">
                Start Exploring <ArrowRight size={16} className="ml-2" />
              </ShimmerButton>
            </Link>
          </div>
        </div>

        {/* Hint — no country pills list, just a simple instruction */}
        <AnimatePresence>
          {!selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-6 z-20 text-center"
            >
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/30">
                click any pin on the globe to explore
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Country preview card — full details */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 px-4 pb-5"
            >
              <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900/90 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  {/* Country image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    {(() => {
                      const coverSite = SITES.find((s) => s.countryId === selected.id && s.imageUrl)
                      return coverSite?.imageUrl ? (
                        <img src={coverSite.imageUrl} alt={selected.name} className="h-full w-full object-cover" />
                      ) : (
                        <HeritageVisual motif={selected.motif} color={selected.colors[0]} className="h-full w-full" rounded="rounded-2xl" />
                      )
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold">
                        {selected.emojiFlag} {selected.name}
                      </h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                        {selected.region}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">{selected.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {selected.siteIds.length} sites
                      </span>
                      <span>·</span>
                      {selected.languages.slice(0, 3).map((l) => (
                        <span key={l} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{l}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                <Link
                  to={`/country/${selected.id}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-400 to-clay-500 py-3.5 font-semibold text-abyss transition hover:brightness-110"
                >
                  Explore {selected.name} <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 py-20">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center backdrop-blur-md"
              >
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  <Icon size={20} />
                </div>
                <div className="font-display text-2xl font-extrabold sm:text-3xl">
                  <NumberTicker value={stat.value} suffix={stat.suffix} duration={2500} />
                </div>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-white/40">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </AnimatedSection>

      {/* ═══════════ TRENDING ═══════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 to-ink-900 py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-clay-400/20 bg-clay-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-clay-400">
              <TrendingUp size={13} /> Must Visit
            </div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Trending <span className="gradient-text">Destinations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRENDING_SITES.map((site) => {
              const country = COUNTRIES.find((c) => c.id === site.countryId)
              return (
                <Link key={site.id} to={`/site/${site.id}`} className="group relative block h-72 overflow-hidden rounded-3xl">
                  {site.imageUrl ? (
                    <img src={site.imageUrl} alt={site.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0">
                      <HeritageVisual motif={site.motif} color={site.themeColor} className="h-full w-full" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 text-[11px] font-bold text-gold-400 backdrop-blur-md">
                    🔥 Must Visit
                  </div>
                  {site.unesco && (
                    <div className="absolute right-3 top-3 rounded-full border border-jade-400/20 bg-ink-950/70 px-2 py-1 text-[10px] font-bold text-jade-400 backdrop-blur-md">
                      UNESCO
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-lg font-bold drop-shadow-lg">{site.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                      <MapPin size={11} /> {site.city}
                      {country && <span>· {country.emojiFlag} {country.name}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════ COUNTRIES GRID ═══════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-900 to-ink-950 py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-jade-400/20 bg-jade-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-jade-400">
              <Compass size={13} /> Explore Countries
            </div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Choose Your <span className="gradient-text">Adventure</span>
            </h2>
          </div>

          <BentoGrid className="lg:grid-cols-2">
            {COUNTRIES.slice(0, 12).map((c) => {
              const coverSite = SITES.find((s) => s.countryId === c.id && s.imageUrl)
              return (
                <Link key={c.id} to={`/country/${c.id}`} className="group block">
                  <BentoCard className="h-full overflow-hidden">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
                        {coverSite?.imageUrl ? (
                          <img src={coverSite.imageUrl} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <HeritageVisual motif={c.motif} color={c.colors[0]} className="h-full w-full" rounded="rounded-2xl" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold">{c.emojiFlag} {c.name}</h3>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400">{c.region}</p>
                        <p className="mt-1.5 line-clamp-2 text-sm text-white/55">{c.summary}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                          <span>{c.siteIds.length} sites</span>
                          <span>·</span>
                          <span>{c.languages[0]}</span>
                        </div>
                      </div>
                    </div>
                  </BentoCard>
                </Link>
              )
            })}
          </BentoGrid>
        </div>
      </AnimatedSection>

      {/* ═══════════ GREETINGS MARQUEE ═══════════ */}
      <section className="relative bg-ink-950 py-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
        <Marquee pauseOnHover className="[--duration:60s]">
          {SITES.slice(0, 40).map((s) => (
            <Link
              key={s.id}
              to={`/site/${s.id}`}
              className="mx-1.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:border-gold-400/30 hover:text-white"
            >
              <span className="font-pixel text-[10px] text-gold-400">{s.greeting.phrase}</span>
              <span className="text-white/20">·</span>
              {s.name}
            </Link>
          ))}
        </Marquee>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 to-ink-900 py-20">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Powerful <span className="gradient-text">Tools</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon
              const card = (
                <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md transition hover:border-white/[0.12] hover:bg-white/[0.04]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${f.iconColor}15`, color: f.iconColor }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/50">{f.description}</p>
                  {f.link && (
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gold-400 opacity-0 transition group-hover:opacity-100">
                      Explore <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              )
              return f.link ? (
                <Link key={f.title} to={f.link}>{card}</Link>
              ) : (
                <div key={f.title}>{card}</div>
              )
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════ MISSION ═══════════ */}
      <AnimatedSection className="relative overflow-hidden bg-gradient-to-b from-ink-900 to-ink-950 py-20">
        <RetroGrid className="opacity-15" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Heritage, <span className="gradient-text">reimagined</span> by AI
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/55">
            HeritageQuest helps preserve, interpret and share the stories, languages and community
            knowledge behind the world's heritage — making them explorable, interactive and alive.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              ['SDG 4', 'Quality Education', '#4ade80'],
              ['SDG 8', 'Decent Work & Growth', '#ffd166'],
              ['SDG 11', 'Sustainable Communities', '#a78bfa'],
            ].map(([n, l, color]) => (
              <div key={n} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
                <div className="font-display text-sm font-bold" style={{ color: color as string }}>{n}</div>
                <div className="text-[11px] text-white/40">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/country/ghana">
              <ShimmerButton className="font-semibold">
                Start the journey <ArrowRight size={16} className="ml-2" />
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 px-4 py-10 text-center">
      <p className="font-display text-base font-bold text-white/80">
        Heritage<span className="gradient-text">Quest</span>
      </p>
      <p className="mt-2 text-xs text-white/35">Built for the AI for Cultural Heritage & Storytelling challenge · SDG 4 · 8 · 11</p>
      <p className="mt-1 text-xs text-white/25">A Progressive Web App — install it on your phone for offline exploration.</p>
    </footer>
  )
}
