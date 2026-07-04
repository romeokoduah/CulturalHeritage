import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Trophy, Sparkles, MapPin, BadgeCheck, ArrowRight, TrendingUp, Globe2, Clock } from 'lucide-react'
import {
  topByCategory,
  legends,
  regionalHalls,
  hiddenGems,
  wonderOfMonth,
  siteOfDay,
  HALL_CATEGORIES,
} from '../lib/halloffame'
import { COUNTRIES_BY_ID } from '../data/countries'
import { HeritageVisual } from '../components/HeritageVisual'
import { cn } from '../lib/cn'
import type { HeritageSite } from '../lib/types'

type Category = (typeof HALL_CATEGORIES)[number]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp} className={className}>
      {children}
    </motion.div>
  )
}

function flagOf(site: HeritageSite): string {
  return COUNTRIES_BY_ID[site.countryId]?.emojiFlag ?? '🌍'
}

/** Small inline laurel/medal wreath — used for medal emphasis on top legends. */
function Laurel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3c-2.5 2.5-3 6-1.5 9.5C6 16 9 18 12 18" />
      <path d="M18 3c2.5 2.5 3 6 1.5 9.5C18 16 15 18 12 18" />
      <path d="M12 18v3" />
      <circle cx="12" cy="10" r="1.4" />
    </svg>
  )
}

/** Category chip in the site's theme color. */
function CategoryChip({ site }: { site: HeritageSite }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ backgroundColor: `${site.themeColor}25`, color: site.themeColor }}
    >
      {site.category}
    </span>
  )
}

function UnescoBadge() {
  return (
    <span className="flex items-center gap-0.5 rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold text-gold-300">
      <BadgeCheck size={11} /> UNESCO
    </span>
  )
}

