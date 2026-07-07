import type { AIProvider } from './types'
import { mockProvider } from './mockProvider'
import { claudeProvider } from './claudeProvider'
import { ollamaProvider } from './ollamaProvider'

export * from './types'
export { setClaudeKey, getClaudeKey, clearClaudeKey } from './claudeProvider'

/**
 * Provider registry. The active provider is chosen at runtime:
 * Ollama is used when VITE_OLLAMA_API_KEY is set,
 * Claude when a user key is configured, otherwise the offline mock.
 */
export const providers: AIProvider[] = [ollamaProvider, claudeProvider, mockProvider]

export function activeProvider(): AIProvider {
  return providers.find((p) => p.isReady()) ?? mockProvider
}
