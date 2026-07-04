import { Sparkles } from 'lucide-react'
import { DailyQuiz } from '../features/quiz/DailyQuiz'

export function QuizPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      <header className="mt-6 mb-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400/80">
          <Sparkles size={13} /> Daily challenge
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold gradient-text sm:text-4xl">Daily Quiz</h1>
        <p className="mt-2 text-sm text-white/60">
          Five questions on the world's heritage. A fresh set every day.
        </p>
      </header>
      <DailyQuiz />
    </div>
  )
}
