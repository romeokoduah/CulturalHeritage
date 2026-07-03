import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Landmark,
  Layers,
  MapPin,
  Milestone,
  Shield,
  Theater,
} from 'lucide-react'
import { cn } from '../../lib/cn'

/* ─────────────────────── DATA ─────────────────────── */

interface Era {
  label: string
  years: string
  yearStart: number
  yearEnd: number
  description: string
  features: string[]
  change?: string // what was gained or lost since prior era
}

interface Site {
  id: string
  name: string
  icon: typeof Landmark
  location: string
  eras: Era[]
  structuresLost: number
  preservationStatus: 'Critical' | 'Endangered' | 'Vulnerable' | 'Stable' | 'Restored'
  keyFact: string
}

const SITES: Site[] = [
  {
    id: 'siheyuan-hutong',
    name: 'Siheyuan & Hutong',
    icon: Building2,
    location: 'Beijing, China',
    eras: [
      {
        label: 'Yuan Dynasty',
        years: '1271 – 1400',
        yearStart: 1271,
        yearEnd: 1400,
        description:
          'The Mongol Yuan dynasty establishes Beijing\'s hutong grid — a network of narrow alleys connecting thousands of courtyard compounds, all oriented north-south by imperial decree.',
        features: ['Rammed-earth courtyard walls', 'North-south alignment grid', 'Single-story timber frames', 'Imperial zoning codes'],
        change: undefined,
      },
      {
        label: 'Ming Perfection',
        years: '1400 – 1644',
        yearStart: 1400,
        yearEnd: 1644,
        description:
          'Ming dynasty artisans perfect the siheyuan form. Over 6,000 hutongs crisscross the capital, each compound reflecting its owner\'s status through gate style, courtyard count, and roof decoration.',
        features: ['Ornamental gate carvings', 'Multi-courtyard compounds', 'Glazed tile roofs', 'Spirit walls (yingbi)'],
        change: 'Gained: Artisanal refinement and 6,000+ hutong network',
      },
      {
        label: 'Qing Zenith',
        years: '1644 – 1911',
        yearStart: 1644,
        yearEnd: 1911,
        description:
          'The Manchu court mandates residential segregation. The Inner City holds Bannermen; the Outer City teems with Han merchants. Hutong culture reaches its zenith with tea houses, opera stages, and bazaars.',
        features: ['Bannerman mansions', 'Tea houses & opera stages', 'Street-vendor bazaars', 'Residential segregation zones'],
        change: 'Gained: Cultural zenith — opera, tea culture, bazaars',
      },
      {
        label: 'Republican Era',
        years: '1911 – 1949',
        yearStart: 1911,
        yearEnd: 1949,
        description:
          'Civil war and occupation scar the old city. Many siheyuan are subdivided among multiple families, courtyard gardens paved over, privacy screens torn down.',
        features: ['Subdivided courtyards', 'Makeshift partitions', 'Paved-over gardens', 'Shared communal spaces'],
        change: 'Lost: Private courtyards, gardens, and single-family integrity',
      },
      {
        label: 'Modern Demolition',
        years: '1949 – 2000',
        yearStart: 1949,
        yearEnd: 2000,
        description:
          'Waves of demolition for Soviet-style blocks, then again for Olympic construction. Over 4,000 hutongs are destroyed. The intimate alley-courtyard fabric that survived 700 years is fragmented in decades.',
        features: ['Soviet-style apartment blocks', 'Widened boulevards', 'Olympic venues', 'Concrete high-rises'],
        change: 'Lost: 4,000+ hutongs demolished in decades',
      },
      {
        label: 'Present Day',
        years: '2000 – today',
        yearStart: 2000,
        yearEnd: 2026,
        description:
          'Only ~1,000 hutongs survive. Conservation zones protect a fraction; gentrification transforms others into boutique hotels and cafés. The living community dwindles as property values soar.',
        features: ['Conservation zones', 'Boutique hotels & cafés', 'Heritage tourism', 'Soaring property values'],
        change: 'Lost: Living community displaced by gentrification',
      },
    ],
    structuresLost: 5000,
    preservationStatus: 'Critical',
    keyFact: 'From over 6,000 hutongs to roughly 1,000 in a single century.',
  },
  {
    id: 'temple-of-heaven',
    name: 'Temple of Heaven',
    icon: Landmark,
    location: 'Beijing, China',
    eras: [
      {
        label: 'Imperial Foundation',
        years: '1420',
        yearStart: 1420,
        yearEnd: 1420,
        description:
          'Yongle Emperor builds a combined Temple of Heaven and Earth as part of his grand relocation of the capital to Beijing. A single great altar serves both cosmic rituals.',
        features: ['Combined Heaven-Earth altar', 'Timber sacrificial hall', 'Imperial Sacred Way', 'Cypress groves planted'],
        change: undefined,
      },
      {
        label: 'Ming Expansion',
        years: '1530',
        yearStart: 1530,
        yearEnd: 1530,
        description:
          'Jiajing Emperor separates Heaven and Earth worship, constructs the Circular Mound Altar in the south and dedicates the original northern altar to Earth alone. The iconic layout takes shape.',
        features: ['Circular Mound Altar', 'Imperial Vault of Heaven', 'Echo Wall', 'Separate Earth temple'],
        change: 'Gained: Separation of rituals, iconic circular plan',
      },
      {
        label: 'Qing Perfection',
        years: '1752',
        yearStart: 1752,
        yearEnd: 1752,
        description:
          'Qianlong Emperor rebuilds the Hall of Prayer for Good Harvests with its iconic triple-eaved roof and luminous blue-glazed tiles. The structure becomes the symbol of Beijing itself.',
        features: ['Triple-eaved circular hall', 'Blue-glazed tiles', '28 massive pillars', 'No nails — mortise-and-tenon only'],
        change: 'Gained: The iconic blue-tiled triple roof',
      },
      {
        label: 'Colonial Crisis',
        years: '1860 – 1900',
        yearStart: 1860,
        yearEnd: 1900,
        description:
          'Anglo-French forces camp in the complex during the Second Opium War. Eight-Nation Alliance occupies it in 1900, using halls as barracks and stables. Trees are felled for firewood.',
        features: ['Military barracks', 'Damaged altars', 'Felled cypress trees', 'Looted ritual vessels'],
        change: 'Lost: Sacred groves felled, ritual vessels looted',
      },
      {
        label: 'Restoration',
        years: '1918 – present',
        yearStart: 1918,
        yearEnd: 2026,
        description:
          'Opened as a public park in 1918. UNESCO World Heritage inscription in 1998 drives meticulous restoration. Today it hosts millions of visitors and dawn tai-chi practitioners.',
        features: ['UNESCO World Heritage Site', 'Public park access', 'Meticulous restoration', 'Dawn tai-chi gatherings'],
        change: 'Gained: Public access, UNESCO protection, restored splendor',
      },
    ],
    structuresLost: 12,
    preservationStatus: 'Restored',
    keyFact: 'The Hall of Prayer uses no nails — only mortise-and-tenon joinery.',
  },
  {
    id: 'great-wall-mutianyu',
    name: 'Great Wall — Mutianyu',
    icon: Shield,
    location: 'Huairou, Beijing, China',
    eras: [
      {
        label: 'First Walls',
        years: '~700 BCE',
        yearStart: -700,
        yearEnd: -700,
        description:
          'Warring States era lords build regional walls of rammed earth and packed stone to defend their borders from rival kingdoms and nomadic raids from the steppe.',
        features: ['Rammed-earth construction', 'Regional border defences', 'Tamped-layer technique', 'No unified system'],
        change: undefined,
      },
      {
        label: 'Qin Unification',
        years: '221 BCE',
        yearStart: -221,
        yearEnd: -221,
        description:
          'Qin Shi Huang links and extends the walls into a single frontier defence spanning thousands of li. Hundreds of thousands of labourers are conscripted; many perish in construction.',
        features: ['Linked frontier wall', 'Beacon-fire signalling', 'Garrison forts', 'Forced-labour conscription'],
        change: 'Gained: Unified continental defence system',
      },
      {
        label: 'Han Extension',
        years: '206 BCE – 220 CE',
        yearStart: -206,
        yearEnd: 220,
        description:
          'The wall pushes west to protect Silk Road caravans crossing the Hexi Corridor. Watchtowers dot the Gobi Desert. The wall becomes a trade artery as much as a military barrier.',
        features: ['Westward Silk Road extension', 'Gobi desert watchtowers', 'Trade-route protection', 'Signal-smoke relay chains'],
        change: 'Gained: Silk Road protection, Gobi watchtowers',
      },
      {
        label: 'Ming Reconstruction',
        years: '1368 – 1644',
        yearStart: 1368,
        yearEnd: 1644,
        description:
          'The Ming rebuild in stone and brick, creating the wall tourists know today. Mutianyu section receives 22 watchtowers in a dense, fortress-like arrangement along a dramatic mountain ridge.',
        features: ['Stone and brick facing', '22 Mutianyu watchtowers', 'Crenellated parapets', 'Inner and outer walls'],
        change: 'Gained: The stone-and-brick wall visitors know today',
      },
      {
        label: 'Abandonment',
        years: '1644 – 1950',
        yearStart: 1644,
        yearEnd: 1950,
        description:
          'The Qing dynasty, ruling both sides of the wall, has no need for it. Villagers mine it for building stone. Vegetation reclaims the battlements. Entire sections vanish.',
        features: ['Stone-mining by villagers', 'Vegetation overgrowth', 'Collapsed watchtowers', 'Sections lost entirely'],
        change: 'Lost: Entire sections mined for building material',
      },
      {
        label: 'Revival',
        years: '1957 – present',
        yearStart: 1957,
        yearEnd: 2026,
        description:
          'Designated a cultural relic in 1957. Tourism infrastructure transforms key sections — cable cars, visitor centres, souvenir markets — while remote stretches continue to crumble.',
        features: ['Cultural relic designation', 'Cable cars & visitor centres', 'Selective restoration', 'Remote sections still crumbling'],
        change: 'Gained: Tourism revival; Lost: Authenticity in restored zones',
      },
    ],
    structuresLost: 1800,
    preservationStatus: 'Vulnerable',
    keyFact: 'Only 8% of the Ming-era wall remains in good condition.',
  },
  {
    id: 'peking-opera',
    name: 'Peking Opera',
    icon: Theater,
    location: 'Beijing, China',
    eras: [
      {
        label: 'Origin',
        years: '1790',
        yearStart: 1790,
        yearEnd: 1790,
        description:
          'Four Anhui opera troupes arrive in Beijing for Emperor Qianlong\'s 80th birthday celebration. Their music and acrobatics merge with local Kunqu opera, planting the seeds of a new art form.',
        features: ['Anhui troupe acrobatics', 'Kunqu vocal fusion', 'Imperial birthday debut', 'Erhuang & xipi melodies'],
        change: undefined,
      },
      {
        label: 'Golden Age',
        years: '1840 – 1930',
        yearStart: 1840,
        yearEnd: 1930,
        description:
          'Masters like Mei Lanfang, Cheng Yanqiu, Shang Xiaoyun, and Xun Huisheng create the Four Great Dan styles. Peking Opera becomes China\'s pre-eminent performing art, with purpose-built theatres citywide.',
        features: ['Four Great Dan styles', 'Mei Lanfang\'s international tours', 'Purpose-built theatres', 'Codified role system (sheng, dan, jing, chou)'],
        change: 'Gained: Codified art form, international fame',
      },
      {
        label: 'Revolution',
        years: '1949 – 1976',
        yearStart: 1949,
        yearEnd: 1976,
        description:
          'Revolutionary model operas replace the classical repertoire during the Cultural Revolution. Traditional performers are persecuted; costumes and scripts are burned. Only eight "model works" are permitted.',
        features: ['Eight model operas only', 'Classical repertoire banned', 'Performers persecuted', 'Costumes & scripts destroyed'],
        change: 'Lost: Classical repertoire banned, performers persecuted',
      },
      {
        label: 'Revival',
        years: '1980 – present',
        yearStart: 1980,
        yearEnd: 2026,
        description:
          'Classical repertoire returns after the Cultural Revolution. UNESCO inscribes Peking Opera in 2010 as Intangible Cultural Heritage. Audiences dwindle but dedicated academies train a new generation.',
        features: ['UNESCO Intangible Heritage (2010)', 'Academy training programs', 'Elderly master lineages', 'Shrinking but devoted audiences'],
        change: 'Gained: UNESCO recognition; Lost: Mass popular audience',
      },
    ],
    structuresLost: 200,
    preservationStatus: 'Endangered',
    keyFact: 'During the Cultural Revolution, only 8 "model operas" were permitted from a repertoire of thousands.',
  },
]

