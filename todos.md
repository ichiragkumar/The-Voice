# BhashaQA — TODO Tracker

## Phase 1–9: [ALL DONE] (see git history)

## Phase 10: Differentiation Build [DONE]

### Agent 1: Final-State Assertion SDK [DONE]
- [x] SDK types (`src/lib/sdk/types.ts`)
- [x] SDK class with captureTranscript, traceTool, assertEntity, assertFinalState, assertPolicy, verify (`src/lib/sdk/index.ts`)
- [x] SDK verification API endpoint (`/api/sdk/verify`)

### Agent 2: India Entity Truth Engine [DONE]
- [x] Hindi number normalizer (ek → 1, dedh lakh → 150000, chaudah sau ninyanve → 1499)
- [x] Hindi time normalizer (saade chaar → 04:30, paune paanch → 04:45, sawa teen → 03:15)
- [x] Hindi date normalizer (aaj, kal, parson, uske agle din, agla wala Friday, aakhri tareekh)
- [x] Spoken digit normalizer (one four double nine → 1499)
- [x] Fuzzy matching (amount tolerance, date proximity)

### Agent 3: Policy Assertion Engine [DONE]
- [x] Policy engine (`src/lib/engine/policy.ts`)
- [x] RBI Collections policy pack (4 rules: identity verification, no threats, PTP capture, hardship escalation)
- [x] E-commerce policy pack (4 rules: order ID verification, refund limits, refund method, confirmation truthfulness)
- [x] Insurance IRDAI policy pack (3 rules: policy verification, API error honesty, nominee change requirements)

### Agent 4: Browser Test Runner [DONE]
- [x] Scenario types and builder (`src/lib/runner/scenarios.ts`)
- [x] Test run API endpoint (`/api/run`)
- [x] Runner page (`/runner`) — pick benchmark pack, run individual or all scenarios, see results with Maya audio

### Agent 5: Indian Caller Benchmarks [DONE]
- [x] Hindi E-commerce: 10 scenarios (spoken order IDs, partial cancel, UPI refund, dedh hazaar, flat 3B, angry caller)
- [x] Hindi Appointments: 5 scenarios (relative dates, saade/paune times, multi-name, false confirmation)
- [x] Hindi Collections: 5 scenarios (teen vs tera, salary-relative PTP, dedh lakh, dispute, simple PTP)
- [x] Benchmark registry (`src/lib/benchmarks/index.ts`)

### Agent 6: SDK Setup Page [DONE]
- [x] Interactive setup wizard (`/setup`) with copyable code blocks
- [x] SDK install snippet, instrumentation example, webhook example
- [x] Vendor badges (Bolna, Vapi, Retell, LiveKit, Pipecat, Sarvam, Custom)
- [x] "What makes this different" section

### Agent 7: Test Run Results [DONE]
- [x] Runs list page (`/runs`) with status badges and policy violation counts
- [x] Run detail page (`/runs/[id]`) with customer speech, tool call JSON, final state, policy check results

### Agent 8: Schema + Seed [DONE]
- [x] TestRun model (id, auditId, scenarioName, scenarioPack, status, checks, transcript, toolCalls, finalState)
- [x] PolicyCheck model (id, testRunId, callId, policyPack, rule, passed, evidence, severity)
- [x] Relations: Audit → TestRun[], Call → PolicyCheck[], TestRun → PolicyCheck[]

### Agent 9: Dashboard + Sidebar [DONE]
- [x] Sidebar updated: 10 nav items (Dashboard, Audits, New Audit, Regression, Review, Packs, Demo, Runner, Runs, Setup)
- [x] Dashboard with FadeIn animations

### Agent 10: Landing Page [DONE]
- [x] Hero: "Did the backend actually do it?" with differentiated messaging
- [x] Features: Final-State SDK, Entity Truth, Policy Packs, Benchmarks
- [x] Steps: "Plug in. Run. Ship with confidence."

## ALL 22 ROUTES BUILDING CLEAN

```
/              — Landing page (cinematic, animated)
/login         — Auth (user1234/password, pre-filled)
/dashboard     — Stats, charts, recent audits
/audits        — Audit list
/audits/new    — Multi-step upload
/audits/[id]   — Audit detail + process button
/calls/[id]    — 5-layer comparison + Maya TTS
/regression    — Version A vs B
/review        — Human review queue
/packs         — 7 industry packs
/demo          — Maya TTS live demo
/runner        — Run benchmark scenarios
/runs          — Test run history
/runs/[id]     — Run detail with policy checks
/setup         — SDK installation wizard
/api/audits    — REST API
/api/process   — Trigger analysis
/api/ingest    — Production ingestion
/api/tts       — Maya TTS proxy
/api/run       — Execute test runs
/api/sdk/verify — SDK result endpoint
```

## NOTHING PENDING — ALL 10 PHASES COMPLETE
