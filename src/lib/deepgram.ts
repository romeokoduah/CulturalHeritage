// Read from the environment (Vite exposes VITE_* vars to the client). The key
// is never hardcoded in source — see .env / .env.example. When it is absent we
// simply fall back to the browser's built-in speech synthesis.
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY as string | undefined

let currentAudio: HTMLAudioElement | null = null

/**
 * Speak text using Deepgram's Text-to-Speech API.
 * Falls back to browser speechSynthesis when no key is configured or the
 * request fails.
 */
export async function speakWithDeepgram(
  text: string,
  options?: { model?: string; onStart?: () => void; onEnd?: () => void },
): Promise<void> {
  const { model = 'aura-asteria-en', onStart, onEnd } = options ?? {}

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }

  // No Deepgram key → go straight to the browser voice.
  if (!DEEPGRAM_API_KEY) {
    speakWithBrowser(text, onStart, onEnd)
    return
  }

  try {
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      },
    )

    if (!response.ok) {
      throw new Error(`Deepgram TTS failed: ${response.status}`)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio

    audio.addEventListener('play', () => onStart?.())
    audio.addEventListener('ended', () => {
      onEnd?.()
      URL.revokeObjectURL(url)
      currentAudio = null
    })
    audio.addEventListener('error', () => {
      onEnd?.()
      URL.revokeObjectURL(url)
      currentAudio = null
    })

    await audio.play()
  } catch {
    // Fallback to browser speech synthesis
    speakWithBrowser(text, onStart, onEnd)
  }
}

/** Speak with the browser's built-in voice (offline fallback). */
function speakWithBrowser(text: string, onStart?: () => void, onEnd?: () => void): void {
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.05
    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  } catch {
    onEnd?.()
  }
}

/** Stop any playing Deepgram audio */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  try {
    window.speechSynthesis.cancel()
  } catch {
    // ignore
  }
}
