import { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, Check, ArrowRight, ArrowLeft, Globe2 } from 'lucide-react'
import { ARCHETYPES, ARCHETYPES_BY_ID, type Archetype } from '../../data/archetypes'
import { setArchetype } from '../../lib/auth'
import { cn } from '../../lib/cn'

type Category = Archetype['category']

/** Category tally, seeded to 0. Ties break by the archetype that reaches the
 * winning score first, which is why the order here mirrors ARCHETYPES. */
const CATEGORIES: Category[] = ['Sacred', 'Monument', 'Landscape', 'Museum', 'Intangible', 'Urban']

interface Choice {
  label: string
  /** The category this answer nudges you toward. */
  toward: Category
}
interface Question {
  prompt: string
  hint: string
  choices: Choice[]
}

const QUESTIONS: Question[] = [
  {
    prompt: 'A free afternoon in a new city — where do you drift?',
    hint: 'No plan, no map. Just follow your feet.',
    choices: [
      { label: 'Toward the sound of bells or a call to prayer', toward: 'Sacred' },
      { label: 'Up to the oldest stones on the highest hill', toward: 'Monument' },
      { label: 'Out past the edge, where the land opens up', toward: 'Landscape' },
      { label: 'Into a hushed hall of glass cases and labels', toward: 'Museum' },
      { label: 'Wherever a drum, a market, a wedding is happening', toward: 'Intangible' },
      { label: 'Deep into the tangled lanes of the old quarter', toward: 'Urban' },
    ],
  },
  {
    prompt: 'What makes you stop and stare?',
    hint: 'The thing that pulls the phone out of your pocket.',
    choices: [
      { label: 'Light falling through a shrine at exactly the right hour', toward: 'Sacred' },
      { label: 'A carving that has watched a thousand years pass', toward: 'Monument' },
      { label: 'A ridge, a lagoon, a horizon that goes forever', toward: 'Landscape' },
      { label: 'One perfect object, lit just so behind glass', toward: 'Museum' },
      { label: 'Hands that still know an old, unwritten craft', toward: 'Intangible' },
      { label: 'A street where five centuries lean against each other', toward: 'Urban' },
    ],
  },
  {
    prompt: 'Pick a souvenir to carry home.',
    hint: 'The one small thing that says "I was there."',
    choices: [
      { label: 'A blessing string tied on at a holy place', toward: 'Sacred' },
      { label: 'A rubbing taken from an ancient inscription', toward: 'Monument' },
      { label: 'A pressed flower from a mountain trail', toward: 'Landscape' },
      { label: 'A postcard of the one painting you can’t forget', toward: 'Museum' },
      { label: 'A recording of a song sung just for you', toward: 'Intangible' },
      { label: 'A hand-drawn map of a neighbourhood’s secrets', toward: 'Urban' },
    ],
  },
  {
    prompt: 'Your ideal soundtrack for the road.',
    hint: 'Close your eyes. What do you want to be hearing?',
    choices: [
      { label: 'Chant and silence, layered under an old dome', toward: 'Sacred' },
      { label: 'Wind moving through empty ruins', toward: 'Monument' },
      { label: 'Birdsong, water, the crunch of a long trail', toward: 'Landscape' },
      { label: 'The soft murmur of a gallery at opening time', toward: 'Museum' },
      { label: 'Drums, voices, a whole square dancing', toward: 'Intangible' },
      { label: 'Trams, café chatter and church bells at once', toward: 'Urban' },
    ],
  },
  {
    prompt: 'Finish the thought: a trip is really for…',
    hint: 'The reason underneath all the reasons.',
    choices: [
      { label: 'Feeling small before something sacred', toward: 'Sacred' },
      { label: 'Touching the deep, unhurried past', toward: 'Monument' },
      { label: 'Breathing wide open under a bigger sky', toward: 'Landscape' },
      { label: 'Understanding the story behind the object', toward: 'Museum' },
      { label: 'Being welcomed into someone’s living culture', toward: 'Intangible' },
      { label: 'Getting happily lost in a city that remembers', toward: 'Urban' },
    ],
  },
]

/** Tally the picked categories and return the winning archetype. Ties resolve
 * to the earliest category in CATEGORIES (== earliest reached during scoring). */
function resolveArchetype(picks: Category[]): Archetype {
  const tally: Record<Category, number> = {
    Sacred: 0,
    Monument: 0,
    Landscape: 0,
    Museum: 0,
    Intangible: 0,
    Urban: 0,
  }
  for (const p of picks) tally[p] += 1

  let best: Category = CATEGORIES[0]
  let bestScore = -1
  for (const cat of CATEGORIES) {
    if (tally[cat] > bestScore) {
      bestScore = tally[cat]
      best = cat
    }
  }
  const winner = ARCHETYPES.find((a) => a.category === best)
  return winner ?? ARCHETYPES[0]
}

