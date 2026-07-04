import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Globe2, MapPin, Sparkles, TrendingUp, Trophy } from 'lucide-react'
import { COMMUNITY, type Explorer } from '../data/community'
import { useStats } from '../lib/gamification'
import { useAuth } from '../lib/auth'
import { ARCHETYPES, ARCHETYPES_BY_ID } from '../data/archetypes'
import { cn } from '../lib/cn'

/* ─────────────────────────── motion ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
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

/* ─────────────────────────── config ─────────────────────────── */

type Metric = 'xp' | 'sites' | 'countries'
type Timeframe = 'all' | 'month' | 'week'

interface MetricDef {
  id: Metric
  label: string
  unit: string
  Icon: typeof Trophy
}

const METRICS: MetricDef[] = [
  { id: 'xp', label: 'Overall', unit: 'XP', Icon: Trophy },
  { id: 'sites', label: 'Sites', unit: 'sites', Icon: MapPin },
  { id: 'countries', label: 'Countries', unit: 'countries', Icon: Globe2 },
]

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'all', label: 'All-time' },
  { id: 'month', label: 'This month' },
  { id: 'week', label: 'This week' },
]

type Ranked = Explorer & { rank: number }

const TOP_N = 12

function rankBy(list: Explorer[], metric: Metric): Ranked[] {
  return [...list]
    .sort((a, b) => b[metric] - a[metric] || b.xp - a.xp || a.name.localeCompare(b.name))
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

function metricValue(e: Explorer, metric: Metric): string {
  return metric === 'xp' ? e.xp.toLocaleString() : String(e[metric])
}

const MEDAL_COLORS: Record<number, string> = { 1: '#ffd166', 2: '#cbd5e1', 3: '#f97362' }

/* ─────────────────────────── medal (inline svg — not in the pinned icon set) ─────────────────────────── */

function Medal({ rank }: { rank: number }) {
  const c = MEDAL_COLORS[rank] ?? '#cbd5e1'
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" fill="none">
      <path d="M8 2.5 12 9 16 2.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="15" r="6.5" fill={c} fillOpacity="0.16" stroke={c} strokeWidth="1.6" />
      <text x="12" y="18" textAnchor="middle" fontSize="8" fontWeight="700" fill={c} className="tabular-nums">
        {rank}
      </text>
    </svg>
  )
}

/* ─────────────────────────── row ─────────────────────────── */

function LeaderRow({ entry, metric, isMe }: { entry: Ranked; metric: Metric; isMe: boolean }) {
  const arch = ARCHETYPES_BY_ID[entry.archetype]
  const top3 = entry.rank <= 3
  return (
    <motion.li variants={fadeUp}>
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-3 py-2.5 backdrop-blur transition',
          top3 && !isMe && 'bg-ink-800/60',
          isMe && 'border-gold-400/60 bg-gold-400/10 ring-2 ring-gold-400',
        )}
      >
        {/* rank */}
        <div className="flex w-9 shrink-0 items-center justify-center">
          {top3 ? (
            <Medal rank={entry.rank} />
          ) : (
            <span className="text-sm font-semibold tabular-nums text-white/45">#{entry.rank}</span>
          )}
        </div>

        {/* flag */}
        <span className="text-xl leading-none" aria-hidden="true">
          {entry.flag}
        </span>

        {/* identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={cn('truncate font-display text-sm font-bold', isMe && 'text-gold-300')}>{entry.name}</p>
            {isMe && (
              <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-abyss">
                You
              </span>
            )}
          </div>
          {arch ? (
            <span
              className="mt-0.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
              style={{ color: arch.color, borderColor: `${arch.color}55`, backgroundColor: `${arch.color}14` }}
            >
              <span aria-hidden="true">{arch.emoji}</span>
              {arch.name}
            </span>
          ) : (
            <span className="mt-0.5 inline-block text-[10px] text-white/35">Unaligned explorer</span>
          )}
        </div>

        {/* metric value */}
        <div className="shrink-0 text-right">
          <p className={cn('font-display text-base font-extrabold tabular-nums', isMe ? 'text-gold-300' : 'text-white')}>
            {metricValue(entry, metric)}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-white/35">{METRICS.find((m) => m.id === metric)!.unit}</p>
        </div>
      </div>
    </motion.li>
  )
}

