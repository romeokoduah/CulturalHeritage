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
  'Every stone has a voice here.',
  'This is one of humanity\'s greatest chapters.',
  'Stand here and feel the weight of centuries.',
]

const FOLLOWUPS = [
  '\n\n_Want a surprising fact, a local greeting, or shall I quiz you?_',
  '\n\n_Ask me for more, or say "quiz me" to test what stuck._',
  '\n\n_Shall I go deeper, teach you a greeting, or move to a nearby wonder?_',
  '\n\n_Say "tell me more" and I\'ll keep going._',
  '\n\n_Try "plan a visit" for tips, or "quiz me" to test your knowledge._',
  '\n\n_Curious about a local greeting? Just ask._',
]

/* ─────────────────────────── site responses ─────────────────────────── */

function siteReply(intent: Intent, site: HeritageSite, history: ChatMessage[]): string {
  const country = COUNTRIES_BY_ID[site.countryId]
  const g = site.greeting

  switch (intent) {
    case 'greeting':
      return `In ${site.city}, a warm welcome sounds like **"${g.phrase}"** _(${g.pronounce})_ — that's **"${g.meaning}"** in ${g.language}. 🗣️\n\nThis greeting is part of everyday life in ${country?.name ?? 'this region'}. When you say **"${g.phrase}"**, you're not just speaking a word — you're stepping into a tradition of hospitality that has welcomed travellers to ${site.name} for generations.\n\nTry it aloud. Tap the **Listen** button on any message and I'll say it for you.\n\n_Want the story behind this place, or a surprising fact?_`

    case 'fact': {
      const f = freshFact(site, history)
      return `${rand(['Did you know?', 'Here\'s a good one.', 'A little-known gem:', 'This one catches people off guard:'])} ${f}\n\n${site.name} (${site.yearsLabel}) is full of stories like this — ${site.category.toLowerCase()} heritage that keeps revealing new layers the deeper you look.${rand(FOLLOWUPS)}`
    }

    case 'quiz': {
      const f = freshFact(site, history)
      return `🧠 **Quick quiz — ${site.name}.**\n\n"${f}"\n\n**True or false?** Give me your gut answer, and I'll tell you the story behind it.`
    }

    case 'quizAnswer':
      return `${rand(['Well played —', 'Exactly right —', 'Good instinct —', 'You\'ve got it —'])} that one is **true**. ✨\n\nHere's another layer to the story: ${freshFact(site, history)}\n\n${site.name} (${site.yearsLabel}, ${site.city}) is a place where every detail carries meaning.${site.unesco ? ' Its UNESCO status protects it for future generations.' : ''}\n\nWant another round, or shall I tell the fuller story?`

    case 'plan': {
      const unesco = site.unesco ? `\n\n🏛️ **UNESCO World Heritage Site** — This designation recognises ${site.name} as a place of outstanding universal value. It rewards a slow, attentive visit; give yourself at least half a day.` : ''
      const rel = relatedSites(site)
      const nearbyTip = rel.length ? `\n• **Combine your visit** — nearby you'll also find ${rel.slice(0, 2).map(s => `**${s.name}**`).join(' and ')}.` : ''
      return `**Planning your visit to ${site.name}**\n\n📍 **Location:** ${site.city}, ${country?.name ?? ''}\n📅 **Era:** ${site.yearsLabel}\n🏷️ **Category:** ${site.category} heritage${unesco}\n\n**Tips for a meaningful visit:**\n\n• **Arrive early** — the light is softer, the crowds thinner, and you'll have space to absorb the atmosphere.\n• **Hire a local guide** if you can — the stories that live in the details are what transform a visit into an experience.\n• **Learn a phrase first:** **"${g.phrase}"** _(${g.pronounce})_ means "${g.meaning}" in ${g.language}. Locals will light up when you try it.\n• **Take your time** — ${site.category === 'Intangible' ? 'watch the artisans work, ask questions, and feel the rhythm of a living tradition' : 'walk slowly, read every plaque, and sit quietly for a moment to feel the history'}.${nearbyTip}\n\n_Want me to tell the story of this place, or teach you another local phrase?_`
    }

    case 'timeline': {
      const events = timelineFor(site)
      if (events.length) {
        const lines = events
          .slice(0, 5)
          .map((e) => `• **${e.yearLabel}** — **${e.title}:** ${e.description}`)
          .join('\n')
        return `**The timeline of ${site.name}:**\n\n📍 ${site.city}, ${country?.name ?? ''} · ${site.category} heritage\n\n${lines}\n\n${site.unesco ? '_This UNESCO World Heritage Site has endured through all of this — and still stands._ ' : ''}Open the **Timeline** page for the full interactive view.\n\n_Want the wider story of ${country?.name ?? 'the region'}, or a surprising fact?_`
      }
      return `${site.name} is dated to **${site.yearsLabel}**${site.foundedYear ? ` (around ${Math.abs(site.foundedYear)} ${site.foundedYear < 0 ? 'BCE' : 'CE'})` : ''}. Located in **${site.city}**, this ${site.category.toLowerCase()} heritage has witnessed centuries of change.\n\n${freshFact(site, history)}${rand(FOLLOWUPS)}`
    }

    case 'related': {
      const rel = relatedSites(site)
      if (rel.length) {
        const picks = rel.map((s) => `• **${s.name}** (${s.city}) — ${s.tagline}${s.unesco ? ' 🏛️' : ''}`).join('\n')
        return `**More heritage in ${country?.name ?? 'this region'}:**\n\nIf ${site.name} moved you, there's much more to discover:\n\n${picks}\n\nEach of these sites carries its own centuries-deep story. _Tap any site on the country page to dive in, or ask me about one by name._`
      }
      return `${site.name} is a standout in ${country?.name ?? 'its region'} — **${site.category.toLowerCase()} heritage** dating to **${site.yearsLabel}**. Ask me for its full story, a greeting in ${g.language}, or say "quiz me".`
    }

    case 'meaning':
      return `${site.localName ? `**${site.name}** — locally known as *${site.localName}* — ` : `**${site.name}** `}carries meaning far beyond its physical form.\n\n${site.tagline}\n\n${rand(OPENERS)} This ${site.category.toLowerCase()} heritage, dating to **${site.yearsLabel}**, is part of the cultural identity of ${country?.name ?? 'its region'}. ${site.unesco ? 'Its UNESCO World Heritage status reflects its importance to all of humanity. ' : ''}${freshFact(site, history)}${rand(FOLLOWUPS)}`

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
    default: {
      const unescoNote = site.unesco ? '\n\nThis site holds **UNESCO World Heritage** status — recognised as a place of outstanding universal value to all of humanity.' : ''
      const factTeaser = site.funFacts.length ? `\n\nHere's something that might surprise you: ${site.funFacts[0]}` : ''
      const categoryNote = `This is **${site.category.toLowerCase()} heritage**, dating to **${site.yearsLabel}**, located in **${site.city}**, ${country?.name ?? ''}.`
      return `${rand(OPENERS)}\n\n${categoryNote}\n\n${site.story}${unescoNote}${factTeaser}${rand(FOLLOWUPS)}`
    }
  }
}

