# BhashaQA — TODO Tracker

## Phase 1: Foundation [DONE]
- [x] Scaffold Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [x] Prisma schema (Audit, Call, Entity, ToolCall, Comparison)
- [x] Seed data (3 audits, 18 calls, Hindi/Hinglish transcripts)
- [x] Prisma client singleton with libsql adapter

## Phase 2: Core Engine [DONE]
- [x] Entity extraction prompts + Claude integration
- [x] Hindi/Hinglish normalization prompts
- [x] Root cause classification prompts
- [x] Comparison engine (expected vs actual)
- [x] Pipeline orchestrator (extract → normalize → compare → classify)

## Phase 3: API Layer [DONE]
- [x] Server actions (audit CRUD, upload, process, dashboard stats)
- [x] API routes (/api/audits, /api/process)
- [x] File upload handling

## Phase 4: UI — Pages [DONE]
- [x] Sidebar navigation
- [x] Landing page (hero + 5-layer visual)
- [x] Dashboard (stats cards, root cause chart, recent audits)
- [x] Audit list page
- [x] New audit page (multi-step upload form)
- [x] Audit detail page (summary, call list, analysis tabs)
- [x] Call detail page (5-layer comparison, failure cards, entity table)

## Phase 5: Polish & Differentiation [IN PROGRESS]
- [ ] Authentication (login page, user1234/password)
- [ ] Dark/Light theme toggle
- [ ] Cinematic landing page redesign (KIMI GAME style)
- [ ] Post-login home page (dashboard)
- [ ] Update positioning: "verifies business transactions" not "tests conversations"
- [ ] E-commerce cancellation/refund pack seed data
- [ ] Update CLAUDE.md with project context

## Phase 6: Skills & Tooling
- [ ] Install audio expert skill (willsigmon/sigstack)
- [ ] Add skills.sh integrations
- [ ] Update AGENTS.md

## Phase 7: Future (Post-Hackathon)
- [ ] Industry packs (e-commerce, appointment, collections)
- [ ] CI/CD integration (GitHub Actions)
- [ ] Production call ingestion
- [ ] Human review workflow
- [ ] Multi-vendor support (Bolna, Vapi, Retell, LiveKit)
