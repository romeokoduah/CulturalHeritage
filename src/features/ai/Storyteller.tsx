import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Sparkles, Square } from 'lucide-react'
import { activeProvider, type ChatMessage, type StorytellerContext } from '../../lib/ai'
import { MascotGlobe } from '../../components/PixelArt'
import { cn } from '../../lib/cn'

let idc = 0
const uid = () => `m${++idc}-${Date.now()}`

function RichText({ text }: { text: string }) {
  // minimal markdown: **bold**, _italic_, line breaks
  const nodes = useMemo(() => {
    return text.split('\n').map((line, li) => {
      const parts = line.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean)
      return (
        <span key={li} className="block min-h-[1px]">
          {parts.map((p, i) => {
            if (p.startsWith('**') && p.endsWith('**'))
              return (
                <strong key={i} className="font-semibold text-white">
                  {p.slice(2, -2)}
                </strong>
              )
            if (p.startsWith('_') && p.endsWith('_'))
              return (
                <em key={i} className="text-white/70">
                  {p.slice(1, -1)}
                </em>
              )
            return <span key={i}>{p}</span>
          })}
        </span>
      )
    })
  }, [text])
  return <>{nodes}</>
}

interface QuickAction {
  label: string
  prompt: string
}

export function Storyteller({
  context,
  title = 'Ask the Storyteller',
  suggestions,
  compact,
}: {
  context: StorytellerContext
  title?: string
  suggestions?: QuickAction[]
  compact?: boolean
}) {
  const provider = activeProvider()
  const seed = context.site?.name ?? context.country?.name ?? 'this place'
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content: `Hi, I'm your heritage guide. Ask me anything about **${seed}** — its story, a local greeting, a surprising fact, or let me quiz you.`,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const quick: QuickAction[] =
    suggestions ??
    [
      { label: '✨ Tell its story', prompt: `Tell me the story of ${seed}.` },
      { label: '🗣️ Teach a greeting', prompt: `Teach me a local greeting from ${seed}.` },
      { label: '💡 Surprise me', prompt: `Tell me a surprising fact about ${seed}.` },
      { label: '🧠 Quiz me', prompt: `Quiz me about ${seed}.` },
    ]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || busy) return
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text.trim() }
    const asstId = uid()
    const history = [...messages, userMsg]
    setMessages([...history, { id: asstId, role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      let acc = ''
      for await (const chunk of provider.stream(history, context, ctrl.signal)) {
        acc += chunk
        setMessages((prev) =>
          prev.map((m) => (m.id === asstId ? { ...m, content: acc } : m)),
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstId ? { ...m, content: 'Sorry — I lost my train of thought. Try again?' } : m,
        ),
      )
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  function stop() {
    abortRef.current?.abort()
    setBusy(false)
  }

  return (
    <div className={cn('flex flex-col rounded-3xl glass overflow-hidden', compact ? 'h-[26rem]' : 'h-[32rem]')}>
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <MascotGlobe size={34} animate={false} />
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold leading-tight">{title}</h3>
          <p className="flex items-center gap-1 text-[11px] text-white/50">
            <Sparkles size={11} className="text-gold-400" />
            {provider.label}
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-jade-400">
          <span className="h-1.5 w-1.5 rounded-full bg-jade-400 animate-pulse" /> online
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-gold-400 text-abyss font-medium rounded-br-sm'
                  : 'bg-white/5 text-white/90 rounded-bl-sm',
              )}
            >
              {m.role === 'assistant' && m.content === '' ? (
                <span className="flex gap-1 py-1">
                  <Dot /> <Dot d="150ms" /> <Dot d="300ms" />
                </span>
              ) : (
                <RichText text={m.content} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1 no-scrollbar">
        {quick.map((q) => (
          <button
            key={q.label}
            onClick={() => send(q.prompt)}
            disabled={busy}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 disabled:opacity-40"
          >
            {q.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-white/10 p-3 safe-bottom"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${seed}…`}
          className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/40 focus:ring-gold-400/50"
        />
        {busy ? (
          <button
            type="button"
            onClick={stop}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay-500 text-white"
            aria-label="Stop"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-abyss transition hover:brightness-110"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        )}
      </form>
    </div>
  )
}

function Dot({ d = '0ms' }: { d?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce"
      style={{ animationDelay: d }}
    />
  )
}
