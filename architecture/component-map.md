# GoDutch — Component Map

> This document is the canonical reference for how GoDutch code is organized.
> Read this before writing any code. Update it when component boundaries change.

---

## Monorepo Topology

GoDutch uses a **domain-first monorepo**. Feature code lives in one place, not scattered across technical layers.

```
godutch/
├── apps/          ← Deployable units (thin wrappers that wire up packages)
├── packages/      ← Domain logic, components, and types (the real code)
├── db/            ← Database schema and migrations (owned by no single package)
├── workers/       ← Background jobs and async processing
├── specs/         ← Feature specifications
├── architecture/  ← Architecture decisions and component maps (you are here)
└── competitive-briefs/
```

**Why domain-first, not layer-first:**
Organizing by technical layer (api/, mobile/, workers/) means one feature story touches four directories. Domain-first means "I'm working on voice input" = "I work in `packages/herald/`". PRs are coherent. Ownership is clear.

---

## Apps (`apps/`)

Thin deployable units. They import from `packages/` and wire things together. No business logic lives here.

### `apps/mobile/`
The React Native (or Flutter) app shell. Handles navigation and screen composition only.
```
apps/mobile/src/
├── navigation/     ← Stack/tab routing setup
├── screens/        ← Screens composed from domain package components
│   ├── scan/       ← Uses: optic + ledger + dutch
│   ├── voice/      ← Uses: herald + ledger
│   ├── expenses/   ← Uses: ledger + dutch
│   ├── groups/     ← Uses: crew
│   └── settlement/ ← Uses: dutch
└── theme/          ← Design tokens, colors, typography
```

### `apps/api/`
The HTTP server. Thin routing layer only — all business logic delegates to domain packages.
```
apps/api/src/
├── server.ts
├── middleware/     ← Auth, logging, error handling
└── routes/         ← One file per domain
    ├── optic.routes.ts
    ├── herald.routes.ts
    ├── ledger.routes.ts
    ├── dutch.routes.ts
    └── crew.routes.ts
```

---

## Packages (`packages/`)

The real codebase. Each package is a vertical slice through the stack for one domain.

---

### `packages/commons` — Shared primitives
**True meaning:** Shared resources belonging to everyone — cross-cutting concerns with no domain affiliation.

Owned by: everyone. No domain-specific logic here.

```
commons/src/
├── types/      ← Money, UserId, GroupId, Currency, SplitMode, ConfidenceScore
├── errors/     ← ParseError, ValidationError, NetworkError, PermissionError
└── utils/      ← formatCurrency, parseDate, roundMoney, clamp
```

**Rules:**
- Zero external dependencies
- No framework imports (no React, no Node APIs)
- If something is only used by one package, it belongs in that package, not here

---

### `packages/optic` — OCR and receipt scanning
**True meaning:** From Greek/Latin for sight/vision. The module that reads the physical world.

```
optic/src/
├── adapters/           ← Swappable OCR backends
│   ├── on-device.ts    ← Apple Vision / Google ML Kit bridge
│   └── cloud.ts        ← Google Vision / AWS Textract client
├── parser/             ← Field extraction from raw OCR output
│   ├── merchant.ts
│   ├── total.ts
│   ├── tax.ts
│   ├── tip.ts
│   └── index.ts        ← Orchestrates field parsers, returns ParsedReceipt
├── reconcile.ts        ← Verifies subtotal + tax + tip ≈ total (within $0.05)
├── types.ts            ← ParsedReceipt, FieldConfidence, ScanResult
└── components/         ← Mobile UI components for this domain
    ├── CameraCapture   ← Camera viewfinder with scan overlay
    ├── ScanOverlay     ← Scanning animation and quality hints
    └── ConfirmationForm ← Editable parsed fields before confirm
```