/** The reusable site card used across category, regional and hidden-gem grids. */
function SiteCard({ site, rank }: { site: HeritageSite; rank?: number }) {
  return (
    <Link
      to={`/site/${site.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative h-36 w-full overflow-hidden">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <HeritageVisual
          motif={site.motif}
          color={site.themeColor}
          rounded="rounded-none"
          className={cn('h-full w-full', site.imageUrl && 'hidden')}
        />
        {typeof rank === 'number' && (
          <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-abyss/70 font-display text-xs font-bold tabular-nums text-gold-300 backdrop-blur-md">
            {rank}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryChip site={site} />
          {site.unesco && <UnescoBadge />}
        </div>
        <h3 className="mt-2 font-display text-base font-bold leading-tight">{site.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-white/40">
          <MapPin size={10} /> {site.city} <span aria-hidden="true">{flagOf(site)}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-white/60">{site.tagline}</p>
        <span
          className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium opacity-0 transition group-hover:opacity-100"
          style={{ color: site.themeColor }}
        >
          Discover <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}

/** Ranked gold plaque for the Legends list. Top 3 get medal emphasis. */
function LegendPlaque({ site, rank }: { site: HeritageSite; rank: number }) {
  const isMedal = rank <= 3
  const medalTone = rank === 1 ? '#ffd166' : rank === 2 ? '#d7dbe6' : '#e0a066'
  return (
    <Link
      to={`/site/${site.id}`}
      className={cn(
        'group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-3 backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
        isMedal ? 'border-gold-400/30 bg-gold-400/[0.06]' : 'border-white/10 bg-white/[0.03] hover:border-white/20',
      )}
    >
      {/* Rank */}
      <div className="relative flex w-10 shrink-0 flex-col items-center justify-center">
        {isMedal && <Laurel className="absolute h-11 w-11 opacity-60" />}
        <span
          className="relative z-10 font-display text-2xl font-extrabold tabular-nums"
          style={{ color: isMedal ? medalTone : undefined }}
        >
          <span className="text-sm font-semibold text-white/40">#</span>
          {rank}
        </span>
      </div>

      {/* Thumb */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <HeritageVisual
          motif={site.motif}
          color={site.themeColor}
          rounded="rounded-none"
          className={cn('h-full w-full', site.imageUrl && 'hidden')}
        />
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-bold leading-tight sm:text-base">{site.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <CategoryChip site={site} />
          {site.unesco && <UnescoBadge />}
        </div>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-white/40">
          <MapPin size={10} /> {site.city} <span aria-hidden="true">{flagOf(site)}</span>
        </p>
      </div>

      {isMedal && (
        <Trophy size={18} className="mr-1 hidden shrink-0 sm:block" style={{ color: medalTone }} aria-hidden="true" />
      )}
    </Link>
  )
}

/** Big feature card for the Wonder of the Month, with a gold ribbon. */
function WonderFeature({ site }: { site: HeritageSite }) {
  return (
    <Link
      to={`/site/${site.id}`}
      className="group relative block overflow-hidden rounded-3xl border border-gold-400/25 bg-white/[0.03] backdrop-blur-xl transition hover:border-gold-400/50 hover:shadow-xl hover:shadow-gold-400/10"
    >
      <div className="relative h-64 w-full overflow-hidden sm:h-80">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <HeritageVisual
          motif={site.motif}
          color={site.themeColor}
          rounded="rounded-none"
          className={cn('h-full w-full', site.imageUrl && 'hidden')}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent" />

        {/* Gold ribbon */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-abyss shadow-lg shadow-gold-400/30">
          <Trophy size={13} /> Wonder of the Month
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip site={site} />
            {site.unesco && <UnescoBadge />}
          </div>
          <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl">
            {site.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
            <MapPin size={13} /> {site.city} <span aria-hidden="true">{flagOf(site)}</span>
          </p>
          <p className="mt-2 max-w-xl text-sm text-white/70">{site.tagline}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300">
            Explore this wonder <ArrowRight size={14} className="transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Slimmer feature strip for the Site of the Day. */
function DayFeature({ site }: { site: HeritageSite }) {
  return (
    <Link
      to={`/site/${site.id}`}
      className="group relative flex items-stretch overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative w-32 shrink-0 overflow-hidden sm:w-48">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <HeritageVisual
          motif={site.motif}
          color={site.themeColor}
          rounded="rounded-none"
          className={cn('h-full w-full', site.imageUrl && 'hidden')}
        />
      </div>
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-400">
          <Clock size={12} /> Site of the Day
        </p>
        <h3 className="mt-1.5 font-display text-lg font-bold leading-tight sm:text-xl">{site.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <CategoryChip site={site} />
          {site.unesco && <UnescoBadge />}
        </div>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-white/40">
          <MapPin size={10} /> {site.city} <span aria-hidden="true">{flagOf(site)}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-white/60">{site.tagline}</p>
      </div>
    </Link>
  )
}

function SectionHeading({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  accent?: string
}) {
  return (
    <div className="mb-4 mt-12">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
        <span style={{ color: accent }}>{icon}</span> {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
    </div>
  )
}

export function HallOfFamePage() {
  const wonder = wonderOfMonth()
  const dayly = siteOfDay()
  const legendSites = legends(12)
  const regions = regionalHalls()
  const gems = hiddenGems(6)

  const [activeCategory, setActiveCategory] = useState<Category>(HALL_CATEGORIES[0])
  const categorySites = topByCategory(activeCategory, 6)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mt-6 text-center"
      >
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-300/80">
          <Sparkles size={13} /> The World&apos;s Greatest Places
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
          <span className="gradient-text">Hall of Fame</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-sm text-white/60 sm:text-base">
          A curated museum of humanity&apos;s most remarkable heritage — legends enshrined in gold, wonders of the month,
          hidden gems and the finest of every category, region by region.
        </p>
      </motion.header>

      {/* Wonder of the Month + Site of the Day */}
      <AnimatedSection className="mt-10 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <WonderFeature site={wonder} />
        </div>
        <div className="lg:col-span-2">
          <DayFeature site={dayly} />
        </div>
      </AnimatedSection>

      {/* Legends */}
      <AnimatedSection>
        <SectionHeading
          icon={<Trophy size={22} />}
          title="Legends"
          subtitle="The twelve most iconic sites on Earth, enshrined in gold."
          accent="#ffd166"
        />
      </AnimatedSection>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid gap-3 sm:grid-cols-2"
      >
        {legendSites.map((site, i) => (
          <motion.div key={site.id} variants={fadeUp}>
            <LegendPlaque site={site} rank={i + 1} />
          </motion.div>
        ))}
      </motion.div>

      {/* Halls by category */}
      <AnimatedSection>
        <SectionHeading
          icon={<Globe2 size={22} />}
          title="Halls by Category"
          subtitle="Browse the finest of every kind of place."
          accent="#4ade80"
        />
      </AnimatedSection>
      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {HALL_CATEGORIES.map((cat) => {
          const active = cat === activeCategory
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              aria-pressed={active}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition',
                active
                  ? 'border-gold-400 bg-gold-400 text-abyss shadow-md shadow-gold-400/20'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white',
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>
      <motion.div
        key={activeCategory}
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categorySites.map((site, i) => (
          <motion.div key={site.id} variants={fadeUp}>
            <SiteCard site={site} rank={i + 1} />
          </motion.div>
        ))}
      </motion.div>

      {/* Regional Halls */}
      <AnimatedSection>
        <SectionHeading
          icon={<MapPin size={22} />}
          title="Regional Halls"
          subtitle="The proudest places from every corner of the world."
          accent="#a78bfa"
        />
      </AnimatedSection>
      <div className="space-y-8">
        {regions.map((hall) => (
          <AnimatedSection key={hall.region}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-white/80">{hall.region}</h3>
              <span className="text-xs text-white/30">{hall.sites.length} sites</span>
            </div>
            <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {hall.sites.map((site) => (
                <div key={site.id} className="w-64 shrink-0 snap-start">
                  <SiteCard site={site} />
                </div>
              ))}
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Hidden Gems */}
      <AnimatedSection>
        <SectionHeading
          icon={<TrendingUp size={22} />}
          title="Hidden Gems"
          subtitle="Under-visited, yet every bit as remarkable."
          accent="#f97362"
        />
      </AnimatedSection>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {gems.map((site) => (
          <motion.div key={site.id} variants={fadeUp}>
            <SiteCard site={site} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
