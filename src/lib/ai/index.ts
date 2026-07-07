import type { AIProvider } from './types'
import { mockProvider } from './mockProvider'
import { claudeProvider } from './claudeProvider'
import { kimiProvider } from './kimiProvider'

export * from './types'
export { setClaudeKey, getClaudeKey, clearClaudeKey } from './claudeProvider'

/**
 * Provider registry. The active provider is chosen at runtime:
 * Kimi is used when VITE_KIMI_API_KEY is set (real-time knowledge),
 * Claude when a user key is configured, otherwise the offline mock.
 */
export const providers: AIProvider[] = [kimiProvider, claudeProvider, mockProvider]

export function activeProvider(): AIProvider {
  return providers.find((p) => p.isReady()) ?? mockProvider
}