type Phase = 'intro' | 'quiz' | 'result'

export function Onboarding({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null))
  const [flashChoice, setFlashChoice] = useState<number | null>(null)
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const picks = useMemo<Category[]>(
    () =>
      answers
        .map((a, qi) => (a === null ? null : QUESTIONS[qi].choices[a].toward))
        .filter((c): c is Category => c !== null),
    [answers],
  )

  const computed = useMemo(() => resolveArchetype(picks), [picks])
  const chosen: Archetype = overrideId ? ARCHETYPES_BY_ID[overrideId] ?? computed : computed

  // Motion presets that collapse to instant when reduced motion is requested.
  const fade = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -24 },
      }
  const transition = reduce ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' as const }

  const goToResult = useCallback(() => {
    setOverrideId(null)
    setShowAll(false)
    setPhase('result')
  }, [])

  const pick = useCallback(
    (choiceIndex: number) => {
      setFlashChoice(choiceIndex)
      setAnswers((prev) => {
        const next = [...prev]
        next[step] = choiceIndex
        return next
      })
      const delay = reduce ? 120 : 340
      window.setTimeout(() => {
        setFlashChoice(null)
        if (step >= QUESTIONS.length - 1) goToResult()
        else setStep((s) => Math.min(s + 1, QUESTIONS.length - 1))
      }, delay)
    },
    [step, reduce, goToResult],
  )

  const back = useCallback(() => {
    setFlashChoice(null)
    if (phase === 'result') {
      setPhase('quiz')
      setStep(QUESTIONS.length - 1)
      return
    }
    if (step === 0) {
      setPhase('intro')
      return
    }
    setStep((s) => Math.max(0, s - 1))
  }, [phase, step])

  const begin = useCallback(() => {
    setArchetype(chosen.id)
    onDone?.()
  }, [chosen.id, onDone])

  const progress = ((step + (phase === 'result' ? 1 : 0)) / QUESTIONS.length) * 100

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-ink-950 text-white">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(255,209,102,0.14), transparent 70%), radial-gradient(50% 45% at 85% 90%, rgba(249,115,98,0.12), transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-10">
        {/* Header / progress */}
        <header className="mb-6 flex items-center gap-3 sm:mb-10">
          <div className="flex items-center gap-2 text-white/70">
            <Globe2 className="h-5 w-5 text-gold-400" aria-hidden />
            <span className="font-display text-sm font-semibold tracking-wide text-white">
              HeritageQuest
            </span>
          </div>
          {phase === 'quiz' && (
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs font-medium text-white/60" aria-live="polite">
                Question {step + 1} of {QUESTIONS.length}
              </span>
              <div
                className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10 sm:w-40"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={QUESTIONS.length}
                aria-valuenow={step + 1}
                aria-label="Quiz progress"
              >
                <motion.div
                  className="h-full rounded-full bg-gold-400"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {/* ---------------------------------------------------------- INTRO */}
            {phase === 'intro' && (
              <motion.section
                key="intro"
                {...fade}
                transition={transition}
                className="text-center"
              >
                <motion.div
                  className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass"
                  animate={reduce ? undefined : { y: [0, -8, 0] }}
                  transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="h-8 w-8 text-gold-400" aria-hidden />
                </motion.div>
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/50">
                  Before we begin
                </p>
                <h1 className="font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
                  Let’s find your <span className="gradient-text">kind of wonder</span>
                </h1>
                <p className="mx-auto mt-5 max-w-md text-base text-white/60 text-balance">
                  Five quick questions, no wrong answers. We’ll match you to the explorer whose
                  world you’d most love to get lost in.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(0)
                    setPhase('quiz')
                  }}
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-display text-base font-semibold text-abyss shadow-lg shadow-gold-400/20 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                >
                  Start the quiz
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </button>
              </motion.section>
            )}

            {/* ----------------------------------------------------------- QUIZ */}
            {phase === 'quiz' && (
              <motion.section
                key={`q-${step}`}
                {...fade}
                transition={transition}
                aria-labelledby="quiz-prompt"
              >
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-gold-400/90">
                  {QUESTIONS[step].hint}
                </p>
                <h2
                  id="quiz-prompt"
                  className="font-display text-2xl font-bold leading-snug text-balance sm:text-3xl"
                >
                  {QUESTIONS[step].prompt}
                </h2>

                <ul className="mt-7 grid gap-3 sm:grid-cols-2" role="list">
                  {QUESTIONS[step].choices.map((choice, ci) => {
                    const selected = answers[step] === ci
                    const flashing = flashChoice === ci
                    const active = selected || flashing
                    return (
                      <li key={ci}>
                        <button
                          type="button"
                          onClick={() => pick(ci)}
                          aria-pressed={selected}
                          className={cn(
                            'group flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
                            active
                              ? 'border-gold-400 bg-gold-400/10 text-white'
                              : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/[0.08]',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-6 w-6 flex-none items-center justify-center rounded-full border text-xs transition-colors',
                              active
                                ? 'border-gold-400 bg-gold-400 text-abyss'
                                : 'border-white/20 text-transparent group-hover:border-white/40',
                            )}
                            aria-hidden
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-sm leading-snug sm:text-[0.95rem]">
                            {choice.label}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-8 flex items-center">
                  <button
                    type="button"
                    onClick={back}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back
                  </button>
                  <span className="ml-auto text-xs text-white/40">Tap an answer to continue</span>
                </div>
              </motion.section>
            )}

            {/* --------------------------------------------------------- RESULT */}
            {phase === 'result' && (
              <motion.section key="result" {...fade} transition={transition}>
                <p className="mb-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-white/50">
                  This is you
                </p>

                <motion.div
                  initial={reduce ? false : { scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transition}
                  className="relative overflow-hidden rounded-3xl border p-7 sm:p-9"
                  style={{
                    borderColor: `${chosen.color}55`,
                    background: `radial-gradient(120% 120% at 50% 0%, ${chosen.color}22, rgba(7,10,20,0.4) 60%)`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                    aria-hidden
                    style={{ background: chosen.color, opacity: 0.25 }}
                  />
                  <div className="relative flex flex-col items-center text-center">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
                      style={{ background: `${chosen.color}22`, border: `1px solid ${chosen.color}66` }}
                      aria-hidden
                    >
                      {chosen.emoji}
                    </div>
                    <h2
                      className="mt-5 font-display text-3xl font-bold sm:text-4xl"
                      style={{ color: chosen.color }}
                    >
                      {chosen.name}
                    </h2>
                    <p className="mt-1 text-sm font-medium uppercase tracking-[0.15em] text-white/60">
                      {chosen.role}
                    </p>
                    <p className="mt-4 max-w-md text-base text-white/75 text-balance">
                      {chosen.blurb}
                    </p>
                    <div
                      className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                      style={{ background: `${chosen.color}1f`, color: chosen.color }}
                    >
                      <Sparkles className="h-4 w-4" aria-hidden />
                      {chosen.perk}
                    </div>
                  </div>
                </motion.div>

                {/* Not quite? Choose another */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    aria-expanded={showAll}
                    className="mx-auto block text-sm font-medium text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                  >
                    {showAll ? 'Hide the others' : 'Not quite? Choose another'}
                  </button>

                  <AnimatePresence initial={false}>
                    {showAll && (
                      <motion.ul
                        role="list"
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reduce ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                        transition={{ duration: reduce ? 0 : 0.3 }}
                        className="mt-4 grid gap-2.5 overflow-hidden sm:grid-cols-2"
                      >
                        {ARCHETYPES.map((a) => {
                          const isPick = a.id === chosen.id
                          return (
                            <li key={a.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOverrideId(a.id)
                                  setShowAll(false)
                                }}
                                aria-pressed={isPick}
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
                                  isPick
                                    ? 'bg-white/[0.06]'
                                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]',
                                )}
                                style={isPick ? { borderColor: `${a.color}88` } : undefined}
                              >
                                <span
                                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-xl"
                                  style={{ background: `${a.color}1f` }}
                                  aria-hidden
                                >
                                  {a.emoji}
                                </span>
                                <span className="min-w-0">
                                  <span
                                    className="block truncate font-display text-sm font-semibold"
                                    style={{ color: a.color }}
                                  >
                                    {a.name}
                                  </span>
                                  <span className="block truncate text-xs text-white/55">
                                    {a.role}
                                  </span>
                                </span>
                                {isPick && (
                                  <Check className="ml-auto h-4 w-4 flex-none" style={{ color: a.color }} aria-hidden />
                                )}
                              </button>
                            </li>
                          )
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={back}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Retake last question
                  </button>
                  <button
                    type="button"
                    onClick={begin}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 font-display text-base font-semibold text-abyss shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:w-auto"
                    style={{ background: chosen.color, boxShadow: `0 10px 30px -10px ${chosen.color}` }}
                  >
                    Begin the journey
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
