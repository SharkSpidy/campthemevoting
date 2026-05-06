import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { THEMES } from '@/lib/themes'

const VALID_IDS = new Set(THEMES.map(t => t.id))

// ─── POST /api/vote — submit 2 votes ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, district, votes } = body as {
      name: string
      district: string
      votes: string[]
    }

    // --- Validation ---
    if (!name?.trim() || !district?.trim() || !Array.isArray(votes)) {
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

    const normalName = name.trim().toLowerCase()
    const normalDistrict = district.trim().toLowerCase()

    // --- Duplicate vote prevention ---
    const { data: existing, error: checkError } = await supabase
      .from('voters')
      .select('id')
      .eq('name', normalName)
      .eq('district', normalDistrict)
      .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted your votes.' },
        { status: 409 }
      )
    }

    // --- Record voter (prevents double voting) ---
    const { error: voterError } = await supabase
      .from('voters')
      .insert({ name: normalName, district: normalDistrict })

    if (voterError) throw voterError

    // --- Record individual votes ---
    const voteRows = votes.map(themeId => ({
      theme_id: themeId,
      voter_name: normalName,
      voter_district: normalDistrict,
    }))

    const { error: votesError } = await supabase
      .from('votes')
      .insert(voteRows)

    if (votesError) throw votesError

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/vote]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

// ─── GET /api/vote — fetch vote tallies ─────────────────────────────────────
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('theme_id')

    if (error) throw error

    // Count votes per theme, default every theme to 0
    const totals: Record<string, number> = {}
    for (const t of THEMES) totals[t.id] = 0
    for (const row of data ?? []) {
      if (totals[row.theme_id] !== undefined) totals[row.theme_id]++
    }

    return NextResponse.json(totals)
  } catch (err) {
    console.error('[GET /api/vote]', err)
    return NextResponse.json({ error: 'Failed to fetch results.' }, { status: 500 })
  }
}
