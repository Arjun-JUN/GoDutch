# GoDutch — Project Guidelines

## Architecture

- **Backend**: FastAPI structured package. Entry point: `backend/app/main.py`.
- **Mobile**: Expo + React Native + NativeWind + Zustand v5 + Expo Router. Source: `mobile/`.
- **Auth**: JWT (30-day expiry). `verify_token` dependency on every protected route.
- **AI**: Gemini API for receipt OCR (`/ai/ocr/scan`) and smart split (`/ai/smart-split`).

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

### Visual QA — automated

For any frontend change, run **`mobile/scripts/qa/run.sh`** to capture screenshots of every key screen and get a pass/fail verdict. The script starts backend + Expo web, seeds test data, drives the gstack `browse` tool, and writes artifacts to `mobile/.qa-output/latest/`.

```bash
mobile/scripts/qa/run.sh
# Then read mobile/.qa-output/latest/summary.txt for the verdict.
# Only Read individual PNGs if something failed or the user asks.
```

Do NOT drive `browse` manually screen-by-screen — the script is faster, more reliable, and cheaper on context. See `mobile/scripts/qa/README.md` for details, flags, and how to add screens.

**Every new page, modal, or popup must ship with a matching capture line in `mobile/scripts/qa/run.sh` in the same change.** Routes get a `capture` call; modals / bottom sheets / popups get a `capture_modal` call. The script runs a coverage-gap check at the end of every run — it walks `mobile/app/**` and warns about any route not exercised. Set `QA_STRICT=1` to make uncovered routes fail the run. This sits alongside the testing mandate and the folder-README mandate as a non-negotiable Definition-of-Done gate for frontend work.

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

### Foundational principles — mandatory pre-ship checklist

**Every frontend change must pass the checklist in [`DESIGN_RULES/user-interface/guides/foundational-principles.md`](./DESIGN_RULES/user-interface/guides/foundational-principles.md) before it is considered done.** The doc defines the four pillars — Affordances & Signifiers, Visual Hierarchy, Interaction & Feedback, Technical Execution — and ends with a line-by-line checklist. Walk it on every change that touches `mobile/app/**`, `mobile/src/slate/**`, or `mobile/src/components/**`. The checklist sits alongside the testing mandate and the folder-README mandate as a non-negotiable Definition-of-Done gate.

Highlights (see the doc for the full rules):
- **Affordances:** group related controls in a shared container; active/disabled state uses a non-color signifier (weight, fill, desaturation), not color alone.
- **Hierarchy:** primary info dominates via size/weight/accent; secondary uses `Text variant="label" tone="subtle"`. No raw `fontSize` / `fontWeight`.
- **Feedback:** every interactive has all five states (default, pressed, disabled, loading, a11y-focus). Every mutation shows a confirmation (toast, chip, or check). Silent success is a bug.
- **Execution:** every spacing is a `spacing.*` token (4pt grid); every color is a `colors.*` token; text over imagery uses `LinearGradient` or progressive blur.

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

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
