'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, RefreshCw, Flame } from 'lucide-react'
import { THEMES } from '@/lib/themes'

interface Results {
  [themeId: string]: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/vote', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Results = await res.json()
      setResults(data)
      setLastUpdated(new Date())
      setError('')
    } catch {
      setError('Could not load results. Retrying…')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 10_000) // auto-refresh every 10s
    return () => clearInterval(interval)
  }, [fetchResults])

  const totalVotes = results
    ? Object.values(results).reduce((a, b) => a + b, 0)
    : 0

  // Sort themes by vote count descending
  const sorted = results
    ? THEMES
        .map(t => ({ ...t, votes: results[t.id] ?? 0 }))
        .sort((a, b) => b.votes - a.votes)
    : []

  const maxVotes = sorted[0]?.votes ?? 1

  return (
    <div className="min-h-dvh bg-amber-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-amber-50/90 backdrop-blur-sm border-b border-stone-200/80 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-200" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none text-stone-900">Live Results</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                  : 'Loading…'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchResults}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-800 border border-stone-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-colors bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </header>

      {/* Stats strip */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        <h1 className="font-display text-3xl font-bold text-stone-900 leading-tight">
          Camp Theme
          <br />
          <span className="text-amber-700">Leaderboard</span>
        </h1>
        <p className="text-stone-500 text-sm mt-2">
          {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} cast · auto-refreshes every 10s
        </p>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-2.5">
            {sorted.map((theme, idx) => {
              const pct = maxVotes > 0 ? (theme.votes / maxVotes) * 100 : 0
              const isTop = idx === 0 && theme.votes > 0

              return (
                <div
                  key={theme.id}
                  className={`relative overflow-hidden rounded-2xl border-2 p-4 transition-all ${
                    isTop
                      ? 'border-amber-800 bg-amber-800 text-amber-50 shadow-lg shadow-amber-900/20'
                      : 'border-stone-200 bg-white text-stone-900'
                  }`}
                >
                  {/* Bar fill */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 ease-out rounded-2xl ${
                      isTop ? 'bg-white/10' : 'bg-amber-100'
                    }`}
                    style={{ width: `${pct}%` }}
                  />

                  <div className="relative flex items-center gap-3">
                    {/* Rank badge */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isTop
                        ? 'bg-amber-300 text-amber-900'
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      {isTop ? <Trophy className="w-4 h-4" /> : idx + 1}
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-bold text-base leading-snug truncate ${isTop ? 'text-amber-50' : 'text-stone-900'}`}>
                        {theme.title}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${isTop ? 'text-amber-300' : 'text-stone-400'}`}>
                        {theme.description}
                      </p>
                    </div>

                    {/* Vote count */}
                    <div className="shrink-0 text-right">
                      <p className={`text-xl font-bold font-display ${isTop ? 'text-amber-100' : 'text-stone-700'}`}>
                        {theme.votes}
                      </p>
                      <p className={`text-xs ${isTop ? 'text-amber-400' : 'text-stone-400'}`}>
                        {totalVotes > 0 ? Math.round((theme.votes / totalVotes) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Back to vote if not voted */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <button
          onClick={() => router.push('/')}
          className="w-full text-center text-sm text-stone-400 hover:text-amber-800 transition-colors py-2"
        >
          ← Back to login
        </button>
      </div>
    </div>
  )
}