**What optic does NOT own:** Expense creation (that's `ledger`). Optic produces a `ParsedReceipt`; ledger consumes it.

**Key design:** The OCR adapter is swappable. The parser is backend-agnostic — it operates on raw text output regardless of which adapter produced it. If on-device confidence falls below threshold, the cloud adapter is called as fallback.

---

### `packages/herald` — Voice input and NLP
**True meaning:** A messenger who listens and announces — interprets spoken words into structured intent.

```
herald/src/
├── adapters/               ← Swappable speech-to-text backends
│   ├── native.ts           ← SFSpeechRecognizer (iOS) / SpeechRecognizer (Android)
│   └── cloud.ts            ← OpenAI Whisper / Google Speech-to-Text
├── parser/                 ← NLP: extract structured expense from transcript
│   ├── amount.ts           ← Regex + word-to-number ("thirty dollars", "$30", "30 bucks")
│   ├── description.ts      ← Extract expense description from utterance
│   ├── participants.ts     ← Extract names / contact matches
│   └── index.ts            ← Orchestrates parsers, returns ExpenseIntent
├── silence-detector.ts     ← Auto-stop recording after 2s of silence
├── types.ts                ← ExpenseIntent, TranscriptionResult, ParseConfidence
└── components/
    ├── MicButton           ← Tap-to-record with state (idle / recording / processing)
    ├── RecordingIndicator  ← Visual + haptic feedback during recording
    └── VoiceConfirmationForm ← Editable parsed intent before confirm
```

**What herald does NOT own:** Expense creation (that's `ledger`). Herald produces an `ExpenseIntent`; ledger consumes it.

**Key design:** NLP is rule-based/regex for v1 — not an LLM call. This keeps it fast, offline-capable, and testable. The STT adapter is swappable between native and cloud.

---

### `packages/ledger` — Expense management
**True meaning:** The principal financial record book — the source of truth for all money that has been spent.

```
ledger/src/
├── models/
│   ├── expense.ts      ← Expense entity type (id, groupId, payerId, amount, description, date)
│   └── split.ts        ← Split entity type (expenseId, userId/guestId, shareAmount)
├── db/
│   ├── schema.ts       ← expenses and splits table definitions
│   └── queries.ts      ← createExpense, getExpensesByGroup, editExpense, deleteExpense
├── service.ts          ← Business logic: create from ParsedReceipt or ExpenseIntent or manual
└── components/
    ├── ExpenseList     ← Scrollable list of expenses in a group
    ├── ExpenseDetail   ← Full view with splits and receipt attachment
    └── ExpenseForm     ← Manual entry form (fallback for OCR/voice failures)
```

**Key design:** Editing or deleting an expense must trigger a balance recompute. The service layer is responsible for enqueueing this — the `dutch` package's `balance/compute` function does the actual computation.

---

### `packages/dutch` — Splitting algorithms and settlement
**True meaning:** "Going dutch" — splitting costs equally — the core concept the app is named after.

```
dutch/src/
├── split/
│   ├── equal.ts        ← Divide amount N ways; odd-cent remainder goes to payer
│   ├── percentage.ts   ← Split by percentages; must sum to 100%
│   ├── exact.ts        ← Manual share amounts; must sum to total
│   └── validate.ts     ← Asserts that splits sum to expense total (within $0.01)
├── balance/
│   ├── compute.ts      ← Sums all splits and settlements for a group → per-user balances
│   └── simplify.ts     ← Debt simplification: greedy min-flow to reduce transfer count
├── settlement/
│   ├── models.ts       ← Settlement entity type (payerId, receiverId, amount, confirmedAt)
│   ├── db/
│   │   └── queries.ts  ← createSettlement, confirmSettlement, getSettlementsByGroup
│   └── service.ts      ← Record a settlement, optionally require confirmation
└── components/
    ├── SplitSelector   ← Toggle between equal / percentage / exact split modes
    ├── BalanceSummary  ← Who owes whom, per person in the group
    └── SettleUpFlow    ← Step-through flow: select amount → confirm → done
```

**Critical invariant: Balances are NEVER stored as mutable counters.**
The balance between any two users is always computed live from the full transaction log (`splits` + `settlements`). There is no `balance` column anywhere in the database. This ensures correctness when expenses are edited or deleted. See `balance/compute.ts`.

---

### `packages/crew` — Groups and members
**True meaning:** A group working together — the social layer of the app.

```
crew/src/
├── models/
│   ├── group.ts        ← Group entity (id, name, currencyCode, createdBy)
│   └── member.ts       ← Member (registered user or guest with display name only)
├── db/
│   ├── schema.ts       ← groups, memberships, guest_members table definitions
│   └── queries.ts      ← createGroup, addMember, removeMember, getGroupMembers
├── service.ts          ← Business logic: group lifecycle, member management
└── components/
    ├── GroupCard       ← Group name, member count, last activity, balance summary
    ├── MemberList      ← List of members with balance indicators
    └── AddMemberSheet  ← Search contacts or add guest by name
```

---

## Database (`db/`)

Schema and migrations are not owned by any single package — they are a shared concern.

```
db/
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_groups_memberships.sql
│   ├── 003_create_expenses_splits.sql
│   └── 004_create_settlements.sql
└── seed/               ← Development seed data
```

**Migration ownership (which packages depend on which migrations):**
| Migration | Packages that read/write these tables |
|---|---|
| 001 users | `crew`, `ledger`, `dutch` |
| 002 groups, memberships, guests | `crew` |
| 003 expenses, splits | `ledger`, `dutch` |
| 004 settlements | `dutch` |

---

## Workers (`workers/`)

Background jobs for async processing. Thin for v1 — most operations are synchronous.

```
workers/src/
├── jobs/
│   ├── push-notify.job.ts       ← Send push notification on new expense (P1 feature)
│   ├── cloud-ocr.job.ts         ← Async cloud OCR escalation (if on-device fails)
│   └── balance-recompute.job.ts ← Triggered on expense edit/delete
├── queue.ts                     ← Queue client setup (BullMQ / Inngest)
└── worker.ts                    ← Worker process bootstrap
```

**v1 reality:** `push-notify` is the only job active at launch. `cloud-ocr` and `balance-recompute` are stubbed — they exist as definitions to make the pattern clear without being triggered yet.

---

## Cross-Package Data Flow

```
[Camera] → optic → ParsedReceipt
                          ↓
[Mic]  → herald → ExpenseIntent → ledger (create Expense + Splits)
                                        ↓
                                   dutch (compute Balances from log)
                                        ↓
                                   dutch (simplify → Settlement plan)
                                        ↓
                                   dutch (record Settlement confirmation)
```

`crew` provides the group context at every step.
`commons` provides the shared types that flow between packages.

---

## What to Update When Adding a Feature

1. If it introduces new database tables → add a migration in `db/migrations/`
2. If it adds a new domain concept → consider whether it fits an existing package or needs a new one
3. If it changes what a package exports → update this file
4. If it adds a new top-level folder → update `CLAUDE.md`
