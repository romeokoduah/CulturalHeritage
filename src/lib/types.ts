export type Motif =
  | 'arch'
  | 'temple'
  | 'mountains'
  | 'city'
  | 'mask'
  | 'wall'
  | 'yurt'
  | 'harbor'
  | 'fort'
  | 'drum'

export interface GalleryPanel {
  motif: Motif
  caption: string
  imageUrl?: string
}

export interface HeritageSite {
  id: string
  countryId: string
  name: string
  localName?: string
  tagline: string
  /** [latitude, longitude] */
  coords: [number, number]
  city: string
  category: 'Monument' | 'Sacred' | 'Landscape' | 'Museum' | 'Intangible' | 'Urban'
  unesco: boolean
  yearsLabel: string
  /** Sketchfab model id for a public embeddable model, or undefined */
  sketchfabModelId?: string
  motif: Motif
  gallery: GalleryPanel[]
  story: string
  funFacts: string[]
  /** A short greeting phrase in a local language, with pronunciation + meaning */
  greeting: { phrase: string; pronounce: string; meaning: string; language: string }
  themeColor: string
  /** Real photo URL from Unsplash/Pexels */
  imageUrl?: string
  /** Approximate founding year for timeline (negative = BCE) */
  foundedYear?: number
  /** Preservation status */
  preservationStatus?: string
}

export interface Country {
  id: string
  name: string
  emojiFlag: string
  /** [latitude, longitude] used to fly the globe */
  coords: [number, number]
  region: string
  summary: string
  languages: string[]
  colors: [string, string]
  heritageIntro: string
  badgeLabel: string
  motif: Motif
  siteIds: string[]
}

export interface TimelineEvent {
  year: number
  yearLabel: string
  title: string
  description: string
  imageUrl?: string
  countryId: string
  siteId?: string
  era?: string
}
