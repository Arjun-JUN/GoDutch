# GoDutch — Project Guidelines

## Architecture

- **Backend**: FastAPI structured package. Entry point: `backend/app/main.py`.
- **Mobile**: Expo + React Native + NativeWind + Zustand v5 + Expo Router. Source: `mobile/`.
- **Auth**: JWT (30-day expiry). `verify_token` dependency on every protected route.
- **AI**: Gemini API for receipt OCR (`/ai/ocr/scan`) and smart split (`/ai/smart-split`).
- **DB Seeding**: `backend/seed.py` populates dev data. Run separately if needed.

## Running locally

To start both Backend and Mobile integrated:

```bash
pnpm dev
```

Note: This uses `concurrently` from the root to start the FastAPI server (port 8000) and the Expo dev server.

## Tests — Non-Negotiable

**Every change ships with extensive tests. Target dozens to hundreds of cases where reasonable. Even "trivial" changes get comprehensive coverage.** This rule is absolute and overrides the general guidance about not over-engineering — in this project, thorough testing IS the requirement.

For every change, cover all applicable layers:
- **Unit tests (UT)** — each function, each branch, each edge case, error paths, boundary values (empty, null, max, negative, unicode, etc.).
- **Integration tests (IT)** — module-to-module interactions, DB round-trips, API contract tests, auth guards.
- **End-to-end / flow tests** — critical user journeys through the affected surface.
- **Regression tests** — for every bug fix, add a test that reproduces the original bug before the fix.
- **Negative tests** — malformed input, missing auth, wrong permissions, concurrent mutations, race conditions.
- **UI tests** — render, interaction, accessibility, responsive breakpoints, loading/empty/error states.

Never mark a task done without running the full suite and confirming all green.

```bash
# Backend — from project root
pytest                       # all tests
pytest tests/unit/ -x        # unit only, stop on first fail
pytest --cov=backend/app     # coverage — aim for ≥ 90% on touched files

# Mobile
cd mobile && pnpm test
cd mobile && pnpm test --coverage
```

- Backend tests use `mongomock-motor` (no real DB needed).
- Mobile tests use Jest + jest-expo + @testing-library/react-native.
- If a layer has no existing test harness, set one up as part of the change — do not skip.

## Folder Documentation — Non-Negotiable

**Every folder must contain a `README.md`** (or `_README.md` where the folder is a package that must stay import-clean). The file describes the folder to a new reader in three parts:

```markdown
# <folder-name>

## Purpose
Verbal description of what lives here and why this folder exists.
What problem does it solve? What is NOT in scope for this folder?

## High-level Flow
The typical path data/control takes through this folder. Step-by-step,
in prose or a numbered list. Name the entry point(s) and exit point(s).

## Interactions
- **Upstream** (who calls into this folder): list them.
- **Downstream** (what this folder calls): list them.
- **Shared state / contracts**: models, events, env vars, DB collections.
- **Side effects**: network, disk, external APIs, background jobs.
```

Each `README.md` follows the **Karpathy wiki structure** — direct, pedagogical, mental-model-first:

```markdown
# folder-name

> One crisp sentence: what this folder is and why it exists.

## Overview

2-3 paragraphs building the reader's mental model. Why does this folder exist?
What abstraction does it encode? What is explicitly NOT in scope?

## How it works

The main path, step by step, from the entry point out. Name specific files and functions.

1. Step 1
2. Step 2
...

## Key files

| File | What it does |
|------|-------------|
| `file.py` | One-line description |

## Inputs & Outputs

**Takes in:** what arrives at the boundary (HTTP requests, function calls, events, env vars)
**Emits:** what leaves (responses, return values, DB writes, external API calls, side effects)

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream (callers) | `mobile/src/api/client.ts` | HTTP GET/POST |
| Downstream (deps) | `backend/app/models/` | Pydantic validation |
| Shared state | MongoDB `expenses` collection | read/write |

## Gotchas

- Non-obvious things, hidden constraints, traps for a new contributor.

## Further reading

- [Sibling folder](../sibling/README.md)
```

Rules:
- When you **add** a folder, create its `README.md` in the same change.
- When you **modify** a folder's responsibilities, interactions, or flow, update its `README.md` in the same change. Stale folder docs are a bug.
- When you **rename/move** a folder, move and update its `README.md`.
- A new contributor should grok the folder in under 60 seconds.
- Link sibling folder READMEs by relative path in Interactions and Further reading.

## Definition of Done (applies to every change)

A change is only "done" when ALL of the following are true:
1. Code compiles / type-checks clean.
2. Comprehensive tests added (UT + IT + negatives + regressions where applicable).
3. Full test suite passes locally.
4. Coverage on touched files is ≥ 90%.
5. Every folder touched has an accurate, current `README.md`.
6. Design guidelines honored (see below).
7. No new lint/type warnings introduced.

## Design

Follow [`DESIGN_RULES/`](./DESIGN_RULES/README.md) strictly. The canonical platform is React Native (`mobile/src/slate/`). Key rules: tonal topography (no 1px borders), 4-point grid, ambient luminosity, generous breath, Manrope typeface. See [`DESIGN_RULES/user-interface/guides/`](./DESIGN_RULES/user-interface/guides/README.md) for the full rule set and [`DESIGN_RULES/components/`](./DESIGN_RULES/components/README.md) for component reference with sample code.

## Status

**Phase: React Native first — mobile is the sole delivery platform.**
The web frontend has been removed. All UI is delivered through the Expo mobile app
(`mobile/`) using the Slate component library in `mobile/src/slate/`.

Known open bug:
- **B003**: Any user can settle for anyone (auth gap).

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:
- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/design-shotgun`
- `/design-html`
- `/review`
- `/ship`
- `/land-and-deploy`
- `/canary`
- `/benchmark`
- `/browse`
- `/connect-chrome`
- `/qa`
- `/qa-only`
- `/design-review`
- `/setup-browser-cookies`
- `/setup-deploy`
- `/retro`
- `/investigate`
- `/document-release`
- `/codex`
- `/cso`
- `/autoplan`
- `/plan-devex-review`
- `/devex-review`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`
- `/learn`

