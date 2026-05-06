import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { THEMES } from '@/lib/themes'

const VALID_IDS = new Set(THEMES.map(t => t.id))

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, district, votes } = body as {
      name: string
      district: string
      votes: string[]
    }

    // --- Validation ---
    if (!name || !district || !Array.isArray(votes)) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }
    if (votes.length !== 2) {
      return NextResponse.json({ error: 'You must vote for exactly 2 themes.' }, { status: 400 })
    }
    if (votes[0] === votes[1]) {
      return NextResponse.json({ error: 'You cannot vote for the same theme twice.' }, { status: 400 })
    }
    if (!votes.every(id => VALID_IDS.has(id))) {
      return NextResponse.json({ error: 'Invalid theme ID.' }, { status: 400 })
    }

    // --- Duplicate vote prevention ---
    const voterKey = `voter:${name.toLowerCase().trim()}:${district.toLowerCase().trim()}`
    const alreadyVoted = await kv.get(voterKey)
    if (alreadyVoted) {
      return NextResponse.json({ error: 'You have already submitted your votes.' }, { status: 409 })
    }

    // --- Persist votes atomically ---
    const pipeline = kv.pipeline()

    // Mark voter as done (expire in 7 days so stale data auto-clears)
    pipeline.set(voterKey, '1', { ex: 60 * 60 * 24 * 7 })

    // Increment vote counters for each chosen theme
    for (const id of votes) {
      pipeline.hincrby('theme_votes', id, 1)
    }

    await pipeline.exec()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/vote] error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Returns { [themeId]: voteCount } for the results page
    const raw = await kv.hgetall('theme_votes')
    // Ensure all themes are present even with 0 votes
    const totals: Record<string, number> = {}
    for (const t of THEMES) {
      totals[t.id] = raw ? Number(raw[t.id] ?? 0) : 0
    }
    return NextResponse.json(totals)
  } catch (err) {
    console.error('[/api/vote GET] error:', err)
    return NextResponse.json({ error: 'Failed to fetch results.' }, { status: 500 })
  }
}
