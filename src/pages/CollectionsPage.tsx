import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Check, X, Sparkles, ArrowRight, Trophy, BadgeCheck } from 'lucide-react'
import { HeritageVisual } from '../components/HeritageVisual'
import { cn } from '../lib/cn'
import { SITES, SITES_BY_ID } from '../data/sites'
import { COUNTRIES_BY_ID } from '../data/countries'
import { TRENDING_IDS } from '../data/featured'
import { useCollections } from '../lib/collections'
import type { HeritageSite } from '../lib/types'

const EMOJI_CHOICES = ['🗺️', '🏛️', '🌏', '⛩️', '🏰', '🕌', '🎭', '⭐'] as const

/* ── Inline icons (heart / plus / trash) — SVG per design rules ───────────── */

function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m4 5v6m4-6v6" />
    </svg>
  )
}

/* ── Shared site thumbnail (image with HeritageVisual fallback) ───────────── */

function SiteThumb({ site, className, rounded }: { site: HeritageSite; className?: string; rounded?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {site.imageUrl ? (
        <img
          src={site.imageUrl}
          alt={site.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
            ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
          }}
        />
      ) : null}
      <HeritageVisual
        motif={site.motif}
        color={site.themeColor}
        className={cn('h-full w-full', site.imageUrl && 'hidden')}
        rounded={rounded ?? 'rounded-none'}
      />
    </div>
  )
}

function CityLine({ site }: { site: HeritageSite }) {
  const flag = COUNTRIES_BY_ID[site.countryId]?.emojiFlag ?? ''
  return (
    <p className="flex items-center gap-1 text-[11px] text-white/45">
      <MapPin size={10} /> {site.city} {flag}
    </p>
  )
}

/* ── Bucket-list card ─────────────────────────────────────────────────────── */

