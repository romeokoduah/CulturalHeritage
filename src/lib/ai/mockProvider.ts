import type { AIProvider, ChatMessage, StorytellerContext } from './types'

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function detectIntent(text: string): string {
  const t = text.toLowerCase()
  if (/(hello|hi |hey|greet|say|translate|language|word)/.test(t)) return 'greeting'
  if (/(quiz|test me|question|challenge)/.test(t)) return 'quiz'
  if (/(fact|surprising|interesting|did you know|trivia)/.test(t)) return 'fact'
  if (/(plan|visit|itinerary|when|how do i get|travel|trip)/.test(t)) return 'plan'
  if (/(story|tell me|history|about|who|what is|explain|describe)/.test(t)) return 'story'
  return 'story'
}

function compose(text: string, ctx: StorytellerContext): string {
  const { site, country } = ctx
  const intent = detectIntent(text)
  const place = site?.name ?? country?.name ?? 'this place'

  if (site) {
    switch (intent) {
      case 'greeting':
        return `In ${site.city}, people might greet you with **"${site.greeting.phrase}"** _(${site.greeting.pronounce})_ — that means **"${site.greeting.meaning}"** in ${site.greeting.language}. Try saying it aloud the next time you picture standing at ${site.name}. 🌍`
      case 'fact':
        return `Here's something many people don't know about ${site.name}: ${rand(site.funFacts)}\n\nWant another, or shall I tell you the fuller story?`
      case 'quiz': {
        const fact = rand(site.funFacts)
        return `Alright — a quick challenge about ${site.name}. 🧠\n\n**True or false?** "${fact}"\n\n_(It's true — but tell me why you think so, and I'll add the story behind it.)_`
      }
      case 'plan':
        return `${site.name} sits in **${site.city}** (${site.category.toLowerCase()} heritage, ${site.yearsLabel}).${
          site.unesco ? ' It carries UNESCO World Heritage status. ' : ' '
        }Go early to beat the light and the crowds, take a local guide if you can, and give yourself time to simply sit with the place. Shall I suggest what to look for when you arrive?`
      case 'story':
      default:
        return `${site.story}\n\n_Ask me for a surprising fact, a greeting in ${site.greeting.language}, or a quick quiz about ${site.name}._`
    }
  }

  if (country) {
    switch (intent) {
      case 'greeting':
        return `${country.name} is home to many languages — ${country.languages.slice(0, 3).join(', ')} among them. Pick one of its heritage sites and I'll teach you a real greeting used there. 🗣️`
      case 'plan':
        return `A journey through ${country.name}'s heritage (${country.region}) could move between its ${country.siteIds.length} featured sites. ${country.heritageIntro} Tap a site on this page and I'll go deep.`
      default:
        return `${country.heritageIntro}\n\n_Ask me about any of ${country.name}'s heritage sites and I'll tell its story._`
    }
  }

  return `I'm your heritage storyteller. Spin the globe, choose ${place}, and ask me for its story, a local greeting, a surprising fact, or a quiz. 🌏`
}

/**
 * MockProvider — an offline, zero-cost storyteller built from curated heritage
 * data. It streams word-by-word to feel alive. Swap this for the Claude
 * provider by changing the active provider in ./index.ts.
 */
export const mockProvider: AIProvider = {
  id: 'mock',
  label: 'Heritage Guide (offline)',
  isReady: () => true,
  async *stream(history: ChatMessage[], context: StorytellerContext, signal?: AbortSignal) {
    const last = [...history].reverse().find((m) => m.role === 'user')
    const full = compose(last?.content ?? '', context)
    const tokens = full.split(/(\s+)/)
    // brief "thinking" beat
    await new Promise((r) => setTimeout(r, 260))
    for (const token of tokens) {
      if (signal?.aborted) return
      yield token
      await new Promise((r) => setTimeout(r, 14 + Math.random() * 26))
    }
  },
}
