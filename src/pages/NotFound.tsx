import { Link } from 'react-router-dom'
import { Compass, MapPin } from 'lucide-react'
import { MascotGlobe } from '../components/PixelArt'

export function NotFound() {
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,209,102,0.08),transparent_60%)]" />
      <div className="relative">
        <div className="mx-auto w-fit animate-float">
          <MascotGlobe size={120} />
        </div>
        <p className="mt-6 font-display text-6xl font-black text-white/10">404</p>
        <h1 className="-mt-6 font-display text-2xl font-extrabold sm:text-3xl">Lost in the world</h1>
        <p className="mx-auto mt-2 max-w-sm text-white/50">
          We couldn't find that place on the map. Every corner of the globe holds a story though — let's find one.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-clay-500 px-5 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110"
          >
            <Compass size={16} /> Back to the globe
          </Link>
          <Link
            to="/timeline"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <MapPin size={16} /> Explore the timeline
          </Link>
        </div>
      </div>
    </div>
  )
}