function BucketCard({ site, onRemove }: { site: HeritageSite; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20"
    >
      <Link to={`/site/${site.id}`} className="block">
        <SiteThumb site={site} className="aspect-[16/10] w-full" />
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${site.name} from bucket list`}
        className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-ink-950/70 text-clay-400 backdrop-blur transition hover:scale-110 hover:text-clay-300"
      >
        <HeartIcon filled />
      </button>
      <Link to={`/site/${site.id}`} className="min-w-0 flex-1 p-3">
        <p className="truncate font-display text-sm font-bold text-white">{site.name}</p>
        <CityLine site={site} />
      </Link>
    </motion.div>
  )
}

/* ── Create-collection control ────────────────────────────────────────────── */

function CreateCollection({ onCreate }: { onCreate: (name: string, emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState<string>(EMOJI_CHOICES[0])

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, emoji)
    setName('')
    setEmoji(EMOJI_CHOICES[0])
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-abyss transition hover:brightness-105"
      >
        <PlusIcon className="h-4 w-4" /> New collection
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
    >
      <label htmlFor="new-collection-name" className="text-xs uppercase tracking-widest text-gold-400/80">
        Name your collection
      </label>
      <input
        id="new-collection-name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="e.g. Silk Road dreams"
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold-400/60"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {EMOJI_CHOICES.map((em) => (
          <button
            key={em}
            type="button"
            aria-label={`Use ${em} icon`}
            aria-pressed={emoji === em}
            onClick={() => setEmoji(em)}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-xl text-lg transition',
              emoji === em ? 'bg-gold-400/20 ring-1 ring-gold-400/60' : 'bg-white/5 hover:bg-white/10',
            )}
          >
            {em}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-abyss transition hover:brightness-105 disabled:opacity-40"
        >
          <Check size={15} /> Create
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

/* ── Collection card ──────────────────────────────────────────────────────── */

interface CollectionCardProps {
  id: string
  name: string
  emoji: string
  siteIds: string[]
  expanded: boolean
  onToggleExpand: () => void
  onRename: (name: string) => void
  onDelete: () => void
  onAddSites: () => void
  onRemoveSite: (siteId: string) => void
}

function CollectionCard({
  id,
  name,
  emoji,
  siteIds,
  expanded,
  onToggleExpand,
  onRename,
  onDelete,
  onAddSites,
  onRemoveSite,
}: CollectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const sites = siteIds.map((sid) => SITES_BY_ID[sid]).filter((s): s is HeritageSite => Boolean(s))

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed) onRename(trimmed)
    else setDraft(name)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-2xl">{emoji}</div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') {
                  setDraft(name)
                  setEditing(false)
                }
              }}
              aria-label="Rename collection"
              className="w-full rounded-lg border border-white/10 bg-ink-950/60 px-2 py-1 font-display text-base font-bold text-white outline-none focus:border-gold-400/60"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(name)
                setEditing(true)
              }}
              className="block max-w-full truncate text-left font-display text-base font-bold text-white transition hover:text-gold-300"
              title="Rename"
            >
              {name}
            </button>
          )}
          <p className="mt-0.5 text-[11px] text-white/45">
            {sites.length} {sites.length === 1 ? 'place' : 'places'}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${name}`}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition hover:bg-clay-400/15 hover:text-clay-400"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Thumbnail strip */}
      {sites.length > 0 && (
        <div className="flex gap-2 px-4">
          {sites.slice(0, 4).map((s) => (
            <div key={s.id} className="h-14 w-14 overflow-hidden rounded-xl">
              <HeritageVisual motif={s.motif} color={s.themeColor} className="h-full w-full" rounded="rounded-none" />
            </div>
          ))}
          {sites.length > 4 && (
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/5 text-xs font-semibold text-white/60">
              +{sites.length - 4}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 p-4">
        <button
          type="button"
          onClick={onAddSites}
          className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Add sites
        </button>
        {sites.length > 0 && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-gold-300 transition hover:text-gold-200"
          >
            {expanded ? 'Hide' : 'Open'}
            <ArrowRight size={13} className={cn('transition-transform', expanded && 'rotate-90')} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && sites.length > 0 && (
          <motion.div
            key={`body-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid gap-2 px-4 pb-4">
              {sites.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]"
                >
                  <Link to={`/site/${s.id}`} className="h-14 w-14 shrink-0">
                    <SiteThumb site={s} className="h-full w-full" />
                  </Link>
                  <Link to={`/site/${s.id}`} className="min-w-0 flex-1 py-2">
                    <p className="truncate font-display text-sm font-bold text-white">{s.name}</p>
                    <CityLine site={s} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemoveSite(s.id)}
                    aria-label={`Remove ${s.name} from ${name}`}
                    className="mr-3 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Add-sites picker modal ───────────────────────────────────────────────── */

interface PickerTarget {
  kind: 'wishlist' | 'collection'
  collectionId?: string
  label: string
}

function AddSitesModal({
  target,
  chosen,
  onToggle,
  onClose,
}: {
  target: PickerTarget
  chosen: ReadonlySet<string>
  onToggle: (siteId: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SITES
    return SITES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (COUNTRIES_BY_ID[s.countryId]?.name.toLowerCase().includes(q) ?? false),
    )
  }, [query])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Add sites to ${target.label}`}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 backdrop-blur-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-gold-400/80">Add to</p>
            <h3 className="truncate font-display text-lg font-bold text-white">{target.label}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city or country…"
            className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold-400/60"
          />
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">No sites match “{query}”.</p>
          ) : (
            <ul className="grid gap-1.5">
              {results.map((s) => {
                const added = chosen.has(s.id)
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onToggle(s.id)}
                      aria-pressed={added}
                      className={cn(
                        'flex w-full items-center gap-3 overflow-hidden rounded-2xl border text-left transition',
                        added
                          ? 'border-jade-400/40 bg-jade-400/10'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
                      )}
                    >
                      <div className="h-12 w-12 shrink-0">
                        <SiteThumb site={s} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1 py-2">
                        <p className="truncate font-display text-sm font-bold text-white">{s.name}</p>
                        <CityLine site={s} />
                      </div>
                      <span
                        className={cn(
                          'mr-3 grid h-8 w-8 shrink-0 place-items-center rounded-full transition',
                          added ? 'bg-jade-400 text-abyss' : 'bg-white/5 text-white/50',
                        )}
                      >
                        {added ? <Check size={16} /> : <PlusIcon className="h-4 w-4" />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export function CollectionsPage() {
  const {
    state,
    toggleWishlist,
    createCollection,
    renameCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
  } = useCollections()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [picker, setPicker] = useState<PickerTarget | null>(null)

  const wishedSites = state.wishlist
    .map((sid) => SITES_BY_ID[sid])
    .filter((s): s is HeritageSite => Boolean(s))

  const suggestions = TRENDING_IDS.map((id) => SITES_BY_ID[id]).filter(
    (s): s is HeritageSite => Boolean(s) && !state.wishlist.includes(s.id),
  )

  // Which site ids are "chosen" for the active picker target.
  const pickerChosen: ReadonlySet<string> = useMemo(() => {
    if (!picker) return new Set<string>()
    if (picker.kind === 'wishlist') return new Set(state.wishlist)
    const col = state.collections.find((c) => c.id === picker.collectionId)
    return new Set(col?.siteIds ?? [])
  }, [picker, state])

  function handlePickerToggle(siteId: string) {
    if (!picker) return
    if (picker.kind === 'wishlist') {
      toggleWishlist(siteId)
    } else if (picker.collectionId) {
      if (pickerChosen.has(siteId)) removeFromCollection(picker.collectionId, siteId)
      else addToCollection(picker.collectionId, siteId)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16">
      {/* Header */}
      <div className="mt-6 rounded-3xl glass p-5">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-400/80">
          <Trophy size={13} /> Your Collections
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">
          <span className="gradient-text">Dream, gather, wander</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/55">
          Save the places that call to you and shape them into your own themed journeys — a bucket list for
          someday, collections for every mood.
        </p>
      </div>

      {/* Bucket list */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="text-clay-400">
            <HeartIcon filled className="h-5 w-5" />
          </span>
          Bucket list
          {wishedSites.length > 0 && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">
              {wishedSites.length}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setPicker({ kind: 'wishlist', label: 'Bucket list' })}
          className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Add sites
        </button>
      </div>

      {wishedSites.length === 0 ? (
        <div className="mt-4 rounded-3xl glass p-6 text-center">
          <Sparkles className="mx-auto text-gold-400" />
          <p className="mt-3 text-white/60">
            Your bucket list is a blank map. Tap the heart on any place you're dreaming of — here are a few
            wonders to start with.
          </p>
          {suggestions.length > 0 && (
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              {suggestions.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
                >
                  <Link to={`/site/${s.id}`} className="h-16 w-16 shrink-0">
                    <SiteThumb site={s} className="h-full w-full" />
                  </Link>
                  <Link to={`/site/${s.id}`} className="min-w-0 flex-1 py-2">
                    <p className="truncate font-display text-sm font-bold text-white">{s.name}</p>
                    <CityLine site={s} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(s.id)}
                    aria-label={`Add ${s.name} to bucket list`}
                    className="mr-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-clay-400 transition hover:scale-110 hover:bg-clay-400/15"
                  >
                    <HeartIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {wishedSites.map((s) => (
              <BucketCard key={s.id} site={s} onRemove={() => toggleWishlist(s.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Collections */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <BadgeCheck size={20} className="text-violet-400" />
          Collections
        </h2>
        <CreateCollection onCreate={createCollection} />
      </div>

      {state.collections.length === 0 ? (
        <div className="mt-4 rounded-3xl glass p-8 text-center">
          <Sparkles className="mx-auto text-violet-400" />
          <p className="mx-auto mt-3 max-w-md text-white/60">
            No collections yet. Group sites into journeys that mean something to you — “Temples of the East,”
            “Someday with family,” “UNESCO bucket list.” Create your first above.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {state.collections.map((c) => (
              <CollectionCard
                key={c.id}
                id={c.id}
                name={c.name}
                emoji={c.emoji}
                siteIds={c.siteIds}
                expanded={expandedId === c.id}
                onToggleExpand={() => setExpandedId((cur) => (cur === c.id ? null : c.id))}
                onRename={(name) => renameCollection(c.id, name)}
                onDelete={() => {
                  deleteCollection(c.id)
                  if (expandedId === c.id) setExpandedId(null)
                }}
                onAddSites={() => setPicker({ kind: 'collection', collectionId: c.id, label: c.name })}
                onRemoveSite={(sid) => removeFromCollection(c.id, sid)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Picker modal */}
      <AnimatePresence>
        {picker && (
          <AddSitesModal
            target={picker}
            chosen={pickerChosen}
            onToggle={handlePickerToggle}
            onClose={() => setPicker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
