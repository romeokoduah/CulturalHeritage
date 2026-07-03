import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { useNavigate } from 'react-router-dom'
import { COUNTRIES } from '../../data/countries'
import { SITES } from '../../data/sites'
import type { Country, HeritageSite } from '../../lib/types'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface PinDatum {
  id: string
  kind: 'country' | 'site'
  lat: number
  lng: number
  label: string
  color: string
  countryId: string
  // country-specific
  emojiFlag?: string
  // site-specific
  site?: HeritageSite
}

interface MapLayer {
  id: string
  label: string
  icon: string
  url: string
  atmosphereColor: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const MAP_LAYERS: MapLayer[] = [
  {
    id: 'night',
    label: 'Night',
    icon: '\uD83C\uDF19',
    url: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    atmosphereColor: '#6aa4ff',
  },
  {
    id: 'day',
    label: 'Day',
    icon: '\u2600\uFE0F',
    url: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
    atmosphereColor: '#87ceeb',
  },
  {
    id: 'blue-marble',
    label: 'Blue Marble',
    icon: '\uD83C\uDF0A',
    url: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    atmosphereColor: '#4a90d9',
  },
  {
    id: 'topology',
    label: 'Topology',
    icon: '\uD83C\uDFD4\uFE0F',
    url: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
    atmosphereColor: '#8fbc8f',
  },
  {
    id: 'green',
    label: 'Green',
    icon: '\uD83C\uDF3F',
    url: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
    atmosphereColor: '#3cb371',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: '\uD83D\uDEF0\uFE0F',
    url: 'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
    atmosphereColor: '#3a3a6a',
  },
]

const GLASS_BG = 'rgba(7,10,20,0.7)'
const GLASS_BORDER = 'rgba(255,255,255,0.1)'

/* ------------------------------------------------------------------ */
/*  Pin SVG builders                                                  */
/* ------------------------------------------------------------------ */

function buildCountryPinSVG(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
    <defs>
      <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
      </filter>
    </defs>
    <path d="M18 46 C18 46 3 28 3 16 A15 15 0 1 1 33 16 C33 28 18 46 18 46Z"
          fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" filter="url(#ds)"/>
    <circle cx="18" cy="16" r="7" fill="rgba(255,255,255,0.25)"/>
  </svg>`
}

function buildSitePinSVG(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="34" viewBox="0 0 24 34">
    <defs>
      <filter id="ds2" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
    </defs>
    <path d="M12 32 C12 32 2 20 2 11 A10 10 0 1 1 22 11 C22 20 12 32 12 32Z"
          fill="${color}" stroke="rgba(255,255,255,0.4)" stroke-width="1" filter="url(#ds2)"/>
    <circle cx="12" cy="11" r="4" fill="rgba(255,255,255,0.3)"/>
  </svg>`
}

/* ------------------------------------------------------------------ */
/*  Hover card builder                                                */
/* ------------------------------------------------------------------ */

function buildHoverCard(pin: PinDatum): HTMLDivElement {
  const card = document.createElement('div')
  card.className = 'globe-hover-card'
  Object.assign(card.style, {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-8px)',
    width: '260px',
    maxWidth: '280px',
    background: GLASS_BG,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${GLASS_BORDER}`,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    opacity: '0',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    pointerEvents: 'none',
    zIndex: '9999',
    fontFamily: 'Inter, system-ui, sans-serif',
  })

  if (pin.kind === 'site' && pin.site) {
    const site = pin.site

    // Image section
    const imgWrap = document.createElement('div')
    Object.assign(imgWrap.style, {
      width: '100%',
      height: '120px',
      overflow: 'hidden',
      position: 'relative',
    })

    if (site.imageUrl) {
      const img = document.createElement('img')
      img.src = site.imageUrl
      img.alt = site.name
      Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      })
      img.onerror = () => {
        img.remove()
        Object.assign(imgWrap.style, {
          background: `linear-gradient(135deg, ${site.themeColor}, ${site.themeColor}88)`,
        })
        const fallbackLabel = document.createElement('div')
        Object.assign(fallbackLabel.style, {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: 'rgba(255,255,255,0.6)',
        })
        fallbackLabel.textContent = site.category === 'Sacred' ? '\u26E9' : '\uD83C\uDFDB'
        imgWrap.appendChild(fallbackLabel)
      }
      imgWrap.appendChild(img)
    } else {
      Object.assign(imgWrap.style, {
        background: `linear-gradient(135deg, ${site.themeColor}, ${site.themeColor}88)`,
      })
      const placeholder = document.createElement('div')
      Object.assign(placeholder.style, {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        color: 'rgba(255,255,255,0.6)',
      })
      placeholder.textContent = site.category === 'Sacred' ? '\u26E9' : '\uD83C\uDFDB'
      imgWrap.appendChild(placeholder)
    }
    card.appendChild(imgWrap)

    // Info section
    const info = document.createElement('div')
    Object.assign(info.style, { padding: '10px 14px 12px' })

    const name = document.createElement('div')
    Object.assign(name.style, {
      fontSize: '13px',
      fontWeight: '600',
      color: '#fff',
      lineHeight: '1.3',
      marginBottom: '3px',
    })
    name.textContent = site.name
    info.appendChild(name)

    const city = document.createElement('div')
    Object.assign(city.style, {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.55)',
      marginBottom: '8px',
    })
    city.textContent = site.city
    info.appendChild(city)

    // Badges row
    const badges = document.createElement('div')
    Object.assign(badges.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '8px',
      flexWrap: 'wrap',
    })

    const catBadge = document.createElement('span')
    Object.assign(catBadge.style, {
      fontSize: '10px',
      fontWeight: '500',
      color: site.themeColor,
      background: `${site.themeColor}22`,
      border: `1px solid ${site.themeColor}44`,
      borderRadius: '6px',
      padding: '2px 7px',
      letterSpacing: '0.02em',
    })
    catBadge.textContent = site.category
    badges.appendChild(catBadge)

    if (site.unesco) {
      const unescoBadge = document.createElement('span')
      Object.assign(unescoBadge.style, {
        fontSize: '10px',
        fontWeight: '500',
        color: '#4fc3f7',
        background: 'rgba(79,195,247,0.12)',
        border: '1px solid rgba(79,195,247,0.3)',
        borderRadius: '6px',
        padding: '2px 7px',
      })
      unescoBadge.textContent = 'UNESCO'
      badges.appendChild(unescoBadge)
    }

    info.appendChild(badges)

    const cta = document.createElement('div')
    Object.assign(cta.style, {
      fontSize: '10px',
      color: 'rgba(255,255,255,0.35)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    })
    cta.textContent = 'Click to explore \u2192'
    info.appendChild(cta)

    card.appendChild(info)
  } else {
    // Country hover card (simpler)
    const info = document.createElement('div')
    Object.assign(info.style, { padding: '12px 14px' })

    const name = document.createElement('div')
    Object.assign(name.style, {
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '4px',
    })
    name.textContent = `${pin.emojiFlag || ''} ${pin.label}`
    info.appendChild(name)

    const country = COUNTRIES.find((c) => c.id === pin.countryId)
    if (country) {
      const region = document.createElement('div')
      Object.assign(region.style, {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '6px',
      })
      region.textContent = `${country.region} \u00B7 ${country.siteIds.length} sites`
      info.appendChild(region)
    }

    const cta = document.createElement('div')
    Object.assign(cta.style, {
      fontSize: '10px',
      color: 'rgba(255,255,255,0.35)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    })
    cta.textContent = 'Click to explore \u2192'
    info.appendChild(cta)

    card.appendChild(info)
  }

  return card
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

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

  /* ---------- Pin data ------------------------------------------ */

  const pins = useMemo<PinDatum[]>(() => {
    const countryPins: PinDatum[] = COUNTRIES.map((c) => ({
      id: c.id,
      kind: 'country',
      lat: c.coords[0],
      lng: c.coords[1],
      label: c.name,
      color: c.colors[1],
      countryId: c.id,
      emojiFlag: c.emojiFlag,
    }))
    const sitePins: PinDatum[] = SITES.map((s) => ({
      id: s.id,
      kind: 'site',
      lat: s.coords[0],
      lng: s.coords[1],
      label: s.name,
      color: s.themeColor,
      countryId: s.countryId,
      site: s,
    }))
    return [...countryPins, ...sitePins]
  }, [])

  const ringsData = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        lat: c.coords[0],
        lng: c.coords[1],
        color: c.colors[1],
      })),
    [],
  )

  /* ---------- HTML element factory ------------------------------ */

  const pinElementFactory = useCallback(
    (d: object) => {
      const pin = d as PinDatum
      const container = document.createElement('div')
      Object.assign(container.style, {
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        animation: 'globePinEntrance 0.5s ease-out',
      })

      // The pin icon
      const pinIcon = document.createElement('div')
      if (pin.kind === 'country') {
        pinIcon.innerHTML = buildCountryPinSVG(pin.color)
        // Overlay emoji flag
        const flagOverlay = document.createElement('div')
        Object.assign(flagOverlay.style, {
          position: 'absolute',
          top: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          lineHeight: '1',
          pointerEvents: 'none',
          textAlign: 'center',
        })
        flagOverlay.textContent = pin.emojiFlag || ''
        pinIcon.style.position = 'relative'
        pinIcon.appendChild(flagOverlay)
      } else {
        pinIcon.innerHTML = buildSitePinSVG(pin.color)
      }

      container.appendChild(pinIcon)

      // Build hover card
      const hoverCard = buildHoverCard(pin)
      container.appendChild(hoverCard)

      // Hover events
      container.addEventListener('mouseenter', () => {
        hoverCard.style.opacity = '1'
        hoverCard.style.transform = 'translateX(-50%) translateY(-12px)'
        container.style.transform = 'scale(1.15)'
      })
      container.addEventListener('mouseleave', () => {
        hoverCard.style.opacity = '0'
        hoverCard.style.transform = 'translateX(-50%) translateY(-8px)'
        container.style.transform = 'scale(1)'
      })

      // Click handler — all pins navigate to their page
      container.addEventListener('click', (e) => {
        e.stopPropagation()
        if (pin.kind === 'site') {
          navigate(`/site/${pin.id}`)
        } else {
          const country = COUNTRIES.find((c) => c.id === pin.countryId)
          if (country) onSelectCountry(country)
          navigate(`/country/${pin.countryId}`)
        }
      })

      return container
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /* ---------- Responsive sizing --------------------------------- */

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

  /* ---------- Auto-rotate + initial view ------------------------ */

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

  /* ---------- Inject keyframe animation ------------------------- */

  useEffect(() => {
    const styleId = 'globe-pin-animation-styles'
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes globePinEntrance {
        0% { opacity: 0; transform: scale(0.3) translateY(10px); }
        60% { opacity: 1; transform: scale(1.1) translateY(-2px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
    `
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  /* ---------- Layer switcher handler ---------------------------- */

  const handleLayerChange = useCallback((layer: MapLayer) => {
    setActiveLayer(layer.id)
    setLayerPanelOpen(false)
  }, [])

  /* ---------- Render -------------------------------------------- */

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full">
      {/* Loading spinner */}
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center text-white/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-gold-400" />
            <p className="text-xs uppercase tracking-widest">rendering the world...</p>
          </div>
        </div>
      )}

      {/* Globe */}
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
        /* --- HTML pin markers --- */
        htmlElementsData={pins}
        htmlLat={(d: object) => (d as PinDatum).lat}
        htmlLng={(d: object) => (d as PinDatum).lng}
        htmlAltitude={(d: object) => ((d as PinDatum).kind === 'country' ? 0.14 : 0.04)}
        htmlElement={pinElementFactory}
        htmlTransitionDuration={800}
        /* --- Rings --- */
        ringsData={ringsData}
        ringLat={(d: object) => (d as { lat: number }).lat}
        ringLng={(d: object) => (d as { lng: number }).lng}
        ringColor={(d: object) => {
          const col = (d as { color: string }).color
          return (t: number) =>
            `${col}${Math.round((1 - t) * 200)
              .toString(16)
              .padStart(2, '0')}`
        }}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1400}
      />

