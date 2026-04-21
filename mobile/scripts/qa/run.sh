#!/usr/bin/env bash
# Visual QA — fully automated.
#
# What it does:
#   1. Kills stale node/python processes on 8000/8082
#   2. Starts backend (FastAPI :8000) + expo web (:8082) in background
#   3. Registers a throwaway test user via API, grabs token
#   4. Seeds a handful of groups via API so populated screens have data
#   5. Injects auth into localStorage so the web app boots logged in
#   6. Drives the gstack browse tool to screenshot every key screen
#   7. Runs per-screen text assertions (fails fast on layout regression)
#   8. Writes qa-output/<stamp>/index.html and screenshots + summary.txt
#   9. Stops servers and cleans up
#
# Usage:
#   mobile/scripts/qa/run.sh              # full run (headless)
#   mobile/scripts/qa/run.sh --headed     # visible Chromium window — watch the flow
#   mobile/scripts/qa/run.sh --keep-alive # leave dev servers running after capture
#   mobile/scripts/qa/run.sh --fast       # skip seed groups (empty-state only)
#   mobile/scripts/qa/run.sh --slow       # extra pauses (pair with --headed to watch)
#
# Output:
#   mobile/.qa-output/<stamp>/
#     summary.txt        Human-readable pass/fail per screen
#     index.html         Grid of all screenshots
#     <screen>.png       One PNG per screen
#   mobile/.qa-output/latest/  Always symlinks/copies the most recent run
#
# Exit code: 0 if all assertions pass, 1 if any screen fails.

set -u

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BACKEND_DIR="$ROOT/backend"
MOBILE_DIR="$ROOT/mobile"
OUT_BASE="$MOBILE_DIR/.qa-output"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$OUT_BASE/$STAMP"
LATEST="$OUT_BASE/latest"

BROWSE="${BROWSE:-$HOME/.claude/skills/gstack/browse/dist/browse}"
if [ ! -x "$BROWSE" ]; then
  echo "[qa] ERROR: browse binary not found at $BROWSE"
  echo "[qa] Install gstack or set BROWSE=/path/to/browse"
  exit 2
fi

mkdir -p "$OUT"
SUMMARY="$OUT/summary.txt"
: > "$SUMMARY"
log() { echo "[qa] $*" | tee -a "$SUMMARY"; }

# ── Config ───────────────────────────────────────────────────────────────────
KEEP_ALIVE=0
SEED_GROUPS=1
HEADED=0
PAUSE_SEC=2
for arg in "$@"; do
  case "$arg" in
    --keep-alive) KEEP_ALIVE=1 ;;
    --fast) SEED_GROUPS=0 ;;
    --headed) HEADED=1; PAUSE_SEC=3 ;;
    --slow) PAUSE_SEC=5 ;;
  esac
done

BACKEND_URL="http://localhost:8000"
WEB_URL="http://localhost:8082"
PASS_COUNT=0
FAIL_COUNT=0

# ── Cleanup ──────────────────────────────────────────────────────────────────
cleanup() {
  if [ "$KEEP_ALIVE" = "1" ]; then
    log "dev servers left running (--keep-alive)"
    return
  fi
  log "cleanup: stopping servers"
  if [ "$HEADED" = "1" ]; then
    # Return browse to headless mode but leave the binary alive.
    "$BROWSE" disconnect >/dev/null 2>&1 || true
  fi
  "$BROWSE" stop >/dev/null 2>&1 || true
  # Kill by port where possible, fallback to blanket kill.
  if command -v taskkill >/dev/null 2>&1; then
    taskkill //F //IM node.exe //T >/dev/null 2>&1 || true
    taskkill //F //IM python.exe //T >/dev/null 2>&1 || true
  else
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    pkill -f "expo start --web" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# ── Start backend ────────────────────────────────────────────────────────────
log "== visual QA run $STAMP =="
log "starting backend (:8000)"
(
  cd "$BACKEND_DIR" && python -m uvicorn app.main:app --reload --port 8000 \
    > "$OUT/backend.log" 2>&1 &
)

for i in $(seq 1 30); do
  if curl -sf "$BACKEND_URL/docs" >/dev/null 2>&1 ||
     curl -sf "$BACKEND_URL/" >/dev/null 2>&1 ||
     curl -s "$BACKEND_URL/api" 2>/dev/null | head -1 >/dev/null; then
    log "backend ready"
    break
  fi
  sleep 1
  [ "$i" = "30" ] && { log "ERROR: backend failed to start (see $OUT/backend.log)"; exit 1; }
done

# ── Start expo web ───────────────────────────────────────────────────────────
log "starting expo web (:8082)"
(
  cd "$MOBILE_DIR" && npx expo start --web --port 8082 \
    > "$OUT/expo.log" 2>&1 &
)

for i in $(seq 1 120); do
  if grep -q "Web Bundled" "$OUT/expo.log" 2>/dev/null; then
    log "expo bundle ready"
    break
  fi
  sleep 2
  [ "$i" = "120" ] && { log "ERROR: expo bundle failed (see $OUT/expo.log)"; exit 1; }
done

# ── Register test user + seed data ───────────────────────────────────────────
EMAIL="qa-$(date +%s)@test.com"
log "registering test user: $EMAIL"
REG_JSON=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"QA Tester\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")

