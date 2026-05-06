'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Send, BookOpen, X } from 'lucide-react'
import { THEMES } from '@/lib/themes'

interface Voter {
  name: string
  district: string
}

const MAX_VOTES = 2

export default function DashboardPage() {
  const router = useRouter()
  const [voter, setVoter] = useState<Voter | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('voter')
    if (!raw) { router.replace('/'); return }

    const v = JSON.parse(raw) as Voter
    setVoter(v)

    // If already voted, go to results
    if (localStorage.getItem('voted') === 'true') {
      router.replace('/results')
    }
  }, [router])

  const toggle = (id: string) => {
    setError('')
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_VOTES) return prev // silently block 3rd selection
      return [...prev, id]
    })
  }

  const handleSubmit = async () => {
    if (selected.length !== MAX_VOTES) {
      setError(`Please select exactly ${MAX_VOTES} themes before submitting.`)
      return
    }
    if (!voter) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: voter.name, district: voter.district, votes: selected }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      localStorage.setItem('voted', 'true')
      router.push('/results')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  if (!voter) return null

  const votesFull = selected.length === MAX_VOTES

  return (
    <div className="min-h-dvh bg-amber-50 pb-36">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-amber-50/90 backdrop-blur-sm border-b border-stone-200/80 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-bold text-stone-900 leading-none">Camp Vote</p>
            <p className="text-xs text-stone-500 mt-0.5">{voter.name} · {voter.district}</p>
          </div>

          {/* Vote counter pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-300 ${
            votesFull
              ? 'bg-amber-800 text-amber-50 border-amber-800 shadow-md shadow-amber-900/20'
              : 'bg-white text-stone-700 border-stone-200'
          }`}>
            {[0, 1].map(i => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < selected.length ? 'bg-amber-300' : 'bg-stone-300'
                }`}
              />
            ))}
            <span>{selected.length}/{MAX_VOTES} Votes</span>
          </div>
        </div>
      </header>

      {/* Page title */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-5">
        <h1 className="font-display text-3xl font-bold text-stone-900 leading-tight">
          Choose your<br /><span className="text-amber-700">2 camp themes</span>
        </h1>
        <p className="text-stone-500 text-sm mt-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Read each description carefully before selecting.
        </p>
      </div>

      {/* Cards grid */}
      <div className="max-w-2xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((theme, i) => {
          const isSelected = selected.includes(theme.id)
          const isDisabled = votesFull && !isSelected

          return (
            <button
              key={theme.id}
              onClick={() => !isDisabled && toggle(theme.id)}
              disabled={isDisabled}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`
                animate-fade-up opacity-0-initial
                relative text-left rounded-2xl border-2 p-4 transition-all duration-200
                ${isSelected
                  ? 'bg-amber-800 border-amber-800 text-amber-50 shadow-lg shadow-amber-900/25 scale-[1.02]'
                  : isDisabled
                    ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                    : 'bg-white border-stone-200 text-stone-900 hover:border-amber-400 hover:shadow-md hover:shadow-amber-900/10 active:scale-[0.98]'
                }
              `}
            >
              {/* Check badge */}
              {isSelected && (
                <span className="absolute top-3 right-3 w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-amber-900" strokeWidth={3} />
                </span>
              )}

              <span className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
                #{theme.id}
              </span>
              <h2 className={`font-display text-lg font-bold leading-snug mb-2 pr-6 ${isSelected ? 'text-amber-50' : 'text-stone-900'}`}>
                {theme.title}
              </h2>
              <p className={`text-sm leading-relaxed ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                {theme.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Sticky bottom submit bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 bg-gradient-to-t from-amber-50 via-amber-50/95 to-transparent">
        <div className="max-w-2xl mx-auto space-y-2">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={selected.length !== MAX_VOTES || submitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-200 disabled:text-stone-400 text-amber-50 font-semibold text-base px-6 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-900/25 hover:shadow-xl active:scale-[0.98] disabled:shadow-none"
          >
            {submitting ? (
              <span className="animate-pulse">Submitting your votes…</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Votes {selected.length === MAX_VOTES ? '✓' : `(${selected.length}/${MAX_VOTES} selected)`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
