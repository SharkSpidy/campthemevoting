-- ============================================================
-- Camp Theme Voting — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Table 1: voters (prevents double voting)
create table if not exists public.voters (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  district    text not null,
  created_at  timestamptz not null default now(),

  -- One submission per name+district combo
  unique (name, district)
);

-- Table 2: votes (one row per vote, 2 rows per submission)
create table if not exists public.votes (
  id             uuid primary key default gen_random_uuid(),
  theme_id       text not null,
  voter_name     text not null,
  voter_district text not null,
  created_at     timestamptz not null default now()
);

-- Index for fast tallying
create index if not exists votes_theme_id_idx on public.votes (theme_id);

-- ── Row Level Security ──────────────────────────────────────
-- We use the service-role key server-side, so RLS can be
-- enabled for safety without blocking our API routes.

alter table public.voters enable row level security;
alter table public.votes   enable row level security;

-- No public read/write — only the service role (used in API) bypasses RLS
-- (service role always bypasses RLS by default in Supabase)