TOKEN=$(printf '%s' "$REG_JSON" | python -c "import sys,json;d=json.load(sys.stdin);print(d.get('token',''))")
USER_JSON=$(printf '%s' "$REG_JSON" | python -c "import sys,json;d=json.load(sys.stdin);print(json.dumps(d.get('user',{})))")

if [ -z "$TOKEN" ]; then
  log "ERROR: register failed. Response: $REG_JSON"
  exit 1
fi
log "token acquired"

if [ "$SEED_GROUPS" = "1" ]; then
  log "seeding groups"
  for g in "Weekend Trip" "Roommates" "Goa Plan"; do
    curl -sf -X POST "$BACKEND_URL/api/groups" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"name\":\"$g\",\"member_emails\":[],\"currency\":\"INR\"}" >/dev/null
  done
  log "seeded 3 groups"
fi

# ── Launch browse ────────────────────────────────────────────────────────────
if [ "$HEADED" = "1" ]; then
  log "launching browse in HEADED mode (visible Chromium window)"
  "$BROWSE" connect >/dev/null 2>&1 || true
else
  log "launching browse in headless mode (use --headed to watch)"
fi
"$BROWSE" viewport 412x915 >/dev/null
"$BROWSE" goto "$WEB_URL/auth" >/dev/null
sleep 3

# Wait for React to mount
for i in $(seq 1 30); do
  MOUNTED=$("$BROWSE" js "document.getElementById('root').children.length > 0" 2>/dev/null | head -1)
  [ "$MOUNTED" = "true" ] && break
  sleep 1
done

# ── Capture + assert helper ──────────────────────────────────────────────────
# Assertion strings match the RAW DOM text content — CSS textTransform is
# applied visually but Text child nodes retain their original casing.
capture() {
  local path="$1"; local name="$2"; local must_contain="${3:-}"
  "$BROWSE" goto "$WEB_URL$path" >/dev/null
  sleep "$PAUSE_SEC"
  _capture_finalize "$path" "$name" "$must_contain"
}

# capture_modal — for bottom sheets, popups, dialogs that open on top of a base
# screen. Navigates to the base path, clicks the trigger, then screenshots +
# asserts the modal content.
#
# Usage:
#   capture_modal <base_path> <name> <trigger_selector> [must_contain]
# Example:
#   capture_modal /groups groups-create-sheet \
#     '[data-testid="groups-create-button"]' "Create Group"
capture_modal() {
  local path="$1"; local name="$2"; local trigger="$3"; local must_contain="${4:-}"
  "$BROWSE" goto "$WEB_URL$path" >/dev/null
  sleep "$PAUSE_SEC"
  if ! "$BROWSE" click "$trigger" >/dev/null 2>&1; then
    log "FAIL  $name  (trigger not clickable: $trigger)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return
  fi
  sleep "$PAUSE_SEC"
  _capture_finalize "$path#modal" "$name" "$must_contain"
}

_capture_finalize() {
  local path="$1"; local name="$2"; local must_contain="$3"
  "$BROWSE" screenshot "$OUT/$name.png" >/dev/null 2>&1
  local size
  size=$(wc -c < "$OUT/$name.png" 2>/dev/null || echo 0)
  CAPTURED_NAMES="$CAPTURED_NAMES $name"
  CAPTURED_PATHS="$CAPTURED_PATHS $path"

  if [ "$size" -lt 2000 ]; then
    log "FAIL  $name  (screenshot too small: ${size} bytes)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return
  fi

  if [ -n "$must_contain" ]; then
    local text
    text=$("$BROWSE" text 2>/dev/null | tr -d '\n')
    if ! printf '%s' "$text" | grep -qF "$must_contain"; then
      log "FAIL  $name  (missing text: '$must_contain')"
      log "      page text start: $(printf '%s' "$text" | head -c 120)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      return
    fi
  fi

  log "PASS  $name  ($size bytes)"
  PASS_COUNT=$((PASS_COUNT + 1))
}

CAPTURED_NAMES=""
CAPTURED_PATHS=""

log "--- capturing screens ---"

# Auth first — before localStorage is populated so the route doesn't redirect.
capture /auth              auth-login      "Split Bills"

# Inject auth into localStorage (AsyncStorage on web is backed by localStorage,
# and the SecureStore shim in src/utils/secureStore.ts also uses localStorage).
log "injecting auth"
TOKEN_JSON=$(printf '%s' "$TOKEN" | python -c "import sys,json;print(json.dumps(sys.stdin.read().strip()))")
cat > /tmp/qa-auth-inject.js <<JS
(() => {
  localStorage.setItem('token', $TOKEN_JSON);
  localStorage.setItem('user', $(printf '%s' "$USER_JSON" | python -c "import sys,json;print(json.dumps(sys.stdin.read().strip()))"));
  return 'ok';
})()
JS
"$BROWSE" eval /tmp/qa-auth-inject.js >/dev/null

