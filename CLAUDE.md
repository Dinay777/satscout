# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at localhost:3000
npm test         # run tests (interactive watch mode)
npm run build    # production build
```

## Project Overview

SATScout is a free AI-powered SAT prep platform that gives students personalized study plans built from the best free resources across the internet. Think "Spotify for SAT prep" — we don't create content, we curate and personalize it.

**Target audience**: High school students preparing for SAT (English-speaking international + Russian-speaking from CIS/Europe/USA).

**Core value proposition**: Student enters their current score, target score, and exam date → AI builds a personalized week-by-week study plan from curated resources → student follows the plan and tracks progress → AI buddy available 24/7 to explain problems and adjust the plan.

**Domain**: satscout.org (not connected yet)
**GitHub**: https://github.com/Dinay777/satscout
**Slogan**: "Your SAT score, planned."

## Architecture

Create React App (React 19, no TypeScript, no router).

**Navigation model**: `App.js` manages a `currentPage` state string (`'home'`, `'resources'`, `'ai-buddy'`). Navigation is purely conditional rendering — no React Router. The `Navbar` component calls `setCurrentPage` to switch views.

**Internationalization**: Bilingual EN/RU. Each component holds its own `text = { en: {...}, ru: {...} }` object and receives a `language` prop. The `language` state lives in `App.js` and is toggled via a button in `Navbar`.

**Resource data**: Static array in `src/data/resources.js`. Each resource has: `id`, `title`, `type`, `section` (array), `difficulty`, `price`, `priceAmount`, `rating`, `description`, `descriptionRu`, `url`, optional `worldcat`, `tags[]`, `recommended`.

**AI Chat (AIChatBuddy)**: Chat UI is fully built but AI backend is a placeholder (setTimeout mock). Ready to replace with actual Claude API call.

**Styling**: All CSS in `src/App.css` and `src/index.css`. BEM-style class names. No CSS modules, no Tailwind. Design: minimalist with color accents — navy (#0F1729), blue (#3B82F6), teal (#06B6D4), green (#10B981). Fonts: Space Grotesk (headings) + Outfit (body).

## Current State (what exists)

- Landing page: hero, features (4 color cards), how it works (3 steps), resource preview (6 sample cards), CTA section, footer
- Resource Library page: search bar, filters (section/type/price), 24 curated resources with color-coded cards
- AI Study Buddy page: full chat UI with sidebar, message bubbles, typing animation, suggestion buttons (placeholder AI)
- Bilingual EN/RU toggle in navbar
- All navigation buttons work (navbar, CTA, footer)
- Footer hidden on AI chat page
- Scroll-to-top on page change

## Pages not yet implemented

- `programs` (Summer Programs) — INTENTIONALLY HIDDEN for now, will return later for application season
- `about` — listed in Navbar but no component

## Phase 1 TODO (current priority)

1. **Supabase Auth** — registration/login via email. Free plan.
2. **Onboarding quiz** — 5 interactive screens after registration: target score, exam date, practice test score, weak sections, study hours/week. Beautiful button-based UI, not boring forms.
3. **Dashboard** — personalized study plan view after login. Includes:
   - Today's Tasks (3 specific tasks for today)
   - Weekly Plan (current week's plan)
   - Progress visual (progress bar or chart)
   - Estimated score tracker
4. **Access control** — Before login: landing page, resource library, about. After login: dashboard, AI buddy, resource library, about.
5. **Hide Summer Programs tab** from nav (keep code for later).
6. **Visual polish** — replace emoji with proper icons (lucide-react), add subtle hover animations, consider adding stock photos to hero.
7. **Connect Claude API** for AI Study Buddy (via Vercel serverless function).
8. **Deploy to Vercel** and connect satscout.org domain.

## File Structure

```
src/
  App.js              — main app with routing logic
  App.css             — all styles (single file)
  index.js            — entry point
  index.css           — base styles
  components/
    Navbar.js          — navigation with language toggle
    Hero.js            — landing page hero section
    Features.js        — 4 feature cards
    HowItWorks.js      — 3-step explainer
    ResourcePreview.js — 6 sample resource cards
    CTA.js             — call-to-action before footer
    ResourceLibrary.js — full resource page with filters
    AIChatBuddy.js     — AI chat interface (placeholder)
    Footer.js          — footer with nav links
  data/
    resources.js       — 24 SAT resources database
```

## Design Principles

- Minimalist but not boring — use color gradients on cards, subtle animations
- Mobile-first responsive design
- Gen Z friendly — clean, fast, no clutter
- Show only "Today's Tasks" on dashboard, not the full overwhelming plan
- Onboarding must feel like a conversation, not a form
- The "aha moment" = seeing your personalized plan within 5 minutes of signing up
