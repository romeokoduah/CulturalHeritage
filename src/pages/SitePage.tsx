import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Check, Lightbulb, MapPin, Volume2 } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SITES_BY_ID } from '../data/sites'
import { COUNTRIES_BY_ID } from '../data/countries'
import { DELEGATES } from '../data/delegates'
import { HeritageVisual } from '../components/HeritageVisual'
import { SketchfabViewer } from '../features/site/SketchfabViewer'
import { Storyteller } from '../features/ai/Storyteller'
import { usePassport } from '../lib/passport'
import { cn } from '../lib/cn'
import { NotFound } from './NotFound'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
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

const FACT_COLORS = [
  { bg: 'from-rose-500/20 to-pink-600/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  { bg: 'from-amber-500/20 to-orange-600/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  { bg: 'from-emerald-500/20 to-teal-600/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  { bg: 'from-blue-500/20 to-indigo-600/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  { bg: 'from-violet-500/20 to-purple-600/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  { bg: 'from-cyan-500/20 to-sky-600/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
]

export function SitePage() {
  const { id = '' } = useParams()
  const site = SITES_BY_ID[id]
  const { isVisited, toggleSite } = usePassport()

  if (!site) return <NotFound />
  const country = COUNTRIES_BY_ID[site.countryId]
  const visited = isVisited(site.id)
  const delegate = DELEGATES[site.countryId]
  const delegateName = delegate?.name ?? 'Heritage Guide'
  const accentColor = site.themeColor

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Full-width hero image */}
      {site.imageUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative -mx-4 overflow-hidden sm:mx-0 sm:mt-4 sm:rounded-3xl"
        >
          <img
            src={site.imageUrl}
            alt={site.name}
            className="h-64 w-full object-cover sm:h-80"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Breadcrumb on hero */}
          <div className="absolute left-4 top-4 flex items-center gap-2 text-xs text-white/70">
            <Link to="/" className="flex items-center gap-1 hover:text-white backdrop-blur-md rounded-full glass px-2.5 py-1">
              <ArrowLeft size={13} /> Globe
            </Link>
            {country && (
              <>
                <span>/</span>
                <Link to={`/country/${country.id}`} className="hover:text-white backdrop-blur-md rounded-full glass px-2.5 py-1">
                  {country.emojiFlag} {country.name}
                </Link>
              </>
            )}
          </div>
          {/* Title overlaid */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl drop-shadow-lg">{site.name}</h1>
            {site.localName && <p className="mt-1 text-lg text-white/60 drop-shadow">{site.localName}</p>}
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
              <MapPin size={13} /> {site.city}
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Breadcrumb without hero */}
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
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{site.name}</h1>
          {site.localName && <p className="mt-1 text-lg text-white/50">{site.localName}</p>}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
            <MapPin size={13} /> {site.city}
          </p>
        </>
      )}

      {/* Info bar */}
      <AnimatedSection>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs uppercase tracking-wider font-semibold"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            {site.category}
          </span>
          {site.unesco && (
            <span className="rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-300 flex items-center gap-1">
              <BadgeCheck size={12} /> UNESCO World Heritage
            </span>
          )}
          <span className="text-xs text-white/40 ml-1">{site.yearsLabel}</span>
        </div>
        <p className="mt-3 max-w-2xl text-balance text-white/70">{site.tagline}</p>
      </AnimatedSection>

      {/* 3D viewer */}
      <AnimatedSection className="mt-6">
        <SketchfabViewer site={site} />
      </AnimatedSection>

      {/* Visit toggle */}
      <AnimatedSection>
        <button
          onClick={() => toggleSite(site.id, site.countryId)}
          className={cn(
            'mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all duration-300 shadow-lg',
            visited
              ? 'bg-jade-500/15 text-jade-400 ring-2 ring-jade-500/30 shadow-jade-500/10'
              : 'bg-gradient-to-r from-gold-400 to-clay-500 text-abyss hover:brightness-110 hover:scale-[1.01] shadow-gold-400/20',
          )}
        >
          {visited ? (
            <>
              <Check size={20} /> Visited — badge earned
            </>
          ) : (
            <>
              <BadgeCheck size={20} /> Mark as visited & earn a badge
            </>
          )}
        </button>
      </AnimatedSection>

      {/* Greeting card */}
      <AnimatedSection>
        <div
          className="mt-6 overflow-hidden rounded-3xl p-[2px]"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${country?.colors[1] ?? accentColor}, ${accentColor}50)`,
          }}
        >
          <div className="rounded-[22px] bg-abyss/95 backdrop-blur-xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
              Say hello in {site.greeting.language}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="min-w-0">
                <p className="font-display text-3xl font-bold text-white">{site.greeting.phrase}</p>
                <p className="mt-1 text-sm text-white/50">
                  <span className="font-pixel text-xs" style={{ color: accentColor }}>{site.greeting.pronounce}</span>
                  {' '} — "{site.greeting.meaning}"
                </p>
              </div>
              <button
                onClick={() => speak(site.greeting.phrase)}
                className="ml-auto grid h-12 w-12 shrink-0 place-items-center rounded-full text-white transition hover:scale-105"
                style={{ backgroundColor: `${accentColor}30` }}
                aria-label="Pronounce"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Story */}
      <AnimatedSection className="mt-8">
        <h2 className="font-display text-xl font-bold">The story</h2>
        <div className="mt-3 flex gap-4">
          <div
            className="w-1 shrink-0 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }}
          />
          <p className="whitespace-pre-line leading-relaxed text-white/75 first-letter:text-3xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-1" style={{ ['--tw-first-letter-color' as string]: accentColor }}>
            {site.story}
          </p>
        </div>
      </AnimatedSection>

      {/* Fun facts */}
      <AnimatedSection className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
          <Lightbulb size={18} style={{ color: accentColor }} /> Did you know?
        </h2>
      </AnimatedSection>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid gap-3 sm:grid-cols-3"
      >
        {site.funFacts.map((f, i) => {
          const color = FACT_COLORS[i % FACT_COLORS.length]
          return (
            <motion.div key={i} variants={fadeUp}>
              <div className={cn(
                'rounded-2xl border p-4 bg-gradient-to-br backdrop-blur-sm',
                color.bg,
                color.border,
              )}>
                <div className={cn('text-2xl font-display font-black', color.text)}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Gallery */}
      <AnimatedSection className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">Gallery</h2>
      </AnimatedSection>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {site.gallery.map((g, i) => (
          <motion.figure key={i} variants={fadeUp} className="group overflow-hidden rounded-2xl backdrop-blur-xl border border-white/10 bg-white/[0.03]">
            {g.imageUrl ? (
              <img
                src={g.imageUrl}
                alt={g.caption}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
              />
            ) : null}
            <HeritageVisual motif={g.motif} color={site.themeColor} className={cn("aspect-square w-full", g.imageUrl && "hidden")} rounded="rounded-none" />
            <figcaption className="px-3 py-2.5 text-[11px] text-white/50">{g.caption}</figcaption>
          </motion.figure>
        ))}
      </motion.div>

      {/* Heritage Guide */}
      <AnimatedSection>
        <div
          className="mt-8 flex items-center gap-4 rounded-2xl p-4 backdrop-blur-xl border border-white/10"
          style={{ background: `linear-gradient(135deg, ${accentColor}12, ${country?.colors[1] ?? accentColor}12)` }}
        >
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${country?.colors[1] ?? accentColor})` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">Your guide</p>
            <p className="mt-0.5 font-display text-base font-bold" style={{ color: accentColor }}>
              {delegateName}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Storyteller */}
      <AnimatedSection className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Chat with {delegateName}</h2>
        <Storyteller context={{ site, country }} title={`${delegateName} — Heritage Guide`} />
      </AnimatedSection>
    </div>
  )
}
