# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
npm start          # React dev server at localhost:3000
npm run server     # Express backend at localhost:3001
npm run build      # production build
npm test           # run tests
```

## Project Overview

SATScout is a free AI-powered SAT prep platform. Students enter their score, target, and exam date → AI builds a personalized week-by-week study plan from curated free resources → they follow the plan, track progress, and use the AI buddy 24/7.

**Slogan**: "Less guessing. More scoring."
**Domain**: satscout.org (live on Vercel)
**GitHub**: https://github.com/Dinay777/satscout
**Target audience**: High school students, especially Russian-speaking (CIS/Europe/USA)

## Current Deployment State

- **Frontend**: Deployed on Vercel (auto-deploys from main branch), live at satscout.org
- **Backend**: Node.js/Express (`server.js`) on **Railway**, auto-deploys from GitHub main. Live at `https://satscout-production.up.railway.app`. Frontend reaches it via the `REACT_APP_API_URL` Vercel env var. (`api.satscout.org` is unused.)
- **Database/Auth**: Supabase (connected and working)
- **satscout.org**: live and served by Vercel

## What Is Already Built and Working

- Landing page: Hero, Features, HowItWorks, SocialProof, PhotoGallery, CTA, Footer
- Resource Library: search + filters, curated resources from `src/data/resources.js`
- AI Study Buddy: Gemini (active provider), SSE streaming, chat history saved to Supabase `chat_messages`, photo uploads (attach an image of a question → Gemini vision reads it)
- Supabase Auth: email registration/login
- Onboarding quiz: collects score, target, exam date, weak sections, study hours
- Dashboard: personalized task list + week strip navigation, tasks stored in Supabase `user_tasks`
- Progress page
- About page (with real founder story)
- EN/RU language toggle throughout
- Auto-profile updates via `[[PLAN_UPDATE]]` blocks parsed from AI responses
- Plan generation: `src/lib/planGenerator.js` creates tasks in Supabase

## What Is Hidden / Not Done

- `SummerPrograms.js` — component exists, intentionally hidden from nav (for later)
- PostHog analytics — wired in code, dormant until `REACT_APP_POSTHOG_KEY` is set in Vercel env

## Architecture

### Frontend
- **Framework**: Create React App, React 19, no TypeScript, no React Router
- **Navigation**: `App.js` manages `currentPage` state string; all routing is conditional rendering
- **State**: `currentPage`, `language`, `user`, `profile` all live in `App.js`
- **i18n**: Each component has its own `text = { en: {...}, ru: {...} }`, receives `language` prop
- **Styling**: All CSS in `src/App.css` + `src/index.css`. BEM-style classes. No Tailwind, no CSS modules.
- **Colors**: navy `#0F1729`, blue `#3B82F6`, teal `#06B6D4`, green `#10B981`
- **Fonts**: Space Grotesk (headings) + Outfit (body)
- **Auth**: Supabase Auth (email). `user` and `profile` in App state. `ai-buddy` and `dashboard` are protected pages.
- **Onboarding**: `Onboarding.js` runs if `user && !profile`

### Backend (`server.js`)
- Express on port 3001
- SSE streaming for AI chat responses
- **Provider switching** via `PROVIDER` env var: `claude-cli` (code default) | `gemini` | `openrouter`. **Production runs `gemini`** (set via Railway env).
- `MAX_CONCURRENT=5` — max parallel in-flight AI requests
- `ALLOWED_ORIGINS` env var controls CORS (comma-separated)
- Rate limiting: `middleware/rateLimiter.js`
- Concurrency guard: `middleware/concurrency.js`
- Queue: `queue/index.js` (RequestQueue)
- PM2 config: `ecosystem.config.js`

### AI Provider Abstraction
All providers implement `stream(messages, systemPrompt, { image, onChunk, onDone, onError, signal })` (`image` is an optional `{ data, mimeType }` photo attachment):
- `providers/claude-cli.js` — spawns `claude` binary via `child_process.spawn`. Uses `CLAUDE_BINARY` env var (default: `claude`). NOT active.
- `providers/gemini.js` — Gemini streaming via `@google/genai` (`GoogleGenAI`). Attaches `image` as `inlineData` to the latest user turn for vision. **Active provider.**
- `providers/openrouter.js` — OpenRouter streaming via fetch. Ready, not active.

To switch provider: change `PROVIDER` env var and restart server. No frontend changes needed.

### Key Frontend Files
```
src/
  App.js                  — root: state, routing, auth listener
  App.css                 — all styles
  components/
    Navbar.js             — nav + language toggle
    Hero.js               — hero section (slogan: "Less guessing. More scoring.")
    Features.js           — 4 feature cards (Study Planner + Dashboard tagged "New")
    HowItWorks.js         — 3-step explainer + sat-book.jpg photo
    SocialProof.js        — social proof section
    PhotoGallery.js       — auto-scrolling photo strip (local + Unsplash)
    CTA.js                — call to action
    Footer.js             — footer
    Auth.js               — login/signup
    Onboarding.js         — post-signup quiz
    AIChatBuddy.js        — chat UI, SSE streaming, profile updates
    Dashboard.js          — task list + week strip navigation
    Progress.js           — score progress view
    ResourceLibrary.js    — filterable resource list
    ResourcePreview.js    — 6 sample cards on landing
    About.js              — founder story + mission
    SummerPrograms.js     — HIDDEN, do not add to nav
  data/
    resources.js          — curated SAT resource database
  lib/
    planGenerator.js      — creates tasks in Supabase user_tasks
    studyPlan.js          — study plan logic + week calculations
    supabase.js           — Supabase client
public/
  images/
    sat-book.jpg          — local photo used in HowItWorks + PhotoGallery
    about-photo.jpg       — founder photo shown on the About page
```

### Key Backend Files
```
server.js               — Express app, routes, SSE, PLAN_UPDATE parsing
ecosystem.config.js     — PM2 config (1 instance, fork mode)
providers/
  base.js               — BaseProvider class
  claude-cli.js         — inactive (spawns claude binary)
  gemini.js             — active AI provider (vision-capable)
  openrouter.js         — ready, not active
middleware/
  rateLimiter.js
  concurrency.js
queue/
  index.js              — RequestQueue
```

## Environment Variables

```env
# Backend (Railway env vars — not in git)
NODE_ENV=production
PORT=3001
PROVIDER=gemini                 # production value | options: claude-cli | gemini | openrouter
GEMINI_API_KEY=...              # required for the active (gemini) provider
GEMINI_MODEL=gemini-2.5-flash   # optional, this is the default
MAX_CONCURRENT=5
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ALLOWED_ORIGINS=https://satscout.org,https://satscout.vercel.app

# Only if switching to the (inactive) Claude/OpenRouter providers:
# ANTHROPIC_API_KEY=... / CLAUDE_BINARY=... / CLAUDE_MODEL=haiku / CLAUDE_TIMEOUT_MS=90000
# OPENROUTER_API_KEY=...

# Frontend (Vercel env vars)
REACT_APP_API_URL=https://satscout-production.up.railway.app   # backend URL
REACT_APP_POSTHOG_KEY=...       # analytics; dormant until set
```

## Design Principles

- Bilingual EN/RU — always update both language objects in every component
- No TypeScript, no React Router — keep it simple
- Responses short: one idea per paragraph, no long intros
- "Today's Tasks" only on dashboard — don't overwhelm with the full plan
- Onboarding feels like a conversation, not a form
