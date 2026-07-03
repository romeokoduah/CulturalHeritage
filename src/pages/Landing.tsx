import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Sparkles, X, Clock, Building2, Globe2, Mic2, BookOpen } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

import { COUNTRIES } from '../data/countries'
import { SITES } from '../data/sites'
import type { Country } from '../lib/types'
import { HeritageVisual } from '../components/HeritageVisual'
import { AnimatedShinyText, GradientBadge } from '../components/magicui/AnimatedGradientText'
import { ShimmerButton } from '../components/magicui/ShimmerButton'
import { Marquee } from '../components/magicui/Marquee'
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid'
import { Particles } from '../components/magicui/Particles'
import { Meteors } from '../components/magicui/Meteors'
import { SparklesText } from '../components/magicui/SparklesText'
import { NumberTicker } from '../components/magicui/NumberTicker'
import { RetroGrid } from '../components/magicui/RetroGrid'
import { cn } from '../lib/cn'

/* ── Reusable animated section wrapper ── */
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ── Section heading ── */
function SectionHeading({
  kicker,
  title,
  align = 'center',
}: {
  kicker: string
  title: string
  align?: 'center' | 'left'
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(align === 'center' ? 'text-center' : 'text-left')}
    >
      <p
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400/80"
        style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}
      >
        <MapPin size={12} /> {kicker}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
    </motion.div>
  )
}

/* ── Stats data ── */
const STATS = [
  { value: 22, suffix: '+', label: 'Heritage Sites', icon: Building2 },
  { value: 4, suffix: '', label: 'Countries Explored', icon: Globe2 },
  { value: 5000, suffix: '+', label: 'Years of History', icon: Clock },
  { value: 10, suffix: '', label: 'UNESCO Sites', icon: BookOpen },
]

/* ── Features data ── */
const FEATURES = [
  {
    icon: Clock,
    title: 'Heritage Timeline',
    description: 'Travel through centuries of cultural evolution across civilizations and continents.',
    link: '/timeline',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Building2,
    title: 'Lost Architecture Simulator',
    description: 'Witness how monumental sites transformed over the course of centuries.',
    link: '/simulator',
    gradient: 'from-amber-500/20 to-orange-500/20',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: Sparkles,
    title: 'AI Storyteller',
    description: 'Chat with an AI that brings heritage to life with tales, context and wonder.',
    link: null,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    icon: Mic2,
    title: 'Voice Synthesis',
    description: 'Hear greetings spoken in local languages, dialects and tonal traditions.',
    link: null,
    gradient: 'from-purple-500/20 to-pink-500/20',
    glow: 'group-hover:shadow-purple-500/20',
  },
]

