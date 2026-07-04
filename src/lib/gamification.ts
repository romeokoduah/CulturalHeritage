import { useEffect, useState } from 'react'
import { getPassport } from './passport'
import { getUser } from './auth'
import { SITES_BY_ID } from '../data/sites'
import { archetypeFor } from '../data/archetypes'
import type { HeritageSite } from './types'

const ACTIVITY_KEY = 'heritagequest.activity.v1'

export const XP_PER_SITE = 100
export const XP_PER_COUNTRY = 150
export const XP_ARCHETYPE_BONUS = 25

const LEVEL_TITLES = ['Wanderer', 'Scout', 'Voyager', 'Pathfinder', 'Pioneer', 'Chronicler', 'Curator', 'Sage', 'Legend']

export interface Stats {
  xp: number
  level: number
  title: string
  xpIntoLevel: number
  xpForLevel: number
  levelProgress: number
  sites: number
  countries: number
  unesco: number
  languages: number
  streak: number
  categoryCounts: Record<string, number>
}

/** Day strings ('YYYY-MM-DD') the user logged a visit, for streaks. */
export function getActivity(): string[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function visitedSites(): HeritageSite[] {
  return getPassport()
    .visitedSites.map((id) => SITES_BY_ID[id])
    .filter(Boolean)
}

function computeStreak(days: string[]): number {
  if (!days.length) return 0
  const set = new Set(days)
  const d = new Date()
  const key = (x: Date) => x.toISOString().slice(0, 10)
  // Streak counts back from today; allow it to still be "alive" if today has no
  // visit yet but yesterday did.
  if (!set.has(key(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (set.has(key(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getStats(): Stats {
  const passport = getPassport()
  const sites = visitedSites()
  const user = getUser()
  const arch = archetypeFor(user?.archetype)

  const categoryCounts: Record<string, number> = {}
  const languages = new Set<string>()
  let unesco = 0
  let archMatches = 0
  for (const s of sites) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1
    languages.add(s.greeting.language)
    if (s.unesco) unesco++
    if (arch && s.category === arch.category) archMatches++
  }

  const xp =
    sites.length * XP_PER_SITE +
    passport.visitedCountries.length * XP_PER_COUNTRY +
    archMatches * XP_ARCHETYPE_BONUS

  const level = Math.floor(Math.sqrt(xp / 250)) + 1
  const levelStart = 250 * (level - 1) * (level - 1)
  const levelEnd = 250 * level * level
  const xpForLevel = levelEnd - levelStart
  const xpIntoLevel = xp - levelStart

  return {
    xp,
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    xpIntoLevel,
    xpForLevel,
    levelProgress: xpForLevel ? xpIntoLevel / xpForLevel : 0,
    sites: sites.length,
    countries: passport.visitedCountries.length,
    unesco,
    languages: languages.size,
    streak: computeStreak(getActivity()),
    categoryCounts,
  }
}

/* ─────────────────────────── achievements ─────────────────────────── */

export interface Achievement {
  id: string
  name: string
  desc: string
  emoji: string
  tier: 'bronze' | 'silver' | 'gold'
  earned: boolean
  progress: number
  goal: number
}

export function getAchievements(): Achievement[] {
  const s = getStats()
  const cc = s.categoryCounts
  const def: Omit<Achievement, 'earned' | 'progress'>[] = [
    { id: 'first-steps', name: 'First Steps', desc: 'Visit your first heritage site', emoji: '👣', tier: 'bronze', goal: 1 },
    { id: 'globetrotter', name: 'Globetrotter', desc: 'Visit 10 sites', emoji: '🧭', tier: 'bronze', goal: 10 },
    { id: 'pathfinder', name: 'Pathfinder', desc: 'Visit 25 sites', emoji: '🗺️', tier: 'silver', goal: 25 },
    { id: 'living-legend', name: 'Living Legend', desc: 'Visit 50 sites', emoji: '🏅', tier: 'gold', goal: 50 },
    { id: 'worldly', name: 'Worldly', desc: 'Earn 10 country badges', emoji: '🌍', tier: 'silver', goal: 10 },
    { id: 'unesco-hunter', name: 'UNESCO Hunter', desc: 'Visit 10 UNESCO sites', emoji: '🏛️', tier: 'silver', goal: 10 },
    { id: 'polyglot', name: 'Polyglot', desc: 'Hear greetings in 8 languages', emoji: '🗣️', tier: 'silver', goal: 8 },
    { id: 'sacred-seeker', name: 'Sacred Seeker', desc: 'Visit 5 sacred sites', emoji: '🛕', tier: 'bronze', goal: 5 },
    { id: 'on-fire', name: 'On Fire', desc: 'Reach a 5-day streak', emoji: '🔥', tier: 'gold', goal: 5 },
  ]
  const progressFor = (id: string): number => {
    switch (id) {
      case 'first-steps':
      case 'globetrotter':
      case 'pathfinder':
      case 'living-legend':
        return s.sites
      case 'worldly':
        return s.countries
      case 'unesco-hunter':
        return s.unesco
      case 'polyglot':
        return s.languages
      case 'sacred-seeker':
        return cc['Sacred'] ?? 0
      case 'on-fire':
        return s.streak
      default:
        return 0
    }
  }
  return def.map((d) => {
    const progress = Math.min(progressFor(d.id), d.goal)
    return { ...d, progress, earned: progress >= d.goal }
  })
}

/* ─────────────────────────── category mastery ─────────────────────────── */

export const MASTERY_TITLES: Record<string, string[]> = {
  Sacred: ['Seeker', 'Devotee', 'Sacred Master'],
  Monument: ['Squire', 'Guardian', 'Fortress Baron'],
  Landscape: ['Rambler', 'Trailblazer', 'Summit Lord'],
  Museum: ['Docent', 'Archivist', 'Grand Curator'],
  Intangible: ['Apprentice', 'Keeper', 'Griot Master'],
  Urban: ['Stroller', 'Flâneur', 'City Sage'],
}
const MASTERY_TIERS = [3, 6, 10]

export interface Mastery {
  category: string
  count: number
  title: string
  tier: number
  nextAt: number | null
}

export function getMastery(): Mastery[] {
  const cc = getStats().categoryCounts
  return Object.keys(MASTERY_TITLES).map((category) => {
    const count = cc[category] ?? 0
    let tier = 0
    for (let i = 0; i < MASTERY_TIERS.length; i++) if (count >= MASTERY_TIERS[i]) tier = i + 1
    const title = tier > 0 ? MASTERY_TITLES[category][tier - 1] : 'Unranked'
    const nextAt = tier < MASTERY_TIERS.length ? MASTERY_TIERS[tier] : null
    return { category, count, title, tier, nextAt }
  })
}

/* ─────────────────────────── quests ─────────────────────────── */

export interface Quest {
  id: string
  title: string
  desc: string
  emoji: string
  goal: number
  progress: number
  reward: number
  done: boolean
}

export function getQuests(): Quest[] {
  const s = getStats()
  const cc = s.categoryCounts
  const raw: Omit<Quest, 'done'>[] = [
    { id: 'sacred-journey', title: 'Sacred Journey', desc: 'Visit 3 sacred sites', emoji: '🛕', goal: 3, progress: Math.min(cc['Sacred'] ?? 0, 3), reward: 150 },
    { id: 'around-world', title: 'Around the World', desc: 'Earn badges in 5 countries', emoji: '🌏', goal: 5, progress: Math.min(s.countries, 5), reward: 250 },
    { id: 'unesco-trail', title: 'UNESCO Trail', desc: 'Visit 5 UNESCO sites', emoji: '🏛️', goal: 5, progress: Math.min(s.unesco, 5), reward: 200 },
    { id: 'polyglot-path', title: 'Polyglot Path', desc: 'Hear greetings in 5 languages', emoji: '🗣️', goal: 5, progress: Math.min(s.languages, 5), reward: 200 },
    { id: 'curators-eye', title: "Curator's Eye", desc: 'Visit 3 museums', emoji: '🏺', goal: 3, progress: Math.min(cc['Museum'] ?? 0, 3), reward: 150 },
  ]
  return raw.map((q) => ({ ...q, done: q.progress >= q.goal }))
}

/* ─────────────────────────── daily quiz ─────────────────────────── */

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answer: number
  siteId: string
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function seedFrom(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** A deterministic 5-question quiz for the given day (same for everyone). */
export function getDailyQuiz(dayKey: string = todayKey(), count = 5): QuizQuestion[] {
  const rng = mulberry32(seedFrom(dayKey))
  const pool = Object.values(SITES_BY_ID).filter((s) => s.imageUrl || s.unesco)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const chosen: HeritageSite[] = []
  const seen = new Set<string>()
  let guard = 0
  while (chosen.length < count && guard++ < 500) {
    const s = pick(pool)
    if (!seen.has(s.id)) {
      seen.add(s.id)
      chosen.push(s)
    }
  }

  const distractors = (field: (s: HeritageSite) => string, correct: string): string[] => {
    const opts = new Set<string>([correct])
    let g = 0
    while (opts.size < 4 && g++ < 200) {
      const v = field(pick(pool))
      if (v) opts.add(v)
    }
    return shuffle([...opts])
  }

  return chosen.map((s, i) => {
    const kind = i % 3
    let prompt: string
    let correct: string
    let field: (x: HeritageSite) => string
    if (kind === 0) {
      prompt = `In which city is ${s.name}?`
      correct = s.city
      field = (x) => x.city
    } else if (kind === 1) {
      prompt = `Which category best describes ${s.name}?`
      correct = s.category
      field = (x) => x.category
    } else {
      prompt = `What is the local greeting near ${s.name}?`
      correct = s.greeting.phrase
      field = (x) => x.greeting.phrase
    }
    const options = distractors(field, correct)
    return { id: `${s.id}-${i}`, prompt, options, answer: options.indexOf(correct), siteId: s.id }
  })
}

/** React hook: live stats that recompute on passport / auth changes. */
export function useStats(): Stats {
  const [stats, setStats] = useState<Stats>(getStats)
  useEffect(() => {
    const h = () => setStats(getStats())
    window.addEventListener('passport:update', h)
    window.addEventListener('auth:update', h)
    return () => {
      window.removeEventListener('passport:update', h)
      window.removeEventListener('auth:update', h)
    }
  }, [])
  return stats
}
