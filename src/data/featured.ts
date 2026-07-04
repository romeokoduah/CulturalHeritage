/**
 * Editorially "trending" heritage sites, surfaced on the Landing page and
 * badged as "Must Visit" on country pages. Single source of truth — imported
 * by both so the two never drift apart.
 */
export const TRENDING_IDS = [
  'pyramids-of-giza',
  'angkor-wat',
  'taj-mahal',
  'colosseum',
  'alhambra-granada',
  'mount-fuji',
] as const

export const TRENDING_ID_SET: ReadonlySet<string> = new Set(TRENDING_IDS)