export function Landing() {
  const [selected, setSelected] = useState<Country | null>(null)

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO — globe is persistent in AppShell background ── */}
      <section className="relative h-[calc(100dvh-3.5rem)] min-h-[560px] w-full overflow-hidden">
        {/* Animated particle background */}
        <Particles className="absolute inset-0 z-0" count={60} color="#ffd166" speed={0.2} />
        {/* Meteors for visual drama */}
        <Meteors count={12} className="z-[1]" />
        {/* Radial gradient overlays — semi-transparent so globe shows through */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_30%,rgba(106,164,255,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_50%_100%,rgba(7,10,20,0.4),transparent_60%)]" />

        {/* Hero overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GradientBadge className="pointer-events-auto">
              <Sparkles size={13} className="mr-1.5 text-gold-400" />
              <AnimatedShinyText className="font-medium">AI for Cultural Heritage & Storytelling</AnimatedShinyText>
            </GradientBadge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-5 max-w-2xl text-balance font-display text-3xl font-extrabold leading-[1.05] text-slate-50 [text-shadow:0_2px_20px_rgba(0,0,0,0.5)] sm:text-5xl"
          >
            Explore humanity's
            <br className="hidden sm:block" /> <span className="gradient-text">living heritage</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mt-3 max-w-md text-balance text-sm text-slate-200/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-base"
          >
            Spin the globe, land on a country, and let an AI storyteller bring its sites, languages and legends to life.
          </motion.p>
        </div>

        {/* bottom hint / CTA */}
        {!selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-5"
          >
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
          </motion.div>
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
      <section className="relative bg-ink-950 py-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
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

      {/* ── Stats ── */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,209,102,0.04),transparent_70%)]" />
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center backdrop-blur-md transition-colors hover:border-gold-400/20"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                  <Icon size={20} />
                </div>
                <div className="font-display text-2xl font-bold sm:text-3xl">
                  <NumberTicker value={stat.value} suffix={stat.suffix} duration={2200} delay={300 + i * 150} />
                </div>
                <p className="mt-1 text-xs text-white/50">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      </AnimatedSection>

      {/* ── Countries ── */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 to-ink-900 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(106,164,255,0.05),transparent_60%)]" />
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeading kicker="Seeding the world" title="Four cultures to begin" />
          <BentoGrid className="mt-10 lg:grid-cols-2">
            {COUNTRIES.map((c, i) => {
              const firstSite = SITES.find((s) => s.countryId === c.id)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <Link to={`/country/${c.id}`} className="group block">
                    <BentoCard className={cn('h-full overflow-hidden', i === 0 && 'sm:col-span-2 lg:col-span-1')}>
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
                          {firstSite?.imageUrl ? (
                            <img
                              src={firstSite.imageUrl}
                              alt={firstSite.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <HeritageVisual motif={c.motif} color={c.colors[0]} className="h-full w-full" rounded="rounded-2xl" />
                          )}
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-xl font-bold">
                              {c.emojiFlag} {c.name}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-widest text-gold-400/80">{c.region}</p>
                          <p className="mt-2 line-clamp-3 text-sm text-white/60">{c.summary}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-white/40">
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
                </motion.div>
              )
            })}
          </BentoGrid>
        </div>
      </AnimatedSection>

      {/* ── Features Showcase ── */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-900 via-ink-950 to-ink-900 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,209,102,0.05),transparent_60%)]" />
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeading kicker="Powerful tools" title="Discover, learn, experience" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              const content = (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300',
                    'hover:border-white/[0.15] hover:bg-white/[0.04]',
                    feature.glow,
                    'hover:shadow-lg',
                  )}
                >
                  {/* Subtle gradient background */}
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100', feature.gradient)} />
                  <div className="relative z-10">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-gold-400 transition-colors group-hover:bg-gold-400/15">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-display text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{feature.description}</p>
                    {feature.link && (
                      <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Explore <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
              return feature.link ? (
                <Link key={feature.title} to={feature.link} className="block">
                  {content}
                </Link>
              ) : (
                <div key={feature.title}>{content}</div>
              )
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Mission / SDG ── */}
      <AnimatedSection className="relative overflow-hidden bg-gradient-to-b from-ink-900 to-ink-950 py-24">
        <RetroGrid className="opacity-30" />
        <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 px-4 md:grid-cols-[1.2fr_1fr]">
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
                <div key={n} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 backdrop-blur-sm">
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
            <div className="absolute h-48 w-48 rounded-full bg-gold-400/10 blur-3xl" />
            <SparklesText className="font-display text-4xl font-extrabold sm:text-5xl" sparkleColor="#ffd166">
              <span className="gradient-text">AI for Heritage</span>
            </SparklesText>
            <p className="mt-6 max-w-xs text-center text-sm text-white/50">
              Harnessing artificial intelligence to preserve and celebrate the world's cultural legacy.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 px-4 py-10 text-center text-xs text-white/40">
      <p className="font-display text-sm text-white/70">
        Culture<span className="gradient-text">Sphere</span>
      </p>
      <p className="mt-2">Built for the AI for Cultural Heritage & Storytelling challenge · SDG 4 · 8 · 11</p>
      <p className="mt-1">A Progressive Web App — install it on your phone for offline exploration.</p>
    </footer>
  )
}
