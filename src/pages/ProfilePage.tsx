import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Trophy,
  Sparkles,
  Check,
  MapPin,
  BadgeCheck,
  ArrowRight,
  Globe2,
  Clock,
  BookOpen,
  Settings,
} from 'lucide-react'
import { MascotGlobe, PixelBadge } from '../components/PixelArt'
import { HeritageVisual } from '../components/HeritageVisual'
import { ShareButton } from '../components/ShareSheet'
import { cn } from '../lib/cn'
import { useAuth, updateName } from '../lib/auth'
import {
  useStats,
  getAchievements,
  getMastery,
  type Achievement,
  type Mastery,
} from '../lib/gamification'
import { archetypeFor } from '../data/archetypes'
import { usePassport } from '../lib/passport'
import { SITES_BY_ID } from '../data/sites'
import { COUNTRIES_BY_ID } from '../data/countries'
import type { ShareCardData } from '../lib/shareCard'

/* ─────────────────────────── helpers ─────────────────────────── */

/** Entrance reveal that fires once the element scrolls into view. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Per-category presentation, mirrored from the traveler archetypes. */
const CATEGORY_META: Record<string, { color: string; emoji: string }> = {
  Sacred: { color: '#56d98a', emoji: '🛕' },
  Monument: { color: '#ffd166', emoji: '📜' },
  Landscape: { color: '#a78bfa', emoji: '⛰️' },
  Museum: { color: '#f97362', emoji: '🏛️' },
  Intangible: { color: '#f4b942', emoji: '🥁' },
  Urban: { color: '#2dd4bf', emoji: '🌆' },
}

const TIER_COLORS: Record<Achievement['tier'], [string, string]> = {
  bronze: ['#cd7f32', '#e8a05a'],
  silver: ['#c0c8d8', '#eef2f9'],
  gold: ['#ffd166', '#f4b942'],
}

const LanguagesIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
)

