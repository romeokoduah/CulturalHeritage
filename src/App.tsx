import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { AppShell } from './components/AppShell'
import { MascotGlobe } from './components/PixelArt'
import { useAuth } from './lib/auth'

const Landing = lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })))
const CountryPage = lazy(() => import('./pages/CountryPage').then((m) => ({ default: m.CountryPage })))
const SitePage = lazy(() => import('./pages/SitePage').then((m) => ({ default: m.SitePage })))
const PassportPage = lazy(() => import('./pages/PassportPage').then((m) => ({ default: m.PassportPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const TimelinePage = lazy(() => import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage })))
const SimulatorPage = lazy(() => import('./pages/SimulatorPage').then((m) => ({ default: m.SimulatorPage })))
const HallOfFamePage = lazy(() => import('./pages/HallOfFamePage').then((m) => ({ default: m.HallOfFamePage })))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })))
const QuestsPage = lazy(() => import('./pages/QuestsPage').then((m) => ({ default: m.QuestsPage })))
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then((m) => ({ default: m.CollectionsPage })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

const AuthScreens = lazy(() => import('./features/auth/AuthScreens').then((m) => ({ default: m.AuthScreens })))
const Onboarding = lazy(() => import('./features/onboarding/Onboarding').then((m) => ({ default: m.Onboarding })))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <MascotGlobe size={72} />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-marquee rounded-full bg-gradient-to-r from-gold-400 to-clay-500" />
        </div>
      </div>
    </div>
  )
}

/**
 * Gate the app behind sign-in (with a guest option), then a one-time archetype
 * onboarding. Both are driven purely by the auth store, so signing in / picking
 * an archetype re-renders straight through to the app.
 */
function AppGate({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthScreens />
      </Suspense>
    )
  }
  if (!user.archetype) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Onboarding />
      </Suspense>
    )
  }
  return <>{children}</>
}

function page(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppGate>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={page(<Landing />)} />
            <Route path="/country/:id" element={page(<CountryPage />)} />
            <Route path="/site/:id" element={page(<SitePage />)} />
            <Route path="/hall" element={page(<HallOfFamePage />)} />
            <Route path="/leaderboard" element={page(<LeaderboardPage />)} />
            <Route path="/quests" element={page(<QuestsPage />)} />
            <Route path="/quiz" element={page(<QuizPage />)} />
            <Route path="/collections" element={page(<CollectionsPage />)} />
            <Route path="/passport" element={page(<PassportPage />)} />
            <Route path="/profile" element={page(<ProfilePage />)} />
            <Route path="/timeline" element={page(<TimelinePage />)} />
            <Route path="/simulator" element={page(<SimulatorPage />)} />
            <Route path="/settings" element={page(<SettingsPage />)} />
            <Route path="*" element={page(<NotFound />)} />
          </Route>
        </Routes>
      </AppGate>
    </BrowserRouter>
  )
}
