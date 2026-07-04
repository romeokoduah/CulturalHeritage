import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'heritagequest.collections.v1'
const EVENT = 'collections:update'

/** A user-created, named list of heritage sites. */
export interface Collection {
  id: string
  name: string
  emoji: string
  siteIds: string[]
  createdAt: number
}

export interface CollectionsState {
  /** Loose "want to visit" bucket list of site ids. */
  wishlist: string[]
  collections: Collection[]
}

const EMPTY: CollectionsState = { wishlist: [], collections: [] }

function read(): CollectionsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CollectionsState>
      return {
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        collections: Array.isArray(parsed.collections) ? parsed.collections : [],
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return { wishlist: [], collections: [] }
}

function write(state: CollectionsState): CollectionsState {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
  window.dispatchEvent(new CustomEvent<CollectionsState>(EVENT, { detail: state }))
  return state
}

function makeId(): string {
  return `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/** Read the current persisted state. */
export function getCollections(): CollectionsState {
  return read()
}

/** Add or remove a site from the bucket list. */
export function toggleWishlist(siteId: string): CollectionsState {
  const cur = read()
  const has = cur.wishlist.includes(siteId)
  const wishlist = has ? cur.wishlist.filter((s) => s !== siteId) : [...cur.wishlist, siteId]
  return write({ ...cur, wishlist })
}

/** Whether a site is on the bucket list. */
export function isWished(siteId: string): boolean {
  return read().wishlist.includes(siteId)
}

/** Create a new named collection and return the updated state. */
export function createCollection(name: string, emoji = '🗺️'): CollectionsState {
  const cur = read()
  const trimmed = name.trim()
  if (!trimmed) return cur
  const collection: Collection = {
    id: makeId(),
    name: trimmed,
    emoji,
    siteIds: [],
    createdAt: Date.now(),
  }
  return write({ ...cur, collections: [collection, ...cur.collections] })
}

/** Rename an existing collection. */
export function renameCollection(id: string, name: string): CollectionsState {
  const cur = read()
  const trimmed = name.trim()
  if (!trimmed) return cur
  const collections = cur.collections.map((c) =>
    c.id === id ? { ...c, name: trimmed } : c,
  )
  return write({ ...cur, collections })
}

/** Delete a collection entirely. */
export function deleteCollection(id: string): CollectionsState {
  const cur = read()
  return write({ ...cur, collections: cur.collections.filter((c) => c.id !== id) })
}

/** Add a site to a collection (no duplicates). */
export function addToCollection(collectionId: string, siteId: string): CollectionsState {
  const cur = read()
  const collections = cur.collections.map((c) =>
    c.id === collectionId && !c.siteIds.includes(siteId)
      ? { ...c, siteIds: [...c.siteIds, siteId] }
      : c,
  )
  return write({ ...cur, collections })
}

/** Remove a site from a collection. */
export function removeFromCollection(collectionId: string, siteId: string): CollectionsState {
  const cur = read()
  const collections = cur.collections.map((c) =>
    c.id === collectionId ? { ...c, siteIds: c.siteIds.filter((s) => s !== siteId) } : c,
  )
  return write({ ...cur, collections })
}

export interface UseCollections {
  state: CollectionsState
  getCollections: () => CollectionsState
  toggleWishlist: (siteId: string) => void
  isWished: (siteId: string) => boolean
  createCollection: (name: string, emoji?: string) => void
  renameCollection: (id: string, name: string) => void
  deleteCollection: (id: string) => void
  addToCollection: (collectionId: string, siteId: string) => void
  removeFromCollection: (collectionId: string, siteId: string) => void
}

/**
 * React hook exposing collections + bucket list, synced across the app via the
 * `collections:update` window event (mirrors the passport store).
 */
export function useCollections(): UseCollections {
  const [state, setState] = useState<CollectionsState>(read)

  useEffect(() => {
    const handler = (e: Event) => setState((e as CustomEvent<CollectionsState>).detail)
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  return {
    state,
    getCollections,
    toggleWishlist: useCallback((siteId: string) => {
      toggleWishlist(siteId)
    }, []),
    isWished: useCallback((siteId: string) => state.wishlist.includes(siteId), [state]),
    createCollection: useCallback((name: string, emoji?: string) => {
      createCollection(name, emoji)
    }, []),
    renameCollection: useCallback((id: string, name: string) => {
      renameCollection(id, name)
    }, []),
    deleteCollection: useCallback((id: string) => {
      deleteCollection(id)
    }, []),
    addToCollection: useCallback((collectionId: string, siteId: string) => {
      addToCollection(collectionId, siteId)
    }, []),
    removeFromCollection: useCallback((collectionId: string, siteId: string) => {
      removeFromCollection(collectionId, siteId)
    }, []),
  }
}

export { EMPTY as EMPTY_COLLECTIONS_STATE }
