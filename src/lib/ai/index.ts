import type { AIProvider } from './types'
import { mockProvider } from './mockProvider'
import { claudeProvider } from './claudeProvider'

export * from './types'
export { setClaudeKey, getClaudeKey, clearClaudeKey } from './claudeProvider'

/**
 * Provider registry. The active provider is chosen at runtime:
 * Claude is used when a user key is configured, otherwise the
 * Heritage Guide (offline, built from the curated dataset).
 */
export const providers: AIProvider[] = [claudeProvider, mockProvider]

export function activeProvider(): AIProvider {
  return providers.find((p) => p.isReady()) ?? mockProvider
}
