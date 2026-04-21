# Visual QA

> One command. Screenshots of every key screen. Automatic pass/fail.

## Run it

```bash
mobile/scripts/qa/run.sh
```

That's it. Takes ~90s. Exits 0 on pass, 1 on any fail. Artifacts land in `mobile/.qa-output/latest/`.

## What Claude should do

**Preferred flow (low-token):**

1. Run the script. Read the exit code.
2. Read `mobile/.qa-output/latest/summary.txt` for the pass/fail table.
3. If anything failed, only then open the specific failing screenshot via the `Read` tool.

**Do not** manually drive `browse` commands screen-by-screen. The script already does that faster and more reliably.

**Do not** read every screenshot on every run — only read the ones that failed or that the user specifically asks about. Each screenshot is ~40KB of context.

## What it captures

Regular screens (one `capture` line each):

| Screen | URL | Required text |
|--------|-----|---------------|
| auth-login | `/auth` | "Split Bills" |
| dashboard | `/dashboard` | "Hey QA" |
| groups-list | `/groups` | "Your circles" |
| activity | `/activity` | "Recent" |
| you-menu | `/you` | "Account" |
| new-expense | `/new-expense` | "New Expense" |
| expenses-list | `/expenses` | "All Activity" |
| settlements | `/settlements` | "Balance Sheet" |
| upi-home | `/(upi)` | "UPI" |

Modals / bottom sheets (navigate to base, click trigger, capture):

| Screen | Base + Trigger | Required text |
|--------|---------------|---------------|
| groups-create-sheet | `/groups` → `[data-testid="groups-create-button"]` | "Create Group" |

Each screen:
1. Screenshot saved as `<name>.png` (must be ≥ 2KB — catches blank pages).
2. Page text scraped and grep'd for the required string (catches routing / auth / mount regressions).

## Flags

```bash
mobile/scripts/qa/run.sh              # full run (default)
mobile/scripts/qa/run.sh --fast       # skip seeding groups — empty-state only
mobile/scripts/qa/run.sh --keep-alive # leave dev servers running after capture
```

## What the script does

1. Kills stale node/python on 8000 / 8082.
2. Starts backend (`uvicorn app.main:app --port 8000`) + expo web (`expo start --web --port 8082`) in background.
3. Waits for bundle ready (greps `expo.log` for `Web Bundled`).
4. Registers a throwaway test user via `POST /api/auth/register` — unique email per run (`qa-<timestamp>@test.com`).
5. Seeds 3 groups via `POST /api/groups` so populated screens have data.
6. Launches `browse` at viewport 412×915 (mobile), injects the token into `localStorage` so the app boots logged in. Web auth uses `src/utils/secureStore.ts` which falls back to localStorage.
7. Navigates each screen, screenshots, asserts text content.
8. Writes `index.html` (grid of screenshots), `summary.txt` (pass/fail log), one PNG per screen.
9. Stops servers (unless `--keep-alive`).

## Output layout

```
mobile/.qa-output/
├── 20260422-000751/         ← timestamped run
│   ├── summary.txt
│   ├── index.html
│   ├── dashboard.png
│   ├── groups-list.png
│   ├── activity.png
│   ├── you-menu.png
│   ├── new-expense.png
│   ├── auth-login.png
│   ├── backend.log
│   └── expo.log
└── latest/                  ← copy of most recent run (same contents)
```

`.qa-output/` is gitignored.

## Extending — add a screen (MANDATORY for every new page/modal/popup)

**Rule:** every new route or modal introduced in the app must land with a matching `capture` line in this script in the same change. The QA script surfaces uncovered routes at the end of each run (see "Coverage gap detection" below). Uncovered routes print `UNCOVERED` lines as warnings; set `QA_STRICT=1` to make them hard failures.

### Regular screens (routes)

Edit `run.sh`, add one line in the capture block:

```bash
capture /settlements       settlements     "Balance Sheet"
```

Three positional args: URL path, screenshot name, substring that must appear in the page text (use title-case — CSS `textTransform: uppercase` doesn't affect the DOM text node).

### Modals, bottom sheets, popups

These don't have their own route — they open on top of a base screen. Use `capture_modal`:

```bash
capture_modal /groups groups-create-sheet \
  '[data-testid="groups-create-button"]'   "Create Group"
```

Four positional args: base URL path, screenshot name, CSS selector of the element that opens the modal, substring the modal must display. Add a `testID` prop to your trigger component if it doesn't already have one — query by `[data-testid="..."]`.

## Coverage gap detection

At the end of every run, the script walks `mobile/app/**` and flags every route file that no `capture` line targets. Example output:

```
--- route coverage ---
UNCOVERED  /groups/:groupId  (add a capture line for this route)
  uncovered: 1
```

Non-fatal by default. To make a clean coverage run mandatory in CI or pre-ship checks, run with `QA_STRICT=1`:

```bash
QA_STRICT=1 mobile/scripts/qa/run.sh
# exits 2 if any route is uncovered
```

For dynamic routes (`[groupId].tsx`), provide a concrete seeded ID in the capture call. Seed the data at the top of the script like the test groups.

## Prerequisites

- Python 3 (for backend + JSON parsing in the script)
- Node + pnpm (already required by the mobile project)
- gstack `browse` binary at `~/.claude/skills/gstack/browse/dist/browse`
- `react-dom@19.2.0` (already pinned in `mobile/package.json`)
- `mobile/src/utils/secureStore.ts` (web-compatible SecureStore shim)

All of the above are already in place.

## Troubleshooting

**Backend didn't start** — check `mobile/.qa-output/latest/backend.log`. Usually a port conflict or venv issue.

**Expo bundle stuck** — check `mobile/.qa-output/latest/expo.log`. Watch for `Web Bundled` line; if Metro hangs, kill node processes manually and retry.

**All screens fail "missing text"** — likely the auth injection didn't take. The `secureStore.ts` shim is required; verify it exists and that `AuthContext.tsx` / `api/client.ts` import from `../utils/secureStore` (not `expo-secure-store` directly).

**Screenshots are all blank** — React/react-dom version mismatch. `mobile/package.json` should pin `"react-dom": "19.2.0"` to match `react`. Verify with `pnpm ls react react-dom`.

## Why this exists

Before this script, visual verification meant: start backend manually → start expo manually → sign up manually → click through screens → screenshot each → stop servers. About 15 tool calls and 10+ minutes of Claude driving the browser step-by-step. Now it's one command and a single text file to read.
