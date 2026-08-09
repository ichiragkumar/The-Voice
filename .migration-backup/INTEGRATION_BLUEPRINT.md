# The Voice — Integration Blueprint

**Status:** Specification — not yet implemented
**Product promise:** Say the job. The Voice gets it done.

## Integration Status

| # | Platform | Status | Priority | First Action |
|---|----------|--------|----------|-------------|
| 1 | Google Calendar | NOT STARTED | P0 | Create/reschedule appointments |
| 2 | Google Sheets | NOT STARTED | P0 | Job ledger append/update |
| 3 | WhatsApp Business | NOT STARTED | P0 pilot | Customer confirmations |
| 4 | Gmail | NOT STARTED | P1 | Draft/send follow-ups |
| 5 | Telegram | NOT STARTED | P1 demo | Voice commands + approvals |
| 6 | SMS (Twilio/Exotel) | NOT STARTED | P2 | Fallback notifications |
| 7 | GitHub | NOT STARTED | P2/vertical | Issues for dev teams |
| 8 | Instagram | NOT STARTED | P2 | Professional account workflows |
| 9 | X (Twitter) | NOT STARTED | P3 | Draft/publish posts |

## What's Built Today (Hackathon MVP)

| Component | Status | Notes |
|-----------|--------|-------|
| Voice input (mic + STT) | DONE | Browser SpeechRecognition (Chrome), typed fallback |
| Claude AI chat with tools | DONE | claude-sonnet-4-6, intent-based, no hardcoding |
| Maya TTS (11 languages) | DONE | Hindi, Hinglish, English + 8 Indian languages |
| User signup + demo orders | DONE | 5 random orders on signup |
| Order management tools | DONE | cancel, refund, track, place, change address |
| Conversation memory | DONE | Last 20 messages in context |
| Real database (Neon PG) | DONE | Users, orders, chat messages, API keys |
| SDK published (npm) | DONE | @imchiragkumar22/wordai-sdk v0.1.2 |
| Landing page | DONE | "Say the job. The Voice gets it done." |
| Live demo on landing | DONE | Guided + voice chat |
| Developer portal | DONE | API keys, SDK docs, copy-for-AI |
| Multi-language support | DONE | 11 languages in chat + TTS |
| Dark/light theme | DONE | next-themes |

## Trust Rule

> The Voice must never say "done" merely because it called an API. It says "done" only after it receives and stores platform evidence.

## Connector Contract (Future)

Every connector will implement:

```ts
interface Connector {
  capabilities(): Promise<Capability[]>;
  authorize(input: AuthorizationRequest): Promise<Connection>;
  resolve(input: ResolveRequest): Promise<Candidate[]>;
  validate(action: ProposedAction): Promise<ValidationResult>;
  execute(action: ApprovedAction): Promise<ExecutionResult>;
  verify(result: ExecutionResult): Promise<VerificationResult>;
  compensate?(result: ExecutionResult): Promise<CompensationResult>;
}
```

## Receipt States

```
PLANNED → AWAITING_CONFIRMATION → APPROVED → RUNNING
        → PENDING_PROVIDER → COMPLETED
        → PARTIAL
        → FAILED
        → CANCELLED
```

## Confirmation Rules

| Risk | Examples | Behavior |
|------|----------|----------|
| Read-only | Check availability, find job | Run immediately with audit log |
| Reversible write | Create draft, add note | One workflow confirmation |
| External communication | Send WhatsApp, email, SMS | Preview recipient + content, explicit confirm |
| Schedule change | Create/reschedule booking | Preview old/new values, explicit confirm |
| Destructive | Cancel booking, delete | Separate explicit confirmation + undo window |
| Public/high-impact | Publish social post, bulk message | Strong confirmation, exclude bulk from MVP |

## Build Sequence (Post-Hackathon)

### Week 1 — Foundation
- Connection records + encrypted token storage
- Capability registry
- Typed plan + action schemas
- Confirmation screen + approval hash
- Queue, retries, receipt states
- Audit log

### Week 2 — Google Calendar + Sheets
- Google OAuth
- Create/reschedule events
- Append/update job rows
- Read-back verification
- Partial-failure receipt

### Week 3 — Telegram Demo
- Bot webhook
- Voice/text command input
- Approve/edit/cancel buttons
- Result receipts

### Week 4 — WhatsApp Pilot
- Customer onboarding
- Message templates
- Send + inbound handlers
- Delivery status reconciliation
- Consent + opt-out

## Platform-Specific Notes

### Google Calendar
- Use `events.insert` with deterministic custom event ID
- Verify with `events.get` after creation
- Use watch channels for change notifications

### Google Sheets
- Every job needs a stable `job_id` column
- Never identify records only by row number
- Use `values.append` for new jobs, `values.update` for known ranges

### WhatsApp Business
- Must use official Cloud API — no browser automation
- Templates required for outbound in many cases
- Track: accepted → sent → delivered → read → failed
- `accepted` ≠ `delivered`

### Gmail
- Default to drafts, not immediate send
- Preserve threadId for replies
- Sensitive scopes may require Google verification

### Telegram
- Bots cannot initiate contact — user must start the bot
- Use inline buttons for approval flows
- Store chat_id + message_id for receipts

### GitHub
- Use GitHub App (not personal tokens)
- Install on selected repos only
- Start with Issues read/write

### SMS
- Use Twilio/Exotel with delivery callbacks
- Track: queued → sent → delivered → failed

### X (Twitter)
- Always preview before publishing
- Rate limits depend on API access tier

### Instagram
- Professional accounts only
- Separate messaging vs publishing capabilities

## Security Checklist (Pre-Pilot)

- [ ] Encrypt tokens at rest, TLS in transit
- [ ] Credentials never in prompts, browser, logs
- [ ] Tenant isolation on every query
- [ ] Least-privilege OAuth scopes
- [ ] Webhook signature verification
- [ ] Redact sensitive content in logs
- [ ] Immutable audit trail
- [ ] Disconnect/revoke/delete controls
- [ ] Test vs live environment separation
- [ ] Rate limits per tenant
- [ ] Idempotency keys for writes
- [ ] Replay protection on confirmations
- [ ] Dependency + secret scanning in CI

## Revenue Model (Hypothesis)

| Package | Price | Includes |
|---------|-------|----------|
| Solo | ₹999/mo | 1 user, Calendar + Sheets |
| Team | ₹4,999/mo | 5 users, 3 workflows, messaging |
| Operations | ₹14,999/mo | More users, CRM, policies |

## Success Criteria (30 days)

- 2+ businesses connect real accounts
- 1+ pays
- 30+ useful commands/week/business
- 3+ hours saved/week
- 90%+ confirmed commands complete
- Zero unauthorized actions
