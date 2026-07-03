import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AppShell } from './components/AppShell'
import { MascotGlobe } from './components/PixelArt'

const Landing = lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })))
const CountryPage = lazy(() => import('./pages/CountryPage').then((m) => ({ default: m.CountryPage })))
const SitePage = lazy(() => import('./pages/SitePage').then((m) => ({ default: m.SitePage })))
const PassportPage = lazy(() => import('./pages/PassportPage').then((m) => ({ default: m.PassportPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

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

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <Landing />
              </Suspense>
            }
          />
          <Route
            path="/country/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <CountryPage />
              </Suspense>
            }
          />
          <Route
            path="/site/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <SitePage />
              </Suspense>
            }
          />
          <Route
            path="/passport"
            element={
              <Suspense fallback={<PageLoader />}>
                <PassportPage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
