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
  Users,
  Compass,
} from 'lucide-react'
import { COUNTRIES } from '../data/countries'
import { SITES } from '../data/sites'
import type { Country } from '../lib/types'
import { HeritageVisual } from '../components/HeritageVisual'
import { AnimatedShinyText, GradientBadge } from '../components/magicui/AnimatedGradientText'
import { ShimmerButton } from '../components/magicui/ShimmerButton'
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid'
import { Marquee } from '../components/magicui/Marquee'
import { Particles } from '../components/magicui/Particles'
import { Meteors } from '../components/magicui/Meteors'
import { SparklesText } from '../components/magicui/SparklesText'
import { NumberTicker } from '../components/magicui/NumberTicker'
import { RetroGrid } from '../components/magicui/RetroGrid'
import { TextReveal } from '../components/magicui/TextReveal'
import { cn } from '../lib/cn'

const GlobeExplorer = lazy(() =>
  import('../features/globe/GlobeExplorer').then((m) => ({ default: m.GlobeExplorer })),
)

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
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' as const }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ── Stagger animation variants ── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

/* ── Stats data ── */
const STATS = [
  { value: 150, suffix: '+', label: 'Heritage Sites', icon: Building2, color: '#ffd166' },
  { value: 45, suffix: '', label: 'Countries', icon: Globe2, color: '#a78bfa' },
  { value: 5000, suffix: '+', label: 'Years of History', icon: Clock, color: '#f97362' },
  { value: 30, suffix: '+', label: 'UNESCO Sites', icon: BookOpen, color: '#4ade80' },
]

/* ── Trending sites (top 6 most visually rich from our data) ── */
const TRENDING_IDS = [
  'cape-coast-castle',
  'great-wall-mutianyu',
  'terracotta-army',
  'temple-of-heaven',
  'tian-tan-buddha',
  'mausoleum-khoja-ahmed-yasawi',
]
const TRENDING_SITES = TRENDING_IDS.map((id) => SITES.find((s) => s.id === id)!).filter(Boolean)

/* ── Features data ── */
const FEATURES = [
  {
    icon: Clock,
    title: 'Heritage Timeline',
    description: 'Travel through centuries of cultural evolution across civilizations and continents.',
    link: '/timeline',
    gradient: 'from-[#667eea] to-[#764ba2]',
    iconColor: '#a78bfa',
  },
  {
    icon: Building2,
    title: 'Lost Architecture Simulator',
    description: 'Witness how monumental sites transformed over the course of centuries.',
    link: '/simulator',
    gradient: 'from-[#f97362] to-[#ffd166]',
    iconColor: '#ffd166',
  },
  {
    icon: Sparkles,
    title: 'AI Storyteller',
    description: 'Chat with an AI that brings heritage to life with tales, context and wonder.',
    link: null,
    gradient: 'from-[#4ade80] to-[#06b6d4]',
    iconColor: '#4ade80',
  },
  {
    icon: Mic2,
    title: 'Voice Synthesis',
    description: 'Hear greetings spoken in local languages, dialects and tonal traditions.',
    link: null,
    gradient: 'from-[#a78bfa] to-[#f97362]',
    iconColor: '#f97362',
  },
]

