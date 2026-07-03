import { Link } from 'react-router-dom'
import { MascotGlobe } from '../components/PixelArt'

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <MascotGlobe size={110} />
        <h1 className="mt-4 font-display text-2xl font-bold">Lost in the world</h1>
        <p className="mt-2 text-white/50">We couldn't find that place on the map.</p>
        <Link to="/" className="mt-5 inline-block rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950">
          Back to the globe
        </Link>
      </div>
    </div>
  )
}
