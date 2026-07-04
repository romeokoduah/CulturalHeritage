import type { HeritageSite } from '../lib/types'

/**
 * Traveler archetypes — the "kind of explorer" a user is. Chosen at onboarding
 * (or earned by behaviour), each maps to one of the site categories, giving it
 * a colour, a badge, and its own leaderboard league.
 */
export interface Archetype {
  id: string
  name: string
  role: string
  /** The heritage category this archetype favours. */
  category: HeritageSite['category']
  color: string
  emoji: string
  blurb: string
  perk: string
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'pilgrim',
    name: 'The Pilgrim',
    role: 'Sacred sites',
    category: 'Sacred',
    color: '#56d98a',
    emoji: '🛕',
    blurb: 'Seeks the quiet and the holy — temples, mosques, shrines and sacred mountains.',
    perk: 'Bonus XP at every Sacred site.',
  },
  {
    id: 'chronicler',
    name: 'The Chronicler',
    role: 'Monuments & the ancient',
    category: 'Monument',
    color: '#ffd166',
    emoji: '📜',
    blurb: 'Chases the deep past — ruins, dynasties and the stones that outlived empires.',
    perk: 'Bonus XP at every Monument.',
  },
  {
    id: 'wanderer',
    name: 'The Wanderer',
    role: 'Landscapes',
    category: 'Landscape',
    color: '#a78bfa',
    emoji: '⛰️',
    blurb: 'Follows the horizon — lagoons, peaks, chimneys and the shape of the land.',
    perk: 'Bonus XP at every Landscape.',
  },
  {
    id: 'curator',
    name: 'The Curator',
    role: 'Museums',
    category: 'Museum',
    color: '#f97362',
    emoji: '🏛️',
    blurb: 'Reads every placard — collections, archives and the objects behind the story.',
    perk: 'Bonus XP at every Museum.',
  },
  {
    id: 'griot',
    name: 'The Griot',
    role: 'Living culture',
    category: 'Intangible',
    color: '#f4b942',
    emoji: '🥁',
    blurb: 'Collects songs, weaves, rites and greetings — heritage that is still breathing.',
    perk: 'Bonus XP at every Intangible site.',
  },
  {
    id: 'urbanist',
    name: 'The Urbanist',
    role: 'Urban heritage',
    category: 'Urban',
    color: '#2dd4bf',
    emoji: '🌆',
    blurb: 'Walks the old cities — quarters, canals and streets where centuries stack up.',
    perk: 'Bonus XP in every historic city.',
  },
]

export const ARCHETYPES_BY_ID: Record<string, Archetype> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.id, a]),
)

export function archetypeFor(id?: string): Archetype | undefined {
  return id ? ARCHETYPES_BY_ID[id] : undefined
}
