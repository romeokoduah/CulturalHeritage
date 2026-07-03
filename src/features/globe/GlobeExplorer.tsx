import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { useNavigate } from 'react-router-dom'
import { COUNTRIES } from '../../data/countries'
import { SITES } from '../../data/sites'
import type { Country } from '../../lib/types'

interface SiteMarker {
  id: string
  lat: number
  lng: number
  label: string
  color: string
  countryId: string
}

interface CountryMarker {
  id: string
  lat: number
  lng: number
  name: string
  flag: string
  color: string
}

interface MapLayer {
  id: string
  label: string
  icon: string
  url: string
  atmo: string
}

const LAYERS: MapLayer[] = [
  { id: 'night', label: 'Night', icon: '🌙', url: 'https://unpkg.com/three-globe/example/img/earth-night.jpg', atmo: '#6aa4ff' },
  { id: 'day', label: 'Day', icon: '☀️', url: 'https://unpkg.com/three-globe/example/img/earth-day.jpg', atmo: '#87ceeb' },
  { id: 'blue', label: 'Blue Marble', icon: '🌊', url: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', atmo: '#4a90d9' },
  { id: 'topo', label: 'Topology', icon: '🏔️', url: 'https://unpkg.com/three-globe/example/img/earth-topology.png', atmo: '#8fbc8f' },
  { id: 'dark', label: 'Dark', icon: '🛰️', url: 'https://unpkg.com/three-globe/example/img/earth-dark.jpg', atmo: '#3a3a6a' },
]

// Pre-build a data URL for each country's flag pin so it's static/cached
function flagPinDataUrl(flag: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
    <path d="M20 48C20 48 4 30 4 17A16 16 0 1 1 36 17C36 30 20 48 20 48Z" fill="${color}" stroke="#fff" stroke-width="2" stroke-opacity="0.7"/>
    <circle cx="20" cy="17" r="10" fill="#fff" fill-opacity="0.9"/>
    <text x="20" y="22" text-anchor="middle" font-size="14">${flag}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function GlobeExplorer({ onSelectCountry }: { onSelectCountry: (c: Country) => void }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [dims, setDims] = useState({ w: 360, h: 480 })
  const [ready, setReady] = useState(false)
  const [layer, setLayer] = useState('night')
  const [layerOpen, setLayerOpen] = useState(false)

  const cur = LAYERS.find((l) => l.id === layer) || LAYERS[0]

  // Site dots (GPU rendered — stable, no flicker)
  const sites = useMemo<SiteMarker[]>(
    () => SITES.map((s) => ({ id: s.id, lat: s.coords[0], lng: s.coords[1], label: s.name, color: s.themeColor, countryId: s.countryId })),
    [],
  )

  // Country markers — use labelsData with flag pin images (static, no DOM flicker)
  const countries = useMemo<CountryMarker[]>(
    () => COUNTRIES.map((c) => ({ id: c.id, lat: c.coords[0], lng: c.coords[1], name: c.name, flag: c.emojiFlag, color: c.colors[1] })),
    [],
  )

  const rings = useMemo(
    () => COUNTRIES.map((c) => ({ lat: c.coords[0], lng: c.coords[1], color: c.colors[1] })),
    [],
  )

  // Responsive sizing
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setDims({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // Auto-rotate + initial view
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.6
    c.enableZoom = true
    c.minDistance = 180
    c.maxDistance = 520
    g.pointOfView({ lat: 20, lng: 60, altitude: 2.4 }, 0)
    setReady(true)
  }, [])

  // Click on a site dot
  const onSiteClick = useCallback((p: object) => {
    navigate(`/site/${(p as SiteMarker).id}`)
  }, [navigate])

  // Click on a country label/pin
  const onCountryClick = useCallback((p: object) => {
    const m = p as CountryMarker
    const country = COUNTRIES.find((c) => c.id === m.id)
    if (!country) return
    const g = globeRef.current
    if (g) {
      g.controls().autoRotate = false
      g.pointOfView({ lat: country.coords[0], lng: country.coords[1], altitude: 1.6 }, 1200)
    }
    onSelectCountry(country)
  }, [onSelectCountry])

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full">
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center text-white/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-gold-400" />
            <p className="text-xs uppercase tracking-widest">rendering the world…</p>
          </div>
        </div>
      )}

      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={cur.url}
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor={cur.atmo}
        atmosphereAltitude={0.22}

        // ── Site dots (GPU, static, no flicker) ──
        pointsData={sites}
        pointLat={(d) => (d as SiteMarker).lat}
        pointLng={(d) => (d as SiteMarker).lng}
        pointColor={(d) => (d as SiteMarker).color}
        pointAltitude={0.008}
        pointRadius={0.2}
        pointLabel={(d) => {
          const m = d as SiteMarker
          return `<div style="font-family:Inter,sans-serif;background:rgba(7,10,20,0.9);border:1px solid rgba(255,255,255,0.15);padding:5px 10px;border-radius:8px;font-size:11px;color:#fff;white-space:nowrap">${m.label}</div>`
        }}
        onPointClick={onSiteClick}

        // ── Country flag pins (custom labels layer — static images, clickable) ──
        labelsData={countries}
        labelLat={(d: object) => (d as CountryMarker).lat}
        labelLng={(d: object) => (d as CountryMarker).lng}
        labelText={() => ''}
        labelSize={0}
        labelDotRadius={0}
        labelAltitude={0.015}
        labelLabel={(d: object) => {
          const m = d as CountryMarker
          return `<div style="font-family:Inter,sans-serif;background:rgba(7,10,20,0.9);border:1px solid rgba(255,255,255,0.15);padding:6px 12px;border-radius:10px;font-size:12px;color:#fff;white-space:nowrap">${m.flag} ${m.name}</div>`
        }}
        onLabelClick={onCountryClick}

        // ── Country HTML pin icons (location markers with flags) ──
        htmlElementsData={countries}
        htmlLat={(d: object) => (d as CountryMarker).lat}
        htmlLng={(d: object) => (d as CountryMarker).lng}
        htmlAltitude={0.02}
        htmlTransitionDuration={0}
        htmlElement={(d: object) => {
          const m = d as CountryMarker
          const el = document.createElement('div')
          el.style.cssText = 'cursor:pointer;pointer-events:auto;transition:transform 0.15s;'
          const img = document.createElement('img')
          img.src = flagPinDataUrl(m.flag, m.color)
          img.width = 36
          img.height = 45
          img.style.cssText = 'display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));'
          img.draggable = false
          el.appendChild(img)
          el.onmouseenter = () => { el.style.transform = 'scale(1.3)' }
          el.onmouseleave = () => { el.style.transform = 'scale(1)' }
          el.onclick = (e) => {
            e.stopPropagation()
            const country = COUNTRIES.find((c) => c.id === m.id)
            if (!country) return
            const g = globeRef.current
            if (g) {
              g.controls().autoRotate = false
              g.pointOfView({ lat: country.coords[0], lng: country.coords[1], altitude: 1.6 }, 1200)
            }
            onSelectCountry(country)
          }
          return el
        }}

        // ── Pulse rings ──
        ringsData={rings}
        ringLat={(d: object) => (d as { lat: number }).lat}
        ringLng={(d: object) => (d as { lng: number }).lng}
        ringColor={(d: object) => {
          const col = (d as { color: string }).color
          return (t: number) => `${col}${Math.round((1 - t) * 200).toString(16).padStart(2, '0')}`
        }}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1400}
      />

      {/* Layer Switcher */}
      {ready && (
        <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20, fontFamily: 'Inter,sans-serif' }}>
          <button
            onClick={() => setLayerOpen((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(7,10,20,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 12, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            <span style={{ fontSize: 14 }}>{cur.icon}</span>
            <span>{cur.label}</span>
            <span style={{ fontSize: 10, opacity: 0.5, transform: layerOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▲</span>
          </button>
          {layerOpen && (
            <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 8, background: 'rgba(7,10,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: 160 }}>
              {LAYERS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setLayer(l.id); setLayerOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: l.id === layer ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: l.id === layer ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{l.icon}</span>
                  <span style={{ flex: 1, fontWeight: l.id === layer ? 600 : 400 }}>{l.label}</span>
                  {l.id === layer && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4fc3f7' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
