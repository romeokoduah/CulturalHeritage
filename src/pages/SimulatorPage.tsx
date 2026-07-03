import { LostArchitectureSimulator } from '../features/architecture/LostArchitectureSimulator'

export function SimulatorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="mt-6 mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400/80">Interactive Experience</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
          Lost Architecture <span className="gradient-text">Simulator</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
          Travel through time and witness how heritage sites were built, transformed, and sometimes lost over centuries.
        </p>
      </div>
      <LostArchitectureSimulator />
    </div>
  )
}