# Authenticated screens — assertion strings use raw casing (no CSS uppercase).
capture /dashboard         dashboard       "Hey QA"
capture /groups            groups-list     "Your circles"
capture /activity          activity        "Recent"
capture /you               you-menu        "Account"
capture /new-expense       new-expense     "New Expense"
capture /expenses          expenses-list   "All Activity"
capture /settlements       settlements     "Balance Sheet"
capture "/(upi)"           upi-home        "UPI"

# Modals / bottom sheets — open them and capture their content.
# Pattern: capture_modal <base_path> <name> <trigger_selector> [must_contain]
capture_modal /groups      groups-create-sheet \
  '[data-testid="groups-create-button"]'      "Create Group"

# ── Generate index.html ──────────────────────────────────────────────────────
{
  echo "<!DOCTYPE html>"
  echo "<html><head><title>QA $STAMP</title><style>"
  echo "body{font-family:-apple-system,sans-serif;margin:24px;background:#fafafa}"
  echo "h1{margin-top:0}.summary{background:#fff;padding:16px;border-radius:8px;margin-bottom:20px;white-space:pre-wrap;font-family:monospace;font-size:13px}"
  echo ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}"
  echo ".cell{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05)}"
  echo ".cell img{width:100%;display:block}"
  echo ".cell h3{margin:0;padding:12px 16px;background:#f4f4f4;font-size:14px}"
  echo "</style></head><body>"
  echo "<h1>Visual QA — $STAMP</h1>"
  echo "<div class=\"summary\">$(cat "$SUMMARY" | sed 's/</\&lt;/g')</div>"
  echo "<div class=\"grid\">"
  for f in "$OUT"/*.png; do
    [ -f "$f" ] || continue
    n=$(basename "$f" .png)
    echo "<div class=\"cell\"><h3>$n</h3><img src=\"$n.png\"></div>"
  done
  echo "</div></body></html>"
} > "$OUT/index.html"

# ── Coverage gap detection ──────────────────────────────────────────────────
# Enumerate every route under mobile/app/** and warn about any that are not
# exercised by a capture above. New screens must be added to this script.
log ""
log "--- route coverage ---"
UNCOVERED=""
UNCOVERED_COUNT=0

# Extract all potential routes. Exclude: __tests__, README.md, _layout, _*.
ROUTES=$(find "$MOBILE_DIR/app" -type f \( -name "*.tsx" -o -name "*.ts" \) \
  2>/dev/null \
  | grep -v "__tests__" \
  | grep -v "_layout\." \
  | grep -v "/\(_\|README" \
  | grep -v "^$MOBILE_DIR/app/\(_layout\|\\+not-found\|_error\)\." \
  | sed "s|^$MOBILE_DIR/app||" \
  | sed 's|\.tsx$||;s|\.ts$||' \
  | sed 's|/index$||' \
  | sed 's|\[\([^]]*\)\]|:\1|g' \
  | sort -u)

for route in $ROUTES; do
  # Normalize: /(tabs)/dashboard → /dashboard, /(upi)/index → /(upi)
  norm=$(echo "$route" | sed 's|/(tabs)||' | sed 's|/index$||')
  [ -z "$norm" ] && norm="/"

  # Strip dynamic segments for matching (e.g. /groups/:groupId → /groups)
  base=$(echo "$norm" | sed 's|/:[^/]*||g')

  # Is there ANY capture whose path starts with this base?
  hit=0
  for captured in $CAPTURED_PATHS; do
    cap_base=$(echo "$captured" | sed 's|#.*$||')
    if [ "$cap_base" = "$norm" ] || [ "$cap_base" = "$base" ]; then
      hit=1
      break
    fi
  done

  # Known-skip routes (auth-gate, redirect stubs, etc.)
  case "$norm" in
    /auth|/\(tabs\)|/\(upi\)/*|/+not-found) hit=1 ;;
  esac

  if [ "$hit" = "0" ]; then
    UNCOVERED="$UNCOVERED $norm"
    UNCOVERED_COUNT=$((UNCOVERED_COUNT + 1))
    log "UNCOVERED  $norm  (add a capture line for this route)"
  fi
done

if [ "$UNCOVERED_COUNT" = "0" ]; then
  log "  all routes have capture coverage"
fi

# ── Final summary (write before copying to latest so latest has it too) ─────
log ""
log "═══ QA summary ═══"
log "  passed:    $PASS_COUNT"
log "  failed:    $FAIL_COUNT"
log "  uncovered: $UNCOVERED_COUNT"
log "  output:    $OUT"
log "  report:    $OUT/index.html"

# ── Latest pointer ───────────────────────────────────────────────────────────
rm -rf "$LATEST" 2>/dev/null || true
cp -r "$OUT" "$LATEST"
log "  latest:  $LATEST"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
if [ "$UNCOVERED_COUNT" -gt 0 ]; then
  # Non-fatal by default — surfaces gaps without blocking a clean QA run.
  # Set QA_STRICT=1 to fail the script when uncovered routes exist.
  if [ "${QA_STRICT:-0}" = "1" ]; then
    exit 2
  fi
fi
exit 0
