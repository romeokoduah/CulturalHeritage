/**
 * Real, publicly-hosted Sketchfab 3D model IDs, keyed by heritage-site id.
 *
 * Kept separate from sites.ts so the 4,000-line dataset stays clean and this
 * curated list can grow independently. Embed via:
 *   https://sketchfab.com/models/<id>/embed
 *
 * Not every model's owner allows third-party embedding, so the viewer always
 * degrades gracefully to the interactive Heritage View if an iframe fails to
 * load (see SketchfabViewer). A handful are artist reconstructions rather than
 * photogrammetry, but all depict the correct monument.
 */
export const MODELS_3D: Record<string, string> = {
  'pyramids-of-giza': '4a251113722f4d969b6cf2ca5f35c502',
  colosseum: '535dc96e586f40bd956ea3cbff810055',
  'taj-mahal': '7b43e635cbfb47719d5a124302b78579',
  'angkor-wat': 'be70b89f9c264fc19d63dca2ae78b224',
  'great-wall-mutianyu': '3d085397bf904e649ce97eb6c4bd9c7a',
  'terracotta-army': '2818e7b3d84b4111b5775c2262830008',
  'alhambra-granada': '163da113b0c74d4daa8624a5b3bce244',
  'sagrada-familia': '62a4e2ca2e464cdab11a4b2156d94821',
  'notre-dame-paris': '2952bd5511494fb2bb99cdd3cb2b7795',
  'mont-saint-michel': '41ced8fae4044d82bdafe29f174b5339',
  'statue-of-liberty': '04a8e7b1ba9142ba8cebc6108cd5bb97',
  'cristo-redentor': 'fa8c4b24898c40ec86a40449cec47474',
  versailles: 'ad12df2228474a8da8e4f4b8bff18f3b',
  'himeji-castle': '6e33b2a9dd42486da236b015bce8c366',
  'mount-fuji': '826d159623d64c1283cb32a83dfe2060',
  'itsukushima-shrine': 'a61f889632704ac892f2f71b8a108e26',
  'gobekli-tepe': '5a4d25c355ff48d59ab76c36812b9cf3',
  ephesus: '1cc6ad6af508422398f60f902cb70e88',
  'cologne-cathedral': '6db09518aa68415db8396cd5acf94939',
  'abu-simbel': '160b25626e5e49df8c8fd99e15ebbb5c',
  pompeii: '3c6a1b00abe549909a409e74a416eeef',
  'shwedagon-pagoda': '0102f8764d0a423f8da9522c84e8bf2d',
  'forbidden-city': '9822899391ae4bb2b50f150abfc68c78',
  'historic-istanbul': '7e7d826a49d248a7a81d4129ce976420',
  'tian-tan-buddha': '3e7bf4482e28420fbb2ca71c90dfaf23',
  'qutb-minar': '8777afc0c80549d1abb7c0f28832bb4b',
  hampi: 'dfaf413f0ce845a3b798b0bb4079962a',
  'hegra-al-hijr': '24d98ea590dd40748a193c6eee784474',
  cappadocia: '5691997304d8464e919b9ac6318a9753',
  'venice-lagoon': 'de20469bb1a6475a97e38945791ec742',
  'great-zimbabwe': '4368b31623f54917b462041beb6cbd3c',
  'ajanta-caves': '0e0aa7dd247d4d818c9ecb1e7be3bcc6',
  'mogao-caves': 'f4f3e524da5c440bb9c228de724192bc',
}

/** Resolve a model id for a site, preferring inline data then the curated map. */
export function model3dFor(siteId: string, inline?: string): string | undefined {
  return inline ?? MODELS_3D[siteId]
}
