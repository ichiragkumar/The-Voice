# BhashaQA — TODO Tracker

## Phase 1: Foundation [DONE]
- [x] Scaffold Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [x] Prisma schema (Audit, Call, Entity, ToolCall, Comparison + reviewStatus)
- [x] Seed data (6 audits, 35 calls, Hindi/Hinglish transcripts)
- [x] Prisma client singleton with libsql adapter

## Phase 2: Core Engine [DONE]
- [x] Entity extraction prompts + Claude integration
- [x] Hindi/Hinglish normalization prompts
- [x] Root cause classification prompts
- [x] Comparison engine (expected vs actual)
- [x] Pipeline orchestrator (extract → normalize → compare → classify)

## Phase 3: API Layer [DONE]
- [x] Server actions (audit CRUD, upload, process, dashboard stats)
- [x] API routes (/api/audits, /api/process, /api/ingest)
- [x] File upload handling
- [x] Production ingestion endpoint with API key auth

## Phase 4: UI — All Pages [DONE]
- [x] Sidebar navigation (7 items + theme toggle + logout)
- [x] Landing page — animated sections (hero, stats, steps, features, CTA)
- [x] Login page with motion animations
- [x] Dashboard with staggered fade-in animations
- [x] Audit list page
- [x] New audit page (multi-step upload form)
- [x] Audit detail page (summary, call list, analysis tabs, process button)
- [x] Call detail page (5-layer comparison, failure cards, entity table)
- [x] Regression comparison page (version A vs B, root cause shift)
- [x] Human review queue page (confirm/dismiss/override with notes)
- [x] Industry packs page (7 packs with verification details)

## Phase 5: Polish & Differentiation [DONE]
- [x] Authentication (cookie-based, middleware redirect)
- [x] Dark/Light theme toggle (next-themes)
- [x] Route groups: (app) for protected, public for landing/login
- [x] Animated layer comparison (staggered reveal + break indicator)
- [x] Motion library (motion/framer-motion) for page transitions
- [x] FadeIn/Stagger wrapper components for reuse
- [x] Landing page nav bar with backdrop blur

## Phase 6: Multi-vendor & CI/CD [DONE]
- [x] Vendor configs (Bolna, Vapi, Retell, LiveKit, Pipecat, Sarvam, Custom)
- [x] Tool call normalizer per vendor format
- [x] Transcript normalizer per vendor format
- [x] GitHub Actions workflow (bhashaqa-gate.yml)
- [x] CLI test runner script (scripts/bhashaqa-test.sh)

## Phase 7: Industry Packs [DONE]
- [x] E-commerce cancellation & refund (seed data + pack)
- [x] Appointment booking & rescheduling (seed data + pack)
- [x] Collections promise-to-pay (seed data + pack)
- [x] Address change (pack definition)
- [x] Insurance policy servicing (seed data + pack)
- [x] Banking & loan servicing (coming soon)
- [x] Telecom plan & recharge (coming soon)

## Phase 8: Skills [DONE]
- [x] frontend-design skill (anthropics/skills)
- [x] shadcn skill (shadcn/ui)
- [x] prisma skills (prisma/skills)

## Phase 9: Maya TTS Integration [DONE]
- [x] Maya API key configured in .env
- [x] Maya TTS library (src/lib/maya-tts.ts) — HTTP synthesis + PCM→WAV conversion
- [x] Language auto-detection (Hindi, Telugu, Bengali, etc.)
- [x] TTS API route (POST /api/tts) — proxy to Maya with WAV response
- [x] SpeakButton component — listen/stop with loading state
- [x] Call detail page — "Listen to call" button on transcript
- [x] Entity table — speak button on each raw Hindi/Hinglish value
- [x] Live Demo page (/demo) — type custom text, select voice, hear sample phrases
- [x] beui MCP server configured in .claude/settings.json
- [x] Font upgraded to Inter + JetBrains Mono
- [x] Login auto-fills credentials (user1234/password)

## NOTHING PENDING — ALL PHASES COMPLETE
