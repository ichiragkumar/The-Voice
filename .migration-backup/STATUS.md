# Word AI — Project Status Report

**Date:** 2026-08-08
**App URL:** http://localhost:3000
**Login:** user1234 / password (pre-filled)

---

## What Word AI Is

Word AI is a **transaction assurance layer** for Indian-language voice agents.

It does NOT just test conversations. It certifies that the Indian caller's exact amount, date, address or request became the **correct authoritative business transaction** in the backend.

**One-line positioning:**
> Generic platforms tell you whether the conversation looked correct. Word AI certifies that the Indian customer's exact request became the correct transaction in the backend.

---

## Why We Exist (The Gap)

Cekura, Hamming, Roark, and Coval already cover general voice-agent testing. Building another dashboard against them is not viable.

**Our 4 wedges that competitors don't cover:**

| # | Gap | What it means |
|---|-----|---------------|
| 1 | **Final-State Verification** | We query the customer's actual backend (Shopify, CRM, calendar) AFTER the tool call to verify the transaction happened correctly. Tool said "success" but order is still active? We catch it. |
| 2 | **India Entity Truth** | We normalize "dedh lakh" → 1,50,000, "saade chaar" → 4:30, "one four double nine" → 1499. Generic platforms treat Hindi as just another language. We treat it as a normalization problem. |
| 3 | **Indian Policy Packs** | RBI collection rules, e-commerce refund policies, IRDAI insurance rules — ready-to-use, not generic compliance. |
| 4 | **Native-Speaker Benchmarks** | Curated Hindi/Hinglish scenarios with expected entities, tool calls, and final states. Not synthetic — calibrated for real Indian caller patterns. |

---

## What's Built (Complete)

### Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Prisma 7 + SQLite
- Claude API via Vercel AI SDK
- Maya TTS (11 Indian languages, ~75ms latency)
- Motion (framer-motion) for animations
- Inter + JetBrains Mono fonts

### 23 Routes (all compiling, zero errors)

| Route | What it does |
|-------|-------------|
| `/` | Cinematic landing page with animations — "Did the backend actually do it?" |
| `/login` | Auth page (user1234/password pre-filled) |
| `/dashboard` | Stats cards, root cause pie chart, recent audits |
| `/audits` | List of all audits with status badges |
| `/audits/new` | Multi-step upload: name → add calls with transcripts/tool logs → submit |
| `/audits/[id]` | Audit detail: summary stats, call list, analysis tab, "Process Audit" button |
| `/calls/[id]` | **THE key page** — 5-layer comparison, failure cards, entity table, Maya TTS "Listen" buttons |
| `/regression` | Compare audit version A vs B — see new failures, fixed failures, root cause shifts |
| `/review` | Human review queue — confirm, dismiss, or override AI-detected failures with notes |
| `/packs` | 7 industry packs (5 available, 2 coming soon) with "Run Tests" buttons |
| `/demo` | Live Maya TTS demo — type Hindi/Hinglish text, hear it spoken, sample phrases |
| `/runner` | Execute benchmark scenarios — pick a pack, run individual or all, see pass/fail with audio |
| `/runs` | Test run history |
| `/runs/[id]` | Run detail: customer speech, expected tool call, final state, policy check results |
| `/setup` | SDK installation wizard — copy-paste code blocks for install, instrument, webhook |
| `/docs` | Full documentation: Overview, SDK, API, Entity Truth, Policies, Vendors, Benchmarks, CLI |
| `/api/audits` | REST: list/create audits |
| `/api/process` | Trigger analysis pipeline |
| `/api/ingest` | Production call ingestion (API key auth) |
| `/api/tts` | Maya TTS proxy |
| `/api/run` | Execute test scenarios |
| `/api/sdk/verify` | Receive SDK verification results |

### Core Engine (`src/lib/engine/`)
- **Entity extraction** — Claude-powered, extracts names/dates/times/amounts/addresses/actions from Hindi/Hinglish/English
- **Normalization** — Resolves Indian expressions: saade chaar → 16:30, parson → day after tomorrow, dedh lakh → 150000
- **Comparison** — Aligns extracted entities to tool call arguments, flags mismatches
- **Classification** — Root cause: ASR error, reasoning error, tool argument error, integration error, false confirmation
- **Pipeline** — Orchestrates extract → normalize → compare → classify

### India Entity Truth Engine (`src/lib/engine/entity-truth.ts`)
- Hindi numbers: ek through ninyanve, sau/hazaar/lakh/crore, dedh/dhai specials
- Hindi time: saade/paune/sawa patterns for all hours, AM/PM from context (subah/shaam/dopahar)
- Hindi dates: aaj, kal, parson, uske agle din, agla wala [weekday], aakhri tareekh
- Spoken digits: "one four double nine" → 1499, "triple two" → 222
- Fuzzy matching: amount tolerance, date proximity

### Final-State SDK (`src/lib/sdk/`)
- `captureTranscript()`, `assertEntity()`, `traceTool()`, `assertFinalState()`, `assertPolicy()`, `verify()`
- Reports results to `/api/sdk/verify`
- Can be packaged as `@wordai/sdk` npm module

### Policy Packs (`src/lib/policies/`)
- **RBI Collections** (4 rules): Verify borrower before disclosure, no threats, PTP with amount+date, escalate hardship
- **E-commerce** (4 rules): Verify order ID, refund ≤ item value, refund method matches preference, confirmation matches action
- **Insurance IRDAI** (3 rules): Verify policy before changes, don't confirm when API errors, nominee changes need relationship+DOB

