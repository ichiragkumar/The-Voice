@AGENTS.md

# Word AI — Voice Agent Truth Layer

## What this is
Word AI verifies business transactions performed by Indian-language voice agents.
Not "tests conversations" — certifies that the customer's exact Hindi/Hinglish request became the correct transaction in the backend.

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Prisma 7 + SQLite (libsql adapter)
- Claude API via Vercel AI SDK (@ai-sdk/anthropic)
- Recharts for charts

## Key Architecture
- `src/lib/engine/` — AI pipeline (extract → normalize → compare → classify)
- `src/actions/` — Server actions (audit CRUD, upload, process)
- `src/components/` — UI components (layer-comparison is the signature piece)
- `prisma/seed.ts` — Demo data (3 audits, 18 calls with Hindi/Hinglish)

## Database
- Prisma 7 requires driver adapter (PrismaLibSql)
- DB file at project root: `dev.db` (not prisma/dev.db)
- Import prisma: `import { prisma } from '@/lib/db'`
- Import types: `import type { Audit } from '@/generated/prisma/client'`

## shadcn/ui Notes (Next.js 16 + base-ui)
- NO `asChild` prop — use `render` prop or wrap with Link
- Button from `@base-ui/react/button`
- Select `onValueChange` receives `string | null`

## Progress Tracking
- See `todos.md` for current status
