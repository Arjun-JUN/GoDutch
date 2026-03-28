# GoDutch — Project Intelligence

> This file is the living brain of the project. It should be updated as conventions evolve,
> new decisions are made, and the project grows. Claude reads this at the start of every session.

---

## What is GoDutch?
An expense-splitting app that uses OCR, voice input, and other smart capabilities to make splitting bills effortless. Users can scan receipts, speak expenses aloud, and settle up with friends — no manual entry required.

## Project Status
- **Phase:** In development — monorepo bootstrapped, `packages/slate` built, expense splitting in progress
- **Last updated:** 2026-03-28

---

## Folder Structure

```
GoDutch/
├── CLAUDE.md                  ← you are here (project intelligence, keep updated)
├── architecture/
│   └── component-map.md       ← monorepo topology, domain packages, data flow
├── competitive-briefs/
│   ├── COMPETITIVE_LOG.md     ← master tracker: all competitive briefs
│   └── [dated briefs]         ← named YYYY-MM-DD_description.md
└── specs/
    ├── FEATURE_LOG.md         ← master tracker: all features + statuses
    └── features/
        ├── _TEMPLATE.md       ← copy this when writing a new spec
        └── [feature specs]    ← one file per feature, named NNN_feature-name.md
```

**Code structure (active):**
```
GoDutch/
├── apps/
│   ├── mobile/                ← Expo bare app: navigation + screen composition only
│   └── api/                   ← HTTP server: thin routing layer only (future)
├── packages/
│   ├── commons/               ← Shared types, errors, utilities (zero dependencies)
│   ├── slate/                 ← Shared UI component library (design system)
│   ├── optic/                 ← OCR and receipt scanning ("sight/vision")
│   ├── herald/                ← Voice input and NLP ("the messenger who listens")
│   ├── ledger/                ← Expense management ("the financial record book")
│   ├── dutch/                 ← Splitting algorithms and settlement ("going dutch")
│   └── crew/                  ← Groups and members ("the social layer")
├── db/                        ← Schema and migrations (shared, not owned by any package)
└── workers/                   ← Background jobs and async processing
```

> See `architecture/component-map.md` for full detail on what each package owns.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Mobile app | React Native (bare Expo) | TypeScript-native; same language as API; vast ecosystem for OCR/voice native modules; bare allows AVCaptureSession, ML Kit, SFSpeechRecognizer |
| Package manager | pnpm workspaces | Strict package isolation; deduplication; workspace:* protocol; npm/Yarn Berry have Metro bundler compatibility issues |
| Routing | Expo Router v3 | File-based routing; auto-handles tabs, modals, deep links; sits on React Navigation |
| Icons | Ionicons (`@expo/vector-icons`) | Ships with Expo; zero native linking; 1300+ icons; outline+filled for tab states |
| UI library | `packages/slate` (internal) | All visual components in one place; design tokens, theming (light/dark), primitives through overlays |

### Critical dev notes
- **Metro watchFolders**: `apps/mobile/metro.config.js` must declare `watchFolders: [workspaceRoot]` and `resolver.extraNodeModules` for every `@godutch/*` package. Without this, editing a package won't hot-reload.
- **react-native must not be hoisted**: Keep it as a direct dep of `apps/mobile` only. pnpm's phantom dependency protection is strict.
- **Reanimated plugin order**: `react-native-reanimated/plugin` must be the last plugin in `babel.config.js`. Getting this wrong breaks animations silently.
- **Money is always cents**: `amountCents: number` internally. `formatCurrency` only at display time. No `balance` column in the DB — computed from transaction log at read time.

---

## Conventions

### Spec files
- Named `NNN_feature-name.md` (e.g. `001_receipt-ocr.md`)
- Always copied from `_TEMPLATE.md`
- Status kept in sync with `FEATURE_LOG.md`

### Feature Log (`specs/FEATURE_LOG.md`)
- Single source of truth for feature status
- Updated every time a spec is created, changed, or shipped
- Features never deleted — dropped ones move to the Archive section

### Competitive Briefs (`competitive-briefs/`)
- Named `YYYY-MM-DD_description.md` (e.g. `2026-03-27_godutch-vs-market.md`)
- Tracked in `COMPETITIVE_LOG.md`
- Used for positioning research, competitor analysis, and strategic decisions

### Architecture docs (`architecture/`)
- `component-map.md` is the canonical reference for what each package owns and how data flows between them
- Read it before writing any code
- Update it when package boundaries or data flow changes

### CLAUDE.md (this file)
- Updated whenever: a new folder is added, a convention changes, a major decision is made, or a new capability is added to the app
- Treat it as a changelog + map, not a static doc

