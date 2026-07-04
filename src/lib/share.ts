export interface ShareContent {
  title: string
  text: string
  url: string
}

/** Whether the browser supports the native share sheet. */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/**
 * Open the OS share sheet, attaching the generated card image when the browser
 * allows file sharing. Returns true if the share dialog opened.
 */
export async function nativeShare(content: ShareContent, file?: File): Promise<boolean> {
  if (!canNativeShare()) return false
  try {
    if (file && 'canShare' in navigator && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ ...content, files: [file] })
    } else {
      await navigator.share(content)
    }
    return true
  } catch {
    // User dismissed, or share failed — treat as no-op.
    return false
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Intent URLs for the common social networks. */
export function socialLinks(content: ShareContent) {
  const url = encodeURIComponent(content.url)
  const text = encodeURIComponent(`${content.title} — ${content.text}`)
  return {
    x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
  }
}
