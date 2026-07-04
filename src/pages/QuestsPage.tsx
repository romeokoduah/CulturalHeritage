import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Sparkles, Check, ArrowRight, Trophy, Clock, BadgeCheck } from 'lucide-react'
import { useStats, getQuests, getAchievements, type Quest } from '../lib/gamification'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/** Streak flame — inline SVG since lucide's Flame isn't in the pinned allow-list. */
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2c.5 3.5-1.8 5.2-3.3 6.8C7.2 10.3 6 11.9 6 14a6 6 0 0 0 12 0c0-2.3-1.1-4.2-2.5-5.8-.6.7-1.4 1.2-2.3 1.2 1-2.3.4-5.3-1.2-7.4Zm0 17a3 3 0 0 1-3-3c0-1.2.7-2.1 1.5-2.9.3.6.9 1 1.6 1 1 0 1.5-.7 1.7-1.5.9.8 1.2 1.9 1.2 3.4a3 3 0 0 1-3 3Z" />
    </svg>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function QuestCard({ quest }: { quest: Quest }) {
  const pct = Math.round((quest.progress / quest.goal) * 100)
  return (
    <motion.li variants={fadeUp}>
      <div
        className={cn(
          'group relative flex h-full flex-col gap-3 rounded-2xl glass p-4 transition hover:-translate-y-0.5',
          quest.done && 'ring-1 ring-jade-400/40',
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-2xl"
            aria-hidden
          >
            {quest.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold">{quest.title}</p>
            <p className="mt-0.5 text-xs text-white/50">{quest.desc}</p>
          </div>
          {quest.done ? (
            <span className="flex items-center gap-1 rounded-full bg-jade-400/15 px-2.5 py-1 text-[11px] font-semibold text-jade-400">
              <Check size={12} /> Complete
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-gold-400/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-gold-400">
              +{quest.reward} XP
            </span>
          )}
        </div>

        <div className="mt-auto">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                quest.done
                  ? 'bg-gradient-to-r from-jade-400 to-jade-500'
                  : 'bg-gradient-to-r from-gold-400 to-clay-400',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/45">
            <span className="tabular-nums">
              {quest.progress} / {quest.goal}
            </span>
            <span className="tabular-nums">
              {quest.done ? 'Claimed' : `${pct}%`}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  )
}

export function QuestsPage() {
  const stats = useStats()
  const { user } = useAuth()
  const name = user?.name ?? 'Explorer'

  const quests = [...getQuests()].sort((a, b) => Number(a.done) - Number(b.done))
  const completed = quests.filter((q) => q.done).length

  const nextAchievements = getAchievements()
    .filter((a) => !a.earned)
    .sort((a, b) => b.progress / b.goal - a.progress / a.goal)
    .slice(0, 3)

  const levelPct = Math.round(stats.levelProgress * 100)
  const firstTime = stats.sites === 0

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mt-6 rounded-3xl glass p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400/80">
              <Trophy size={13} /> Quests &amp; Goals
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              {greeting()}, <span className="gradient-text">{name}</span>
            </h1>
            <p className="mt-1 text-sm text-white/55">
              {firstTime
                ? 'Your adventure starts here — pick a goal and earn your first XP.'
                : 'Keep the momentum going. Every visit moves a quest forward.'}
            </p>
          </div>

          {/* Streak */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-4 py-3',
              stats.streak > 0
                ? 'border-clay-400/30 bg-clay-400/10'
                : 'border-white/10 bg-white/5',
            )}
          >
            <FlameIcon
              className={cn(
                'h-8 w-8 shrink-0',
                stats.streak > 0 ? 'text-clay-400' : 'text-white/30',
              )}
            />
            <div className="leading-tight">
              {stats.streak > 0 ? (
                <>
                  <p className="font-display text-xl font-extrabold tabular-nums">
                    {stats.streak}
                    <span className="ml-1 text-sm font-semibold text-white/50">
                      day{stats.streak === 1 ? '' : 's'}
                    </span>
                  </p>
                  <p className="text-[11px] text-white/50">streak — keep it alive!</p>
                </>
              ) : (
                <>
                  <p className="font-display text-sm font-bold">No streak yet</p>
                  <p className="text-[11px] text-white/50">Visit a site today to start one</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Level + XP bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <BadgeCheck size={14} className="text-violet-400" />
              Level {stats.level}
              <span className="text-white/45">· {stats.title}</span>
            </span>
            <span className="tabular-nums text-white/50">
              {stats.xpIntoLevel} / {stats.xpForLevel} XP
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 via-clay-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/45">
            {stats.xpForLevel - stats.xpIntoLevel} XP to Level {stats.level + 1}
          </p>
        </div>
      </motion.header>

      {/* First-time / empty state */}
      {firstTime && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-gold-400/20 bg-gradient-to-b from-gold-400/10 to-transparent p-8 text-center"
        >
          <Sparkles className="h-8 w-8 text-gold-400" />
          <h2 className="font-display text-lg font-bold">Ready for your first goal?</h2>
          <p className="max-w-md text-sm text-white/55">
            Quests turn exploring into an adventure. Spin the globe, mark a heritage site as
            visited, and watch your first quest come to life.
          </p>
          <Link
            to="/"
            className="mt-1 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-105"
          >
            Begin exploring <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Daily Challenge callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-6"
      >
        <Link
          to="/quiz"
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/20 via-clay-400/10 to-gold-400/10 p-5 transition hover:-translate-y-0.5 sm:p-6"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl" />
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl" aria-hidden>
            🧠
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-400">
              <Clock size={12} /> Daily Challenge
            </p>
            <h2 className="mt-0.5 font-display text-lg font-bold">Today&apos;s Quiz</h2>
            <p className="mt-0.5 text-sm text-white/60">
              5 quick questions on world heritage — earn XP and defend your streak.
            </p>
          </div>
          <ArrowRight className="shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-white/70" />
        </Link>
      </motion.div>

      {/* Active quests */}
      <Reveal className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Active quests</h2>
            <p className="text-xs text-white/45">Incomplete goals come first — chip away at them.</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold tabular-nums text-white/60">
            {completed}/{quests.length} done
          </span>
        </div>
        <motion.ul variants={stagger} className="grid gap-3 sm:grid-cols-2">
          {quests.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </motion.ul>
      </Reveal>

      {/* Achievements teaser */}
      {nextAchievements.length > 0 && (
        <Reveal className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Almost there</h2>
              <p className="text-xs text-white/45">Achievements within your reach.</p>
            </div>
            <Link
              to="/profile"
              className="group flex shrink-0 items-center gap-1 text-xs font-semibold text-gold-400"
            >
              See all achievements
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <motion.ul variants={stagger} className="grid gap-3 sm:grid-cols-3">
            {nextAchievements.map((a) => {
              const pct = Math.round((a.progress / a.goal) * 100)
              return (
                <motion.li
                  key={a.id}
                  variants={fadeUp}
                  className="flex items-center gap-3 rounded-2xl glass p-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-xl" aria-hidden>
                    {a.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold">{a.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] tabular-nums text-white/45">
                      {a.progress} / {a.goal}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        </Reveal>
      )}

      {/* Closing nudge */}
      {!firstTime && (
        <Reveal className="mt-10">
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center"
          >
            <Sparkles className="h-6 w-6 text-gold-400" />
            <p className="text-sm text-white/60">
              You&apos;ve explored{' '}
              <span className="font-semibold text-white tabular-nums">{stats.sites}</span>{' '}
              site{stats.sites === 1 ? '' : 's'} across{' '}
              <span className="font-semibold text-white tabular-nums">{stats.countries}</span>{' '}
              countr{stats.countries === 1 ? 'y' : 'ies'}. The next discovery is one tap away.
            </p>
            <Link
              to="/"
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
            >
              Explore the globe <ArrowRight size={15} />
            </Link>
          </motion.div>
        </Reveal>
      )}
    </div>
  )
}
