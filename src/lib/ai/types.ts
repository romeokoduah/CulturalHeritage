import type { Country, HeritageSite } from '../types'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export interface StorytellerContext {
  site?: HeritageSite
  country?: Country
}

export interface AIProvider {
  /** Stable identifier, e.g. "mock" | "claude" */
  id: string
  /** Human label shown in the UI */
  label: string
  /** Whether the provider is configured and usable right now */
  isReady(): boolean
  /**
   * Produce a reply to the latest user turn.
   * Yields incremental text chunks so the UI can stream a typing effect.
   */
  stream(
    history: ChatMessage[],
    context: StorytellerContext,
    signal?: AbortSignal,
  ): AsyncGenerator<string, void, unknown>
}

export type QuickIntent = 'story' | 'greeting' | 'quiz' | 'fact' | 'plan'
