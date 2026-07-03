import type { Motif } from '../lib/types'
import { cn } from '../lib/cn'

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  )
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function shade(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

function Scene({ motif, color }: { motif: Motif; color: string }) {
  const dark = shade(color, -70)
  const mid = shade(color, -20)
  const light = shade(color, 60)
  const silhouette = '#0a0d1a'
  const silhouette2 = '#141a30'

  const skies: Record<string, [string, string]> = {
    default: [shade(color, -40), shade(color, 40)],
  }
  const [skyA, skyB] = skies.default

  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        <linearGradient id={`sky-${motif}-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyA} />
          <stop offset="55%" stopColor={skyB} />
          <stop offset="100%" stopColor={light} />
        </linearGradient>
        <radialGradient id={`sun-${motif}-${color}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7e0" />
          <stop offset="60%" stopColor={light} />
          <stop offset="100%" stopColor={mid} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#sky-${motif}-${color})`} />
      <circle cx="310" cy="80" r="70" fill={`url(#sun-${motif}-${color})`} />
      <circle cx="310" cy="80" r="26" fill="#fff3cf" opacity="0.9" />

      {motif === 'mountains' && (
        <g>
          <polygon points="0,300 80,150 160,300" fill={silhouette2} />
          <polygon points="120,300 220,120 320,300" fill={silhouette} />
          <polygon points="260,300 340,170 400,300" fill={silhouette2} />
          <polygon points="220,120 245,155 195,155" fill="#f4f6ff" opacity="0.85" />
        </g>
      )}

      {motif === 'wall' && (
        <g fill={silhouette}>
          <path d="M0,260 L60,230 L120,255 L180,215 L240,250 L300,205 L360,245 L400,215 L400,300 L0,300 Z" />
          {[40, 150, 260, 350].map((x, i) => (
            <rect key={i} x={x} y={i % 2 ? 190 : 175} width="26" height="60" fill={silhouette2} />
          ))}
        </g>
      )}

      {motif === 'temple' && (
        <g fill={silhouette}>
          <rect x="150" y="150" width="100" height="110" />
          <polygon points="135,150 200,95 265,150" />
          <polygon points="150,150 200,120 250,150" fill={silhouette2} />
          <rect x="185" y="185" width="30" height="75" fill={mid} opacity="0.7" />
          <rect x="120" y="240" width="160" height="20" fill={silhouette2} />
        </g>
      )}

      {motif === 'arch' && (
        <g fill={silhouette}>
          <path d="M120,300 L120,160 Q200,80 280,160 L280,300 Z" />
          <path d="M150,300 L150,180 Q200,130 250,180 L250,300 Z" fill={mid} opacity="0.55" />
        </g>
      )}

      {motif === 'fort' && (
        <g fill={silhouette}>
          <rect x="90" y="160" width="220" height="100" />
          {[90, 130, 170, 210, 250, 290].map((x) => (
            <rect key={x} x={x} y="145" width="20" height="20" />
          ))}
          <rect x="180" y="205" width="40" height="55" fill={silhouette2} />
        </g>
      )}

      {motif === 'city' && (
        <g>
          {[
            [60, 150],
            [95, 110],
            [135, 175],
            [175, 90],
            [215, 140],
            [255, 70],
            [300, 130],
            [340, 160],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="30" height={260 - y} fill={i % 2 ? silhouette : silhouette2} />
          ))}
        </g>
      )}

      {motif === 'harbor' && (
        <g>
          <rect x="0" y="220" width="400" height="80" fill={dark} opacity="0.9" />
          {[70, 150, 230, 310].map((x, i) => (
            <g key={x} fill={i % 2 ? silhouette : silhouette2}>
              <rect x={x} y="150" width="50" height="70" />
              <rect x={x + 14} y="120" width="6" height="34" />
            </g>
          ))}
          <path d="M0,235 Q100,225 200,235 T400,235" stroke={light} strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      )}

      {motif === 'yurt' && (
        <g fill={silhouette}>
          <path d="M120,260 Q120,180 200,175 Q280,180 280,260 Z" />
          <path d="M175,175 L200,120 L225,175 Z" fill={silhouette2} />
          <rect x="185" y="215" width="30" height="45" fill={mid} opacity="0.7" />
        </g>
      )}

      {motif === 'mask' && (
        <g>
          <ellipse cx="200" cy="175" rx="55" ry="80" fill={silhouette} />
          <ellipse cx="180" cy="155" rx="10" ry="16" fill={light} />
          <ellipse cx="222" cy="155" rx="10" ry="16" fill={light} />
          <path d="M185,205 Q200,220 215,205" stroke={light} strokeWidth="4" fill="none" />
          <path d="M200,95 L200,250" stroke={mid} strokeWidth="3" opacity="0.6" />
        </g>
      )}

      {motif === 'drum' && (
        <g>
          <ellipse cx="200" cy="235" rx="90" ry="24" fill={dark} />
          <path d="M110,235 L130,170 L270,170 L290,235 Z" fill={silhouette} />
          <ellipse cx="200" cy="170" rx="70" ry="20" fill={mid} />
          <ellipse cx="200" cy="170" rx="70" ry="20" fill="none" stroke={light} strokeWidth="2" />
          {[150, 200, 250].map((x) => (
            <line key={x} x1={x} y1="172" x2={x - 20} y2="233" stroke={light} strokeWidth="1.5" opacity="0.6" />
          ))}
        </g>
      )}

      {/* foreground haze */}
      <rect x="0" y="250" width="400" height="50" fill={dark} opacity="0.55" />
    </svg>
  )
}

export function HeritageVisual({
  motif,
  color,
  className,
  rounded = 'rounded-3xl',
}: {
  motif: Motif
  color: string
  className?: string
  rounded?: string
}) {
  return (
    <div className={cn('relative overflow-hidden', rounded, className)}>
      <Scene motif={motif} color={color} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
    </div>
  )
}
