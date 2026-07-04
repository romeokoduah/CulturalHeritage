import { SITES } from '../data/sites'
import { COUNTRIES_BY_ID } from '../data/countries'
import { MODELS_3D } from '../data/models3d'
import { TRENDING_ID_SET } from '../data/featured'
import type { HeritageSite } from './types'

/**
 * The Hall of Fame is computed from the static dataset — a deterministic "fame
 * score" ranks the world's greatest places by category, region and overall.
 * (The community/explorer halls live in the leaderboard, seeded until accounts
 * sync.) Same inputs → same halls every render.
 */

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 1000
}

export function fameScore(s: HeritageSite): number {
  let n = 0
  if (s.unesco) n += 45
  if (s.imageUrl) n += 15
  if (TRENDING_ID_SET.has(s.id)) n += 35
  if (MODELS_3D[s.id]) n += 25
  if (typeof s.foundedYear === 'number') n += Math.min(30, Math.max(0, (2025 - s.foundedYear) / 130))
  // Stable tiebreak so equal-score sites keep a deterministic order.
  n += hash(s.id) / 1000
  return n
}

export const HALL_CATEGORIES = ['Monument', 'Sacred', 'Landscape', 'Museum', 'Intangible', 'Urban'] as const

const byFame = (a: HeritageSite, b: HeritageSite) => fameScore(b) - fameScore(a)

export function topByCategory(category: string, n = 6): HeritageSite[] {
  return SITES.filter((s) => s.category === category).sort(byFame).slice(0, n)
}

export function legends(n = 12): HeritageSite[] {
  return [...SITES].sort(byFame).slice(0, n)
}

export interface RegionalHall {
  region: string
  sites: HeritageSite[]
}

export function regionalHalls(perRegion = 4): RegionalHall[] {
  const byRegion = new Map<string, HeritageSite[]>()
  for (const s of SITES) {
    const region = COUNTRIES_BY_ID[s.countryId]?.region ?? 'Elsewhere'
    if (!byRegion.has(region)) byRegion.set(region, [])
    byRegion.get(region)!.push(s)
  }
  return [...byRegion.entries()]
    .map(([region, sites]) => ({ region, sites: sites.sort(byFame).slice(0, perRegion) }))
    .sort((a, b) => a.region.localeCompare(b.region))
}

/** Hidden gems — non-UNESCO, off the trending list, but still remarkable. */
export function hiddenGems(n = 6): HeritageSite[] {
  return SITES.filter((s) => !s.unesco && !TRENDING_ID_SET.has(s.id))
    .sort(byFame)
    .slice(0, n)
}

function pickByPeriod(period: number): HeritageSite {
  const ranked = legends(40)
  return ranked[period % ranked.length]
}

export function wonderOfMonth(): HeritageSite {
  const d = new Date()
  return pickByPeriod(d.getFullYear() * 12 + d.getMonth())
}

export function siteOfDay(): HeritageSite {
  const d = new Date()
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  const pool = legends(60)
  return pool[dayOfYear % pool.length]
}
