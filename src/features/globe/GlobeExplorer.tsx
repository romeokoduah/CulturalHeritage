import { useEffect, useMemo, useRef, useState } from 'react'
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

  const markers = useMemo<MarkerDatum[]>(() => {
    const countryMarkers: MarkerDatum[] = COUNTRIES.map((c) => ({
      id: c.id,
      kind: 'country',
      lat: c.coords[0],
      lng: c.coords[1],
      label: `${c.emojiFlag} ${c.name}`,
      color: c.colors[1],
      size: 0.9,
      countryId: c.id,
    }))
    const siteMarkers: MarkerDatum[] = SITES.map((s) => ({
      id: s.id,
      kind: 'site',
      lat: s.coords[0],
      lng: s.coords[1],
      label: s.name,
      color: s.themeColor,
      size: 0.35,
      countryId: s.countryId,
    }))
    return [...countryMarkers, ...siteMarkers]
  }, [])

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

  function focus(c: Country) {
    const g = globeRef.current
    if (g) {
      g.controls().autoRotate = false
      g.pointOfView({ lat: c.coords[0], lng: c.coords[1], altitude: 1.6 }, 1200)
    }
    onSelectCountry(c)
  }

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
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor="#6aa4ff"
        atmosphereAltitude={0.22}
        pointsData={markers}
        pointLat={(d) => (d as MarkerDatum).lat}
        pointLng={(d) => (d as MarkerDatum).lng}
        pointColor={(d) => (d as MarkerDatum).color}
        pointAltitude={(d) => ((d as MarkerDatum).kind === 'country' ? 0.14 : 0.05)}
        pointRadius={(d) => (d as MarkerDatum).size}
        pointLabel={(d) => {
          const m = d as MarkerDatum
          return `<div style="font-family:Inter,sans-serif;background:#0b1020;border:1px solid rgba(255,255,255,.15);padding:6px 10px;border-radius:10px;font-size:12px;color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.5)">${m.label}</div>`
        }}
        onPointClick={(d) => {
          const m = d as MarkerDatum
          const country = COUNTRIES.find((c) => c.id === m.countryId)
          if (m.kind === 'site') {
            navigate(`/site/${m.id}`)
          } else if (country) {
            focus(country)
          }
        }}
        ringsData={COUNTRIES.map((c) => ({ lat: c.coords[0], lng: c.coords[1], color: c.colors[1] }))}
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
    </div>
  )
}
