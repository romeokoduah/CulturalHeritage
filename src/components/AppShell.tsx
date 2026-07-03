import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Globe2, Compass, BookMarked, Settings } from 'lucide-react'
import { cn } from '../lib/cn'
import { usePassport } from '../lib/passport'
import { SITES } from '../data/sites'

const NAV = [
  { to: '/', label: 'Explore', icon: Globe2, end: true },
  { to: '/passport', label: 'Passport', icon: BookMarked, end: false },
  { to: '/settings', label: 'AI', icon: Settings, end: false },
]

export function AppShell() {
  const { state } = usePassport()
  const location = useLocation()
  const pct = Math.round((state.visitedSites.length / SITES.length) * 100)

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      {/* Top bar */}
      <header className="safe-top sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-clay-500 text-ink-950">
              <Compass size={18} />
            </span>
            <span className="font-display text-base font-bold tracking-tight">
              Culture<span className="gradient-text">Sphere</span>
            </span>
          </Link>
          <div className="ml-auto hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-1.5 text-sm transition',
                    isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:ml-2">
            <div className="hidden items-center gap-2 rounded-full glass px-3 py-1 text-xs text-white/70 xs:flex sm:flex">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-500" style={{ width: `${pct}%` }} />
              </div>
              {pct}%
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="safe-bottom sticky bottom-0 z-40 border-t border-white/10 bg-ink-950/85 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV.map((n) => {
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
                {n.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
