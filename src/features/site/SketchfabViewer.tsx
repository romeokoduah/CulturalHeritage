import { useRef, useState } from 'react'
import { Box, ExternalLink, Move3d, Play, RotateCcw, Sparkles } from 'lucide-react'
import type { HeritageSite } from '../../lib/types'
import { HeritageVisual } from '../../components/HeritageVisual'
import { model3dFor } from '../../data/models3d'
import { cn } from '../../lib/cn'

type Mode = 'poster' | 'model' | 'failed'

/**
 * The heritage "3D" panel. When a verified Sketchfab model exists it loads on
 * demand (saving mobile data and avoiding broken autoloads); otherwise — and
 * whenever an embed is blocked by its owner — it shows a polished, pointer-
 * reactive Heritage View built from the site's own motif. There is no dead
 * "coming soon" state: every site gets something alive to explore.
 */
export function SketchfabViewer({ site }: { site: HeritageSite }) {
  const modelId = model3dFor(site.id, site.sketchfabModelId)
  const [mode, setMode] = useState<Mode>('poster')

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl glass">
      {mode === 'model' && modelId ? (
        <>
          <iframe
            title={`${site.name} 3D model`}
            className="h-full w-full"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
            src={`https://sketchfab.com/models/${modelId}/embed?autospin=0.3&autostart=1&ui_theme=dark&ui_infos=0&ui_hint=0&ui_controls=1&preload=1&transparent=0`}
            onError={() => setMode('failed')}
          />
          <button
            onClick={() => setMode('poster')}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-white/80 transition hover:text-white"
          >
            <RotateCcw size={12} /> Exit 3D
          </button>
        </>
      ) : (
        <>
          <InteractiveHeritageView site={site} />

          {/* Controls layer */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-widest text-white/70">
                <Move3d size={12} className="text-gold-400" />
                {modelId ? '3D model' : 'Interactive view'}
              </span>
              {mode === 'failed' && (
                <span className="rounded-full bg-clay-500/20 px-2.5 py-1 text-[10px] font-medium text-clay-300">
                  3D embed unavailable
                </span>
              )}
            </div>

            <div className="flex items-end justify-between gap-2">
              <span className="pointer-events-auto hidden items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] text-white/55 sm:flex">
                <Sparkles size={11} className="text-gold-400" /> Move your cursor to explore
              </span>
              {modelId && mode !== 'failed' ? (
                <button
                  onClick={() => setMode('model')}
                  className="pointer-events-auto ml-auto flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-abyss shadow-xl transition hover:scale-105 hover:bg-white"
                >
                  <Play size={15} /> View in 3D
                </button>
              ) : (
                <a
                  href={`https://sketchfab.com/search?q=${encodeURIComponent(site.name)}&type=models`}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto ml-auto flex items-center gap-1 rounded-full glass px-3 py-1.5 text-[11px] text-white/60 transition hover:text-white"
                >
                  <Box size={12} /> More 3D scans <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * A pointer-reactive parallax scene. Layers of the site's motif shift at
 * different depths so a flat illustration reads as a tangible, tiltable object.
 */
function InteractiveHeritageView({ site }: { site: HeritageSite }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false })

  function onMove(e: React.PointerEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 14, ry: px * 18, active: true })
  }
  function reset() {
    setTilt({ rx: 0, ry: 0, active: false })
  }

  const t = (depth: number) =>
    `translate3d(${tilt.ry * depth}px, ${-tilt.rx * depth}px, 0)`

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="absolute inset-0 [perspective:1100px]"
      style={{ background: `radial-gradient(circle at 50% 30%, ${site.themeColor}22, transparent 70%)` }}
    >
      <div
        className={cn(
          'relative h-full w-full [transform-style:preserve-3d]',
          !tilt.active && 'transition-transform duration-700 ease-out',
        )}
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        {/* Back layer — the motif scene, oversized so parallax never reveals an edge */}
        <div className="absolute inset-[-8%]" style={{ transform: `${t(1.4)} translateZ(-40px) scale(1.12)` }}>
          <HeritageVisual motif={site.motif} color={site.themeColor} rounded="rounded-none" className="h-full w-full" />
        </div>

        {/* Mid layer — colour wash + depth vignette */}
        <div
          className="absolute inset-0"
          style={{
            transform: `${t(0.6)} translateZ(0px)`,
            background: `linear-gradient(180deg, transparent 30%, ${site.themeColor}18 100%)`,
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.55)',
          }}
        />

        {/* Specular highlight that follows the cursor */}
        <div
          className="absolute inset-0 mix-blend-soft-light transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(circle at ${50 + tilt.ry * 2.4}% ${50 - tilt.rx * 2.4}%, rgba(255,255,255,0.55), transparent 45%)`,
          }}
        />

        {/* Front layer — floating title plate */}
        <div
          className="absolute inset-x-0 bottom-0 p-4"
          style={{ transform: `${t(-1.1)} translateZ(60px)` }}
        >
          <p className="font-display text-lg font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {site.name}
          </p>
          <p className="text-xs text-white/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{site.city}</p>
        </div>
      </div>
    </div>
  )
}
