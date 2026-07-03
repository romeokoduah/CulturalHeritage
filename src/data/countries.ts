import type { Country } from '../lib/types'

export const COUNTRIES: Country[] = [
  {
    id: 'ghana',
    name: 'Ghana',
    emojiFlag: '🇬🇭',
    coords: [7.9465, -1.0232],
    region: 'West Africa',
    summary:
      'The Gold Coast of empires and Independence — home to Ashanti kingdoms, kente cloth, highlife rhythm and the first sub-Saharan nation to break free of colonial rule.',
    languages: ['Twi (Akan)', 'Ewe', 'Ga', 'Dagbani', 'English'],
    colors: ['#e5533d', '#f4b942'],
    heritageIntro:
      'Ghana carries the memory of the Atlantic slave trade in its coastal castles, the philosophy of the Ashanti in its woven cloth, and the pulse of highlife in its streets. Its heritage is at once monumental and intimate — cast in stone forts and stitched into gold-threaded proverbs.',
    badgeLabel: 'Gold Coast Explorer',
    motif: 'fort',
    siteIds: ['cape-coast-castle', 'kente-bonwire', 'larabanga-mosque'],
  },
  {
    id: 'china',
    name: 'Beijing',
    emojiFlag: '🇨🇳',
    coords: [39.9042, 116.4074],
    region: 'East Asia',
    summary:
      'The imperial capital of dynasties — where the Great Wall meets courtyard alleys, Peking Opera resonates through tea houses, and centuries of culture live on in every hutong corner.',
    languages: ['Mandarin', 'Beijing Dialect', 'Cantonese', 'Wu', 'Min'],
    colors: ['#e5533d', '#ffd166'],
    heritageIntro:
      "Beijing's heritage stretches from the rammed-earth ramparts of the Great Wall to the sacred geometry of the Temple of Heaven, from the vanishing hutong alleys to the painted faces of Peking Opera. It is a city where imperial grandeur and intimate neighbourhood life have been fused for millennia.",
    badgeLabel: 'Imperial Capital Voyager',
    motif: 'wall',
    siteIds: [
      'great-wall-mutianyu', 'terracotta-army', 'west-lake-hangzhou',
      'beijing-dialect', 'pingshu-narrative', 'peking-opera',
      'siheyuan-hutong', 'temple-of-heaven', 'beijing-roast-duck',
      'cloisonne-enamel', 'temple-fairs-miaohui', 'tcm-beijing-school',
      'diabolo-spinning',
    ],
  },
  {
    id: 'kazakhstan',
    name: 'Kazakhstan',
    emojiFlag: '🇰🇿',
    coords: [48.0196, 66.9237],
    region: 'Central Asia',
    summary:
      'The vast heart of the Eurasian steppe — land of nomads, Silk Road caravans, sun-headed petroglyphs and the wordless storytelling of the dombyra.',
    languages: ['Kazakh', 'Russian'],
    colors: ['#22c55e', '#ffd166'],
    heritageIntro:
      "Kazakhstan's heritage is the heritage of the steppe: mobile, musical and monumental in unexpected places. From Timurid domes at Turkistan to Bronze Age carvings at Tamgaly, it bridges the nomadic and the imperial across nine time-worn centuries and beyond.",
    badgeLabel: 'Steppe Wayfarer',
    motif: 'yurt',
    siteIds: ['mausoleum-khoja-ahmed-yasawi', 'tamgaly-petroglyphs', 'dombra-kui'],
  },
  {
    id: 'hongkong',
    name: 'Hong Kong',
    emojiFlag: '🇭🇰',
    coords: [22.3193, 114.1694],
    region: 'East Asia',
    summary:
      'Where a fishing archipelago became a global city — a place of temples and towers, junk boats and skyscrapers, incense smoke curling beside neon light.',
    languages: ['Cantonese', 'English', 'Mandarin'],
    colors: ['#e5533d', '#22c55e'],
    heritageIntro:
      "Hong Kong's heritage lives in the tension between old and new: stilt villages of the Tanka boat people, incense-filled temples to the gods of war and literature, and a giant bronze Buddha watching over Lantau — all a cable-car ride from one of the densest skylines on Earth.",
    badgeLabel: 'Pearl of the Orient Guide',
    motif: 'harbor',
    siteIds: ['tian-tan-buddha', 'tai-o-fishing-village', 'man-mo-temple'],
  },
]

export const COUNTRIES_BY_ID: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c]),
)