export function Landing() {
  const [selected, setSelected] = useState<Country | null>(null)

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════ 1. HERO SECTION ═══════════════════════════ */}
      <section className="relative h-[calc(100dvh-3.5rem)] min-h-[560px] w-full overflow-hidden bg-ink-950">
        {/* Animated particle background */}
        <Particles className="absolute inset-0 z-0" count={80} color="#ffd166" speed={0.15} />
        {/* Meteors for cinematic drama */}
        <Meteors count={16} className="z-[1]" />
        {/* Radial gradient overlays for depth */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_20%,rgba(167,139,250,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_80%_80%,rgba(249,115,98,0.1),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_50%_100%,rgba(10,10,30,0.85),transparent_60%)]" />

        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
            </div>
          }
        >
          <GlobeExplorer onSelectCountry={setSelected} />
        </Suspense>

        {/* Hero overlay text */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' as const }}
          >
            <GradientBadge className="pointer-events-auto">
              <Sparkles size={13} className="mr-1.5 text-gold-400" />
              <AnimatedShinyText className="font-medium">
                AI for Cultural Heritage & Storytelling
              </AnimatedShinyText>
            </GradientBadge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' as const }}
            className="mx-auto mt-6 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.05] text-slate-50 [text-shadow:0_4px_40px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl"
          >
            Discover humanity's
            <br className="hidden sm:block" />{' '}
            <span className="bg-gradient-to-r from-[#ffd166] via-[#f97362] to-[#a78bfa] bg-clip-text text-transparent">
              living heritage
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mx-auto mt-4 max-w-lg text-balance text-sm text-slate-200/80 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-base md:text-lg"
          >
            Spin the globe, land on a country, and let an AI storyteller bring its sites, languages and
            legends to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="pointer-events-auto mt-6"
          >
            <Link to={`/country/${COUNTRIES[0]?.id ?? 'ghana'}`}>
              <ShimmerButton className="mx-auto font-semibold">
                Start Exploring <ArrowRight size={16} className="ml-2" />
              </ShimmerButton>
            </Link>
          </motion.div>
        </div>

        {/* Country quick-select pills */}
        <AnimatePresence>
          {!selected && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-5"
            >
              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
                {COUNTRIES.map((c, i) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1 + i * 0.08 }}
                    onClick={() => setSelected(c)}
                    className="group relative rounded-full border border-white/10 bg-ink-900/60 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md transition-all duration-300 hover:border-gold-400/50 hover:bg-gold-400/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,209,102,0.15)]"
                  >
                    <span className="relative z-10">
                      {c.emojiFlag} {c.name}
                    </span>
                  </motion.button>
                ))}
              </div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/25">
                tap a glowing marker or choose a country
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Country preview sheet */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 px-4 pb-5"
            >
              <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900/80 p-5 shadow-[0_-10px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="h-18 w-18 shrink-0 overflow-hidden rounded-2xl">
                    <HeritageVisual
                      motif={selected.motif}
                      color={selected.colors[0]}
                      className="h-full w-full"
                      rounded="rounded-2xl"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold">
                        {selected.emojiFlag} {selected.name}
                      </h3>
                      <span className="rounded-full bg-gradient-to-r from-[#a78bfa]/20 to-[#f97362]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                        {selected.region}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/55">
                      {selected.summary}
                    </p>
                    <div className="mt-2 flex gap-2 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {selected.siteIds.length} sites
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe2 size={10} /> {selected.languages.length} languages
                      </span>
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
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffd166] via-[#f97362] to-[#a78bfa] py-3.5 font-semibold text-ink-950 shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,209,102,0.3)] hover:brightness-110"
                >
                  Explore {selected.name} <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════════════════════ 2. TEXT REVEAL ═══════════════════════════ */}
      <section className="relative bg-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(167,139,250,0.06),transparent_70%)]" />
        <TextReveal
          text="From the castles of Ghana's Gold Coast to the temples of Beijing, from the petroglyphs of Kazakhstan to the fishing villages of Hong Kong — we connect you to 5,000 years of human achievement."
          className="font-display text-white/90"
        />
      </section>

      {/* ═══════════════════════════ 3. STATS BAR ═══════════════════════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,209,102,0.05),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(74,222,128,0.04),transparent_50%)]" />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:gap-6"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 text-center backdrop-blur-xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(255,209,102,0.08)]"
              >
                {/* Glow blob */}
                <div
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: stat.color }}
                />
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  <Icon size={22} />
                </div>
                <div className="font-display text-3xl font-extrabold sm:text-4xl">
                  <NumberTicker
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2500}
                    delay={400 + i * 200}
                  />
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-widest text-white/40">
                  {stat.label}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatedSection>

      {/* ═══════════════════════════ 4. TRENDING HERITAGE ═══════════════════════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 to-ink-900 py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(249,115,98,0.08),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(167,139,250,0.06),transparent_50%)]" />

        <div className="mx-auto w-full max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f97362]/20 bg-[#f97362]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f97362]">
              <TrendingUp size={14} /> Trending Heritage
            </div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f97362] to-[#a78bfa] bg-clip-text text-transparent">
                Must-Visit
              </span>{' '}
              Destinations
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/50">
              The most explored heritage sites across our collection, each with stories waiting to be
              discovered.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {TRENDING_SITES.map((site) => {
              const country = COUNTRIES.find((c) => c.id === site.countryId)
              return (
                <motion.div key={site.id} variants={fadeUp}>
                  <Link
                    to={`/site/${site.id}`}
                    className="group relative block h-72 overflow-hidden rounded-3xl sm:h-80"
                  >
                    {/* Image */}
                    {site.imageUrl ? (
                      <img
                        src={site.imageUrl}
                        alt={site.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0">
                        <HeritageVisual
                          motif={site.motif}
                          color={site.themeColor}
                          className="h-full w-full"
                        />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#ffd166]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    {/* Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ffd166] backdrop-blur-md">
                      🔥 Must Visit
                    </div>
                    {/* UNESCO badge */}
                    {site.unesco && (
                      <div className="absolute right-3 top-3 rounded-full border border-[#4ade80]/20 bg-ink-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4ade80] backdrop-blur-md">
                        UNESCO
                      </div>
                    )}
                    {/* Info at bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-display text-xl font-bold text-white drop-shadow-lg">
                        {site.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-white/60">
                        <MapPin size={12} className="text-[#f97362]" />
                        {site.city}
                        {country && (
                          <>
                            <span className="text-white/20">·</span>
                            <span>
                              {country.emojiFlag} {country.name}
                            </span>
                          </>
                        )}
                      </div>
                      {/* Hover arrow */}
                      <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#ffd166] opacity-0 transition-all duration-300 group-hover:opacity-100">
                        Explore this site <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════ 5. COUNTRIES GRID ═══════════════════════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-900 via-ink-950 to-ink-950 py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(74,222,128,0.05),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,209,102,0.04),transparent_50%)]" />

        <div className="mx-auto w-full max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80]">
              <Compass size={14} /> Explore Countries
            </div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-[#4ade80] via-[#ffd166] to-[#f97362] bg-clip-text text-transparent">
                Adventure
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/50">
              Each country is a gateway to a unique tapestry of heritage, language and living tradition.
            </p>
          </motion.div>

          <BentoGrid className="lg:grid-cols-2">
            {COUNTRIES.map((c, i) => {
              const countrySites = SITES.filter((s) => s.countryId === c.id)
              const coverSite = countrySites.find((s) => s.imageUrl)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                >
                  <Link to={`/country/${c.id}`} className="group block">
                    <BentoCard className="h-full overflow-hidden">
                      <div className="flex gap-4">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                          {coverSite?.imageUrl ? (
                            <img
                              src={coverSite.imageUrl}
                              alt={coverSite.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <HeritageVisual
                              motif={c.motif}
                              color={c.colors[0]}
                              className="h-full w-full"
                              rounded="rounded-2xl"
                            />
                          )}
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                          {/* Subtle gradient on image */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-ink-950/50 to-transparent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-xl font-bold">
                              {c.emojiFlag} {c.name}
                            </h3>
                          </div>
                          <p className="mt-1 inline-block rounded-full bg-gradient-to-r from-[#ffd166]/10 to-[#f97362]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#ffd166]">
                            {c.region}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
                            {c.summary}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/50">
                              <Building2 size={10} className="text-[#a78bfa]" /> {c.siteIds.length}{' '}
                              sites
                            </span>
                            {c.languages.slice(0, 2).map((l) => (
                              <span
                                key={l}
                                className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/50"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                          {/* Hover CTA */}
                          <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#4ade80] opacity-0 transition-all duration-300 group-hover:opacity-100">
                            Explore <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </BentoCard>
                  </Link>
                </motion.div>
              )
            })}
          </BentoGrid>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <Link
              to={`/country/${COUNTRIES[0]?.id ?? 'ghana'}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[#4ade80]/30 hover:bg-[#4ade80]/5 hover:text-white hover:shadow-[0_0_30px_rgba(74,222,128,0.1)]"
            >
              <Users size={16} className="text-[#4ade80]" /> View All Countries{' '}
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════ 6. GREETINGS MARQUEE ═══════════════════════════ */}
      <section className="relative overflow-hidden bg-ink-950 py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f97362]/40 to-transparent" />
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,209,102,0.03),transparent_70%)]" />

        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/25">
            Greetings from around the world
          </p>
        </div>

        <Marquee pauseOnHover className="[--duration:45s]">
          {SITES.map((s, i) => {
            const colors = ['#ffd166', '#f97362', '#a78bfa', '#4ade80']
            const borderColor = colors[i % colors.length]
            return (
              <Link
                key={s.id}
                to={`/site/${s.id}`}
                className="mx-1.5 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  border: `1px solid ${borderColor}25`,
                  background: `${borderColor}08`,
                }}
              >
                <span
                  className="font-pixel text-[11px] font-bold"
                  style={{ color: borderColor }}
                >
                  {s.greeting.phrase}
                </span>
                <span className="text-white/20">|</span>
                <span className="text-white/60">{s.name}</span>
              </Link>
            )
          })}
        </Marquee>
      </section>

      {/* ═══════════════════════════ 7. FEATURES SHOWCASE ═══════════════════════════ */}
      <AnimatedSection className="relative bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(167,139,250,0.06),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,209,102,0.04),transparent_50%)]" />

        <div className="mx-auto w-full max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/20 bg-[#a78bfa]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
              <Sparkles size={14} /> Powerful Tools
            </div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">
              Discover, Learn,{' '}
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#f97362] to-[#ffd166] bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              const card = (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05]"
                >
                  {/* Gradient glow on hover */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                      `${feature.gradient}`,
                    )}
                    style={{ opacity: 0 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
                    style={{ backgroundImage: `linear-gradient(135deg, ${feature.iconColor}20, transparent)` }}
                  />
                  {/* Corner glow */}
                  <div
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{ background: feature.iconColor }}
                  />

                  <div className="relative z-10">
                    <div
                      className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `${feature.iconColor}12`,
                        color: feature.iconColor,
                      }}
                    >
                      <Icon size={26} />
                    </div>
                    <h3 className="font-display text-xl font-bold">{feature.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/45">
                      {feature.description}
                    </p>
                    {feature.link && (
                      <div
                        className="mt-5 flex items-center gap-1.5 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100"
                        style={{ color: feature.iconColor }}
                      >
                        Explore <ArrowRight size={14} />
                      </div>
                    )}
                    {!feature.link && (
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-white/25 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        Coming soon
                      </div>
                    )}
                  </div>
                </motion.div>
              )
              return feature.link ? (
                <Link key={feature.title} to={feature.link} className="block">
                  {card}
                </Link>
              ) : (
                <div key={feature.title}>{card}</div>
              )
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════ 8. MISSION SECTION ═══════════════════════════ */}
      <AnimatedSection className="relative overflow-hidden bg-gradient-to-b from-ink-950 to-ink-900 py-28">
        <RetroGrid className="opacity-20" />
        {/* Extra glow layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,209,102,0.08),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(167,139,250,0.06),transparent_50%)]" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-4 md:grid-cols-[1.2fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffd166]/20 bg-[#ffd166]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd166]">
                <BookOpen size={14} /> Why It Matters
              </div>
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">
                Heritage,{' '}
                <span className="bg-gradient-to-r from-[#ffd166] to-[#f97362] bg-clip-text text-transparent">
                  reimagined
                </span>{' '}
                by AI
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55">
                HeritageQuest helps preserve, interpret and share the stories, languages and community
                knowledge behind the world's heritage — making them explorable, interactive and alive
                for a new generation.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {[
                ['SDG 4', 'Quality Education', '#4ade80'],
                ['SDG 8', 'Decent Work & Growth', '#ffd166'],
                ['SDG 11', 'Sustainable Communities', '#a78bfa'],
              ].map(([n, l, color]) => (
                <motion.div
                  key={n}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  <div className="font-display text-sm font-bold" style={{ color: color as string }}>
                    {n}
                  </div>
                  <div className="text-[11px] text-white/45">{l}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10"
            >
              <Link to="/country/ghana">
                <ShimmerButton className="font-semibold">
                  Start the journey <ArrowRight size={16} className="ml-2" />
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative grid place-items-center py-12"
          >
            {/* Layered glowing orbs */}
            <div className="absolute h-64 w-64 rounded-full bg-[#ffd166]/10 blur-[80px]" />
            <div className="absolute h-40 w-40 translate-x-12 translate-y-8 rounded-full bg-[#a78bfa]/10 blur-[60px]" />
            <div className="absolute h-32 w-32 -translate-x-8 -translate-y-6 rounded-full bg-[#f97362]/10 blur-[50px]" />

            <SparklesText
              className="font-display text-5xl font-extrabold sm:text-6xl md:text-7xl"
              sparkleColor="#ffd166"
            >
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f97362] to-[#a78bfa] bg-clip-text text-transparent">
                AI for Heritage
              </span>
            </SparklesText>
            <p className="mt-8 max-w-xs text-center text-sm leading-relaxed text-white/45">
              Harnessing artificial intelligence to preserve and celebrate the world's cultural legacy
              for future generations.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════ 9. FOOTER ═══════════════════════════ */}
      <Footer />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.05] bg-ink-950 px-4 py-14 text-center">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,209,102,0.04),transparent_60%)]" />
      <div className="relative z-10">
        <p className="font-display text-lg font-bold text-white/80">
          Heritage<span className="bg-gradient-to-r from-[#ffd166] via-[#f97362] to-[#a78bfa] bg-clip-text text-transparent">Quest</span>
        </p>
        <p className="mt-3 text-xs text-white/35">
          Built for the AI for Cultural Heritage & Storytelling challenge · SDG 4 · 8 · 11
        </p>
        <p className="mt-1.5 text-xs text-white/25">
          A Progressive Web App — install it on your phone for offline exploration.
        </p>
      </div>
    </footer>
  )
}