---

## Key Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-03-26 | Use markdown spec files in `specs/features/` | Lightweight, versionable, easy to evolve |
| 2026-03-26 | FEATURE_LOG.md as master tracker | Single place to see all features at a glance |
| 2026-03-27 | Add `competitive-briefs/` folder with `COMPETITIVE_LOG.md` | Track market positioning and competitor research alongside feature specs |
| 2026-03-27 | Domain-first monorepo topology (`apps/`, `packages/`, `db/`, `workers/`) | Feature code lives in one place — one feature story = one package. PRs are coherent, ownership is clear, domains can be extracted later if needed |
| 2026-03-27 | Balances computed from transaction log, never stored as mutable counter | Ensures correctness when expenses are edited or deleted. No `balance` column anywhere in the schema |
| 2026-03-28 | React Native + Expo bare workflow (not managed) | OCR/voice need native modules (AVCaptureSession, ML Kit, SFSpeechRecognizer); bare still gets EAS Build/Updates |
| 2026-03-28 | pnpm workspaces (not npm/Yarn) | Metro bundler resolves packages correctly; strict phantom-dep protection; workspace:* protocol |
| 2026-03-28 | Expo Router v3 for navigation | File-based routing, auto deep links, tab+modal layouts match the 9-screen expense spec |
| 2026-03-28 | `packages/slate` as the internal UI design system | All visual components abstracted here; zero business logic; named "slate" |
| 2026-03-28 | Money stored as integer cents (no floats) | $10 / 3 = [334, 333, 333] cents — correct; floats accumulate errors across splits |
| 2026-03-28 | TypeScript strict mode + branded ID types | Prevents UserId/GroupId/ExpenseId mix-ups at compile time |

---

## Known Capabilities (planned)
- **OCR receipt scanning** — parse receipts to auto-fill expenses
- **Voice input** — log expenses by speaking naturally
- **Expense splitting** — split bills evenly or by custom amounts

> Add entries here as new capabilities are confirmed or built.

---

## Testing Philosophy

**Every change must have three tiers of test coverage: happy path, failure path, and edge cases.** No exceptions.

### By layer

| Layer | Test type | Rule |
|---|---|---|
| `packages/*` | Unit tests | Pure logic, no I/O. Run in milliseconds. These are the most important tests — exhaustive coverage. |
| `apps/api` | Integration tests | Hit a real test database. Never mock the DB (mock/prod divergence hides migration bugs). Test HTTP status codes, error shapes, auth enforcement only — not business logic. |
| `apps/mobile` | Component + E2E | Component tests for UI states; E2E (Detox/Maestro) for full user flows (scan → confirm → split → settle). |
| `workers/` | Unit + smoke | Unit-test each job with a mocked queue client. Smoke-test that the worker boots and consumes a sample job. |
| `db/` | Migration tests | Run all migrations against a clean test database on every CI run. |

### Test case structure
Every test file should include cases for:
- **Happy path** — valid inputs, system behaves as expected
- **Failure path** — invalid inputs, API errors, permission denials, network failures
- **Edge cases** — boundary values, zero/empty states, maximum values, rounding, locale/currency variations

---

## Mandatory Pre-PR Workflow

**Every PR must go through this checklist in order. The `gh pr create` command is hook-blocked until step 3 is complete.**

1. **Run `/review`** — review all changes for correctness, security, and code quality. Fix every finding before moving on.
2. **Run `/tech-debt`** — audit for technical debt introduced by the change. Address all issues found.
3. **Unlock the PR gate** — run `touch .claude/pr-review-done.flag` to signal the checklist is done.
4. **Raise the PR** — run `gh pr create`. The hook checks for the flag and allows it. The flag is auto-deleted after the PR is created.

> The gate is enforced by a `PreToolUse` hook in `.claude/settings.json`. Skipping steps 1–3 will result in a blocked `gh pr create`.

---

## What Claude Should Always Do
- Update `FEATURE_LOG.md` when creating or changing a spec
- Update `COMPETITIVE_LOG.md` when creating or changing a competitive brief
- Update this file when the project structure or conventions change
- Update `architecture/component-map.md` when package boundaries or data flow changes
- Name spec files with the `NNN_` prefix matching the feature number in the log
- Name competitive briefs with the `YYYY-MM-DD_` date prefix
- Keep decisions in the Key Decisions Log above
- Write tests at all three tiers (happy / failure / edge) for every code change
- Follow the Mandatory Pre-PR Workflow above before every `gh pr create`
