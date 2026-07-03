import { useState } from 'react'
import { Box, ExternalLink, Play } from 'lucide-react'
import type { HeritageSite } from '../../lib/types'
import { HeritageVisual } from '../../components/HeritageVisual'

/**
 * Loads a Sketchfab model on demand (saves mobile data, avoids autoloading
 * broken iframes). Falls back to the procedural heritage visual when no model
 * id is configured. When the libresprite/sketchfab MCPs are connected, real
 * model ids can be dropped into the site data.
 */
export function SketchfabViewer({ site }: { site: HeritageSite }) {
  const [loaded, setLoaded] = useState(false)
  const hasModel = !!site.sketchfabModelId

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl glass">
      {loaded && hasModel ? (
        <iframe
          title={`${site.name} 3D model`}
          className="h-full w-full"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          src={`https://sketchfab.com/models/${site.sketchfabModelId}/embed?autospin=1&autostart=1&ui_theme=dark&ui_infos=0&ui_controls=1`}
        />
      ) : (
        <>
          <HeritageVisual motif={site.motif} color={site.themeColor} rounded="rounded-3xl" className="h-full w-full" />
          <div className="absolute inset-0 grid place-items-center bg-ink-950/30">
            {hasModel ? (
              <button
                onClick={() => setLoaded(true)}
                className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-xl transition hover:scale-105"
              >
                <Play size={16} /> View in 3D
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex items-center gap-2 rounded-full glass px-4 py-2 text-xs uppercase tracking-widest text-white/70">
                  <Box size={14} className="text-gold-400" /> 3D scan coming soon
                </span>
                <a
                  href={`https://sketchfab.com/search?q=${encodeURIComponent(site.name)}&type=models`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
                >
                  Browse models on Sketchfab <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </>
      )}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-widest text-white/70">
        {hasModel ? 'Sketchfab · 3D' : 'Heritage view'}
      </span>
    </div>
  )
}
