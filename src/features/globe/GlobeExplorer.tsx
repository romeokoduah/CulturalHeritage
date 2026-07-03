import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { useNavigate } from 'react-router-dom'
import { COUNTRIES } from '../../data/countries'
import { SITES } from '../../data/sites'
import type { Country } from '../../lib/types'

/* ── Types ── */

interface SiteMarker {
  id: string
  lat: number
  lng: number
  label: string
  color: string
  size: number
  countryId: string
}

interface CountryPin {
  id: string
  lat: number
  lng: number
  name: string
  color: string
  emojiFlag: string
}

interface MapLayer {
  id: string
  label: string
  icon: string
  url: string
  atmosphereColor: string
}

const MAP_LAYERS: MapLayer[] = [
  { id: 'night', label: 'Night', icon: '🌙', url: 'https://unpkg.com/three-globe/example/img/earth-night.jpg', atmosphereColor: '#6aa4ff' },
  { id: 'day', label: 'Day', icon: '☀️', url: 'https://unpkg.com/three-globe/example/img/earth-day.jpg', atmosphereColor: '#87ceeb' },
  { id: 'blue-marble', label: 'Blue Marble', icon: '🌊', url: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', atmosphereColor: '#4a90d9' },
  { id: 'topology', label: 'Topology', icon: '🏔️', url: 'https://unpkg.com/three-globe/example/img/earth-topology.png', atmosphereColor: '#8fbc8f' },
  { id: 'dark', label: 'Dark', icon: '🛰️', url: 'https://unpkg.com/three-globe/example/img/earth-dark.jpg', atmosphereColor: '#3a3a6a' },
]

/* ── Component ── */

export function GlobeExplorer({
  onSelectCountry,
}: {
  onSelectCountry: (c: Country) => void
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [dims, setDims] = useState({ w: 360, h: 480 })
  const [ready, setReady] = useState(false)
  const [activeLayer, setActiveLayer] = useState<string>('night')
  const [layerPanelOpen, setLayerPanelOpen] = useState(false)

  const currentLayer = MAP_LAYERS.find((l) => l.id === activeLayer) || MAP_LAYERS[0]

  /* ── Site markers: GPU-rendered static dots (no flicker) ── */
  const siteMarkers = useMemo<SiteMarker[]>(
    () =>
      SITES.map((s) => ({
        id: s.id,
        lat: s.coords[0],
        lng: s.coords[1],
        label: s.name,
        color: s.themeColor,
        size: 0.25,
        countryId: s.countryId,
      })),
    [],
  )

  /* ── Country pins: HTML elements with location pin + flag (only 45, stable) ── */
  const countryPins = useMemo<CountryPin[]>(
    () =>
      COUNTRIES.map((c) => ({
        id: c.id,
        lat: c.coords[0],
        lng: c.coords[1],
        name: c.name,
        color: c.colors[1],
        emojiFlag: c.emojiFlag,
      })),
    [],
  )

  const ringsData = useMemo(
    () => COUNTRIES.map((c) => ({ lat: c.coords[0], lng: c.coords[1], color: c.colors[1] })),
    [],
  )

  /* ── Responsive sizing ── */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setDims({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  /* ── Auto-rotate + initial view ── */
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    const controls = g.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.enableZoom = true
    controls.minDistance = 180
    controls.maxDistance = 520
    g.pointOfView({ lat: 20, lng: 60, altitude: 2.4 }, 0)
    setReady(true)
  }, [])

  /* ── Country pin HTML element factory ── */
  const countryPinFactory = useCallback(
    (d: object) => {
      const pin = d as CountryPin

      const el = document.createElement('div')
      el.style.cssText = 'cursor:pointer;text-align:center;transition:transform 0.2s;'

      // Location pin SVG with country color
      el.innerHTML = `
        <div style="position:relative;display:inline-block;">
          <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 40 C16 40 3 25 3 14 A13 13 0 1 1 29 14 C29 25 16 40 16 40Z"
                  fill="${pin.color}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
            <circle cx="16" cy="14" r="6" fill="rgba(255,255,255,0.3)"/>
          </svg>
          <div style="position:absolute;top:5px;left:50%;transform:translateX(-50%);font-size:13px;line-height:1;pointer-events:none;">
            ${pin.emojiFlag}
          </div>
        </div>
      `

      // Hover: scale up
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.25)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

      // Click: fly to country + show preview
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const country = COUNTRIES.find((c) => c.id === pin.id)
        if (country) {
          const g = globeRef.current
          if (g) {
            g.controls().autoRotate = false
            g.pointOfView({ lat: country.coords[0], lng: country.coords[1], altitude: 1.6 }, 1200)
          }
          onSelectCountry(country)
        }
      })

      return el
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /* ── Site dot click handler ── */
  const handleSiteClick = useCallback(
    (point: object) => {
      const m = point as SiteMarker
      navigate(`/site/${m.id}`)
    },
    [navigate],
  )

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
        globeImageUrl={currentLayer.url}
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor={currentLayer.atmosphereColor}
        atmosphereAltitude={0.22}
        /* ── Site markers: GPU static dots ── */
        pointsData={siteMarkers}
        pointLat={(d) => (d as SiteMarker).lat}
        pointLng={(d) => (d as SiteMarker).lng}
        pointColor={(d) => (d as SiteMarker).color}
        pointAltitude={0.01}
        pointRadius={(d) => (d as SiteMarker).size}
        pointLabel={(d) => {
          const m = d as SiteMarker
          return `<div style="font-family:Inter,sans-serif;background:rgba(7,10,20,0.9);border:1px solid rgba(255,255,255,0.15);padding:6px 12px;border-radius:10px;font-size:12px;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.5);white-space:nowrap">${m.label}</div>`
        }}
        onPointClick={handleSiteClick}
        /* ── Country pins: HTML location markers with flags ── */
        htmlElementsData={countryPins}
        htmlLat={(d: object) => (d as CountryPin).lat}
        htmlLng={(d: object) => (d as CountryPin).lng}
        htmlAltitude={0.06}
        htmlElement={countryPinFactory}
        htmlTransitionDuration={0}
        /* ── Pulse rings ── */
        ringsData={ringsData}
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

      {/* Map Layer Switcher */}
      {ready && (
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
          <button
            onClick={() => setLayerPanelOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              background: 'rgba(7,10,20,0.7)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#fff', fontSize: '12px', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ fontSize: '14px' }}>{currentLayer.icon}</span>
            <span>{currentLayer.label}</span>
            <span style={{ fontSize: '10px', opacity: 0.5, transform: layerPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▲</span>
          </button>

          {layerPanelOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px',
              background: 'rgba(7,10,20,0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: '160px',
            }}>
              {MAP_LAYERS.map((layer) => {
                const isActive = layer.id === activeLayer
                return (
                  <button
                    key={layer.id}
                    onClick={() => { setActiveLayer(layer.id); setLayerPanelOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                      padding: '8px 12px', background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none', borderRadius: '8px',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      fontSize: '12px', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{layer.icon}</span>
                    <span style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>{layer.label}</span>
                    {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4fc3f7' }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
