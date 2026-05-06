# 🏕️ Camp Theme Voting Dashboard

A mobile-first, frictionless voting app built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Vercel KV** (Redis).

---

## ⚡ Quickstart (from zero to deployed)

### 1. Init & Install

```bash
npx create-next-app@latest camp-vote --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd camp-vote
```

Then **replace all files** in this repo with the ones provided, or scaffold manually.

Install extra dependencies:

```bash
npm install @vercel/kv lucide-react
npm install -D @types/node
```

### 2. Run locally (without KV)

For local dev without KV set up yet, the API route will error on submission but the UI works fine.

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Vercel KV Setup (Required for voting to persist)

> **Do this once, takes ~3 minutes.**

### Step 1 — Deploy to Vercel first

```bash
npm i -g vercel
vercel          # follow prompts, deploy to production
```

### Step 2 — Create a KV Store

1. Go to your **Vercel Dashboard** → your project
2. Click the **Storage** tab
3. Click **Connect Store** → **Create New** → **KV (Redis)**
4. Name it anything (e.g. `camp-votes-kv`)
5. Choose the region closest to your attendees
6. Click **Create & Connect**

### Step 3 — Pull the env vars

Vercel auto-injects these into your deployment. For local dev:

```bash
vercel env pull .env.local
```

This creates a `.env.local` file with:

```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### Step 4 — Redeploy

```bash
vercel --prod
```

✅ Voting now persists across sessions!

---

## 📁 Project Structure

```
app/
  page.tsx              # Login page (name + district)
  layout.tsx            # Root layout with fonts
  globals.css           # Tailwind + grain overlay
  dashboard/
    page.tsx            # Voting cards grid (client component)
  results/
    page.tsx            # Live leaderboard with bar chart
  api/
    vote/
      route.ts          # POST (submit votes) + GET (fetch results)
lib/
  themes.ts             # All 15 theme cards data
```

---

## 🗳️ How It Works

| Feature | Implementation |
|---|---|
| Login | Name + District saved to `localStorage` |
| Vote storage | Vercel KV Redis hash `theme_votes` |
| Double-vote prevention | KV key `voter:{name}:{district}` checked before write |
| Vote limit | Exactly 2; enforced client + server |
| Results | GET `/api/vote` returns all vote counts; auto-refreshes every 10s |
| Redirect after vote | Client sets `localStorage.voted = true`, redirects to `/results` |

---

## 🛡️ Anti-Abuse

- Server checks for duplicate voter key in KV before writing
- Validates exactly 2 votes, no duplicates, valid IDs
- Voter key expires after 7 days (configurable in `route.ts`)

---

## 🎨 Design

- **Fonts**: Playfair Display (display) + DM Sans (body)  
- **Palette**: Warm amber/stone — evokes community and faith  
- **Mobile-first**: Single-column on phone, 2-col grid on tablet+  
- **Sticky header** with live vote counter pill  
- **Sticky footer** with submit button (disabled until 2 selected)  
- Cards visually dim when 2 are already selected  
- Results page auto-refreshes every 10s; animated bar fills

---

## 📝 Customizing Themes

Edit `lib/themes.ts` — all pages read from that single source of truth.

---

## 🚀 One-Command Deploy

```bash
vercel --prod
```
