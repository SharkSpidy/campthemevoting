'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Flame } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [district, setDistrict] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !district.trim()) return
    setLoading(true)
    localStorage.setItem('voter', JSON.stringify({ name: name.trim(), district: district.trim() }))
    router.push('/dashboard')
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 bg-amber-50 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-120px] right-[-80px] w-80 h-80 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-60px] w-64 h-64 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-[-100px] w-48 h-48 rounded-full bg-orange-200/20 blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-8 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <Flame className="w-8 h-8 text-amber-200" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10 animate-fade-up animation-delay-100">
          <h1 className="font-display text-4xl font-bold text-stone-900 leading-tight tracking-tight">
            Camp Theme
            <br />
            <span className="text-amber-700">Vote 2026</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed">
            Tell us who you are to cast your votes.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up animation-delay-200 space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Samuel Mathew"
              required
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 bg-white text-stone-900 placeholder-stone-300 font-body text-base focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="district" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              District
            </label>
            <input
              id="district"
              type="text"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              placeholder="e.g. Kozhikode"
              required
              className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 bg-white text-stone-900 placeholder-stone-300 font-body text-base focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !district.trim() || loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-200 disabled:text-stone-400 text-amber-50 font-semibold text-base px-6 py-4 rounded-xl transition-all duration-200 shadow-md shadow-amber-900/20 hover:shadow-lg hover:shadow-amber-900/30 active:scale-[0.98]"
          >
            {loading ? (
              <span className="animate-pulse">Entering…</span>
            ) : (
              <>
                Enter & Vote
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-8 animate-fade-up animation-delay-300">
          No account needed · Your vote is anonymous
        </p>
      </div>
    </main>
  )
}