/* ─────────────────── ERA GRADIENTS ─────────────────── */

function eraGradient(progress: number): string {
  // progress 0..1 across all eras
  if (progress < 0.15) return 'from-amber-950/90 via-amber-900/70 to-yellow-950/80'
  if (progress < 0.3) return 'from-blue-950/90 via-indigo-900/70 to-slate-900/80'
  if (progress < 0.5) return 'from-red-950/90 via-rose-900/70 to-amber-950/80'
  if (progress < 0.7) return 'from-emerald-950/90 via-teal-900/70 to-cyan-950/80'
  if (progress < 0.85) return 'from-slate-800/90 via-gray-800/70 to-zinc-900/80'
  return 'from-violet-950/90 via-purple-900/70 to-slate-900/80'
}

function eraBorderColor(progress: number): string {
  if (progress < 0.15) return 'border-amber-500/30'
  if (progress < 0.3) return 'border-indigo-400/30'
  if (progress < 0.5) return 'border-rose-500/30'
  if (progress < 0.7) return 'border-emerald-400/30'
  if (progress < 0.85) return 'border-gray-400/30'
  return 'border-purple-400/30'
}

function eraGlowColor(progress: number): string {
  if (progress < 0.15) return 'rgba(245,158,11,0.6)'
  if (progress < 0.3) return 'rgba(99,102,241,0.6)'
  if (progress < 0.5) return 'rgba(244,63,94,0.6)'
  if (progress < 0.7) return 'rgba(20,184,166,0.6)'
  if (progress < 0.85) return 'rgba(161,161,170,0.6)'
  return 'rgba(168,85,247,0.6)'
}

