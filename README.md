# HeritageQuest 🌍

**AI for Cultural Heritage & Storytelling** — an interactive globe that lets you explore, preserve and reimagine the world's living cultural heritage.

Spin a 3D Earth, tap any of **158 heritage sites across 45 countries**, hear a local greeting spoken aloud, read its story, walk its timeline, watch lost architecture rebuilt century by century, and chat with an AI heritage guide. Built as an installable Progressive Web App. Aligned with **UN SDGs 4, 8 & 11**.

## Features

- **Interactive globe** — `react-globe.gl` / three.js Earth with clickable country pins and site dots.
- **Site pages** — story, "did you know?" facts, image galleries, a 3D/interactive heritage view, and a spoken local greeting.
- **AI Storyteller** — a warm, offline heritage guide (zero-cost, works with no API key) that can optionally upgrade to live **Claude** streaming when you add a key in Settings.
- **Voice** — Deepgram text-to-speech, gracefully falling back to the browser voice.
- **Heritage Timeline** — an animated journey through centuries of cultural evolution.
- **Lost Architecture Simulator** — scrub an era slider to see how sites changed over time.
- **Passport** — mark sites visited, collect country badges, track your exploration.
- **Shareable** — send any site, country or your passport to friends with a designed share card.
- **PWA** — installable, offline-capable, dark/light theme.

## Tech stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 3 · Framer Motion · react-globe.gl · vite-plugin-pwa · oxlint

## Getting started

```bash
npm install
cp .env.example .env   # optional — add keys for live voice/AI
npm run dev            # http://localhost:5173
```

The app runs fully without any keys — voice falls back to the built-in browser
voice and the AI uses the offline storyteller.

### Environment

| Variable | Purpose | Required |
|---|---|---|
| `VITE_DEEPGRAM_API_KEY` | Deepgram TTS voice | No (falls back to browser voice) |

The Claude AI key is entered in the in-app **Settings** screen and stored in your
browser — it is never committed.

> ⚠️ A Deepgram key was previously hardcoded in source and pushed publicly.
> If that was your key, rotate it at <https://console.deepgram.com/> and put the
> new value in your local (git-ignored) `.env`. For production, proxy Deepgram
> and Claude through a small backend instead of calling them from the browser.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |

## Project structure

```
src/
  pages/       Route screens (Landing, Country, Site, Timeline, Simulator, Passport, Settings)
  features/    Self-contained features (globe, timeline, architecture simulator, site 3D, AI)
  components/  Shared UI (AppShell, HeritageVisual, PixelArt, magicui effects)
  data/        Static heritage dataset (sites, countries, timeline, delegates, featured)
  lib/         Theme, passport state, TTS, AI providers, helpers
```
