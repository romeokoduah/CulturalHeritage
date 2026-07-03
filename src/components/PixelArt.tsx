import { cn } from '../lib/cn'

/**
 * Pixel-art rendered as crisp SVG rects (LibreSprite-style aesthetic).
 * Procedural so it always renders and scales without image assets.
 */

const OCEAN = '#2b6fb3'
const OCEAN_D = '#1f5590'
const LAND = '#3fae6b'
const LAND_D = '#2e8752'
const OUT = '#0a0d1a'
const HAT = '#7a4a2b'
const HATL = '#9a5f38'
const GOLD = '#ffd166'
const WHITE = '#f4f6ff'

// Which globe cells are "land" (16x16 grid)
const LAND_CELLS = new Set([
  '5,7', '6,7', '6,8', '7,8', '5,8',
  '9,6', '10,6', '10,7', '11,7',
  '8,10', '9,10', '9,11', '10,11', '8,11',
  '4,9', '5,10', '11,9', '10,10',
])

export function MascotGlobe({ size = 96, className, animate = true }: { size?: number; className?: string; animate?: boolean }) {
  const N = 16
  const cells: { x: number; y: number; c: string }[] = []
  const cx = 7.5
  const cy = 8.5
  const r = 6.6

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (d <= r) {
        const edge = d > r - 1
        const isLand = LAND_CELLS.has(`${x},${y}`)
        cells.push({ x, y, c: edge ? (isLand ? LAND_D : OCEAN_D) : isLand ? LAND : OCEAN })
      }
    }
  }

  // Explorer hat (rows 1-3)
  const hat: { x: number; y: number; c: string }[] = []
  for (let x = 4; x <= 11; x++) hat.push({ x, y: 3, c: GOLD }) // gold band
  for (let x = 5; x <= 10; x++) hat.push({ x, y: 2, c: HATL })
  for (let x = 6; x <= 9; x++) hat.push({ x, y: 1, c: HAT })

  // Eyes + smile
  const face = [
    { x: 5, y: 8, c: WHITE },
    { x: 6, y: 8, c: OUT },
    { x: 9, y: 8, c: WHITE },
    { x: 10, y: 8, c: OUT },
    { x: 6, y: 11, c: OUT },
    { x: 7, y: 12, c: OUT },
    { x: 8, y: 12, c: OUT },
    { x: 9, y: 11, c: OUT },
  ]

  const all = [...cells, ...hat, ...face]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={cn(animate && 'animate-float', className)}
      role="img"
      aria-label="Kofi the Explorer mascot"
    >
      {all.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width="1.02" height="1.02" fill={p.c} />
      ))}
    </svg>
  )
}

export function PixelBadge({
  colors,
  emoji,
  earned,
  size = 88,
  className,
}: {
  colors: [string, string]
  emoji: string
  earned: boolean
  size?: number
  className?: string
}) {
  const [a, b] = colors
  return (
    <div
      className={cn('relative grid place-items-center', className)}
      style={{ width: size, height: size }}
      aria-label={earned ? 'Badge earned' : 'Badge locked'}
    >
      <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* outer gold ring */}
        {ring(8, 8, 7, earned ? GOLD : '#3a4160').map((p, i) => (
          <rect key={`o${i}`} x={p.x} y={p.y} width="1.02" height="1.02" fill={p.c} />
        ))}
        {/* inner disc split into two country colours */}
        {disc(8, 8, 5.4, earned ? a : '#20263f', earned ? b : '#171c30').map((p, i) => (
          <rect key={`d${i}`} x={p.x} y={p.y} width="1.02" height="1.02" fill={p.c} />
        ))}
      </svg>
      <span
        className={cn(
          'absolute text-2xl transition-all',
          earned ? 'opacity-100' : 'opacity-30 grayscale',
        )}
        style={{ fontSize: size * 0.34 }}
      >
        {emoji}
      </span>
      {!earned && (
        <span className="absolute -bottom-1 rounded bg-ink-950/80 px-1.5 text-[9px] uppercase tracking-widest text-white/50">
          locked
        </span>
      )}
    </div>
  )
}

function ring(cx: number, cy: number, r: number, color: string) {
  const out: { x: number; y: number; c: string }[] = []
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - cx + 0.5, y - cy + 0.5)
      if (d <= r && d > r - 1.3) out.push({ x, y, c: color })
    }
  return out
}
function disc(cx: number, cy: number, r: number, a: string, b: string) {
  const out: { x: number; y: number; c: string }[] = []
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - cx + 0.5, y - cy + 0.5)
      if (d <= r) out.push({ x, y, c: x + y < 15 ? a : b })
    }
  return out
}
