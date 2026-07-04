import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, X, Sparkles, ArrowRight, Trophy, MapPin } from 'lucide-react'
import { cn } from '../../lib/cn'
import { getDailyQuiz, todayKey, type QuizQuestion } from '../../lib/gamification'
import { SITES_BY_ID } from '../../data/sites'

const TOTAL = 5

interface StoredResult {
  score: number
  answers: number[]
}

function storageKey(): string {
  return `heritagequest.quiz.${todayKey()}`
}

function loadStored(): StoredResult | null {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredResult>
    if (typeof parsed.score !== 'number' || !Array.isArray(parsed.answers)) return null
    return { score: parsed.score, answers: parsed.answers as number[] }
  } catch {
    return null
  }
}

/** Persist today's result, keeping the best score already recorded. */
function saveStored(result: StoredResult): void {
  try {
    const prev = loadStored()
    if (prev && prev.score >= result.score) return
    localStorage.setItem(storageKey(), JSON.stringify(result))
  } catch {
    /* storage unavailable — no-op */
  }
}

interface Tier {
  title: string
  blurb: string
  emoji: string
}

function tierFor(score: number): Tier {
  if (score >= TOTAL) return { title: 'Heritage Master!', blurb: 'A flawless run across the world.', emoji: '🏆' }
  if (score >= 3) return { title: 'Well travelled!', blurb: 'You know your landmarks.', emoji: '🌍' }
  return { title: 'Keep exploring!', blurb: 'Every journey starts somewhere.', emoji: '🧭' }
}

/* ─────────────────────────── quiz reducer ─────────────────────────── */

interface QuizState {
  index: number
  selected: number | null
  answers: number[]
  score: number
  done: boolean
}

type QuizAction =
  | { type: 'select'; choice: number; correct: number }
  | { type: 'next' }
  | { type: 'reset' }

function initialState(): QuizState {
  return { index: 0, selected: null, answers: [], score: 0, done: false }
}

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'select': {
      if (state.selected !== null) return state
      return {
        ...state,
        selected: action.choice,
        answers: [...state.answers, action.choice],
        score: action.choice === action.correct ? state.score + 1 : state.score,
      }
    }
    case 'next': {
      if (state.selected === null) return state
      const nextIndex = state.index + 1
      const done = nextIndex >= TOTAL
      return { ...state, index: nextIndex, selected: null, done }
    }
    case 'reset':
      return initialState()
    default:
      return state
  }
}

/* ─────────────────────────── component ─────────────────────────── */

export function DailyQuiz() {
  const questions = useMemo<QuizQuestion[]>(() => getDailyQuiz(todayKey(), TOTAL), [])
  const reduceMotion = useReducedMotion()

  const [stored, setStored] = useState<StoredResult | null>(() => loadStored())
  const [practice, setPractice] = useState(false)
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // Persist a completed run (keeps best score), and surface it on the result screen.
  useEffect(() => {
    if (!state.done) return
    const result: StoredResult = { score: state.score, answers: state.answers }
    saveStored(result)
    setStored(loadStored())
  }, [state.done, state.score, state.answers])

  const startPractice = useCallback(() => {
    setPractice(true)
    dispatch({ type: 'reset' })
  }, [])

  // Show the stored result unless the user is actively practising and hasn't finished.
  const showStoredResult = stored !== null && !practice
  const showRunResult = state.done

  if (showStoredResult || showRunResult) {
    const score = showRunResult ? state.score : (stored?.score ?? 0)
    const answers = showRunResult ? state.answers : (stored?.answers ?? [])
    return (
      <ResultScreen
        score={score}
        answers={answers}
        questions={questions}
        reduceMotion={!!reduceMotion}
        onPlayAgain={startPractice}
      />
    )
  }

  return (
    <ActiveQuiz
      questions={questions}
      state={state}
      dispatch={dispatch}
      reduceMotion={!!reduceMotion}
    />
  )
}

/* ─────────────────────────── active quiz ─────────────────────────── */

interface ActiveQuizProps {
  questions: QuizQuestion[]
  state: QuizState
  dispatch: React.Dispatch<QuizAction>
  reduceMotion: boolean
}