function eraAccentText(progress: number): string {
  if (progress < 0.15) return 'text-amber-400'
  if (progress < 0.3) return 'text-indigo-400'
  if (progress < 0.5) return 'text-rose-400'
  if (progress < 0.7) return 'text-emerald-400'
  if (progress < 0.85) return 'text-zinc-300'
  return 'text-purple-400'
}

/* ─────────────── ANIMATED NUMBER ─────────────── */

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    const start = display
    const diff = value - start
    const t0 = performance.now()
    function tick(now: number) {
      const elapsed = now - t0
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

/* ─────────────── STATUS BADGE ─────────────── */

function StatusBadge({ status }: { status: Site['preservationStatus'] }) {
  const colors: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    Endangered: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Vulnerable: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    Stable: 'bg-green-500/20 text-green-400 border-green-500/40',
    Restored: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  }
  return (
    <span className={cn('inline-block rounded-full border px-3 py-0.5 text-xs font-semibold', colors[status])}>
      {status}
    </span>
  )
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export function LostArchitectureSimulator() {
  const [siteIndex, setSiteIndex] = useState(0)
  const [eraIndex, setEraIndex] = useState(0)
  const [sliderValue, setSliderValue] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const site = SITES[siteIndex]
  const eras = site.eras
  const era = eras[eraIndex]

  // normalise slider 0..1000 to era index
  const maxSlider = 1000
  const eraFromSlider = useCallback(
    (v: number) => {
      const idx = Math.round((v / maxSlider) * (eras.length - 1))
      return Math.max(0, Math.min(eras.length - 1, idx))
    },
    [eras.length],
  )

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      setSliderValue(v)
      setEraIndex(eraFromSlider(v))
    },
    [eraFromSlider],
  )

  // when site changes, reset era
  useEffect(() => {
    setEraIndex(0)
    setSliderValue(0)
  }, [siteIndex])

  const progress = sliderValue / maxSlider
  const glowColor = eraGlowColor(progress)
  const accentText = eraAccentText(progress)
  const gradient = eraGradient(progress)

  const displayYear = useMemo(() => {
    const e = eras[eraIndex]
    if (e.yearStart === e.yearEnd) return e.yearStart < 0 ? `${Math.abs(e.yearStart)} BCE` : `${e.yearStart}`
    const s = e.yearStart < 0 ? `${Math.abs(e.yearStart)} BCE` : `${e.yearStart}`
    const end = e.yearEnd >= 2026 ? 'Today' : e.yearEnd < 0 ? `${Math.abs(e.yearEnd)} BCE` : `${e.yearEnd}`
    return `${s} — ${end}`
  }, [eras, eraIndex])

  const prevEra = () => {
    const ni = Math.max(0, eraIndex - 1)
    setEraIndex(ni)
    setSliderValue(Math.round((ni / (eras.length - 1)) * maxSlider))
  }
  const nextEra = () => {
    const ni = Math.min(eras.length - 1, eraIndex + 1)
    setEraIndex(ni)
    setSliderValue(Math.round((ni / (eras.length - 1)) * maxSlider))
  }

  return (
    <div className="relative flex flex-col gap-6">
      {/* ── Site Selector ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SITES.map((s, i) => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setSiteIndex(i)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300',
                i === siteIndex
                  ? 'border-white/20 bg-white/10 text-white shadow-lg shadow-white/5'
                  : 'border-white/5 bg-white/[0.03] text-white/50 hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70',
              )}
            >
              <Icon size={16} />
              <span className="whitespace-nowrap">{s.name}</span>
            </button>
          )
        })}
      </div>

      {/* ── Main Scene ── */}
      <div className="relative min-h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl sm:min-h-[520px]">
        {/* Background gradient */}
        <motion.div
          key={`${site.id}-${eraIndex}-bg`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={cn('absolute inset-0 bg-gradient-to-br', gradient)}
        />

        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
          {/* Header: location + site */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <MapPin size={12} />
                <span>{site.location}</span>
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{site.name}</h2>
            </div>
            {/* Era navigation arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevEra}
                disabled={eraIndex === 0}
                className="rounded-lg border border-white/10 p-1.5 text-white/60 transition hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextEra}
                disabled={eraIndex === eras.length - 1}
                className="rounded-lg border border-white/10 p-1.5 text-white/60 transition hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Era Card — animated swap */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${site.id}-${eraIndex}`}
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="my-6 flex flex-col gap-5 sm:my-8"
            >
              {/* Era name + year */}
              <div>
                <motion.p
                  className={cn('text-xs font-semibold uppercase tracking-[0.2em]', accentText)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {era.label}
                </motion.p>
                <motion.p
                  className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {displayYear}
                </motion.p>
              </div>

              {/* Narrative */}
              <motion.p
                className="max-w-2xl font-serif text-base leading-relaxed text-white/75 sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {era.description}
              </motion.p>

              {/* Features grid */}
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {era.features.map((f) => (
                  <span
                    key={f}
                    className={cn(
                      'rounded-lg border bg-black/30 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm',
                      eraBorderColor(progress),
                    )}
                  >
                    {f}
                  </span>
                ))}
              </motion.div>

              {/* Change banner */}
              {era.change && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={cn(
                    'inline-flex max-w-max items-center gap-2 rounded-lg border bg-black/40 px-4 py-2 text-sm backdrop-blur-md',
                    eraBorderColor(progress),
                    era.change.startsWith('Lost')
                      ? 'text-red-300/90'
                      : era.change.startsWith('Gained')
                        ? 'text-emerald-300/90'
                        : 'text-amber-200/90',
                  )}
                >
                  <Layers size={14} className="shrink-0 opacity-60" />
                  {era.change}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom: stats row */}
          <div className="flex flex-wrap items-end gap-4 sm:gap-6">
            <Stat icon={Building2} label="Structures Lost" value={<AnimatedNumber value={site.structuresLost} />} />
            <Stat
              icon={Clock}
              label="Years of History"
              value={
                <AnimatedNumber
                  value={
                    eras[eras.length - 1].yearEnd -
                    eras[0].yearStart +
                    (eras[0].yearStart < 0 ? 0 : 0) // already correct for negative years
                  }
                />
              }
            />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-white/40">Preservation</span>
              <StatusBadge status={site.preservationStatus} />
            </div>
            <div className="ml-auto hidden max-w-xs text-right text-xs text-white/40 lg:block">
              <Milestone size={12} className="mb-0.5 mr-1 inline-block opacity-60" />
              {site.keyFact}
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline Slider ── */}
      <div className="relative rounded-2xl border border-white/10 bg-black/30 px-6 py-5 backdrop-blur-xl">
        {/* Era markers */}
        <div className="mb-3 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-white/30">
          {eras.map((e, i) => {
            return (
              <button
                key={i}
                onClick={() => {
                  setEraIndex(i)
                  setSliderValue(Math.round((i / (eras.length - 1)) * maxSlider))
                }}
                className={cn(
                  'transition-colors duration-300',
                  i === eraIndex ? 'text-white/80' : 'hover:text-white/50',
                )}
                style={{ position: 'relative' }}
                title={e.label}
              >
                <span className="hidden sm:inline">{e.label}</span>
                <span className="sm:hidden">{e.years.slice(0, 4)}</span>
              </button>
            )
          })}
        </div>

        {/* Track + slider */}
        <div className="relative" ref={trackRef}>
          {/* Background track */}
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />

          {/* Filled track */}
          <motion.div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${glowColor}, ${glowColor.replace('0.6', '0.3')})`,
              boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor.replace('0.6', '0.2')}`,
            }}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Era node dots */}
          {eras.map((_, i) => {
            const pct = eras.length === 1 ? 50 : (i / (eras.length - 1)) * 100
            const isActive = i === eraIndex
            return (
              <motion.div
                key={i}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.4 : 1,
                    boxShadow: isActive ? `0 0 16px ${glowColor}` : '0 0 0px transparent',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    'h-3 w-3 rounded-full border-2 transition-colors duration-300',
                    isActive ? 'border-white bg-white' : 'border-white/30 bg-white/10',
                  )}
                />
              </motion.div>
            )
          })}

          {/* Invisible range input on top */}
          <input
            type="range"
            min={0}
            max={maxSlider}
            value={sliderValue}
            onChange={handleSlider}
            className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:-translate-y-[2px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.5)]"
          />
        </div>

        {/* Year display */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Calendar size={12} />
            <span>
              Era {eraIndex + 1} of {eras.length}
            </span>
          </div>
          <motion.span
            key={displayYear}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('text-sm font-bold', accentText)}
          >
            {displayYear}
          </motion.span>
        </div>
      </div>

      {/* ── Key Fact (mobile) ── */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-xs text-white/50 lg:hidden">
        <Milestone size={12} className="mb-0.5 mr-1 inline-block opacity-60" />
        {site.keyFact}
      </div>
    </div>
  )
}

/* ─── Helper: Stat ─── */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/40">
        <Icon size={10} />
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums text-white">{value}</span>
    </div>
  )
}
