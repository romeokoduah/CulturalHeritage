import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass, MapPin, Sparkles, ArrowRight, BadgeCheck, Check } from 'lucide-react'
import { MascotGlobe } from '../../components/PixelArt'
import { cn } from '../../lib/cn'
import { useAuth } from '../../lib/auth'

type Mode = 'signin' | 'signup'

/* ------------------------------------------------------------------ *
 * Inline icons — lucide v1.23 doesn't ship mail/lock/user/eye here,
 * so we hand-roll tiny stroke SVGs that inherit `currentColor`.
 * ------------------------------------------------------------------ */

interface IconProps {
  className?: string
}

function MailIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function UserIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function EyeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  )
}

function EyeOffIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 5.7A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.4M6.2 7.4A17 17 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3.5-.66" />
      <path d="M10 10a2.8 2.8 0 0 0 4 4" />
      <path d="m3 3 18 18" />
    </svg>
  )
}

/* ------------------------------------------------------------------ *
 * Value props for the hero side.
 * ------------------------------------------------------------------ */

const VALUE_PROPS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Explore 158 heritage sites',
    body: 'Journey across a living world map of UNESCO wonders.',
  },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: 'Collect country badges & climb the ranks',
    body: 'Earn pixel-art badges and rise through explorer tiers.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Hear greetings spoken aloud',
    body: 'Discover cultures with authentic voices and stories.',
  },
]

/* ------------------------------------------------------------------ *
 * Reusable labelled field with a leading icon.
 * ------------------------------------------------------------------ */

interface FieldProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
  icon: ReactNode
  trailing?: ReactNode
  required?: boolean
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  trailing,
  required,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-white/70">
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
          aria-hidden="true"
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 text-[15px] text-white',
            'placeholder:text-white/30 outline-none transition',
            'focus:border-gold-400/60 focus:bg-white/10 focus:ring-2 focus:ring-gold-400/30',
            trailing ? 'pr-12' : 'pr-4',
          )}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Icon + leading glyph sizing helper for inline SVGs.
 * ------------------------------------------------------------------ */

const GLYPH = 'h-[18px] w-[18px]'

/* ------------------------------------------------------------------ *
 * Main export.
 * ------------------------------------------------------------------ */

export function AuthScreens({ onDone }: { onDone?: () => void }) {
  const { signUp, signIn, guest } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  const switchMode = (next: Mode) => {
    if (next === mode) return
    setMode(next)
    setError(null)
  }

  const submitLabel = useMemo(
    () => (isSignup ? 'Create account' : 'Sign in'),
    [isSignup],
  )

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    const result = isSignup
      ? signUp({ name, email, password })
      : signIn({ email, password })

    if (result.ok) {
      onDone?.()
    } else {
      setError(result.error ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const handleGuest = () => {
    guest()
    onDone?.()
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-ink-950 text-white">
      {/* Background: subtle grid + radial glows */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(60rem 40rem at 15% -10%, rgba(255,209,102,0.14), transparent 60%),' +
            'radial-gradient(50rem 40rem at 100% 110%, rgba(167,139,250,0.16), transparent 55%),' +
            'radial-gradient(40rem 30rem at 90% 0%, rgba(249,115,98,0.10), transparent 60%)',
        }}
      />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        {/* ---------------------------------------------------------- *
         * Hero / brand side
         * ---------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur">
            <Compass className="h-3.5 w-3.5 text-gold-400" />
            HeritageQuest
          </div>

          <div className="mt-6 flex items-center gap-4 lg:mt-8">
            <MascotGlobe size={84} />
            <div className="hidden h-14 w-px bg-white/10 sm:block lg:hidden" />
          </div>

          <h1 className="mt-6 max-w-xl text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            <span className="gradient-text">Your passport to the world&apos;s living heritage</span>
          </h1>

          <p className="mt-4 max-w-md text-balance text-base text-white/60 sm:text-lg">
            Wander the globe with Kofi, uncover UNESCO wonders, and carry the
            stories of every culture in your pocket.
          </p>

          <ul className="mt-8 w-full max-w-md space-y-3">
            {VALUE_PROPS.map((prop, i) => (
              <motion.li
                key={prop.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 + i * 0.1 }}
                className="glass flex items-start gap-3.5 rounded-2xl p-3.5 text-left"
              >
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-400/15 text-gold-400">
                  {prop.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{prop.title}</p>
                  <p className="text-[13px] leading-snug text-white/55">{prop.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* ---------------------------------------------------------- *
         * Auth card side
         * ---------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-full"
        >
          <div className="glass mx-auto w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/30 sm:p-8">
            {/* Segmented toggle */}
            <div
              role="tablist"
              aria-label="Choose sign in or create account"
              className="relative grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-ink-950/40 p-1"
            >
              {(['signin', 'signup'] as const).map((m) => {
                const active = mode === m
                return (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchMode(m)}
                    className={cn(
                      'relative z-10 rounded-xl py-2.5 text-sm font-semibold transition-colors',
                      active ? 'text-abyss' : 'text-white/60 hover:text-white/90',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="auth-toggle-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-gold-300 to-gold-400 shadow-lg shadow-gold-400/20"
                      />
                    )}
                    {m === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                )
              })}
            </div>

            <div className="mt-6">
              <h2 className="font-display text-xl font-bold text-white">
                {isSignup ? 'Start your quest' : 'Welcome back, explorer'}
              </h2>
              <p className="mt-1 text-sm text-white/55">
                {isSignup
                  ? 'Create an account to sync your progress everywhere.'
                  : 'Sign in to pick up where you left off.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <AnimatePresence initial={false}>
                {isSignup && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <Field
                      id="auth-name"
                      label="Name"
                      type="text"
                      value={name}
                      onChange={setName}
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      icon={<UserIcon className={GLYPH} />}
                      required={isSignup}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                id="auth-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                icon={<MailIcon className={GLYPH} />}
                required
              />

              <Field
                id="auth-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                icon={<LockIcon className={GLYPH} />}
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="grid h-9 w-9 place-items-center rounded-xl text-white/45 transition hover:bg-white/10 hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40"
                  >
                    {showPassword ? (
                      <EyeOffIcon className={GLYPH} />
                    ) : (
                      <EyeIcon className={GLYPH} />
                    )}
                  </button>
                }
              />

              {/* Inline error */}
              <AnimatePresence initial={false}>
                {error && (
                  <motion.p
                    key="auth-error"
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 rounded-xl border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-400"
                  >
                    <span className="mt-px shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5M12 16h.01" />
                      </svg>
                    </span>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'group relative flex w-full items-center justify-center gap-2 rounded-2xl',
                  'bg-gradient-to-r from-gold-300 to-gold-400 px-5 py-3.5 text-[15px] font-bold text-abyss',
                  'shadow-lg shadow-gold-400/25 transition',
                  'hover:shadow-xl hover:shadow-gold-400/35 hover:brightness-105',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
                  'disabled:cursor-not-allowed disabled:opacity-70',
                )}
              >
                {submitLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/35">
                or
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* Guest */}
            <button
              type="button"
              onClick={handleGuest}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5',
                'text-[15px] font-semibold text-white transition',
                'hover:border-jade-400/40 hover:bg-white/10',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/40',
              )}
            >
              <Compass className="h-4 w-4 text-jade-400" />
              Continue as guest
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/45">
              <Check className="h-3.5 w-3.5 shrink-0 text-jade-400" />
              Your progress saves on this device; create an account later to sync.
            </p>
          </div>
        </motion.section>
      </div>

      <div className="safe-bottom" />
    </div>
  )
}