function ActiveQuiz({ questions, state, dispatch, reduceMotion }: ActiveQuizProps) {
  const q = questions[state.index]
  const locked = state.selected !== null
  const nextRef = useRef<HTMLButtonElement>(null)
  const promptId = `quiz-prompt-${q.id}`

  // Move focus to the Next button once a choice is locked, for keyboard flow.
  useEffect(() => {
    if (locked && nextRef.current) nextRef.current.focus()
  }, [locked])

  const progressPct = Math.round((state.index / questions.length) * 100)

  return (
    <div>
      {/* Progress + live score */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-400/80">
          Question {state.index + 1}
          <span className="text-white/40"> / {questions.length}</span>
        </p>
        <p className="flex items-center gap-1.5 text-sm text-white/70" aria-live="polite">
          <Trophy size={14} className="text-gold-400" />
          <span className="font-display font-bold tabular-nums text-white">{state.score}</span>
          <span className="text-white/40">pts</span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={state.index + 1}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-500"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 28 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
          transition={reduceMotion ? { duration: 0.12 } : { duration: 0.28, ease: 'easeOut' }}
          className="mt-6 rounded-3xl glass p-5 backdrop-blur sm:p-6"
        >
          <h2 id={promptId} className="font-display text-xl font-extrabold leading-snug sm:text-2xl">
            {q.prompt}
          </h2>

          <div className="mt-5 grid gap-3" role="group" aria-labelledby={promptId}>
            {q.options.map((option, i) => {
              const isCorrect = i === q.answer
              const isPicked = i === state.selected
              const showCorrect = locked && isCorrect
              const showWrong = locked && isPicked && !isCorrect
              return (
                <button
                  key={option}
                  type="button"
                  disabled={locked}
                  onClick={() => dispatch({ type: 'select', choice: i, correct: q.answer })}
                  aria-pressed={isPicked}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70',
                    !locked && 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10',
                    locked && !showCorrect && !showWrong && 'border-white/10 bg-white/5 opacity-50',
                    showCorrect && 'border-jade-400/60 bg-jade-400/15 text-white',
                    showWrong && 'border-clay-400/60 bg-clay-400/15 text-white',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                      !locked && 'border-white/20 text-white/60',
                      showCorrect && 'border-jade-400 bg-jade-400 text-abyss',
                      showWrong && 'border-clay-400 bg-clay-400 text-abyss',
                      locked && !showCorrect && !showWrong && 'border-white/15 text-white/40',
                    )}
                  >
                    {showCorrect ? <Check size={14} strokeWidth={3} /> : showWrong ? <X size={14} strokeWidth={3} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              )
            })}
          </div>

          {/* Feedback + Next */}
          <AnimatePresence>
            {locked && (
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={reduceMotion ? { duration: 0.12 } : { duration: 0.24 }}
                className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className={cn('flex items-center gap-1.5 text-sm font-semibold', state.selected === q.answer ? 'text-jade-400' : 'text-clay-400')} aria-live="polite">
                  {state.selected === q.answer ? (
                    <>
                      <Sparkles size={15} /> Correct!
                    </>
                  ) : (
                    <>
                      <span>Answer:</span>
                      <span className="text-white">{q.options[q.answer]}</span>
                    </>
                  )}
                </p>
                <button
                  ref={nextRef}
                  type="button"
                  onClick={() => dispatch({ type: 'next' })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-2.5 text-sm font-bold text-abyss transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                >
                  {state.index + 1 >= questions.length ? 'See results' : 'Next'}
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────── result screen ─────────────────────────── */

interface ResultScreenProps {
  score: number
  answers: number[]
  questions: QuizQuestion[]
  reduceMotion: boolean
  onPlayAgain: () => void
}

function ResultScreen({ score, answers, questions, reduceMotion, onPlayAgain }: ResultScreenProps) {
  const tier = tierFor(score)
  const pct = Math.round((score / questions.length) * 100)

  // Pick a site to invite the user to review — prefer one they missed, else the first.
  const reviewQuestion = useMemo(() => {
    const missed = questions.find((qq, i) => answers[i] !== undefined && answers[i] !== qq.answer)
    return missed ?? questions[0]
  }, [questions, answers])
  const reviewSite = reviewQuestion ? SITES_BY_ID[reviewQuestion.siteId] : undefined

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0.15 } : { duration: 0.4, ease: 'easeOut' }}
    >
      <div className="rounded-3xl glass p-6 text-center backdrop-blur sm:p-8">
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400/15 text-3xl"
          initial={reduceMotion ? false : { rotate: -12, scale: 0.7 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          aria-hidden
        >
          {tier.emoji}
        </motion.div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-400/80">Daily Quiz complete</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold gradient-text sm:text-3xl">{tier.title}</h2>
        <p className="mt-1 text-sm text-white/60">{tier.blurb}</p>

        <div className="mt-5 flex items-baseline justify-center gap-1.5" aria-live="polite">
          <span className="font-display text-5xl font-extrabold tabular-nums text-white">{score}</span>
          <span className="font-display text-2xl font-bold text-white/40">/ {questions.length}</span>
        </div>
        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-clay-500"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <h3 className="mb-3 mt-8 font-display text-sm font-bold uppercase tracking-wider text-white/50">Breakdown</h3>
      <ul className="grid gap-2.5">
        {questions.map((qq, i) => {
          const picked = answers[i]
          const correct = picked === qq.answer
          const answered = picked !== undefined
          return (
            <li key={qq.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  correct ? 'bg-jade-400 text-abyss' : 'bg-clay-400 text-abyss',
                )}
                aria-hidden
              >
                {correct ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/90">{qq.prompt}</p>
                {!correct && (
                  <p className="mt-0.5 text-xs text-white/50">
                    {answered && <span className="text-clay-400">Your answer: {qq.options[picked]} · </span>}
                    <span className="text-jade-400">Correct: {qq.options[qq.answer]}</span>
                  </p>
                )}
                <span className="sr-only">{correct ? 'Correct' : 'Incorrect'}</span>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Review a site */}
      {reviewSite && (
        <Link
          to={`/site/${reviewSite.id}`}
          className="mt-6 flex items-center gap-3 rounded-2xl glass p-4 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/20 text-violet-400">
            <MapPin size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-violet-400/90">Review a place</p>
            <p className="truncate font-display text-sm font-bold text-white">{reviewSite.name}</p>
          </div>
          <ArrowRight size={16} className="shrink-0 text-white/40" />
        </Link>
      )}

      {/* Come back / practice */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-1.5 text-sm text-white/50">
          <Sparkles size={14} className="text-gold-400" />
          Come back tomorrow for a new set.
        </p>
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70"
        >
          Play again (for practice)
        </button>
      </div>
    </motion.div>
  )
}
