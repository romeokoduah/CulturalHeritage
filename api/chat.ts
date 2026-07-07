import type { VercelRequest, VercelResponse } from '@vercel/node'

const OLLAMA_KEY = process.env.OLLAMA_API_KEY
const BASE_URL = 'https://ollama.com/api/chat'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!OLLAMA_KEY) {
    return res.status(500).json({ error: 'OLLAMA_API_KEY not configured' })
  }

  const upstream = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OLLAMA_KEY}`,
    },
    body: JSON.stringify(req.body),
  })

  if (!upstream.ok) {
    const text = await upstream.text()
    return res.status(upstream.status).send(text)
  }

  // Stream the response back
  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Transfer-Encoding', 'chunked')

  const reader = upstream.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    res.write(decoder.decode(value, { stream: true }))
  }
  res.end()
}
