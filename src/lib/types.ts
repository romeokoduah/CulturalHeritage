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
