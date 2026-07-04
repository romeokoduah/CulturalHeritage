import { useCallback, useEffect, useState } from 'react'

/**
 * Client-side auth for the demo: accounts + a guest mode, persisted in
 * localStorage and synced app-wide via a custom event (same pattern as the
 * passport). This is the single seam where a real backend (e.g. Supabase auth)
 * drops in later — the UI only ever talks to these functions and useAuth().
 *
 * NOTE: passwords are stored locally in plain text purely for this offline
 * demo. Do not reuse this for production — swap in a real auth provider.
 */

const CURRENT_KEY = 'heritagequest.auth.v1'
const USERS_KEY = 'heritagequest.users.v1'

export interface User {
  id: string
  name: string
  email?: string
  guest: boolean
  archetype?: string
  createdAt: number
}
interface Account extends User {
  password?: string
}

export interface AuthResult {
  ok: boolean
  error?: string
}

const uid = () => 'u_' + Math.random().toString(36).slice(2, 10)

function readCurrent(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}
function writeCurrent(user: User | null) {
  if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user))
  else localStorage.removeItem(CURRENT_KEY)
  window.dispatchEvent(new CustomEvent('auth:update', { detail: user }))
}
function readDB(): Account[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as Account[]) : []
  } catch {
    return []
  }
}
function writeDB(accounts: Account[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts))
}
const strip = (a: Account): User => {
  const { password: _pw, ...user } = a
  void _pw
  return user
}

export function getUser(): User | null {
  return readCurrent()
}
export function isAuthed(): boolean {
  return !!readCurrent()
}

export function signUp(input: { name: string; email: string; password: string }): AuthResult {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Please enter a valid email.' }
  if (input.password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' }
  const db = readDB()
  if (db.some((a) => a.email === email)) return { ok: false, error: 'An account with that email already exists.' }
  const account: Account = { id: uid(), name, email, password: input.password, guest: false, createdAt: Date.now() }
  writeDB([...db, account])
  writeCurrent(strip(account))
  return { ok: true }
}

export function signIn(input: { email: string; password: string }): AuthResult {
  const email = input.email.trim().toLowerCase()
  const account = readDB().find((a) => a.email === email)
  if (!account) return { ok: false, error: 'No account found with that email.' }
  if (account.password !== input.password) return { ok: false, error: 'Incorrect password. Try again.' }
  writeCurrent(strip(account))
  return { ok: true }
}

export function continueAsGuest(name = 'Explorer'): void {
  writeCurrent({ id: uid(), name: name.trim() || 'Explorer', guest: true, createdAt: Date.now() })
}

export function signOut(): void {
  writeCurrent(null)
}

export function setArchetype(archetype: string): void {
  const cur = readCurrent()
  if (!cur) return
  writeCurrent({ ...cur, archetype })
  if (!cur.guest) writeDB(readDB().map((a) => (a.id === cur.id ? { ...a, archetype } : a)))
}

export function updateName(name: string): void {
  const cur = readCurrent()
  if (!cur) return
  const next = name.trim()
  if (!next) return
  writeCurrent({ ...cur, name: next })
  if (!cur.guest) writeDB(readDB().map((a) => (a.id === cur.id ? { ...a, name: next } : a)))
}

/** React hook exposing the current user, synced across the app via events. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(readCurrent)
  useEffect(() => {
    const handler = (e: Event) => setUser((e as CustomEvent<User | null>).detail ?? null)
    window.addEventListener('auth:update', handler)
    return () => window.removeEventListener('auth:update', handler)
  }, [])
  const refresh = useCallback(() => setUser(readCurrent()), [])
  return { user, isAuthed: !!user, signUp, signIn, guest: continueAsGuest, signOut, setArchetype, updateName, refresh }
}