/* ─────────────────────────── country responses ─────────────────────────── */

function countryReply(intent: Intent, ctx: StorytellerContext): string {
  const country = ctx.country!
  const sites = SITES_BY_COUNTRY[country.id] ?? []
  const unescoCount = sites.filter(s => s.unesco).length

  switch (intent) {
    case 'greeting':
      return `${country.name} speaks in many voices — ${country.languages.join(', ')}. 🗣️\n\nEach language carries centuries of tradition, trade, and storytelling. Pick one of its **${sites.length} featured heritage sites** and I'll teach you a real greeting used there — the kind that opens doors and earns smiles.\n\nWhich site draws you in?`

    case 'plan':
      return `**Planning a heritage journey through ${country.name}**\n\n🌍 **Region:** ${country.region}\n🗣️ **Languages:** ${country.languages.slice(0, 4).join(', ')}${country.languages.length > 4 ? ' and more' : ''}\n🏛️ **Featured sites:** ${sites.length}${unescoCount ? ` (${unescoCount} UNESCO World Heritage)` : ''}\n\n${country.heritageIntro}\n\n**Suggested route:**\n\n${sites.slice(0, 4).map((s, i) => `${i + 1}. **${s.name}** in ${s.city} — ${s.tagline}`).join('\n')}\n\nStart with ${sites[0] ? `**${sites[0].name}**` : 'any pin'} and let each site pull you to the next. Tap any site on the map for the full story.\n\n_Say "quiz me" to test your knowledge, or ask about any site by name._`

    case 'fact': {
      const allFacts = sites.flatMap(s => s.funFacts.map(f => ({ site: s.name, fact: f })))
      if (allFacts.length) {
        const pick = rand(allFacts)
        return `**Did you know?** ${pick.fact}\n\n— from **${pick.site}**, one of ${country.name}'s ${sites.length} featured heritage sites.${rand(FOLLOWUPS)}`
      }
      return country.heritageIntro
    }

    case 'quiz': {
      const allFacts = sites.flatMap(s => s.funFacts.map(f => ({ site: s.name, fact: f })))
      if (allFacts.length) {
        const pick = rand(allFacts)
        return `🧠 **Quick quiz — ${country.name} heritage.**\n\n"${pick.fact}"\n\n**True or false?** Take your best guess!`
      }
      return `Pick a heritage site in ${country.name} and I'll quiz you on it.`
    }

    case 'related':
    case 'more': {
      const picks = sites.map((s) => `• **${s.name}** (${s.city}) — ${s.tagline}${s.unesco ? ' 🏛️' : ''}`).join('\n')
      return `**${country.name}'s heritage at a glance:**\n\n${picks}\n\n${unescoCount ? `🏛️ = UNESCO World Heritage Site (${unescoCount} total)\n\n` : ''}_Tap any site on the map, or ask me about one by name._`
    }

    case 'timeline': {
      const events = timelineFor(undefined, country.id).slice(0, 5)
      if (events.length) {
        const lines = events.map((e) => `• **${e.yearLabel}** — ${e.title}: ${e.description}`).join('\n')
        return `**${country.name} across the ages:**\n\n${lines}\n\nThis is just a glimpse — open the **Timeline** page to walk the full journey. _Or ask me to go deeper on any era._`
      }
      return `${country.heritageIntro}\n\n${country.name} holds **${sites.length} featured heritage sites** spanning centuries of history. Ask about any site for its detailed timeline.`
    }

    case 'help':
      return `I can guide you through **${country.name}** (${country.region}). Here's what I can do:\n\n• **"Tell me its story"** — the heritage and traditions of ${country.name}\n• **"Teach a greeting"** — a phrase in ${country.languages[0] ?? 'the local language'}\n• **"Show me the sites"** — all ${sites.length} featured heritage places\n• **"Surprise me"** — a fact you probably didn't know\n• **"Quiz me"** — test what you've learned\n• **"Plan a visit"** — a suggested heritage route\n• **"Timeline"** — walk through history\n\nWhere shall we begin?`

    case 'thanks':
      return `Thank you for exploring ${country.name} with me. 🌏 Its **${sites.length} heritage sites** carry the voices of countless generations. The more we share these stories, the longer they endure. Come back anytime — there's always more to discover.`

    default:
      return `**Welcome to ${country.name}** ${country.emojiFlag}\n\n🌍 **Region:** ${country.region}\n🗣️ **Languages:** ${country.languages.slice(0, 4).join(', ')}${country.languages.length > 4 ? ' and more' : ''}\n🏛️ **Heritage sites:** ${sites.length}${unescoCount ? ` (${unescoCount} UNESCO)` : ''}\n\n${country.heritageIntro}\n\n**Featured sites:**\n\n${sites.slice(0, 4).map(s => `• **${s.name}** — ${s.tagline}`).join('\n')}\n\n_Tap a site on the map, ask me about one by name, or say "quiz me" to test your knowledge._`
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
