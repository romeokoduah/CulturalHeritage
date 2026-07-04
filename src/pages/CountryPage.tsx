import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, Globe2, Languages, MapPin, TrendingUp } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { COUNTRIES_BY_ID } from '../data/countries'
import { SITES_BY_COUNTRY } from '../data/sites'
import { DELEGATES } from '../data/delegates'
import { HeritageVisual } from '../components/HeritageVisual'
import HeritageTimeline from '../features/timeline/HeritageTimeline'
import { PixelBadge } from '../components/PixelArt'
import { Storyteller } from '../features/ai/Storyteller'
import { BentoCard, BentoGrid } from '../components/magicui/BentoGrid'
import { ShareButton } from '../components/ShareSheet'
import type { ShareCardData } from '../lib/shareCard'
import { usePassport } from '../lib/passport'
import { TRENDING_ID_SET } from '../data/featured'
import { cn } from '../lib/cn'
import { NotFound } from './NotFound'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function CountryPage() {
  const { id = '' } = useParams()
  const country = COUNTRIES_BY_ID[id]
  const { state, isVisited } = usePassport()

  if (!country) return <NotFound />
  const sites = SITES_BY_COUNTRY[country.id] ?? []
  const earned = state.visitedCountries.includes(country.id)
  const delegate = DELEGATES[country.id]
  const delegateName = delegate?.name ?? 'Heritage Guide'

  // Find first site with an image for hero
  const heroImage = sites.find((s) => s.imageUrl)?.imageUrl

  const shareData: ShareCardData = {
    kind: 'country',
    eyebrow: country.region,
    title: `${country.name}`,
    subtitle: `${sites.length} heritage sites · ${country.languages[0]}`,
    accent: country.colors[0],
    accent2: country.colors[1],
    imageUrl: heroImage,
    emoji: country.emojiFlag,
  }
  const shareContent = {
    title: `${country.name} · HeritageQuest`,
    text: country.summary,
    url: typeof window !== 'undefined' ? window.location.href : '',
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative mt-4 overflow-hidden rounded-3xl"
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt={country.name}
            className="h-56 w-full object-cover sm:h-72"
            loading="eager"
          />
        ) : (
          <HeritageVisual motif={country.motif} color={country.colors[0]} className="h-56 w-full sm:h-72" rounded="rounded-3xl" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <Link
          to="/"
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-white/80 hover:text-white backdrop-blur-md"
        >
          <ArrowLeft size={14} /> Globe
        </Link>
        <div className="absolute right-3 top-3">
          <ShareButton data={shareData} share={shareContent} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/70">
                <Globe2 size={12} /> {country.region}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl drop-shadow-lg">
                {country.emojiFlag} {country.name}
              </h1>
            </div>
            <PixelBadge colors={country.colors} emoji={country.emojiFlag} earned={earned} size={72} />
          </div>
        </div>
      </motion.div>

      {/* Heritage Guide card */}
      <AnimatedSection>
        <div
          className="mt-5 flex items-center gap-4 rounded-2xl p-4 backdrop-blur-xl border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${country.colors[0]}15, ${country.colors[1] ?? country.colors[0]}15)`,
          }}
        >
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-bold"
            style={{
              background: `linear-gradient(135deg, ${country.colors[0]}, ${country.colors[1] ?? country.colors[0]})`,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">Your Heritage Guide</p>
            <p className="mt-0.5 font-display text-lg font-bold" style={{ color: country.colors[0] }}>
              {delegateName}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Facts bento */}
      <AnimatedSection>
        <BentoGrid className="mt-6 sm:grid-cols-2 lg:grid-cols-3">
          <BentoCard colSpan="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: country.colors[0] }}>
              Heritage in brief
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{country.heritageIntro}</p>
          </BentoCard>
          <BentoCard>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: country.colors[0] }}>
              <Languages size={12} /> Languages
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {country.languages.map((l) => (
                <span
                  key={l}
                  className="rounded-full px-2.5 py-1 text-xs text-white/80"
                  style={{ backgroundColor: `${country.colors[0]}20` }}
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs uppercase tracking-widest text-white/40">Collectible</p>
            <p className="font-pixel text-[10px] leading-relaxed" style={{ color: country.colors[0] }}>
              {country.badgeLabel}
            </p>
          </BentoCard>
        </BentoGrid>
      </AnimatedSection>

      {/* Sites */}
      <AnimatedSection>
        <div className="mt-10 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Heritage sites</h2>
          <span className="text-xs text-white/40">
            {state.visitedSites.filter((s) => sites.some((x) => x.id === s)).length}/{sites.length} visited
          </span>
        </div>
      </AnimatedSection>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="mt-4 grid gap-4 sm:grid-cols-2"
      >
        {sites.map((s) => (
          <motion.div key={s.id} variants={fadeUp}>
            <Link
              to={`/site/${s.id}`}
              className="group relative flex overflow-hidden rounded-3xl backdrop-blur-xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
            >
              {/* Image with hover zoom */}
              <div className="w-28 shrink-0 sm:w-36 overflow-hidden">
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                  />
                ) : null}
                <HeritageVisual motif={s.motif} color={s.themeColor} className={cn("h-full w-full", s.imageUrl && "hidden")} rounded="rounded-none" />
              </div>
              <div className="min-w-0 flex-1 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium"
                    style={{ backgroundColor: `${s.themeColor}25`, color: s.themeColor }}
                  >
                    {s.category}
                  </span>
                  {s.unesco && (
                    <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold text-gold-300">
                      UNESCO
                    </span>
                  )}
                  {TRENDING_ID_SET.has(s.id) && (
                    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400 flex items-center gap-0.5">
                      <TrendingUp size={10} /> Must Visit
                    </span>
                  )}
                  {isVisited(s.id) && <Check size={14} className="text-jade-400" />}
                </div>
                <h3 className="mt-1.5 font-display text-base font-bold leading-tight">{s.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/40">
                  <MapPin size={10} /> {s.city}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-white/60">{s.tagline}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition group-hover:opacity-100" style={{ color: country.colors[0] }}>
                  Discover <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Heritage Timeline */}
      <AnimatedSection className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold flex items-center gap-2">
          <Clock size={18} style={{ color: country.colors[0] }} /> Heritage Timeline
        </h2>
        <HeritageTimeline countryId={country.id} />
      </AnimatedSection>

      {/* AI Storyteller */}
      <AnimatedSection className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Chat with {delegateName}</h2>
        <Storyteller context={{ country }} title={`${delegateName} — Heritage Guide`} />
      </AnimatedSection>
    </div>
  )
}