/* ─────────────────────────── page ─────────────────────────── */

export function LeaderboardPage() {
  const stats = useStats()
  const { user } = useAuth()

  const [metric, setMetric] = useState<Metric>('xp')
  const [timeframe, setTimeframe] = useState<Timeframe>('all')
  const [league, setLeague] = useState<string | null>(null)

  const me: Explorer = useMemo(
    () => ({
      id: 'me',
      name: user?.name ?? 'You',
      country: '',
      flag: '📍',
      archetype: user?.archetype ?? '',
      sites: stats.sites,
      countries: stats.countries,
      xp: stats.xp,
    }),
    [user?.name, user?.archetype, stats.sites, stats.countries, stats.xp],
  )

  const merged = useMemo<Explorer[]>(() => [...COMMUNITY, me], [me])

  // Global ranking (across the whole cohort) — powers the summary card.
  const overall = useMemo(() => rankBy(merged, metric), [merged, metric])
  const meOverall = overall.find((e) => e.id === 'me')!

  // The board honours the selected archetype league, if any.
  const boardList = useMemo(
    () => (league ? merged.filter((e) => e.archetype === league) : merged),
    [merged, league],
  )
  const ranked = useMemo(() => rankBy(boardList, metric), [boardList, metric])
  const meRanked = ranked.find((e) => e.id === 'me')

  const visible = league ? ranked : ranked.slice(0, TOP_N)
  const pinnedMe = meRanked && !visible.some((e) => e.id === 'me') ? meRanked : null

  const activeMetric = METRICS.find((m) => m.id === metric)!
  const leagueArch = league ? ARCHETYPES_BY_ID[league] : undefined

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Header */}
      <AnimatedSection className="mt-6">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400/80">
          <Trophy size={13} /> Hall of explorers
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold gradient-text sm:text-4xl">Leaderboards</h1>
        <p className="mt-2 max-w-xl text-sm text-white/50">
          <Sparkles size={12} className="mr-1 inline text-violet-400" />
          A demo cohort of travellers for now — your real rank locks in once accounts sync across devices.
        </p>
      </AnimatedSection>

      {/* Your rank summary */}
      <AnimatedSection className="mt-5">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gold-400/30 bg-gold-400/10 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-400/20 text-2xl" aria-hidden="true">
              {me.flag}
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gold-400/80">Your standing · {activeMetric.label}</p>
              <p className="font-display text-xl font-extrabold">
                You're{' '}
                <span className="tabular-nums text-gold-300">#{meOverall.rank}</span>{' '}
                <span className="text-white/45">of {overall.length}</span>
              </p>
            </div>
          </div>
          <div className="ml-auto flex gap-4 text-center">
            {([
              { label: 'XP', value: stats.xp.toLocaleString() },
              { label: 'Sites', value: String(stats.sites) },
              { label: 'Countries', value: String(stats.countries) },
            ] as const).map((s) => (
              <div key={s.label}>
                <p className="font-display text-lg font-extrabold tabular-nums">{s.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
          {user?.guest && (
            <p className="w-full text-[11px] text-white/40">
              Playing as a guest — create an account to keep your rank.
            </p>
          )}
        </div>
      </AnimatedSection>

      {/* Metric tabs */}
      <AnimatedSection className="mt-6">
        <div role="tablist" aria-label="Ranking metric" className="flex gap-2">
          {METRICS.map((m) => {
            const active = metric === m.id
            return (
              <button
                key={m.id}
                role="tab"
                aria-selected={active}
                onClick={() => setMetric(m.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
                  active
                    ? 'border-gold-400/50 bg-gold-400 text-abyss'
                    : 'border-white/10 bg-ink-900/60 text-white/60 hover:text-white',
                )}
              >
                <m.Icon size={15} />
                {m.label}
              </button>
            )
          })}
        </div>
      </AnimatedSection>

      {/* Timeframe segmented control */}
      <AnimatedSection className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Timeframe"
            className="inline-flex rounded-full border border-white/10 bg-ink-900/60 p-1"
          >
            {TIMEFRAMES.map((t) => {
              const active = timeframe === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTimeframe(t.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    active ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80',
                  )}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
          <p className="flex items-center gap-1 text-[11px] text-white/40">
            <TrendingUp size={12} className="text-jade-400" />
            Seasons reset the board — top explorers get enshrined in the Hall of Fame.
          </p>
        </div>
      </AnimatedSection>

      {/* Archetype leagues */}
      <AnimatedSection className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Archetype leagues</h2>
          {league && (
            <button onClick={() => setLeague(null)} className="text-xs font-semibold text-gold-400 hover:underline">
              Clear filter
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setLeague(null)}
            aria-pressed={league === null}
            className={cn(
              'shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition',
              league === null
                ? 'border-white/25 bg-white/10 text-white'
                : 'border-white/10 bg-ink-900/60 text-white/55 hover:text-white',
            )}
          >
            All leagues
          </button>
          {ARCHETYPES.map((a) => {
            const active = league === a.id
            return (
              <button
                key={a.id}
                onClick={() => setLeague(active ? null : a.id)}
                aria-pressed={active}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition',
                  active ? 'text-abyss' : 'border-white/10 bg-ink-900/60 text-white/70 hover:text-white',
                )}
                style={
                  active
                    ? { backgroundColor: a.color, borderColor: a.color }
                    : { borderColor: `${a.color}40` }
                }
              >
                <span aria-hidden="true">{a.emoji}</span>
                <span style={active ? undefined : { color: a.color }}>{a.name}</span>
              </button>
            )
          })}
        </div>
      </AnimatedSection>

      {/* Board */}
      <AnimatedSection className="mt-5">
        <div className="rounded-2xl glass p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2 px-1">
            {leagueArch ? (
              <>
                <span className="text-lg" aria-hidden="true">
                  {leagueArch.emoji}
                </span>
                <p className="font-display text-sm font-bold" style={{ color: leagueArch.color }}>
                  {leagueArch.name} league
                </p>
                <span className="text-xs text-white/35">· {leagueArch.role}</span>
              </>
            ) : (
              <>
                <activeMetric.Icon size={16} className="text-gold-400" />
                <p className="font-display text-sm font-bold">Top explorers · {activeMetric.label}</p>
              </>
            )}
            <span className="ml-auto text-xs tabular-nums text-white/35">{ranked.length} ranked</span>
          </div>

          {visible.length === 0 ? (
            <div className="px-2 py-10 text-center text-sm text-white/50">
              No explorers in this league yet — be the first to claim it.
            </div>
          ) : (
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
              className="space-y-2"
            >
              {visible.map((e) => (
                <LeaderRow key={e.id} entry={e} metric={metric} isMe={e.id === 'me'} />
              ))}
            </motion.ul>
          )}

          {/* Pinned "you" row when outside the shown top-N */}
          {pinnedMe && (
            <>
              <div className="my-2 flex items-center gap-2 px-2 text-white/30" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest">Your rank</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <ul>
                <LeaderRow entry={pinnedMe} metric={metric} isMe />
              </ul>
            </>
          )}
        </div>
      </AnimatedSection>

      {/* Footer CTA */}
      <AnimatedSection className="mt-6">
        <Link
          to="/passport"
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur transition hover:border-gold-400/40"
        >
          <Sparkles size={18} className="text-gold-400" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold">Climb the ranks</p>
            <p className="text-xs text-white/50">Visit more heritage sites to earn XP and overtake the cohort.</p>
          </div>
          <ArrowRight size={16} className="text-white/40" />
        </Link>
      </AnimatedSection>
    </div>
  )
}
