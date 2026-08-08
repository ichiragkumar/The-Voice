# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build (uses Turbopack)
npx vitest run        # Run 28 entity normalization tests
npx prisma db push    # Push schema to Neon PostgreSQL
npx prisma db seed    # Seed 6 audits, 35+ calls
npx prisma generate   # Regenerate Prisma client after schema changes
```

Prisma requires `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes"` for destructive operations like `--force-reset`.

Seed config is in `prisma.config.ts` (not package.json) — Prisma 7 moved it there.

## Environment Variables

```
DATABASE_URL          — Neon PostgreSQL connection string
ANTHROPIC_API_KEY     — Claude API (Vercel AI SDK)
WORDAI_API_KEY        — API key for /api/ingest and /api/sdk/verify
MAYA_API_KEY          — Maya TTS (11 Indian languages)
```

## Architecture

### Database
- **Prisma 7 with PostgreSQL** via `@prisma/adapter-pg` (PrismaPg). Not the default Prisma driver.
- Client singleton at `src/lib/db.ts` — import as `import { prisma } from '@/lib/db'`
- Generated types at `src/generated/prisma/client` — import as `import type { Audit } from '@/generated/prisma/client'`
- 7 models: Audit, Call, Entity, ToolCall, Comparison, TestRun, PolicyCheck, ApiKey

### Auth
- Cookie-based (`wordai_session`). Middleware at `src/middleware.ts` protects all routes except `/`, `/login`, `/api/*`.
- Default credentials: user1234 / password (hardcoded in `src/lib/auth.ts`)

### Route Groups
- `src/app/page.tsx` + `src/app/login/` — Public (no sidebar)
- `src/app/(app)/` — Protected route group with sidebar layout

### AI Integration
- `src/lib/ai.ts` — Shared model config. `getModel()` returns `anthropic("claude-sonnet-4-20250514")`. `isAIConfigured()` checks for API key.
- Engine pipeline at `src/lib/engine/pipeline.ts` — Uses Claude for extraction/normalization/classification when key exists, falls back to deterministic normalizers when not.
- Deterministic entity normalizer at `src/lib/engine/entity-truth.ts` — Hindi numbers, times, dates, spoken digits. Has 28 golden tests.

### SDK
- Published as `@imchiragkumar22/wordai-sdk` on npm
- Source at `packages/sdk/` with its own `tsconfig.json`
- Build: `cd packages/sdk && npm run build` (uses tsup)
- Publish: `cd packages/sdk && npm publish --access public`

### shadcn/ui (Next.js 16 + base-ui)
- No `asChild` prop — use `render` prop on triggers, or wrap Button with Link
- Button uses `@base-ui/react/button`
- Select `onValueChange` receives `string | null` — guard with `(v: string | null) => v && ...`

### Maya TTS
- `src/lib/maya-tts.ts` — HTTP POST to `tts.mayaresearch.ai/v1/tts`, returns raw PCM converted to WAV
- Response is 16-bit LE, mono, 24kHz — the `pcmToWav()` function adds the WAV header
- Voices: "Ananya" (F) or "Arjun" (M). Language codes: hi, te, bn, gu, kn, ml, mr, or, pa, ta, en

### Live Demo (Landing Page)
- `src/components/landing/live-demo.tsx` — Guided step-by-step demo on the landing page
- Uses browser SpeechRecognition (Chrome only, blocked in Brave)
- Calls `/api/claude` which uses mock tools from `src/lib/demo-scenarios.ts`
- `inject_failure: true` makes the agent say "cancelled" while backend stays "active"

### Key API Routes
| Route | Purpose |
|-------|---------|
| `/api/claude` | Claude proxy + mock tool execution + failure injection |
| `/api/tts` | Maya TTS proxy (keeps API key server-side) |
| `/api/keys` | API key CRUD (GET/POST/DELETE/PATCH) |
| `/api/ingest` | Production call ingestion (requires x-api-key header) |
| `/api/sdk/verify` | SDK verification results endpoint |
| `/api/run` | Execute benchmark test scenarios |

### Brand
- Product name: **Word AI** (display) / **WordAI** (code identifiers)
- No references to "BhashaQA" should exist in the codebase
