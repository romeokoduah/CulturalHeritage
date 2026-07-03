import type { HeritageSite } from '../lib/types'

export const SITES: HeritageSite[] = [
  // ───────────────────────────── GHANA ─────────────────────────────
  {
    id: 'cape-coast-castle',
    countryId: 'ghana',
    name: 'Cape Coast Castle',
    localName: 'Oguaa Castle',
    tagline: 'A whitewashed fortress holding the memory of the Atlantic slave trade.',
    coords: [5.1035, -1.2426],
    city: 'Cape Coast',
    category: 'Monument',
    unesco: true,
    yearsLabel: 'Built 1653',
    sketchfabModelId: undefined,
    motif: 'fort',
    themeColor: '#e5533d',
    gallery: [
      { motif: 'fort', caption: 'Seaward ramparts and cannon' },
      { motif: 'arch', caption: 'The Door of No Return' },
      { motif: 'harbor', caption: 'Fishing boats on the Gulf of Guinea' },
    ],
    story:
      'Rising white against the Gulf of Guinea, Cape Coast Castle began as a Swedish timber lodge in 1653 and grew into one of the largest slave-holding fortresses on the West African coast. Beneath its bright courtyards lie the dungeons where enslaved Africans were held before passing through the "Door of No Return." Today it is a place of pilgrimage and remembrance — a UNESCO World Heritage Site that asks every visitor to carry its story forward.',
    funFacts: [
      'The castle changed hands between Swedish, Danish, Dutch and British traders before becoming British in 1664.',
      'A church once stood directly above the male slave dungeon.',
      'US President Barack Obama and his family visited in 2009.',
    ],
    greeting: { phrase: 'Akwaaba', pronounce: 'ah-KWAA-ba', meaning: 'Welcome', language: 'Twi' },
  },
  {
    id: 'kente-bonwire',
    countryId: 'ghana',
    name: 'Kente Weaving of Bonwire',
    tagline: 'The living art of colour, proverb and cloth woven by the Ashanti.',
    coords: [6.789, -1.462],
    city: 'Bonwire, Ashanti',
    category: 'Intangible',
    unesco: false,
    yearsLabel: '17th century → today',
    motif: 'drum',
    themeColor: '#f4b942',
    gallery: [
      { motif: 'drum', caption: 'Strip-loom rhythm of the weaver' },
      { motif: 'mask', caption: 'Adinkra symbols and meaning' },
    ],
    story:
      'In the village of Bonwire, the clack of narrow strip-looms has not stopped for centuries. Kente is not merely cloth — every pattern carries a name, a proverb, a philosophy. Legend says two hunters learned the craft by studying a spider spinning its web. Once reserved for Ashanti royalty, kente is now worn worldwide as a banner of African identity, each colour deliberate: gold for status, green for renewal, black for spiritual maturity.',
    funFacts: [
      'Each kente pattern has a name and an associated proverb or historical event.',
      'A full royal cloth can take weeks and multiple weavers to complete.',
      'The most famous pattern, Adweneasa, means "my skill is exhausted / my ideas are finished".',
    ],
    greeting: { phrase: 'Wo ho te sɛn?', pronounce: 'woh hoh teh sen', meaning: 'How are you?', language: 'Twi' },
  },
  {
    id: 'larabanga-mosque',
    countryId: 'ghana',
    name: 'Larabanga Mosque',
    tagline: "West Africa's oldest mosque, sculpted from mud and timber.",
    coords: [9.2205, -1.858],
    city: 'Larabanga',
    category: 'Sacred',
    unesco: false,
    yearsLabel: 'c. 1421',
    motif: 'temple',
    themeColor: '#4ade80',
    gallery: [
      { motif: 'temple', caption: 'Sudanese-style mud pillars' },
      { motif: 'arch', caption: 'Whitewashed prayer niche' },
    ],
    story:
      'Often called the "Mecca of West Africa," the Larabanga Mosque is a jewel of Sudanese-Sahelian mud architecture. Its white pyramidal towers and timber struts have been re-plastered by hand for six centuries. Beside it grows a "mystic" baobab said to mark where the mosque\'s founder was told to build. It is one of the oldest surviving mosques on the continent and a testament to the reach of trans-Saharan trade and Islam.',
    funFacts: [
      'The projecting timber beams are not just decorative — they are the scaffolding for annual re-plastering.',
      'An ancient Quran housed nearby is believed by locals to have descended from heaven.',
      'It was placed on the World Monuments Watch list of endangered sites.',
    ],
    greeting: { phrase: 'Ni ti yuun', pronounce: 'nee tee yoon', meaning: 'Good morning', language: 'Gonja' },
  },

  // ───────────────────────────── CHINA ─────────────────────────────
  {
    id: 'great-wall-mutianyu',
    countryId: 'china',
    name: 'The Great Wall at Mutianyu',
    localName: '慕田峪长城',
    tagline: 'A stone dragon riding the mountain spine for thousands of kilometres.',
    coords: [40.4319, 116.5704],
    city: 'Beijing',
    category: 'Monument',
    unesco: true,
    yearsLabel: 'Ming dynasty, 14th–17th c.',
    sketchfabModelId: undefined,
    motif: 'wall',
    themeColor: '#e5533d',
    gallery: [
      { motif: 'wall', caption: 'Watchtowers along the ridgeline' },
      { motif: 'mountains', caption: 'Forested peaks of Huairou' },
    ],
    story:
      'The Great Wall is not one wall but many, built and rebuilt across two thousand years by successive dynasties to guard the northern frontier. The Mutianyu section, restored from Ming-era stone, winds through wooded mountains with 22 watchtowers in a short stretch. Contrary to legend it is not visible from the Moon — but standing on its battlements, watching it ripple to the horizon, it feels like it might reach there.',
    funFacts: [
      'The combined length of all Great Wall sections exceeds 21,000 km.',
      'Workers used sticky rice mortar — its amylopectin made the wall remarkably durable.',
      'It became a UNESCO World Heritage Site in 1987.',
    ],
    greeting: { phrase: '你好', pronounce: 'nee-how', meaning: 'Hello', language: 'Mandarin' },
  },
  {
    id: 'terracotta-army',
    countryId: 'china',
    name: 'Terracotta Army',
    localName: '兵马俑',
    tagline: "An 8,000-strong clay army guarding China's first emperor.",
    coords: [34.3841, 109.2785],
    city: "Xi'an",
    category: 'Museum',
    unesco: true,
    yearsLabel: 'c. 210 BCE',
    sketchfabModelId: undefined,
    motif: 'mask',
    themeColor: '#f4b942',
    gallery: [
      { motif: 'mask', caption: 'Individually sculpted faces' },
      { motif: 'temple', caption: 'Excavated pits at the mausoleum' },
    ],
    story:
      'In 1974, farmers digging a well near Xi\'an struck a buried army. Emperor Qin Shi Huang had commissioned thousands of life-sized terracotta soldiers — infantry, archers, charioteers and horses — to guard him in the afterlife. No two faces are alike. Once painted in brilliant colour and armed with real bronze weapons, they are among the greatest archaeological discoveries ever made, and the emperor\'s tomb mound itself remains unexcavated to this day.',
    funFacts: [
      'Each warrior was assembled from modular parts, then individualised by hand.',
      'The figures were originally vividly painted; pigment often flakes within minutes of exposure to air.',
      'Ancient records describe rivers of mercury inside the still-sealed tomb — soil tests show unusually high mercury levels.',
    ],
    greeting: { phrase: '欢迎', pronounce: 'hwan-ying', meaning: 'Welcome', language: 'Mandarin' },
  },
  {
    id: 'west-lake-hangzhou',
    countryId: 'china',
    name: 'West Lake',
    localName: '西湖',
    tagline: 'A thousand years of poetry mirrored in still water.',
    coords: [30.2416, 120.1385],
    city: 'Hangzhou',
    category: 'Landscape',
    unesco: true,
    yearsLabel: 'Cultivated since 9th c.',
    motif: 'mountains',
    themeColor: '#22c55e',
    gallery: [
      { motif: 'mountains', caption: 'Misted hills and causeways' },
      { motif: 'temple', caption: 'Leifeng Pagoda at dusk' },
    ],
    story:
      'For over a millennium West Lake has shaped the Chinese ideal of scenic beauty — causeways, arched bridges, pagodas and willow banks composed like a landscape painting. Poets from the Tang and Song dynasties immortalised its "ten scenes," and the governor-poet Su Shi built one of its famous causeways. It is a masterpiece of designed landscape that influenced garden design across East Asia.',
    funFacts: [
      'The poet Su Shi (Su Dongpo) engineered the Su Causeway while serving as Hangzhou\'s governor.',
      'The legend of the White Snake, one of China\'s great folk tales, is set here.',
      'It inspired garden and lake designs as far as Japan and Korea.',
    ],
    greeting: { phrase: '西湖美', pronounce: 'shee-hoo may', meaning: 'West Lake is beautiful', language: 'Mandarin' },
  },

  // ─────────────────────────── KAZAKHSTAN ───────────────────────────
  {
    id: 'mausoleum-khoja-ahmed-yasawi',
    countryId: 'kazakhstan',
    name: 'Mausoleum of Khoja Ahmed Yasawi',
    tagline: 'An unfinished Timurid masterpiece crowned with the largest brick dome in Central Asia.',
    coords: [43.2973, 68.2716],
    city: 'Turkistan',
    category: 'Sacred',
    unesco: true,
    yearsLabel: 'Begun 1389',
    sketchfabModelId: undefined,
    motif: 'temple',
    themeColor: '#4ade80',
    gallery: [
      { motif: 'temple', caption: 'Turquoise ribbed dome' },
      { motif: 'arch', caption: 'Unfinished portal with scaffolding scars' },
    ],
    story:
      'Commissioned by Timur (Tamerlane) to honour the revered Sufi poet Khoja Ahmed Yasawi, this mausoleum in Turkistan was a laboratory for the architecture that would later crown Samarkand. Its enormous double dome and glowing turquoise tilework were left deliberately unfinished when Timur died — the wooden scaffolding marks are still visible, a frozen moment of medieval construction. It remains a major pilgrimage site for Central Asian Muslims.',
    funFacts: [
      'It houses the largest surviving brick dome in Central Asia, over 18 metres across.',
      'A giant bronze cauldron (the Tai Kazan) inside could hold water for 3,000 pilgrims.',
      'Three pilgrimages here were once considered equal to the Hajj by some Central Asian traditions.',
    ],
    greeting: { phrase: 'Қош келдіңіз', pronounce: 'kosh kel-din-iz', meaning: 'Welcome', language: 'Kazakh' },
  },
  {
    id: 'tamgaly-petroglyphs',
    countryId: 'kazakhstan',
    name: 'Tamgaly Petroglyphs',
    tagline: 'Bronze Age sun-headed deities carved into a desert gorge.',
    coords: [43.8, 75.53],
    city: 'Almaty Region',
    category: 'Landscape',
    unesco: true,
    yearsLabel: 'c. 1400 BCE',
    motif: 'mountains',
    themeColor: '#f4b942',
    gallery: [
      { motif: 'mountains', caption: 'Rock canyon of engravings' },
      { motif: 'mask', caption: 'Solar-headed anthropomorphs' },
    ],
    story:
      'Hidden in a gorge in the Chu-Ili mountains, Tamgaly holds some 5,000 petroglyphs pecked into rock over three thousand years. Its most famous images are strange "sun-headed" figures — humans crowned with radiant discs — alongside hunters, dancers and herds. The site was a sacred sanctuary where Bronze Age communities carried out rituals, and it offers a rare, layered record of the beliefs of the Eurasian steppe.',
    funFacts: [
      'The name Tamgaly relates to "marked" or "painted" place.',
      'The engravings span from the Bronze Age to the early 20th century.',
      'The sun-headed figures may represent solar deities or shamans in ritual dress.',
    ],
    greeting: { phrase: 'Сәлеметсіз бе', pronounce: 'sa-le-met-siz be', meaning: 'Hello', language: 'Kazakh' },
  },
  {
    id: 'dombra-kui',
    countryId: 'kazakhstan',
    name: 'Küi of the Dombyra',
    tagline: 'Wordless stories told on two strings across the steppe.',
    coords: [48.0196, 66.9237],
    city: 'Nationwide',
    category: 'Intangible',
    unesco: true,
    yearsLabel: 'Ancient → living tradition',
    motif: 'drum',
    themeColor: '#a78bfa',
    gallery: [
      { motif: 'drum', caption: 'The two-stringed dombyra' },
      { motif: 'yurt', caption: 'Music inside the yurt' },
    ],
    story:
      'The dombyra is the soul of Kazakh music — a long-necked, two-stringed lute whose solo instrumental pieces, called küi, tell stories without a single word. A great küishi can evoke a galloping horse, a grieving mother, or a battle purely through rhythm and resonance. Passed from master to student by ear for generations, the art of the dombyra küi is inscribed on UNESCO\'s list of Intangible Cultural Heritage.',
    funFacts: [
      'A küi is a programmatic instrumental piece — every one carries a narrative or legend.',
      'The legendary composer Kurmangazy is a national hero of the tradition.',
      'The dombyra\'s two strings are traditionally tuned a fourth or fifth apart.',
    ],
    greeting: { phrase: 'Рахмет', pronounce: 'rah-met', meaning: 'Thank you', language: 'Kazakh' },
  },

  // ─────────────────────────── HONG KONG ───────────────────────────
  {
    id: 'tian-tan-buddha',
    countryId: 'hongkong',
    name: 'Tian Tan Buddha',
    localName: '天壇大佛',
    tagline: 'A serene bronze giant watching over the hills of Lantau.',
    coords: [22.2540, 113.905],
    city: 'Lantau Island',
    category: 'Sacred',
    unesco: false,
    yearsLabel: 'Completed 1993',
    sketchfabModelId: undefined,
    motif: 'temple',
    themeColor: '#f4b942',
    gallery: [
      { motif: 'temple', caption: '268 steps to the Big Buddha' },
      { motif: 'mountains', caption: 'Ngong Ping plateau' },
    ],
    story:
      'Seated atop 268 steps on the Ngong Ping plateau, the Tian Tan Buddha — "Big Buddha" — is one of the largest seated bronze Buddha statues in the world. Facing north toward mainland China, its right hand raised to remove affliction, it symbolises the harmony of people, nature and faith. Beside it, Po Lin Monastery fills the air with incense. A cable car glides visitors up from the sea, trading the neon city for mountain silence.',
    funFacts: [
      'The statue is 34 metres tall and weighs over 250 tonnes.',
      'Its design echoes the Altar of Heaven (Tian Tan) in Beijing — hence the name.',
      'A relic said to be a bone of the Buddha is enshrined beneath the statue.',
    ],
    greeting: { phrase: '你好', pronounce: 'nei-hou', meaning: 'Hello', language: 'Cantonese' },
  },
  {
    id: 'tai-o-fishing-village',
    countryId: 'hongkong',
    name: 'Tai O Fishing Village',
    localName: '大澳',
    tagline: 'Stilt houses and salted memories of the Tanka boat people.',
    coords: [22.2528, 113.8597],
    city: 'Lantau Island',
    category: 'Urban',
    unesco: false,
    yearsLabel: 'Centuries-old',
    motif: 'harbor',
    themeColor: '#22c55e',
    gallery: [
      { motif: 'harbor', caption: 'Stilt houses over the water' },
      { motif: 'city', caption: 'Narrow lanes and drying seafood' },
    ],
    story:
      'Known as the "Venice of Hong Kong," Tai O is a fishing village where the Tanka people built their homes on stilts above the tidal creeks. Fishing boats, shrimp-paste factories and salted fish hanging in the sun preserve a way of life that predates the skyscrapers across the water. It is a fragile, living heritage — endangered by fire, storms and modern development, yet fiercely loved.',
    funFacts: [
      'The stilt houses (pang uk) are traditionally linked by rope-drawn ferries and footbridges.',
      'Tai O is famous for its pungent shrimp paste and salted fish.',
      'Pink dolphins are sometimes spotted in the surrounding waters.',
    ],
    greeting: { phrase: '多謝', pronounce: 'daw-jeh', meaning: 'Thank you', language: 'Cantonese' },
  },
  {
    id: 'man-mo-temple',
    countryId: 'hongkong',
    name: 'Man Mo Temple',
    localName: '文武廟',
    tagline: 'Coils of incense honouring the gods of literature and war.',
    coords: [22.2839, 114.1503],
    city: 'Sheung Wan',
    category: 'Sacred',
    unesco: false,
    yearsLabel: 'Built c. 1847',
    motif: 'temple',
    themeColor: '#e5533d',
    gallery: [
      { motif: 'temple', caption: 'Giant hanging incense coils' },
      { motif: 'city', caption: 'Hollywood Road old town' },
    ],
    story:
      'Tucked among the antique shops of Hollywood Road, Man Mo Temple has burned incense since the 1840s in honour of Man Cheong, god of literature, and Mo Tai, god of war. Students once prayed here before imperial examinations. Beneath giant spiral incense coils that hang like galaxies from the ceiling, the temple is a pocket of old Hong Kong — a Grade I historic building where the colonial city and Chinese tradition meet in smoke and gold.',
    funFacts: [
      'Man is the god of literature; Mo is the god of war — scholars and soldiers both worshipped here.',
      'The hanging incense coils can burn for up to two weeks.',
      'It is now managed as a declared monument and heritage site.',
    ],
    greeting: { phrase: '早晨', pronounce: 'jou-san', meaning: 'Good morning', language: 'Cantonese' },
  },
]

export const SITES_BY_ID: Record<string, HeritageSite> = Object.fromEntries(
  SITES.map((s) => [s.id, s]),
)

export const SITES_BY_COUNTRY: Record<string, HeritageSite[]> = SITES.reduce(
  (acc, s) => {
    ;(acc[s.countryId] ||= []).push(s)
    return acc
  },
  {} as Record<string, HeritageSite[]>,
)
