import type { AIProvider, ChatMessage, StorytellerContext } from './types'

const KEY_STORAGE = 'culturesphere.anthropicKey'
const MODEL = 'claude-sonnet-4-5'

export function setClaudeKey(key: string) {
  localStorage.setItem(KEY_STORAGE, key.trim())
}
export function getClaudeKey(): string | null {
  return localStorage.getItem(KEY_STORAGE)
}
export function clearClaudeKey() {
  localStorage.removeItem(KEY_STORAGE)
}

function systemPrompt(context: StorytellerContext): string {
  const { site, country } = context
  const lines = [
    'You are the CultureSphere Storyteller — a warm, vivid guide to world cultural heritage.',
    'Speak with the curiosity of a great museum docent: accurate, evocative, and respectful of the communities whose heritage you describe.',
    'Keep replies concise (2–5 short paragraphs). Offer a local greeting, a surprising fact, or a follow-up question when it fits. Never invent facts about a site.',
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
 * ClaudeProvider — a fully-wired path to the Anthropic API. It is inert until
 * a user supplies an API key (stored locally). This is the drop-in upgrade
 * from the offline MockProvider.
 *
 * NOTE: For production, route this through a small backend proxy rather than
 * calling the API directly from the browser with a user key.
 */
export const claudeProvider: AIProvider = {
  id: 'claude',
  label: 'Claude AI Storyteller',
  isReady: () => !!getClaudeKey(),
  async *stream(history: ChatMessage[], context: StorytellerContext, signal?: AbortSignal) {
    const key = getClaudeKey()
    if (!key) {
      yield 'Claude is not connected yet. Add an API key in Settings to enable live AI storytelling.'
      return
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        stream: true,
        system: systemPrompt(context),
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    if (!res.ok || !res.body) {
      yield `The AI service returned an error (${res.status}). Falling back to the offline guide is recommended.`
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
        try {
          const json = JSON.parse(dataLine.slice(5).trim())
          if (json.type === 'content_block_delta' && json.delta?.text) {
            yield json.delta.text as string
          }
        } catch {
          /* ignore keep-alive lines */
        }
      }
    }
  },
}
