import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { renderShareCard, cardToBlob, type ShareCardData } from '../lib/shareCard'
import { canNativeShare, copyToClipboard, nativeShare, socialLinks, type ShareContent } from '../lib/share'

/* Small inline icons — avoids depending on brand-icon names in the pinned lucide build. */
const ShareIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
)
const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
)
const DownloadIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>
)

const SOCIALS: { key: keyof ReturnType<typeof socialLinks>; label: string; color: string }[] = [
  { key: 'x', label: '𝕏', color: '#e7e9ea' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#25d366' },
  { key: 'telegram', label: 'Telegram', color: '#2aabee' },
  { key: 'facebook', label: 'Facebook', color: '#4c6ef5' },
]

export function ShareButton({
  data,
  share,
  variant = 'icon',
  label = 'Share',
  className,
}: {
  data: ShareCardData
  share: ShareContent
  variant?: 'icon' | 'pill'
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className={cn(
          variant === 'icon'
            ? 'grid h-9 w-9 place-items-center rounded-full glass text-white/80 transition hover:text-white'
            : 'inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15',
          className,
        )}
      >
        <ShareIcon size={variant === 'icon' ? 17 : 16} />
        {variant === 'pill' && label}
      </button>
      <ShareModal open={open} onClose={() => setOpen(false)} data={data} share={share} />
    </>
  )
}

function ShareModal({
  open,
  onClose,
  data,
  share,
}: {
  open: boolean
  onClose: () => void
  data: ShareCardData
  share: ShareContent
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState<null | 'share' | 'download'>(null)

  useEffect(() => {
    if (!open) return
    setReady(false)
    setCopied(false)
    const c = canvasRef.current
    if (!c) return
    let alive = true
    renderShareCard(c, data).then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [open, data])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  async function handleShare() {
    const c = canvasRef.current
    if (!c) return
    setBusy('share')
    const blob = await cardToBlob(c, data)
    const file = blob ? new File([blob], 'heritagequest.png', { type: 'image/png' }) : undefined
    const ok = await nativeShare(share, file)
    setBusy(null)
    if (!ok) {
      const done = await copyToClipboard(share.url)
      if (done) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  async function handleDownload() {
    const c = canvasRef.current
    if (!c) return
    setBusy('download')
    const blob = await cardToBlob(c, data)
    setBusy(null)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heritagequest-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  async function handleCopy() {
    const ok = await copyToClipboard(share.url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const links = socialLinks(share)

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-ink-900 p-5 shadow-2xl safe-bottom"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Share this discovery</h3>
              <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Card preview */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950">
              {!ready && (
                <div className="absolute inset-0 z-10 grid place-items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-gold-400" />
                </div>
              )}
              <canvas ref={canvasRef} className="block w-full" style={{ aspectRatio: '1200 / 630' }} />
            </div>

            {/* Primary actions */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {canNativeShare() && (
                <ActionButton onClick={handleShare} loading={busy === 'share'} primary>
                  <ShareIcon size={16} /> Share
                </ActionButton>
              )}
              <ActionButton onClick={handleDownload} loading={busy === 'download'}>
                <DownloadIcon /> Save card
              </ActionButton>
              <ActionButton onClick={handleCopy}>
                {copied ? <><Check size={16} className="text-jade-400" /> Copied</> : <><CopyIcon /> Copy link</>}
              </ActionButton>
            </div>

            {/* Socials */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.key}
                  href={links[s.key]}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.07]"
                >
                  <span style={{ color: s.color }}>●</span> {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function ActionButton({
  children,
  onClick,
  loading,
  primary,
}: {
  children: React.ReactNode
  onClick: () => void
  loading?: boolean
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition disabled:opacity-50',
        primary
          ? 'bg-gradient-to-r from-gold-400 to-clay-500 text-abyss hover:brightness-110'
          : 'border border-white/10 bg-white/[0.03] text-white/85 hover:bg-white/[0.07]',
      )}
    >
      {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : children}
    </button>
  )
}