const PencilIcon = ({ size = 15 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

/* ─────────────────────────── name editor ─────────────────────────── */

function NameEditor({ name, color }: { name: string; color: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)

  function save() {
    const next = value.trim()
    if (next) updateName(next)
    setEditing(false)
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="flex items-center gap-2"
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          maxLength={32}
          aria-label="Edit your explorer name"
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-display text-2xl font-extrabold text-white outline-none focus:border-white/40 sm:text-3xl"
        />
        <button
          type="submit"
          aria-label="Save name"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-abyss"
          style={{ backgroundColor: color }}
        >
          <Check size={18} />
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="min-w-0 truncate font-display text-2xl font-extrabold sm:text-3xl">{name}</h1>
      <button
        type="button"
        onClick={() => {
          setValue(name)
          setEditing(true)
        }}
        aria-label="Edit your name"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        <PencilIcon />
      </button>
    </div>
  )
}

/* ─────────────────────────── stat tile ─────────────────────────── */

function StatTile({
  icon,
  value,
  label,
  accent,
  delay,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  accent: string
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition hover:-translate-y-1">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ color: accent, backgroundColor: `${accent}1f` }}>
          {icon}
        </span>
        <span className="mt-1 font-display text-2xl font-extrabold" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      </div>
    </Reveal>
  )
}

/* ─────────────────────────── achievement card ─────────────────────────── */

function AchievementCard({ a }: { a: Achievement }) {
  const pct = Math.round((a.progress / a.goal) * 100)
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center backdrop-blur transition',
        a.earned
          ? 'border-white/15 bg-white/[0.05] hover:-translate-y-1'
          : 'border-white/10 bg-white/[0.02]',
      )}
    >
      <PixelBadge colors={TIER_COLORS[a.tier]} emoji={a.emoji} earned={a.earned} size={72} />
      <p className={cn('font-display text-sm font-bold', !a.earned && 'text-white/60')}>{a.name}</p>
      <p className="text-[11px] leading-snug text-white/45">{a.desc}</p>
      {a.earned ? (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: TIER_COLORS[a.tier][0] }}
        >
          <BadgeCheck size={12} /> {a.tier}
        </span>
      ) : (
        <div className="mt-auto w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-white/40" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {a.progress} / {a.goal}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── mastery row ─────────────────────────── */

function MasteryRow({ m }: { m: Mastery }) {
  const meta = CATEGORY_META[m.category] ?? { color: '#ffd166', emoji: '🏷️' }
  const pct = m.nextAt ? Math.min(100, Math.round((m.count / m.nextAt) * 100)) : 100
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
        style={{ backgroundColor: `${meta.color}1f` }}
      >
        {meta.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-display text-sm font-bold">{m.category}</p>
          <p className="shrink-0 text-xs font-semibold" style={{ color: meta.color }}>
            {m.title}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
          </div>
          <span className="shrink-0 text-[11px] text-white/50" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {m.nextAt ? `${m.count} / ${m.nextAt}` : `${m.count} · max`}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── page ─────────────────────────── */

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const stats = useStats()
  const { state } = usePassport()
  const achievements = getAchievements()
  const mastery = getMastery()
  const arch = archetypeFor(user?.archetype)

  // Signed-out fallback.
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16">
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl glass p-10 text-center">
          <MascotGlobe size={96} />
          <h1 className="font-display text-2xl font-extrabold">Your explorer profile</h1>
          <p className="max-w-sm text-white/60">
            Sign in to track your level, badges and the heritage you've discovered around the world.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const since = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const accent = arch?.color ?? '#ffd166'
  const levelPct = Math.max(0, Math.min(100, Math.round(stats.levelProgress * 100)))

  const recent = [...state.visitedSites]
    .reverse()
    .map((id) => SITES_BY_ID[id])
    .filter(Boolean)
    .slice(0, 4)

  const earnedCount = achievements.filter((a) => a.earned).length

  const shareData: ShareCardData = {
    kind: 'passport',
    eyebrow: arch ? arch.name : 'Explorer',
    title: `${user.name}'s HeritageQuest`,
    subtitle: `Level ${stats.level} · ${stats.title}`,
    accent,
    accent2: '#f97362',
    emoji: arch?.emoji ?? '🌍',
    stats: [
      { label: 'Sites visited', value: String(stats.sites) },
      { label: 'Country badges', value: String(stats.countries) },
      { label: 'Total XP', value: String(stats.xp) },
    ],
  }
  const shareContent = {
    title: `${user.name} on HeritageQuest`,
    text: `I'm a Level ${stats.level} ${stats.title} — ${stats.sites} sites across ${stats.countries} countries!`,
    url: typeof window !== 'undefined' ? window.location.origin : '',
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Header card */}
      <Reveal>
        <div className="relative mt-6 overflow-hidden rounded-3xl glass p-5 sm:p-6">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: accent }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            {arch ? (
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-4xl"
                style={{ backgroundColor: `${accent}26`, boxShadow: `inset 0 0 0 2px ${accent}55` }}
                aria-label={arch.name}
              >
                {arch.emoji}
              </div>
            ) : (
              <MascotGlobe size={80} className="shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400/80">
                <Trophy size={13} /> Explorer Profile
              </p>
              <div className="mt-1">
                <NameEditor name={user.name} color={accent} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {arch && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: `${accent}22`, color: accent }}
                  >
                    <span>{arch.emoji}</span>
                    {arch.name} · {arch.role}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-white/45">
                  <Clock size={12} /> Explorer since {since}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Level & XP */}
      <Reveal delay={0.05}>
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-6">
          <div className="flex items-center gap-4">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-display text-3xl font-extrabold text-abyss"
              style={{ background: `linear-gradient(135deg, ${accent}, #f97362)`, fontVariantNumeric: 'tabular-nums' }}
              aria-label={`Level ${stats.level}`}
            >
              {stats.level}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold gradient-text">{stats.title}</p>
              <p className="text-xs text-white/50" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {stats.xpIntoLevel} / {stats.xpForLevel} XP to level {stats.level + 1}
              </p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, #f97362)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${levelPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="font-display text-2xl font-extrabold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {stats.xp}
              </p>
              <p className="text-xs uppercase tracking-wide text-white/45">total XP</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Guest banner */}
      {user.guest && (
        <Reveal delay={0.05}>
          <Link
            to="/"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-gold-400/25 bg-gold-400/[0.06] p-4 transition hover:-translate-y-0.5"
          >
            <Sparkles className="shrink-0 text-gold-400" size={20} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">Save your progress</p>
              <p className="text-xs text-white/55">Create an account to sync your passport across devices.</p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-gold-400" />
          </Link>
        </Reveal>
      )}

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile icon={<MapPin size={18} />} value={stats.sites} label="Sites" accent="#ffd166" delay={0} />
        <StatTile icon={<Globe2 size={18} />} value={stats.countries} label="Countries" accent="#4ade80" delay={0.05} />
        <StatTile icon={<BadgeCheck size={18} />} value={stats.unesco} label="UNESCO" accent="#a78bfa" delay={0.1} />
        <StatTile icon={<LanguagesIcon size={18} />} value={stats.languages} label="Languages" accent="#f97362" delay={0.15} />
        <StatTile
          icon={<span className="text-base leading-none">🔥</span>}
          value={
            <span>
              {stats.streak}
              <span className="ml-1 text-sm font-semibold text-white/50">{stats.streak === 1 ? 'day' : 'days'}</span>
            </span>
          }
          label="Streak"
          accent="#f4b942"
          delay={0.2}
        />
      </div>

      {/* Empty state */}
      {stats.sites === 0 && (
        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl glass p-8 text-center">
            <MascotGlobe size={72} />
            <p className="max-w-sm text-white/60">
              Your passport is waiting — explore the globe to earn your first stamp.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110"
            >
              Explore the globe <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      )}

      {/* Achievements */}
      <Reveal delay={0.05}>
        <div className="mb-4 mt-10 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <BadgeCheck size={18} className="text-gold-400" /> Achievements
          </h2>
          <span className="text-xs text-white/45" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {earnedCount} / {achievements.length} earned
          </span>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <Reveal key={a.id} delay={Math.min(i, 6) * 0.04}>
            <AchievementCard a={a} />
          </Reveal>
        ))}
      </div>

      {/* Category mastery */}
      <Reveal delay={0.05}>
        <h2 className="mb-4 mt-10 flex items-center gap-2 font-display text-lg font-bold">
          <BookOpen size={18} className="text-jade-400" /> Category mastery
        </h2>
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2">
        {mastery.map((m, i) => (
          <Reveal key={m.category} delay={Math.min(i, 6) * 0.04}>
            <MasteryRow m={m} />
          </Reveal>
        ))}
      </div>

      {/* Recent explorations */}
      {recent.length > 0 && (
        <>
          <Reveal delay={0.05}>
            <h2 className="mb-4 mt-10 flex items-center gap-2 font-display text-lg font-bold">
              <MapPin size={18} className="text-clay-400" /> Recent explorations
            </h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((s, i) => {
              const country = COUNTRIES_BY_ID[s.countryId]
              return (
                <Reveal key={s.id} delay={Math.min(i, 4) * 0.05}>
                  <Link
                    to={`/site/${s.id}`}
                    className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur transition hover:-translate-y-1"
                  >
                    <div className="h-16 w-16 shrink-0">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <HeritageVisual motif={s.motif} color={s.themeColor} className="h-full w-full" rounded="rounded-none" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 py-2">
                      <p className="truncate font-display text-sm font-bold">{s.name}</p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-white/45">
                        <MapPin size={10} /> {s.city}
                        {country && <span>· {country.emojiFlag}</span>}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="mr-3 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/70"
                    />
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </>
      )}

      {/* Actions */}
      <Reveal delay={0.05}>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ShareButton data={shareData} share={shareContent} variant="pill" label="Share" />
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.07]"
          >
            <Settings size={16} /> Settings
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-clay-400/30 bg-clay-400/[0.06] px-4 py-2 text-sm font-semibold text-clay-400 transition hover:bg-clay-400/[0.12]"
          >
            Sign out
          </button>
        </div>
      </Reveal>
    </div>
  )
}
