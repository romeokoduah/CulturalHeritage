import type { AIProvider, ChatMessage, StorytellerContext } from './types'

const OLLAMA_KEY = import.meta.env.VITE_OLLAMA_API_KEY as string | undefined
const MODEL = 'gemma4:31b'
const BASE_URL = 'https://ollama.com/api/chat'

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
 * OllamaProvider — uses Ollama Cloud API for heritage storytelling.
 * Activated when VITE_OLLAMA_API_KEY is set in the environment.
 * Uses the Ollama native /api/chat endpoint with streaming.
 */
export const ollamaProvider: AIProvider = {
  id: 'ollama',
  label: 'Ollama AI Storyteller',
  isReady: () => !!OLLAMA_KEY,
  async *stream(history: ChatMessage[], context: StorytellerContext, signal?: AbortSignal) {
    if (!OLLAMA_KEY) {
      yield 'Ollama is not configured. Set VITE_OLLAMA_API_KEY to enable AI storytelling.'
      return
    }
    const res = await fetch(BASE_URL, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OLLAMA_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
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
      // Ollama streams one JSON object per line
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const json = JSON.parse(line)
          if (json.message?.content) {
            yield json.message.content as string
          }
          if (json.done) return
        } catch {
          /* ignore malformed lines */
        }
      }
    }
  },
}
