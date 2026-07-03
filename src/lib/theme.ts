import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'culturesphere.theme'
const THEME_EVENT = 'theme:update'

/** Read the persisted theme, or fall back to the OS preference. */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/** Apply a theme to <html> and update the browser UI theme-color. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('light', theme === 'light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f8fc' : '#0b1020')
}

/** Persist + apply a theme and notify subscribers. */
export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }))
}

export function toggleTheme() {
  setTheme(getStoredTheme() === 'light' ? 'dark' : 'light')
}

/** Ensure the class is applied on first paint (called from main). */
export function initTheme() {
  applyTheme(getStoredTheme())
}

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb)
  return () => window.removeEventListener(THEME_EVENT, cb)
}

/** React hook returning the current theme, re-rendering on change. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getStoredTheme, () => 'dark')
}
