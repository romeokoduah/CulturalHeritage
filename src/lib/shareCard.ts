/**
 * Renders a beautiful, downloadable share card onto a <canvas> — no external
 * libraries. Used by the Share sheet to produce an image users can save or post.
 * Everything is drawn with the Canvas 2D API so the result is always
 * exportable; a remote photo is layered in when CORS permits, and silently
 * dropped (re-rendered on a rich gradient) when it would taint the canvas.
 */

export interface ShareCardData {
  kind: 'site' | 'country' | 'passport'
  eyebrow?: string
  title: string
  subtitle?: string
  greeting?: string
  emoji?: string
  accent: string
  accent2?: string
  imageUrl?: string
  stats?: { label: string; value: string }[]
}

export const CARD_W = 1200
export const CARD_H = 630

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 255, g: 209, b: 102 }
}
const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  let truncated = false
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
      if (lines.length === maxLines) {
        truncated = true
        line = ''
        break
      }
    } else {
      line = test
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  if (truncated && lines.length) lines[lines.length - 1] += '…'
  return lines
}

async function ensureFonts() {
  try {
    if (!('fonts' in document)) return
    await Promise.all([
      document.fonts.load('800 72px Sora'),
      document.fonts.load('700 30px Sora'),
      document.fonts.load('500 28px Inter'),
      document.fonts.ready,
    ])
  } catch {
    /* fall back to system fonts */
  }
}

/** Draw the card. When `withImage` is false, the photo is skipped entirely. */
export async function renderShareCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
  withImage = true,
): Promise<void> {
  await ensureFonts()
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const accent = data.accent || '#ffd166'
  const accent2 = data.accent2 || '#f97362'
  const PAD = 72

  // Base background
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H)
  bg.addColorStop(0, '#0b1020')
  bg.addColorStop(1, '#070a14')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Photo with scrim, when available and allowed
  let hasPhoto = false
  if (withImage && data.imageUrl) {
    const img = await loadImage(data.imageUrl)
    if (img) {
      hasPhoto = true
      const scale = Math.max(CARD_W / img.width, CARD_H / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, CARD_W - w, (CARD_H - h) / 2, w, h)
      const scrim = ctx.createLinearGradient(0, 0, CARD_W, 0)
      scrim.addColorStop(0, 'rgba(7,10,20,0.97)')
      scrim.addColorStop(0.55, 'rgba(7,10,20,0.72)')
      scrim.addColorStop(1, 'rgba(7,10,20,0.32)')
      ctx.fillStyle = scrim
      ctx.fillRect(0, 0, CARD_W, CARD_H)
      const vert = ctx.createLinearGradient(0, CARD_H, 0, CARD_H - 340)
      vert.addColorStop(0, 'rgba(7,10,20,0.9)')
      vert.addColorStop(1, 'rgba(7,10,20,0)')
      ctx.fillStyle = vert
      ctx.fillRect(0, CARD_H - 340, CARD_W, 340)
    }
  }

  // Accent glow
  const glow = ctx.createRadialGradient(180, 120, 0, 180, 120, 620)
  glow.addColorStop(0, rgba(accent, hasPhoto ? 0.14 : 0.28))
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Decorative rings + emoji for image-less cards
  if (!hasPhoto) {
    ctx.save()
    ctx.strokeStyle = rgba(accent, 0.16)
    ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(CARD_W - 170, CARD_H / 2, 110 + i * 92, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
    if (data.emoji) {
      ctx.font = '190px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(data.emoji, CARD_W - 170, CARD_H / 2)
    }
  }

  // Accent top border
  const border = ctx.createLinearGradient(0, 0, CARD_W, 0)
  border.addColorStop(0, accent)
  border.addColorStop(1, accent2)
  ctx.fillStyle = border
  ctx.fillRect(0, 0, CARD_W, 8)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Brand lockup
  const chip = ctx.createLinearGradient(PAD, 54, PAD + 46, 100)
  chip.addColorStop(0, accent)
  chip.addColorStop(1, accent2)
  ctx.fillStyle = chip
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(PAD, 54, 46, 46, 12)
    ctx.fill()
  } else {
    ctx.fillRect(PAD, 54, 46, 46)
  }
  ctx.fillStyle = '#070a14'
  ctx.font = '700 26px Inter, sans-serif'
  ctx.fillText('◎', PAD + 12, 87)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 30px Sora, sans-serif'
  ctx.fillText('HeritageQuest', PAD + 62, 88)

  // Content flows top-down through the lower-left column.
  const textMax = CARD_W - PAD * 2 - (hasPhoto ? 40 : 300)
  let cursor = 262

  if (data.eyebrow) {
    ctx.fillStyle = accent
    ctx.font = '700 22px Inter, sans-serif'
    ctx.fillText(data.eyebrow.toUpperCase().split('').join(' '), PAD, cursor)
    cursor += 30
  }

  // Title (max 2 lines)
  ctx.fillStyle = '#ffffff'
  const titleSize = data.title.length > 24 ? 64 : 78
  ctx.font = `800 ${titleSize}px Sora, sans-serif`
  const lines = wrapText(ctx, data.title, textMax, 2)
  lines.forEach((ln) => {
    cursor += titleSize
    ctx.fillText(ln, PAD, cursor)
    cursor += titleSize * 0.06
  })

  if (data.subtitle) {
    cursor += 46
    ctx.fillStyle = 'rgba(255,255,255,0.68)'
    ctx.font = '500 30px Inter, sans-serif'
    ctx.fillText(data.subtitle, PAD, cursor)
  }

  if (data.greeting) {
    cursor += 58
    ctx.font = '600 26px Inter, sans-serif'
    const w = ctx.measureText(data.greeting).width + 48
    ctx.fillStyle = rgba(accent, 0.16)
    if (ctx.roundRect) {
      ctx.beginPath()
      ctx.roundRect(PAD, cursor - 36, w, 54, 27)
      ctx.fill()
    }
    ctx.fillStyle = accent
    ctx.fillText(data.greeting, PAD + 24, cursor)
  }

  // Stats row (passport)
  if (data.stats?.length) {
    const cols = data.stats.length
    const gap = 28
    const colW = (CARD_W - PAD * 2 - gap * (cols - 1)) / cols
    const sy = CARD_H - PAD - 108
    data.stats.forEach((s, i) => {
      const x = PAD + i * (colW + gap)
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(x, sy, colW, 108, 18)
        ctx.fill()
      }
      ctx.fillStyle = accent
      ctx.font = '800 44px Sora, sans-serif'
      ctx.fillText(s.value, x + 22, sy + 60)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = '600 20px Inter, sans-serif'
      ctx.fillText(s.label, x + 22, sy + 90)
    })
  }

  // Footer tagline
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '500 22px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText("Explore the world's living heritage", CARD_W - PAD, CARD_H - 40)
  ctx.textAlign = 'left'
}

/** Export the canvas to a PNG blob, retrying without the photo if it tainted. */
export async function cardToBlob(canvas: HTMLCanvasElement, data: ShareCardData): Promise<Blob | null> {
  const tryExport = () =>
    new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((b) => resolve(b), 'image/png')
      } catch {
        resolve(null)
      }
    })
  let blob = await tryExport()
  if (!blob) {
    await renderShareCard(canvas, data, false)
    blob = await tryExport()
  }
  return blob
}
