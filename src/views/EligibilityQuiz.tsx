import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Heart,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Weight,
  Activity,
  UserCheck,
} from 'lucide-react'
import type { View } from '../types'

interface Props {
  setView: (v: View) => void
}

interface Question {
  id: string
  title: string
  description: string
  icon: any
  correctAnswer: boolean // true = YES is eligible, false = NO is eligible
  explanation: string
}

export default function EligibilityQuiz({ setView }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [quizFinished, setQuizFinished] = useState(false)

  const questions: Question[] = [
    {
      id: 'age',
      title: 'Are you between 18 and 65 years old?',
      description: 'Standard medical eligibility criteria for blood donor safety.',
      icon: UserCheck,
      correctAnswer: true,
      explanation: 'Donors must be at least 18 years old and under 65 for routine voluntary donations.',
    },
    {
      id: 'weight',
      title: 'Do you weigh at least 50 kg (110 lbs)?',
      description: 'Ensures your total blood volume is safe for donating one standard unit (350–450 ml).',
      icon: Weight,
      correctAnswer: true,
      explanation: 'Minimum 50 kg body weight guarantees the body easily recovers after donating one standard unit.',
    },
    {
      id: 'interval',
      title: 'Has it been at least 90 days (3 months) since your last donation?',
      description: 'Allows your red blood cells and iron stores to fully replenish.',
      icon: Calendar,
      correctAnswer: true,
      explanation: 'Whole blood donation requires a 90-day cooldown interval for donor wellness.',
    },
    {
      id: 'health',
      title: 'Are you currently free from acute cold, fever, infection, or major active antibiotics?',
      description: 'Protects both donor stamina and recipient patient safety.',
      icon: Activity,
      correctAnswer: true,
      explanation: 'You should be in good general health on the day of donation without acute active infections.',
    },
    {
      id: 'tattoos',
      title: 'Have you had any tattoos, major piercings, or dental surgeries in the past 6 months?',
      description: 'Standard window period to prevent potential bloodborne transmission risk.',
      icon: AlertTriangle,
      correctAnswer: false, // If YES, you have to wait
      explanation: 'A 6-month deferral period is standard after tattoo or piercing procedures.',
    },
  ]

  function handleAnswer(choice: boolean) {
    const question = questions[currentStep]
    const updated = { ...answers, [question.id]: choice }
    setAnswers(updated)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setQuizFinished(true)
    }
  }

  function handleRestart() {
    setAnswers({})
    setCurrentStep(0)
    setQuizFinished(false)
  }

  // Calculate eligibility result
  const failedQuestions = questions.filter((q) => answers[q.id] !== q.correctAnswer)
  const isFullyEligible = failedQuestions.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <CheckCircle2 className="w-5 h-5 text-red-200" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-200">
            Medical Self-Check
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Donor Health & Eligibility Screener
        </h1>
        <p className="text-red-100 text-xs sm:text-sm max-w-xl">
          Complete this quick 1-minute confidential screening to check if you are ready to donate blood today.
        </p>
      </div>

      {!quizFinished ? (
        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-10">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          {(() => {
            const q = questions[currentStep]
            const Icon = q.icon
            return (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                      {q.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {q.description}
                    </p>
                  </div>
                </div>

                {/* Yes / No Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => handleAnswer(true)}
                    className="p-5 rounded-2xl border-2 border-gray-200 hover:border-red-600 hover:bg-red-50/50 text-left transition group active:scale-[0.98] shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="text-lg font-bold text-gray-900 group-hover:text-red-800 block">
                        YES
                      </span>
                      <span className="text-xs text-gray-500">I meet this condition</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-700 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswer(false)}
                    className="p-5 rounded-2xl border-2 border-gray-200 hover:border-gray-600 hover:bg-gray-50 text-left transition group active:scale-[0.98] shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="text-lg font-bold text-gray-900 group-hover:text-gray-800 block">
                        NO
                      </span>
                      <span className="text-xs text-gray-500">I do not meet this</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      ) : (
        /* Quiz Results Card */
        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-md mx-auto">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 ${
              isFullyEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isFullyEligible ? <ShieldCheck className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {isFullyEligible ? 'You Are Eligible to Donate!' : 'Temporary Cooldown or Deferral'}
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              {isFullyEligible
                ? 'Based on your answers, you fulfill all standard health requirements. Join our district network to help save lives.'
                : 'You have one or more temporary deferrals. Check details below for guidance on when you can safely donate.'}
            </p>
          </div>

          {/* Breakdown List */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Question Summary & Medical Guidance:
            </h3>

            {questions.map((q) => {
              const userAnswer = answers[q.id]
              const passed = userAnswer === q.correctAnswer

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    passed
                      ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{q.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{q.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            {isFullyEligible ? (
              <button
                onClick={() => setView('register-donor')}
                className="flex-1 py-4 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-white" /> Register as a Donor Now
              </button>
            ) : (
              <button
                onClick={() => setView('blood-banks')}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
              >
                Find Local Blood Banks & Helplines
              </button>
            )}

            <button
              onClick={handleRestart}
              className="py-4 px-6 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
