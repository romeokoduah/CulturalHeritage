import { useState } from 'react'
import { Bot, Check, KeyRound, ShieldCheck, Trash2, Volume2 } from 'lucide-react'
import { clearClaudeKey, getClaudeKey, setClaudeKey, activeProvider } from '../lib/ai'

const DEEPGRAM_ON = !!import.meta.env.VITE_DEEPGRAM_API_KEY

export function SettingsPage() {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(!!getClaudeKey())

  function save() {
    if (!key.trim()) return
    setClaudeKey(key)
    setSaved(true)
    setKey('')
  }
  function remove() {
    clearClaudeKey()
    setSaved(false)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      <div className="mt-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-clay-500 text-abyss">
          <Bot size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold">AI Storyteller</h1>
          <p className="text-sm text-white/50">Active: {activeProvider().label}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl glass p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound size={16} className="text-gold-400" /> Connect Claude (optional)
        </p>
        <p className="mt-2 text-sm text-white/60">
          HeritageQuest ships with a rich offline storyteller. To enable live, open-ended AI conversations, connect an
          Anthropic API key. It is stored only in your browser.
        </p>

        {saved ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-jade-500/10 px-4 py-3 ring-1 ring-jade-500/30">
            <span className="flex items-center gap-2 text-sm text-jade-400">
              <Check size={16} /> Claude connected
            </span>
            <button onClick={remove} className="flex items-center gap-1 text-xs text-white/50 hover:text-clay-400">
              <Trash2 size={13} /> Remove
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-gold-400/50"
            />
            <button
              onClick={save}
              className="rounded-2xl bg-gold-400 px-5 py-3 text-sm font-semibold text-abyss transition hover:brightness-105"
            >
              Save key
            </button>
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs text-white/40">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          For a hackathon demo this calls Anthropic directly from the browser. In production, route requests through a
          small backend proxy so the key is never exposed.
        </p>
      </div>

      <div className="mt-6 rounded-3xl glass p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Volume2 size={16} className="text-gold-400" /> Voice
        </p>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10">
          <span className="text-sm text-white/60">
            {DEEPGRAM_ON ? 'Deepgram natural voice' : 'Browser voice'}
          </span>
          <span
            className={
              DEEPGRAM_ON
                ? 'flex items-center gap-1.5 text-xs font-semibold text-jade-400'
                : 'text-xs font-semibold text-white/40'
            }
          >
            {DEEPGRAM_ON ? <><Check size={13} /> Active</> : 'Fallback'}
          </span>
        </div>
        <p className="mt-3 text-xs text-white/40">
          Greetings and stories are read aloud with Deepgram when a{' '}
          <code className="rounded bg-white/10 px-1">VITE_DEEPGRAM_API_KEY</code> is set, otherwise your device's
          built-in voice is used. Nothing is required — it just works.
        </p>
      </div>

      <div className="mt-6 rounded-3xl glass p-5">
        <h2 className="font-display text-lg font-bold">Install the app</h2>
        <p className="mt-2 text-sm text-white/60">
          HeritageQuest is a Progressive Web App. On your phone, open the browser menu and choose{' '}
          <span className="text-white">“Add to Home Screen”</span> to install it and explore offline.
        </p>
      </div>
    </div>
  )
}
