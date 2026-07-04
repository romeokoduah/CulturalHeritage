import type { AIProvider, ChatMessage, StorytellerContext } from './types'
import type { HeritageSite } from '../types'
import { SITES_BY_COUNTRY } from '../../data/sites'
import { COUNTRIES_BY_ID } from '../../data/countries'
import { TIMELINE_EVENTS } from '../../data/timeline'

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const QUIZ_MARK = 'true or false'

/* ─────────────────────────── intent detection ─────────────────────────── */

type Intent =
  | 'greeting'
  | 'quiz'
  | 'quizAnswer'
  | 'fact'
  | 'plan'
  | 'related'
  | 'meaning'
  | 'timeline'
  | 'more'
  | 'thanks'
  | 'help'
  | 'story'

function lastAssistant(history: ChatMessage[]): string {
  return [...history].reverse().find((m) => m.role === 'assistant')?.content ?? ''
}

function detectIntent(text: string, history: ChatMessage[]): Intent {
  const t = text.toLowerCase().trim()
  const prev = lastAssistant(history).toLowerCase()

  // If we just posed a quiz and the reply looks like an answer, grade it.
  if (prev.includes(QUIZ_MARK) && /^(true|false|yes|no|maybe|a|b|c|d|i think|not sure|idk|dunno|hmm|dont know|don't know|correct|wrong)\b/.test(t))
    return 'quizAnswer'

  if (/(thank|thanks|cheers|appreciate|bye|goodbye|see you|later)/.test(t)) return 'thanks'
  if (/(help|what can you|how do you work|options|menu|what do you do)/.test(t)) return 'help'
  if (/(quiz|test me|challenge|question me)/.test(t)) return 'quiz'
  if (/(more|another|again|next|continue|keep going|go on|tell me more|and\??$|^yes$|^yeah$|^sure$|^ok)/.test(t)) return 'more'
  if (/(greet|hello|say hi|translate|language|word for|how do (you|i) say|speak)/.test(t)) return 'greeting'
  if (/(fact|surprising|interesting|did you know|trivia|surprise)/.test(t)) return 'fact'
  if (/(when|timeline|history of|era|century|built|founded|how old|date)/.test(t)) return 'timeline'
  if (/(plan|visit|itinerary|how do i get|travel|trip|go there|best time|tickets|hours)/.test(t)) return 'plan'
  if (/(other|nearby|else|similar|like this|compare|what else|around)/.test(t)) return 'related'
  if (/(name|meaning|called|why is it|significance|symbol)/.test(t)) return 'meaning'
  if (/(story|tell me|history|about|who|what is|explain|describe)/.test(t)) return 'story'
  return 'story'
}

/* ─────────────────────────── content helpers ─────────────────────────── */

/** A fun fact that hasn't appeared in the conversation yet. */
function freshFact(site: HeritageSite, history: ChatMessage[]): string {
  const said = history.filter((m) => m.role === 'assistant').map((m) => m.content).join(' ')
  const unused = site.funFacts.filter((f) => !said.includes(f.slice(0, 24)))
  return rand(unused.length ? unused : site.funFacts)
}

function timelineFor(site?: HeritageSite, countryId?: string) {
  if (site) {
    const own = TIMELINE_EVENTS.filter((e) => e.siteId === site.id)
    if (own.length) return own
  }
  const cid = site?.countryId ?? countryId
  return cid ? TIMELINE_EVENTS.filter((e) => e.countryId === cid) : []
}

function relatedSites(site: HeritageSite): HeritageSite[] {
  return (SITES_BY_COUNTRY[site.countryId] ?? []).filter((s) => s.id !== site.id)
}

const OPENERS = [
  'Here is where it gets interesting.',
  'Picture this.',
  "Let me set the scene.",
  'Come closer — this one is special.',
  'Ah, a wonderful place to linger.',
]

const FOLLOWUPS = [
  '\n\n_Want a surprising fact, a local greeting, or shall I quiz you?_',
  '\n\n_Ask me for more, or say "quiz me" to test what stuck._',
  '\n\n_Shall I go deeper, teach you a greeting, or move to a nearby wonder?_',
  '\n\n_Say "tell me more" and I\'ll keep going._',
]

/* ─────────────────────────── site responses ─────────────────────────── */

function siteReply(intent: Intent, site: HeritageSite, history: ChatMessage[]): string {
  const country = COUNTRIES_BY_ID[site.countryId]
  const g = site.greeting

  switch (intent) {
    case 'greeting':
      return `In ${site.city}, a warm welcome sounds like **"${g.phrase}"** _(${g.pronounce})_ — that's **"${g.meaning}"** in ${g.language}. 🗣️\n\nTry it aloud as you imagine standing before ${site.name}. Tap the **Listen** button on any message and I'll say it for you. Want another phrase, or the story behind this place?`

    case 'fact': {
      const f = freshFact(site, history)
      return `${rand(['Did you know?', 'Here\'s a good one.', 'A little-known gem:'])} ${f}${rand(FOLLOWUPS)}`
    }

    case 'quiz': {
      const f = freshFact(site, history)
      return `🧠 **Quick quiz — ${site.name}.**\n\n"${f}"\n\n**True or false?** Give me your gut answer, and I'll tell you the story behind it.`
    }

    case 'quizAnswer':
      return `${rand(['Well played —', 'Exactly right —', 'Good instinct —', 'You\'ve got it —'])} that one is **true**. ✨ ${freshFact(site, history)}\n\nWant another round, or shall I tell the fuller story of ${site.name}?`

    case 'plan': {
      const unesco = site.unesco ? ' As a UNESCO World Heritage Site, it rewards a slow, attentive visit. ' : ' '
      return `${site.name} sits in **${site.city}** — ${site.category.toLowerCase()} heritage, ${site.yearsLabel}.${unesco}A few gentle tips:\n\n• Arrive early — the light is softer and the crowds thinner.\n• Take a local guide if you can; the stories live in the details.\n• Learn one phrase first: **"${g.phrase}"** (${g.meaning}).\n\nWant me to point out what to look for when you arrive?`
    }

    case 'timeline': {
      const events = timelineFor(site)
      if (events.length) {
        const lines = events
          .slice(0, 3)
          .map((e) => `• **${e.yearLabel}** — ${e.title}: ${e.description}`)
          .join('\n')
        return `A short walk through ${site.name}'s timeline:\n\n${lines}\n\n_Want the wider story of ${country?.name ?? 'the region'}, or a surprising fact?_`
      }
      return `${site.name} is dated to **${site.yearsLabel}**${site.foundedYear ? ` (around ${Math.abs(site.foundedYear)} ${site.foundedYear < 0 ? 'BCE' : 'CE'})` : ''}. ${freshFact(site, history)}`
    }

    case 'related': {
      const rel = relatedSites(site)
      if (rel.length) {
        const picks = rel.slice(0, 3).map((s) => `• **${s.name}** — ${s.tagline}`).join('\n')
        return `If ${site.name} moved you, ${country?.name ?? 'this country'} holds more:\n\n${picks}\n\n_Tap any site on the country page to dive in — or ask me about one by name._`
      }
      return `${site.name} is a standout in ${country?.name ?? 'its region'}. Ask me for its story, or a greeting in ${g.language}.`
    }

    case 'meaning':
      return `${site.localName ? `**${site.name}** — locally *${site.localName}* — ` : `**${site.name}** `}means far more than its stones. ${site.tagline} ${rand(OPENERS)} ${freshFact(site, history)}`

    case 'more': {
      // Progress the conversation: fact → timeline → related, based on what's been said.
      const said = history.filter((m) => m.role === 'assistant').map((m) => m.content).join(' ')
      const unusedFacts = site.funFacts.filter((f) => !said.includes(f.slice(0, 24)))
      if (unusedFacts.length) return `${rand(['There\'s more.', 'Keep going with me.', 'One more layer:'])} ${rand(unusedFacts)}${rand(FOLLOWUPS)}`
      const events = timelineFor(site)
      if (events.length) {
        const e = rand(events)
        return `Let's step back in time. **${e.yearLabel}** — ${e.title}: ${e.description}\n\n_Want to meet a nearby wonder next?_`
      }
      return siteReply('related', site, history)
    }

    case 'thanks':
      return `It's a joy to share ${site.name} with you. 🌍 Wherever you wander next, carry a little of its story. Say **"${g.phrase}"** — ${g.meaning} — until we meet again.`

    case 'help':
      return `I'm your guide to **${site.name}**. You can ask me to:\n\n• **Tell its story** — the history and meaning\n• **Teach a greeting** in ${g.language}\n• **Surprise me** with a fact\n• **Quiz me** to test what you've learned\n• **Plan a visit** or explore **nearby** sites\n\nWhat sounds good?`

    case 'story':
    default:
      return `${rand(OPENERS)}\n\n${site.story}${rand(FOLLOWUPS)}`
  }
}

/* ─────────────────────────── country responses ─────────────────────────── */

function countryReply(intent: Intent, ctx: StorytellerContext): string {
  const country = ctx.country!
  const sites = SITES_BY_COUNTRY[country.id] ?? []

  switch (intent) {
    case 'greeting':
      return `${country.name} speaks in many voices — ${country.languages.slice(0, 3).join(', ')}${country.languages.length > 3 ? ' and more' : ''}. 🗣️ Pick one of its heritage sites and I'll teach you a real greeting used there. Which draws you in?`

    case 'plan':
      return `A journey through ${country.name} (${country.region}) could thread its **${sites.length} featured sites**. ${country.heritageIntro}\n\nStart with ${sites[0] ? `**${sites[0].name}**` : 'any pin'} and let the thread pull you onward. Want me to suggest a route?`

    case 'related':
    case 'more': {
      const picks = sites.slice(0, 4).map((s) => `• **${s.name}** — ${s.tagline}`).join('\n')
      return `Here's what ${country.name} keeps for the curious:\n\n${picks}\n\n_Ask me about any of them by name._`
    }

    case 'timeline': {
      const events = timelineFor(undefined, country.id).slice(0, 3)
      if (events.length) {
        const lines = events.map((e) => `• **${e.yearLabel}** — ${e.title}`).join('\n')
        return `${country.name} across the ages:\n\n${lines}\n\n_Open the Timeline page to walk it in full._`
      }
      return country.heritageIntro
    }

    case 'help':
      return `I can guide you through **${country.name}**. Ask for its **heritage story**, a **greeting**, the **sites** worth seeing, or say **"quiz me"**. Where shall we begin?`

    case 'thanks':
      return `Thank you for exploring ${country.name} with me. 🌏 Its heritage is a living thing — the more we share it, the longer it endures.`

    default:
      return `${country.heritageIntro}\n\n_Ask me about any of ${country.name}'s heritage sites and I'll tell its story — or say "quiz me"._`
  }
}

function compose(text: string, ctx: StorytellerContext, history: ChatMessage[]): string {
  const intent = detectIntent(text, history)
  if (ctx.site) return siteReply(intent, ctx.site, history)
  if (ctx.country) return countryReply(intent, ctx)
  return `I'm your heritage storyteller. 🌍 Spin the globe, choose a place, and ask me for its story, a local greeting, a surprising fact, or a quiz.`
}

/**
 * MockProvider — an offline, zero-cost storyteller built from the curated
 * heritage dataset. It is history-aware: it avoids repeating facts, grades your
 * quiz answers, and progresses through story → facts → timeline → nearby sites
 * as you say "tell me more". Streams word-by-word to feel alive.
 */
export const mockProvider: AIProvider = {
  id: 'mock',
  label: 'Heritage Guide',
  isReady: () => true,
  async *stream(history: ChatMessage[], context: StorytellerContext, signal?: AbortSignal) {
    const last = [...history].reverse().find((m) => m.role === 'user')
    const full = compose(last?.content ?? '', context, history)
    const tokens = full.split(/(\s+)/)
    await new Promise((r) => setTimeout(r, 240))
    for (const token of tokens) {
      if (signal?.aborted) return
      yield token
      // Pause a beat longer at sentence ends for a natural cadence.
      const base = 12 + Math.random() * 22
      const extra = /[.!?]\n?$/.test(token) ? 90 : 0
      await new Promise((r) => setTimeout(r, base + extra))
    }
  },
}
