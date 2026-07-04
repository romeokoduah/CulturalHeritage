import type { ComponentType } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Globe2,
  Compass,
  BookMarked,
  Settings,
  Moon,
  Sun,
  Clock,
  Building2,
  Trophy,
  Sparkles,
  TrendingUp,
  Lightbulb,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { usePassport } from '../lib/passport'
import { useAuth } from '../lib/auth'
import { archetypeFor } from '../data/archetypes'
import { SITES } from '../data/sites'
import { useTheme, toggleTheme } from '../lib/theme'

function Bookmark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ThemeToggle() {
  const theme = useTheme()
  const isLight = theme === 'light'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-gold-400/40 hover:text-gold-400"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number }>
  end?: boolean
  core?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'Explore', icon: Globe2, end: true, core: true },
  { to: '/hall', label: 'Hall of Fame', icon: Trophy, core: true },
  { to: '/leaderboard', label: 'Ranks', icon: TrendingUp },
  { to: '/quests', label: 'Quests', icon: Sparkles, core: true },
  { to: '/quiz', label: 'Quiz', icon: Lightbulb },
  { to: '/collections', label: 'Saved', icon: Bookmark },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/simulator', label: 'Simulator', icon: Building2 },
  { to: '/passport', label: 'Passport', icon: BookMarked, core: true },
  { to: '/settings', label: 'AI', icon: Settings },
]

function ProfileAvatar({ compact }: { compact?: boolean }) {
  const { user } = useAuth()
  const arch = archetypeFor(user?.archetype)
  const glyph = arch?.emoji ?? (user?.name?.[0]?.toUpperCase() ?? '★')
  const color = arch?.color ?? '#ffd166'
  return (
    <NavLink
      to="/profile"
      aria-label="Your profile"
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-full transition',
          compact ? 'flex-col text-[10px]' : '',
          !compact && isActive ? 'ring-2 ring-gold-400/50' : '',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'grid place-items-center rounded-full text-sm',
              compact ? 'h-6 w-6' : 'h-8 w-8',
              compact && isActive ? 'ring-2 ring-gold-400' : '',
            )}
            style={{ background: `${color}22`, border: `1px solid ${color}55` }}
          >
            {glyph}
          </span>
          {compact && <span className={isActive ? 'text-gold-400' : 'text-white/50'}>Profile</span>}
        </>
      )}
    </NavLink>
  )
}

export function AppShell() {
  const { state } = usePassport()
  const location = useLocation()
  const pct = Math.round((state.visitedSites.length / SITES.length) * 100)
  const coreNav = NAV.filter((n) => n.core)

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      {/* Top bar */}
      <header className="safe-top sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-clay-500 text-abyss">
              <Compass size={18} />
            </span>
            <span className="font-display text-base font-bold tracking-tight">
              Heritage<span className="gradient-text">Quest</span>
            </span>
          </Link>

          {/* Desktop nav — scrollable so every destination fits */}
          <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar sm:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-sm transition',
                    isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-2">
            <div className="hidden items-center gap-2 rounded-full glass px-3 py-1 text-xs text-white/70 md:flex">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-500" style={{ width: `${pct}%` }} />
              </div>
              {pct}%
            </div>
            <ThemeToggle />
            <ProfileAvatar />
          </div>
        </div>

        {/* Mobile secondary nav — a scrollable chip row so all destinations are reachable */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 pb-2 sm:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition',
                  isActive ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/60',
                )
              }
            >
              <n.icon size={13} />
              {n.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="relative flex-1">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) — core destinations for thumb reach */}
      <nav className="safe-bottom sticky bottom-0 z-40 border-t border-white/10 bg-ink-950/85 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {coreNav.map((n) => {
            const active = n.end ? location.pathname === '/' : location.pathname.startsWith(n.to)
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition',
                  active ? 'text-gold-400' : 'text-white/50',
                )}
              >
                <n.icon size={20} />
                {n.label === 'Hall of Fame' ? 'Hall' : n.label}
              </NavLink>
            )
          })}
          <div className="flex flex-1 flex-col items-center gap-0.5 py-2.5">
            <ProfileAvatar compact />
          </div>
        </div>
      </nav>
    </div>
  )
}
