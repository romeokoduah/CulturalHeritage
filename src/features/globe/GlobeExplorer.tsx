import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { useNavigate } from 'react-router-dom'
import { COUNTRIES } from '../../data/countries'
import { SITES } from '../../data/sites'
import type { Country } from '../../lib/types'

interface MarkerDatum {
  id: string
  kind: 'country' | 'site'
  lat: number
  lng: number
  label: string
  color: string
  size: number
  countryId: string
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

  // Static point markers — no DOM elements, no flickering
  const markers = useMemo<MarkerDatum[]>(() => {
    const countryMarkers: MarkerDatum[] = COUNTRIES.map((c) => ({
      id: c.id,
      kind: 'country' as const,
      lat: c.coords[0],
      lng: c.coords[1],
      label: `${c.emojiFlag} ${c.name}`,
      color: c.colors[1],
      size: 0.7,
      countryId: c.id,
    }))
    const siteMarkers: MarkerDatum[] = SITES.map((s) => ({
      id: s.id,
      kind: 'site' as const,
      lat: s.coords[0],
      lng: s.coords[1],
      label: s.name,
      color: s.themeColor,
      size: 0.3,
      countryId: s.countryId,
    }))
    return [...countryMarkers, ...siteMarkers]
  }, [])

  const ringsData = useMemo(
    () => COUNTRIES.map((c) => ({ lat: c.coords[0], lng: c.coords[1], color: c.colors[1] })),
    [],
  )

  // Responsive sizing
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setDims({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // Auto-rotate + initial view
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

  // Click handler — stable, works on every pin
  const handlePointClick = useCallback(
    (point: object) => {
      const m = point as MarkerDatum
      if (m.kind === 'site') {
        navigate(`/site/${m.id}`)
      } else {
        const country = COUNTRIES.find((c) => c.id === m.countryId)
        if (country) {
          const g = globeRef.current
          if (g) {
            g.controls().autoRotate = false
            g.pointOfView({ lat: country.coords[0], lng: country.coords[1], altitude: 1.6 }, 1200)
          }
          onSelectCountry(country)
        }
      }
    },
    [navigate, onSelectCountry],
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
        /* Static point markers — GPU-rendered, no flicker */
        pointsData={markers}
        pointLat={(d) => (d as MarkerDatum).lat}
        pointLng={(d) => (d as MarkerDatum).lng}
        pointColor={(d) => (d as MarkerDatum).color}
        pointAltitude={(d) => ((d as MarkerDatum).kind === 'country' ? 0.12 : 0.03)}
        pointRadius={(d) => (d as MarkerDatum).size}
        pointLabel={(d) => {
          const m = d as MarkerDatum
          return `<div style="font-family:Inter,sans-serif;background:rgba(7,10,20,0.85);border:1px solid rgba(255,255,255,0.15);padding:6px 12px;border-radius:10px;font-size:12px;color:#fff;backdrop-filter:blur(8px);box-shadow:0 6px 24px rgba(0,0,0,0.5);pointer-events:none;white-space:nowrap">${m.label}</div>`
        }}
        onPointClick={handlePointClick}
        /* Pulse rings around countries */
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
