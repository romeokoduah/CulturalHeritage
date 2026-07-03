import { useCallback, useEffect, useState } from 'react'
import { SITES_BY_ID } from '../data/sites'

const STORAGE_KEY = 'culturesphere.passport.v1'

export interface PassportState {
  visitedSites: string[]
  visitedCountries: string[]
}

function read(): PassportState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PassportState
  } catch {
    /* ignore */
  }
  return { visitedSites: [], visitedCountries: [] }
}

function write(state: PassportState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('passport:update', { detail: state }))
}

function countriesFromSites(siteIds: string[]): string[] {
  const set = new Set<string>()
  for (const id of siteIds) {
    const site = SITES_BY_ID[id]
    if (site) set.add(site.countryId)
  }
  return [...set]
}

/** React hook exposing the visitor passport, synced across the app via events. */
export function usePassport() {
  const [state, setState] = useState<PassportState>(read)

  useEffect(() => {
    const handler = (e: Event) => setState((e as CustomEvent<PassportState>).detail)
    window.addEventListener('passport:update', handler)
    return () => window.removeEventListener('passport:update', handler)
  }, [])

  const toggleSite = useCallback((siteId: string, _countryId: string) => {
    void _countryId
    const cur = read()
    const has = cur.visitedSites.includes(siteId)
    const visitedSites = has
      ? cur.visitedSites.filter((s) => s !== siteId)
      : [...cur.visitedSites, siteId]
    write({ visitedSites, visitedCountries: countriesFromSites(visitedSites) })
  }, [])

  const isVisited = useCallback((siteId: string) => state.visitedSites.includes(siteId), [state])

  return { state, toggleSite, isVisited }
}

export function getPassport(): PassportState {
  return read()
}