      {/* Map Layer Switcher */}
      {ready && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            zIndex: 20,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Toggle button */}
          <button
            onClick={() => setLayerPanelOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: GLASS_BG,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${GLASS_BORDER}`,
              borderRadius: '10px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(7,10,20,0.85)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = GLASS_BG
            }}
          >
            <span style={{ fontSize: '14px' }}>{currentLayer.icon}</span>
            <span>{currentLayer.label}</span>
            <span
              style={{
                fontSize: '10px',
                opacity: 0.5,
                transform: layerPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              {'\u25B2'}
            </span>
          </button>

          {/* Layer options panel */}
          {layerPanelOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '8px',
                background: GLASS_BG,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${GLASS_BORDER}`,
                borderRadius: '12px',
                padding: '6px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                animation: 'globePinEntrance 0.2s ease-out',
                minWidth: '160px',
              }}
            >
              {MAP_LAYERS.map((layer) => {
                const isActive = layer.id === activeLayer
                return (
                  <button
                    key={layer.id}
                    onClick={() => handleLayerChange(layer)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, color 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.06)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      }
                    }}
                  >
                    <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>
                      {layer.icon}
                    </span>
                    <span style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>{layer.label}</span>
                    {isActive && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#4fc3f7',
                          flexShrink: 0,
                        }}
                      />
                    )}
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
