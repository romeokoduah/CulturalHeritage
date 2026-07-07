import type { AIProvider, ChatMessage, StorytellerContext } from './types'

const KIMI_KEY = import.meta.env.VITE_KIMI_API_KEY as string | undefined
const MODEL = 'moonshot-v1-32k'
const BASE_URL = 'https://api.moonshot.cn/v1/chat/completions'

function systemPrompt(context: StorytellerContext): string {
  const { site, country } = context
  const lines = [
    'You are the HeritageQuest Storyteller — a warm, vivid, and knowledgeable guide to world cultural heritage.',
    'You have access to real-time knowledge. When users ask about a place, give accurate, up-to-date information including visiting hours, recent events, restoration projects, or any current developments you know about.',
    'Speak with the curiosity of a great museum docent: accurate, evocative, and respectful of the communities whose heritage you describe.',
    'Keep replies concise (2–5 short paragraphs). Offer a local greeting, a surprising fact, or a follow-up question when it fits. Never invent facts about a site.',
    'Use **bold** for emphasis and _italic_ for foreign words or phrases.',
  ]
  if (country) lines.push(`\nCurrent country: ${country.name} (${country.region}). ${country.heritageIntro}`)
  if (site) {
    lines.push(
      `\nCurrent site: ${site.name} in ${site.city}. ${site.story}`,
      `Known facts: ${site.funFacts.join(' ')}`,
      `Local greeting: "${site.greeting.phrase}" (${site.greeting.pronounce}) = "${site.greeting.meaning}" [${site.greeting.language}].`,
    )
  }
  return lines.join('\n')
}

/**
 * KimiProvider — uses the Moonshot AI (Kimi) API for real-time, knowledgeable
 * heritage storytelling. Kimi excels at providing accurate, up-to-date
 * information about places and cultural sites.
 *
 * Activated when VITE_KIMI_API_KEY is set in the environment.
 * Uses OpenAI-compatible chat completions API with streaming.
 */
export const kimiProvider: AIProvider = {
  id: 'kimi',
  label: 'Kimi AI Storyteller',
  isReady: () => !!KIMI_KEY,
  async *stream(history: ChatMessage[], context: StorytellerContext, signal?: AbortSignal) {
    if (!KIMI_KEY) {
      yield 'Kimi AI is not configured. Set VITE_KIMI_API_KEY to enable real-time heritage storytelling.'
      return
    }
    const res = await fetch(BASE_URL, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt(context) },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    })
    if (!res.ok || !res.body) {
      yield `The AI service returned an error (${res.status}). Falling back to the offline guide.`
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''
      for (const evt of events) {
        const dataLine = evt.split('\n').find((l) => l.startsWith('data:'))
        if (!dataLine) continue
        const data = dataLine.slice(5).trim()
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content
          if (delta) yield delta as string
        } catch {
          /* ignore keep-alive or malformed lines */
        }
      }
    }
  },
}
