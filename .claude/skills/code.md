# GoDutch — General Coding Skill

Use this skill whenever writing or reviewing code for GoDutch.

---

## Before Writing Any Code

1. Read `architecture/component-map.md` to confirm which package owns what you are about to write.
2. Confirm the tech stack in use (undecided as of 2026-03-27 — check CLAUDE.md for updates).
3. Check whether the change touches a package boundary or data flow — if so, update `architecture/component-map.md` when done.

---

## Package Ownership Rules

Every piece of code belongs in exactly one package. Use these rules to decide where:

| If the code... | It belongs in... |
|---|---|
| Captures an image, runs OCR, or parses receipt fields | `packages/optic` |
| Records audio, transcribes speech, or parses NLP from voice | `packages/herald` |
| Creates, edits, deletes, or lists expenses | `packages/ledger` |
| Calculates splits, computes balances, or records settlements | `packages/dutch` |
| Creates groups, manages members, or handles invites | `packages/crew` |
| Is a shared type, error class, or formatting utility used by 2+ packages | `packages/commons` |
| Is an HTTP route handler that delegates to a package | `apps/api/src/routes/` |
| Is a screen that composes package components | `apps/mobile/src/screens/` |
| Is a background job triggered by a queue | `workers/src/jobs/` |

**If something fits two packages**, it probably belongs in `commons` — or the abstraction is wrong. Stop and reconsider.

---

## The Balance Invariant (Never Violate This)

**Balances are NEVER stored as mutable counters.**

There is no `balance` column in any database table. The balance between any two users is always computed live by querying the full transaction log (`splits` + `settlements` tables).

This lives in `packages/dutch/src/balance/compute.ts`.

Violating this invariant causes silent data corruption when expenses are edited or deleted. If you find yourself writing to a balance field, stop — you are doing it wrong.

---

## Testing Requirements

**Every code change must include tests at all three tiers:**

### 1. Happy path
The inputs are valid and the system behaves as expected. Confirms the feature works.

### 2. Failure path
Invalid inputs, missing data, API errors, permission denials, network failures.
Confirms graceful degradation — the app doesn't crash, it gives useful feedback.

### 3. Edge cases
Boundary values, empty states, maximum values, rounding (especially money arithmetic), concurrent operations, locale and currency variations.

### Where tests live

- **`packages/*`** — Unit tests alongside the source file. Pure functions, no I/O, run in milliseconds. These are the most important tests in the codebase.
- **`apps/api`** — Integration tests hitting a real test database. Never mock the DB.
- **`apps/mobile`** — Component tests (UI states) + E2E tests (full user flows).
- **`workers/`** — Unit tests per job (mocked queue) + smoke test that the worker boots.
- **`db/`** — Migration tests run against a clean test DB on every CI run.

### Money arithmetic edge cases (always test these)

- Odd-cent rounding when splitting N ways (e.g. $10 split 3 ways = $3.33 + $3.33 + $3.34)
- Zero-amount expenses
- Maximum realistic amounts (e.g. $99,999.99)
- Splits that don't sum to the total (must be caught by `dutch/split/validate.ts`)
- Multi-currency scenarios (if applicable)

---

## Code Style Rules

- **No business logic in `apps/api` routes or `apps/mobile` screens.** Routes call package services. Screens render package components. Logic lives in packages.
- **Adapter pattern for external services.** OCR backends (`optic/adapters/`), STT backends (`herald/adapters/`) are swappable. Never hard-code a vendor inside core logic.
- **`commons` has zero external dependencies.** If you need to import a framework inside `commons`, the code belongs elsewhere.
- **Each package exports a clean public API via `index.ts`.** Internal implementation files are not for consumers to import directly.

---

## When to Update Other Files

| When you... | Also update... |
|---|---|
| Add or change a package's public exports | `architecture/component-map.md` |
| Add a new top-level folder | `CLAUDE.md` folder structure map |
| Make a significant architectural decision | `CLAUDE.md` Key Decisions Log |
| Add a new feature spec | `specs/FEATURE_LOG.md` |
| Add a new competitive brief | `competitive-briefs/COMPETITIVE_LOG.md` |

---

## Component-Specific Skills (Created Lazily)

When a component's patterns have emerged (after the first ~200 lines of code), create a focused skill:

- `.claude/skills/code-optic.md` — OCR adapter pattern, confidence gating, fallback logic
- `.claude/skills/code-herald.md` — NLP parser rules, STT adapter, silence detection
- `.claude/skills/code-dutch.md` — Split calculator invariants, balance computation, debt simplification
- `.claude/skills/code-ledger.md` — Expense lifecycle, balance recompute trigger
- `.claude/skills/code-crew.md` — Group lifecycle, guest member handling