### Benchmark Packs (`src/lib/benchmarks/`)
- **Hindi E-commerce**: 10 scenarios (spoken order IDs, partial cancellation, UPI refund, dedh hazaar, flat 3B confusion, angry caller corrections)
- **Hindi Appointments**: 5 scenarios (relative dates, saade/paune times, multi-name instructions, false confirmation)
- **Hindi Collections**: 5 scenarios (teen vs tera hazaar, salary-relative PTP dates, dedh lakh, disputes)

### Seed Data (6 audits, 35+ calls)
1. Dr. Sharma Clinic — 10 calls, 3 failed (reasoning error, ASR error, false confirmation)
2. QuickFix AC Service — 5 calls, 1 failed (tool argument error: flat 3B → 38)
3. MediLab Diagnostics — 3 calls (processing status)
4. ShopEasy E-commerce — 8 calls, 3 failed (wrong refund amount, wrong refund method, wrong delivery date)
5. FinServ Collections — 5 calls, 2 failed (teen/tera confusion, salary-relative PTP)
6. SecureLife Insurance — 4 calls, 1 failed (API error ignored, false confirmation)

### Multi-Vendor Support (`src/lib/vendors.ts`)
Normalizers for: Bolna, Vapi, Retell AI, LiveKit, Pipecat, Sarvam AI, Custom/FastAPI

### CI/CD
- GitHub Actions workflow (`.github/workflows/wordai-gate.yml`)
- CLI test runner (`scripts/wordai-test.sh`)

### Maya TTS Integration
- HTTP synthesis with PCM → WAV conversion
- 11 Indian languages, ~75ms latency
- "Listen" buttons on transcripts and entity values
- Live demo page with voice selection (Ananya/Arjun)

---

## What's NOT Built (Intentionally)

| Excluded | Why |
|----------|-----|
| Twilio / Exotel telephony | Not needed for MVP — browser-based testing, no phone infrastructure |
| FastAPI backend | Everything is Next.js — one codebase, one deployment |
| Generic voice-agent dashboard | That's Cekura's territory — we don't compete on dashboards |
| Synthetic call generation | We verify real calls, not simulate them (Maya is for demo audio only) |
| Production monitoring at scale | Post-hackathon feature |
| On-premise deployment | Enterprise feature |

---

## Where We're Going

### Immediate (Hackathon Demo)
The demo script:
1. Open landing page → cinematic "Did the backend actually do it?"
2. Login (pre-filled) → Dashboard shows 6 audits with failure data
3. Click into ShopEasy e-commerce audit → 3 failures highlighted
4. Click failed call → 5-layer comparison shows "agent said UPI but sent bank_account"
5. Click "Listen" → hear the Hindi phrase via Maya
6. Go to Runner → run Hindi e-commerce benchmark pack → see pass/fail results
7. Go to Docs → show SDK code for `assertFinalState()`
8. Key message: "Cekura checks if the tool was called. We check if the order is actually cancelled in Shopify."

### Post-Hackathon (First Revenue)

**Sell a service, not software:**
> "7-Day Hindi/Hinglish Voice Agent Release Audit — ₹25,000–₹50,000"

The customer gets:
- 25 test scenarios customized for their agent
- Tool-call + backend-state verification
- Critical failure report with root causes
- Prompt recommendations
- Reusable regression suite

**First target customer:** Voice-AI development agencies building Hindi/Hinglish e-commerce or appointment agents.

### Product Roadmap

| Phase | What | When |
|-------|------|------|
| Now | Hackathon demo + first 2 paid pilots | This week |
| Month 1 | Publish @wordai/sdk on npm, add Shopify/WooCommerce final-state connectors | Sep 2026 |
| Month 2 | Add real human reviewer workflow, curated benchmark dataset with native speakers | Oct 2026 |
| Month 3 | Banking/telecom policy packs with legal review, India-hosted mode | Nov 2026 |
| Month 4+ | Production monitoring, CI/CD marketplace, Cekura complement/integration | Dec 2026+ |

---

## Key Metrics to Track

| Metric | Why |
|--------|-----|
| Failures found per 200 calls | Proves value — target: ≥ 3 unknown critical failures |
| Final-state mismatches | Our unique signal — tool said success but backend disagrees |
| Entity normalization accuracy | Hindi/Hinglish → structured value correctness |
| Time to first audit | Onboarding speed — target: < 10 minutes |
| Pilot conversion rate | Audit → monthly customer — target: ≥ 50% |

---

## File Structure Summary

```
wordai/
├── prisma/schema.prisma          — 7 models (Audit, Call, Entity, ToolCall, Comparison, TestRun, PolicyCheck)
├── prisma/seed.ts                — 6 audits, 35+ calls with realistic Hindi/Hinglish data
├── src/
│   ├── app/
│   │   ├── page.tsx              — Cinematic landing
│   │   ├── login/                — Auth
│   │   ├── (app)/                — Protected route group (11 pages)
│   │   └── api/                  — 6 API endpoints
│   ├── components/
│   │   ├── landing/              — 5 animated landing sections
│   │   ├── ui/                   — 19 shadcn components
│   │   └── *.tsx                 — 12 custom components
│   ├── lib/
│   │   ├── sdk/                  — Final-State Assertion SDK
│   │   ├── engine/               — Entity truth, comparison, classification, policy
│   │   ├── policies/             — RBI, e-commerce, insurance rule packs
│   │   ├── benchmarks/           — 20 Hindi/Hinglish test scenarios
│   │   ├── maya-tts.ts           — Maya TTS integration
│   │   └── vendors.ts            — Multi-vendor normalizers
│   └── actions/                  — 6 server action files
├── .github/workflows/            — CI/CD gate
├── scripts/                      — CLI test runner
├── todos.md                      — Progress tracker (all complete)
└── STATUS.md                     — This file
```
