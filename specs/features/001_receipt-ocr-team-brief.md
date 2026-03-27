# Feature Team Brief: Receipt Scanning via OCR

## At a Glance

GoDutch is building an OCR-powered receipt scanning flow that takes a user from photo capture to a confirmed expense split in under 30 seconds. The pivotal architectural bet is on-device OCR (Apple Vision on iOS, ML Kit on Android) for zero latency and privacy-by-default, with a cloud fallback if real-world accuracy falls below the 85% parse-success target. The primary acceptance bar is that 85% of scans of printed receipts produce a usable grand total within ±$0.05, with no dead-end error states under any failure condition.

---

## Frontend Plan

### 1. Screen Inventory

| Screen | Purpose | Trigger |
|---|---|---|
| **Camera Capture Screen** | Opens device camera so user can frame and capture the receipt | User taps "Scan receipt" on the home/new-expense screen |
| **OCR Processing Overlay** | Full-screen modal showing parse-in-progress loading state | Automatically shown after capture; dismissed when parsing completes or errors |
| **Confirmation & Edit Screen** | Shows all extracted fields in an editable form for user review before confirming | OCR parse returns a result (success or partial) |
| **Manual Entry Screen** | Pre-filled fallback form for when OCR fails entirely | "Enter manually" CTA on error banner, or user proactively skips scanning |
| **Scan Quality Guidance Overlay** (P1) | Real-time camera overlay hints before capture ("Move closer," "Better lighting") | Active while camera viewfinder is displayed |

### 2. Component Breakdown

**New components to build:**

- `ReceiptCameraView` — wraps the native camera module; handles permission requests, viewfinder rendering, and tap-to-capture gesture. Props: `onCapture(imageUri)`, `onPermissionDenied()`.
- `OcrLoadingOverlay` — full-screen modal with animated pulse and copy ("Reading your receipt..."). Props: `visible: boolean`.
- `ReceiptConfirmationForm` — central screen component; renders all six parsed fields as tappable `EditableField` inputs, auto-recalculates grand total in real time. Props: `parsedData: ParsedReceipt`, `onConfirm(data)`, `onRetake()`.
- `EditableField` — a labeled text input styled as read-only until tapped, with a low-confidence amber underline flag. Props: `label`, `value`, `isLowConfidence: boolean`, `onChangeText`.
- `TotalReconciliationBanner` — inline warning when `subtotal + tax + tip` does not equal `total`. Stateless display component.
- `ErrorBanner` — non-blocking top banner for soft failures. Props: `message`, `onDismiss`, `onRetake`, `onManualEntry`.
- `TipSelector` (P1) — quick-pick chip row (15%, 18%, 20%, Custom) shown when no tip line detected. Props: `subtotal`, `onTipSelected(amount)`.

**Existing components to reuse:** Standard `TextInput`, `Button`, `Screen` layout wrapper from the existing design system.

### 3. User Flow

**Happy path:**
1. User taps "Scan receipt" → `ReceiptCameraView` opens (camera launches within 2s).
2. User frames the receipt → taps the capture button.
3. `OcrLoadingOverlay` appears; image submitted to OCR pipeline.
4. Parse completes → `ReceiptConfirmationForm` displays all six fields (merchant, date, subtotal, tax, tip, total).
5. High-confidence fields appear clean; any low-confidence field carries an amber underline cue.
6. If `subtotal + tax + tip` does not equal `total` → `TotalReconciliationBanner` appears inline.
7. User reviews, optionally edits any field (grand total recalculates live).
8. User taps "Confirm" → expense created, user proceeds to participant selection.

**Primary error path (OCR fails / low confidence):**
1. Steps 1–3 same as above.
2. Parse returns failure or confidence below threshold → `OcrLoadingOverlay` dismissed.
3. `ErrorBanner` appears: "We could not read that receipt clearly. Try again with better lighting or enter the details yourself."
4. Two CTAs: "Retake photo" (returns to camera) and "Enter manually" (opens `ManualEntryScreen` with blank or partial fields).

**Edge-case paths:**
- **Camera permission denied:** `ReceiptCameraView` shows a permission-request UI; if permanently denied, deep-links to system settings with explanatory copy.
- **Retake after partial parse:** Tapping "Retake" on the confirmation screen discards all parsed data, returns to camera view fresh.
- **Multiple payment methods on receipt:** Fields display whatever was parsed; user corrects the total manually — no special UI for v1.
- **Image import from photo library (P1):** Alternate entry point on the camera screen; flows into the same OCR pipeline and confirmation screen.

### 4. State Management

| State piece | Where it lives | Notes |
|---|---|---|
| `cameraPermissionStatus` | Local to `ReceiptCameraView` | Checked on mount; not persisted |
| `capturedImageUri` | Local to the scan flow (ephemeral) | Discarded after parsing; never written to persistent storage |
| `ocrLoading: boolean` | Local to the scan flow screen | |
| `parsedReceipt: ParsedReceipt` | Local to `ReceiptConfirmationForm` | Original parse result kept for retake discard logic |
| `editedReceipt: ParsedReceipt` | Local component state in form | Updated on every field change; grand total is a derived value |
| `vendorHistory` (P1) | App-level persistent cache (AsyncStorage) | Keyed by merchant name; used to pre-fill category tag |
| `activeExpenseDraft` | Shared app state | Populated on "Confirm"; carries confirmed receipt data into split flow |

Nothing in this feature flow needs server-side persistence for v1 (images are ephemeral by design).

### 5. API Consumption Points

**POST /api/receipts/parse** (or on-device native module equivalent)

- **Trigger:** Immediately after image capture
- **Request:** `{ imageBase64: string, mimeType: "image/jpeg" }` (cloud path) or native bridge call (on-device path)
- **Success response:** Structured JSON with all six field values, confidence map per field, and `parseStatus: "success" | "partial" | "failed"`
- **Failure responses and UI handling:**
  - `422 PARSE_FAILED` → show `ErrorBanner`, offer retake or manual entry
  - `413 IMAGE_TOO_LARGE` → show inline message, suggest retake
  - `504 OCR_TIMEOUT` → show `ErrorBanner` with retry option
  - `500 INTERNAL_ERROR` → show `ErrorBanner`, offer manual entry

### 6. Design Considerations

**From the spec:**
- Camera screen should feel native and fast — no heavy chrome or instruction text that slows down the moment.
- Confirmation screen is the most important screen in the flow. Edits should feel easy and expected, not like a failure.
- Error states must be friendly and instructional — never a raw error code.

**Additional notes:**
- **Loading/skeleton state:** `OcrLoadingOverlay` uses an animated pulse; copy cycles to "Almost there..." after 3 seconds to reassure on slow parses.
- **Accessibility:** All `EditableField` inputs have accessible labels. Capture button has an accessibility label ("Take photo of receipt"). Low-confidence indicator uses both color (amber) AND a text hint ("Review this field") for color-blind users. All tap targets minimum 44×44pt.
- **Haptics:** Light haptic on successful capture; error haptic on parse failure.
- **Small phone handling:** `ReceiptConfirmationForm` uses a `ScrollView`; "Confirm" button pinned to bottom safe area.
- **Animation:** `OcrLoadingOverlay` fades in/out (~200ms) to avoid jarring transitions.

### 7. Frontend Implementation Checklist

**Foundation**
- [ ] Add "Scan receipt" entry point to the new-expense screen (button + navigation route)
- [ ] Scaffold `ReceiptCameraView` screen with navigation header and back button
- [ ] Wire camera permission flow (request → granted / denied states)
- [ ] Integrate native camera module (React Native Camera or Expo Camera); confirm capture works on iOS and Android

**Data layer**
- [ ] Define `ParsedReceipt` TypeScript type (all six fields + confidence map + parseStatus)
- [ ] Build `useOcrParse` hook: accepts `imageUri`, calls parse API/native module, returns `{ data, loading, error }`
- [ ] Implement on-device OCR bridge (Apple Vision / ML Kit) OR cloud API client — based on architecture decision
- [ ] Add confidence threshold logic: flag low-confidence fields; set `parseStatus: "failed"` if global confidence below floor

**UI — Camera screen**
- [ ] Implement `OcrLoadingOverlay` with animated pulse and copy cycling after 3 seconds
- [ ] Add "Retake" flow: discard state, return to camera
- [ ] Add photo library import entry point (P1, can be deferred)

**UI — Confirmation screen**
- [ ] Build `ReceiptConfirmationForm` with all six `EditableField` instances
- [ ] Implement live grand total recalculation when subtotal / tax / tip change
- [ ] Build `TotalReconciliationBanner` and wire to discrepancy detection
- [ ] Style low-confidence `EditableField` with amber underline and accessibility hint
- [ ] Pin "Confirm" button to bottom safe area; ensure `ScrollView` works on small screens

**UI — Error states**
- [ ] Build `ErrorBanner` with "Retake" and "Enter manually" CTAs
- [ ] Wire "Enter manually" to `ManualEntryScreen` (pre-filled with any partial parse data)
- [ ] Camera permission denied state: settings deep-link UI

**Polish**
- [ ] Add haptic feedback on capture and on parse error
- [ ] Add loading copy cycle (3-second delay)
- [ ] Accessibility audit: tap targets, screen reader labels, color-blind safe indicators
- [ ] Add `TipSelector` quick-pick component (P1)
- [ ] Add vendor memory pre-fill for category tag (P1)

**QA prep**
- [ ] Unit tests for live total recalculation logic
- [ ] Unit tests for confidence threshold classification
- [ ] Manual test on both iOS and Android across multiple device sizes

---

## Backend Plan

### 1. Data Models

**`ParsedReceiptResult`** (ephemeral — not persisted to database in v1)

```
ParsedReceiptResult {
  merchant:    string | null
  date:        string | null        // ISO 8601 date string
  subtotal:    number | null        // decimal, two-decimal precision
  tax:         number | null
  tip:         number | null
  total:       number | null
  confidence: {
    merchant:  float 0.0-1.0
    date:      float 0.0-1.0
    subtotal:  float 0.0-1.0
    tax:       float 0.0-1.0
    tip:       float 0.0-1.0
    total:     float 0.0-1.0
  }
  parseStatus: "success" | "partial" | "failed"
  rawText:     string | null        // full OCR text, debug log only, never stored
}
```

**`Expense`** (existing model — two new fields via migration):
- `source: "ocr" | "manual" | "voice"` (new enum value)
- `merchant: string | null` (new nullable field)

**`VendorMemory`** (new, persistent — P1):
```
VendorMemory {
  id:           uuid
  userId:       uuid (FK -> users)
  merchantName: string (normalized lowercase)
  categoryTag:  string
  lastSeenAt:   timestamp
}
```

### 2. API Endpoints

#### POST /api/receipts/parse

**Auth:** Required (JWT bearer token).

**Request body:**
```json
{
  "image": "<base64-encoded string>",
  "mimeType": "image/jpeg | image/png",
  "clientTimestamp": "<ISO 8601, optional>"
}
```

**Success response (200):**
```json
{
  "parseStatus": "success | partial",
  "merchant": "string | null",
  "date": "string | null",
  "subtotal": 12.50,
  "tax": 1.13,
  "tip": 2.00,
  "total": 15.63,
  "confidence": {
    "merchant": 0.92,
    "date": 0.88,
    "subtotal": 0.95,
    "tax": 0.91,
    "tip": 0.78,
    "total": 0.97
  }
}
```

**Error responses:**

| Status | Error code | Condition |
|---|---|---|
| 422 | `PARSE_FAILED` | Global confidence below threshold; no usable fields extracted |
| 422 | `IMAGE_UNREADABLE` | Image is corrupt, too dark, or OCR engine returned empty text |
| 413 | `IMAGE_TOO_LARGE` | Image exceeds 8 MB limit |
| 400 | `INVALID_MIME` | Unsupported image type |
| 504 | `OCR_TIMEOUT` | Cloud OCR service exceeded 5 s SLA (cloud path only) |
| 500 | `INTERNAL_ERROR` | Unexpected failure; error logged server-side |

**Note on on-device path:** If the team chooses on-device OCR, this endpoint is not needed for parsing — it is done via the native bridge. The endpoint is the cloud fallback. The response shape is identical either way, so the frontend is fully decoupled from the decision.

### 3. Business Logic

**Parse pipeline (step by step):**

1. **Receive and validate image** — decode base64, validate MIME type and file size. Reject early if invalid.
2. **Invoke OCR engine** — pass image bytes to the selected engine (on-device native module or cloud API). Receive raw text blocks with bounding boxes and per-block confidence scores.
3. **Field extraction** — run regex and heuristic matchers against raw text for each of the six fields:
   - `merchant`: First non-date, non-numeric line near the top of the receipt (or largest font block if bounding box data available).
   - `date`: Match common date formats (MM/DD/YYYY, Month DD YYYY, etc.).
   - `subtotal`: Line labeled "Subtotal," "Sub Total," or a similar label pattern.
   - `tax`: Line labeled "Tax," "HST," "GST," "VAT."
   - `tip`: Line labeled "Tip," "Gratuity," "Service charge."
   - `total`: Line labeled "Total," "Amount Due," "Grand Total" — prefer the largest monetary value near the bottom.
4. **Confidence assignment** — each field gets a score: OCR engine block-level confidence multiplied by field-extraction heuristic confidence. Unmatched fields return `null` value and `0.0` confidence.
5. **Total reconciliation check** — compute `subtotal + tax + tip`. If delta vs. extracted total exceeds $0.05, flag `reconciliationWarning: true` (frontend surfaces the reconciliation banner).
6. **Parse status determination:**
   - `"success"`: `total` confidence >= threshold (e.g., 0.80) and at least 4 of 6 fields extracted.
   - `"partial"`: `total` extracted but some fields missing or low-confidence.
   - `"failed"`: `total` not extractable or global confidence below floor.
7. **Return result** — send structured JSON. Raw image and raw OCR text are NOT stored; discarded after response is sent.

**Silent failure risk:** The heuristic matcher for `total` might pick up a subtotal line if the receipt uses ambiguous labeling (e.g., "Total" appears twice). Mitigation: prefer the bottom-most occurrence and the highest monetary value near the bottom of the receipt.

### 4. External Integrations

**Option A — On-device OCR (preferred for v1):**
- **iOS:** Apple Vision Framework (`VNRecognizeTextRequest`). Invoked via a React Native native module. Returns text observations with bounding boxes and per-character confidence. Zero network calls; processes in approximately 1–2 seconds on modern hardware.
- **Android:** Google ML Kit Text Recognition (`TextRecognizer`). Similar API surface; returns `Text` blocks with bounding boxes and confidence.
- **Exposure to JS:** `NativeOcrModule.parseImage(base64: string): Promise<OcrRawResult>`
- **Failure modes:** Engine returns empty result → `PARSE_FAILED`. Engine throws unexpectedly → `INTERNAL_ERROR`.

**Option B — Cloud OCR fallback:**
- **Services:** Google Cloud Vision or AWS Textract (Textract has a native receipt parsing mode).
- **Invocation:** HTTPS POST with image bytes. Approximately 2–4 second round-trip.
- **Failure modes:** Timeout (>5s) → `OCR_TIMEOUT`; API error → `INTERNAL_ERROR`.
- **Privacy note:** Image bytes transmitted over HTTPS; GoDutch does not store them. Third-party data retention policies apply (a risk to disclose to users).

**Architecture recommendation:** Build the on-device path first; instrument confidence scores in production; switch to cloud only if real-world accuracy falls below the 85% target.

### 5. Storage & Persistence

| Data | Storage location | Retention | Notes |
|---|---|---|---|
| Raw receipt image | Not stored | Discarded after parse | Privacy-first per spec |
| Raw OCR text | Server-side debug log only | 7 days | Never accessible to client; purged on schedule |
| `ParsedReceiptResult` | Not stored | Ephemeral (in-memory per request) | Only user-confirmed values travel forward |
| User-confirmed expense fields | `expenses` table (DB) | Per user account retention | `source: "ocr"` tag allows attribution tracking |
| `VendorMemory` records (P1) | `vendor_memory` table (DB) | Indefinite (user-owned) | Clearable from user settings |

### 6. Error Handling Strategy

**Expected errors (returned to client):**

| Error | Response | Log level |
|---|---|---|
| `PARSE_FAILED` | 422 + error body | INFO (metric: parse failure rate) |
| `IMAGE_UNREADABLE` | 422 + error body | INFO |
| `IMAGE_TOO_LARGE` | 413 + error body | INFO |
| `OCR_TIMEOUT` | 504 + error body | WARN (alert if rate spikes) |
| `INVALID_MIME` | 400 + error body | INFO |

**Unexpected errors (server-side):**

| Error | Response | Log level |
|---|---|---|
| OCR engine crash | 500, `INTERNAL_ERROR` | ERROR (alert on-call) |
| Malformed image bytes post-decode | 422, `IMAGE_UNREADABLE` | WARN |
| DB write failure (expense save) | 500, `INTERNAL_ERROR` | ERROR |

All errors are caught at the API handler level. No raw stack traces returned to the client. Errors tagged with a `requestId` for log correlation.

### 7. Backend Implementation Checklist

**Data model**
- [ ] Write migration: add `source` enum field to `expenses` table
- [ ] Write migration: add `merchant` field to `expenses` table
- [ ] Write migration: create `vendor_memory` table (P1 — can defer)
- [ ] Generate/update TypeScript types from schema

**Core OCR logic**
- [ ] Implement `NativeOcrModule` (iOS): wrap `VNRecognizeTextRequest`, expose to JS
- [ ] Implement `NativeOcrModule` (Android): wrap ML Kit `TextRecognizer`, expose to JS
- [ ] Write `extractFields(rawOcrText)` function: regex + heuristic matchers for all six fields
- [ ] Write `assignConfidence(ocrBlocks, extractedFields)`: combine block-level and heuristic confidence
- [ ] Write `determineParseStatus(fields, confidenceMap)`: success / partial / failed logic
- [ ] Write `checkTotalReconciliation(subtotal, tax, tip, total)`: delta check with $0.05 tolerance
- [ ] Unit test all extraction and confidence functions with fixture receipts (varied formats)

**API layer**
- [ ] Scaffold `POST /api/receipts/parse` route with auth middleware
- [ ] Add request validation (MIME type, base64 decode, size check)
- [ ] Wire extraction pipeline to route handler
- [ ] Implement structured error responses for all documented error codes
- [ ] Add `requestId` to all error logs

**Cloud OCR fallback (if needed)**
- [ ] Add cloud OCR client (Google Cloud Vision or Textract) behind a feature flag
- [ ] Implement 5-second timeout wrapper with `OCR_TIMEOUT` error handling
- [ ] Ensure image bytes are not logged or forwarded beyond the OCR call

**Observability**
- [ ] Add parse success / failure / partial rate metrics (Datadog or equivalent)
- [ ] Add parse latency histogram (target: p95 <= 5s)
- [ ] Set up alert: parse failure rate > 20% over a 5-minute window
- [ ] Set up log purge job: raw OCR text logs deleted after 7 days

**Integration**
- [ ] End-to-end test: submit real receipt image, assert correct field extraction
- [ ] End-to-end test: submit corrupt image, assert `IMAGE_UNREADABLE` response
- [ ] Load test: 50 concurrent parse requests; assert p95 < 5s

---

## QA Plan

### 1. Acceptance Criteria

**Camera Capture:**
> **Camera open latency:** Given the user is on the new-expense screen and has granted camera permission, when they tap "Scan receipt," then the in-app camera viewfinder opens within 2 seconds on both iOS and Android.

**OCR Parsing — field coverage:**
> **Field extraction completeness:** Given a standard printed restaurant receipt, when the user captures and submits the image, then the system attempts all six fields (merchant name, date, subtotal, tax, tip, grand total), and any field that cannot be parsed is returned as null — not populated with incorrect data.

**OCR Parsing — latency:**
> **Parse latency:** Given a standard device (iPhone 12 / Pixel 6 or equivalent), when a receipt image is submitted for parsing, then the parse completes and the confirmation screen is shown within 5 seconds.

**OCR Accuracy:**
> **Grand total accuracy:** Given a printed receipt with a legible grand total, when the image is processed, then the extracted grand total matches the actual receipt total within +/-$0.05 on at least 85% of scans (measured over a corpus of 100+ test receipts).

**Editable Confirmation Screen:**
> **Field editability:** Given a successful or partial parse, when the confirmation screen is displayed, then every extracted field is tappable and editable; editing subtotal, tax, or tip causes the grand total to update in real time without requiring a page reload or re-submit.

**Fallback to Manual Entry:**
> **No dead ends:** Given a parse that fails entirely (parseStatus: "failed"), when the result is returned, then a non-blocking error banner appears and the user is offered both a "Retake" option and an "Enter manually" option leading to a manual entry form — there is no dead end.

**Scan Retry:**
> **Retake clears state:** Given the user is on the confirmation screen, when they tap "Retake," then the app returns to the camera viewfinder and all previously parsed data is discarded and replaced by the next scan.

**Confidence flagging:**
> **Low-confidence field indicator:** Given a field with confidence below the defined threshold, when the confirmation screen renders, then that field is visually flagged (amber underline or equivalent) to invite user review.

**Total reconciliation:**
> **Reconciliation warning:** Given that subtotal + tax + tip does not equal the extracted grand total (delta > $0.05), when the confirmation screen renders, then a reconciliation warning banner is displayed to the user.

### 2. Happy Path Scenarios

**Scenario A: Friend scanning a restaurant bill**

1. Open GoDutch -> tap "New Expense" -> tap "Scan receipt." Expected: camera opens within 2 seconds.
2. Frame the receipt in the viewfinder; tap the capture button. Expected: shutter animation fires; loading overlay appears.
3. Wait for parse to complete (<=5 seconds). Expected: confirmation screen appears with merchant name, date, subtotal, tax, tip, and grand total filled in.
4. Review fields — all correct. Tap "Confirm." Expected: expense created with `source: "ocr"`; user taken to participant selection.

**Scenario B: Roommate scanning a utility invoice**

1. Open GoDutch -> "New Expense" -> "Scan receipt." Camera opens.
2. Capture a PG&E invoice (printed, clear text, no tip line).
3. Confirmation screen shows: merchant = "PG&E", date = invoice date, subtotal = invoice amount, tax = null, tip = null, total = invoice amount.
4. Tip field is blank; P1 tip-suggestion chips appear if implemented — user dismisses.
5. User taps "Confirm." Expected: expense created correctly; vendor memory notes "PG&E" for future category pre-fill.

### 3. Edge Cases

1. **Crumpled or partially obscured receipt:** The receipt has a fold across the total line. Expected: `parseStatus: "partial"`, total field is null, confirmation screen shows blank total with low-confidence flag. User must fill it in before confirming.

2. **Receipt photographed at a steep angle (>45 degrees):** Perspective distortion reduces OCR accuracy. Expected: either a partial parse with low-confidence flags, or a failed parse that surfaces the error banner — never a silently wrong total.

3. **Low-light photo (dim restaurant lighting):** Image is dark but text is marginally readable. Expected: either a successful parse with lower confidence scores (fields flagged) or a clear `IMAGE_UNREADABLE` error with retake guidance — not a corrupted number.

4. **Receipt with ambiguous "Total" label (two totals):** Receipt shows "Subtotal: $20.00" and "Total: $20.00" and "Amount Due: $22.60" (after delivery fee). Expected: system extracts the bottom-most / largest total value; reconciliation warning fires since values do not match.

5. **Very long receipt exceeding size limit (>8 MB):** A grocery receipt photographed in high resolution. Expected: `IMAGE_TOO_LARGE` error returned; friendly message displayed; no crash.

6. **Camera permission revoked mid-session:** User grants permission, navigates away, revokes in settings, returns. Expected: camera screen detects permission denied on re-mount; shows explanation UI with deep-link to system settings. App does not crash.

7. **App backgrounded during parse:** User force-quits app or switches apps while OCR is running. Expected: on return, app shows the camera screen or new-expense entry point — not a frozen loading screen. No phantom expense created.

8. **Tip line labeled "Service charge":** Some receipts use non-standard labels. Expected: extracted into tip field if recognizably labeled; otherwise left null with user prompted to fill in. Reconciliation warning fires if total does not match.

9. **Foreign currency receipt (e.g., GBP, EUR):** Per spec, parsed but not auto-converted. Expected: numeric values extracted correctly; currency symbol ignored or stripped; user sees raw numbers and sets preferred currency manually. No crash or garbled output.

10. **Duplicate tap on capture button:** User double-taps before the first capture registers. Expected: only one capture event fires; button is debounced or disabled after first tap until result returns.

### 4. Error State Testing

**Parse completely fails:**
- Trigger: Image too dark / blurry for any text to be extracted (`parseStatus: "failed"`).
- Expected message: "We could not read that receipt clearly. Try again with better lighting or enter the details yourself."
- Expected app state: Error banner shown (non-blocking); user can tap "Retake" or "Enter manually." No dead end.

**Image too large:**
- Trigger: Image file exceeds size limit (8 MB).
- Expected message: "This photo is too large. Try retaking the receipt."
- Expected app state: Banner shown; user returned to camera or offered guidance. No progress lost.

**Parse times out (cloud OCR path):**
- Trigger: Cloud OCR service takes >5s and times out.
- Expected message: "This is taking longer than usual. Check your connection and try again."
- Expected app state: Loading overlay dismissed; error banner with retry and manual entry options. No partial state left behind.

**Camera permission denied:**
- Trigger: User taps "Scan receipt" but camera permission is denied.
- Expected message: "GoDutch needs camera access to scan receipts. You can allow this in your device settings."
- Expected app state: Settings deep-link button shown. App does not crash. User can also choose "Enter manually."

**Total reconciliation mismatch:**
- Trigger: Extracted `subtotal + tax + tip` does not equal extracted `total` (delta > $0.05).
- Expected UI: Reconciliation warning banner on confirmation screen ("The totals do not quite add up — please review").
- Expected app state: All fields remain editable. User can confirm with a mismatch still active (user override), ideally with a secondary confirmation prompt.

### 5. Performance Benchmarks

| What to measure | How to measure | Pass threshold |
|---|---|---|
| Camera open latency | Manual timing from "Scan receipt" tap to viewfinder visible | <= 2.0 seconds on target devices |
| Parse latency (on-device) | Automated test: time from `parseImage()` call to result callback | p95 <= 5.0 seconds on iPhone 12 / Pixel 6 |
| Parse latency (cloud path) | Automated test with network instrumentation | p95 <= 5.0 seconds including network round-trip |
| Grand total accuracy | Batch test: 100+ receipts vs. ground truth | >= 85% within +/-$0.05 |
| Parse success rate | Production metric (days 1-14): non-failed parses / total scans | >= 85% |
| Fallback-to-manual rate | Production metric: "Enter manually" taps / total scan attempts | <= 15% |
| Confirmation screen edit rate | Production metric: scans where user modifies at least one field | <= 25% |
| Time from scan to confirmed split | Production metric: median time from "Scan receipt" to "Confirm" | <= 30 seconds |

### 6. Integration Test Points

**Image submission to parse result:**
- Data crossing the boundary: `imageBase64` (request) and `ParsedReceiptResult` JSON (response).
- Assert: Response contains all six fields (values may be null). Confidence map present with floats 0–1 per field. `parseStatus` is one of `"success" | "partial" | "failed"`.
- Assert: A null field value is never accompanied by a non-zero confidence score.
- Async timing: Confirm the frontend loading overlay stays visible for the full duration of the async parse call and is not dismissed prematurely.

**Total reconciliation flag:**
- Data: `subtotal`, `tax`, `tip`, `total` in the API response.
- Assert: When `subtotal + tax + tip - total > 0.05`, the `TotalReconciliationBanner` renders. Test with a mock response carrying a $0.06 discrepancy.

**Error code to UI message mapping:**
- For each documented error code (`PARSE_FAILED`, `IMAGE_UNREADABLE`, `IMAGE_TOO_LARGE`, `OCR_TIMEOUT`, `INTERNAL_ERROR`), assert the correct user-friendly copy appears and the correct recovery options are shown.
- Use mock API responses; do not depend on real OCR failures.

**Confirmed expense creation:**
- Data: User-edited `ParsedReceipt` fields submitted to expense creation.
- Assert: Created expense has `source: "ocr"`, correct `merchant`, and the user-edited `total` (not the original OCR total if the user changed it).

**Race condition — double-submit:**
- Test: Rapidly tap "Confirm" twice on the confirmation screen.
- Assert: Only one expense is created. The "Confirm" button should be disabled or the request de-duplicated server-side.

### 7. QA Checklist

**Smoke tests (run first, fast — block ship if any fail)**
- [ ] Camera opens within 2 seconds on iOS
- [ ] Camera opens within 2 seconds on Android
- [ ] A clear, printed restaurant receipt produces a non-failed parse result
- [ ] Confirmation screen renders with at least the grand total field populated
- [ ] "Confirm" creates an expense with the correct total
- [ ] Parse failure shows error banner with Retake and Manual Entry options (no dead end)

**Functional tests (full scenario coverage)**
- [ ] Happy path: friend group restaurant receipt — all 6 fields extracted, confirm creates expense
- [ ] Happy path: roommate utility invoice — no tip line, tip selector appears (P1, if implemented)
- [ ] Retake flow: partial parse -> user taps Retake -> camera opens fresh -> second scan replaces first
- [ ] Manual entry fallback: failed parse -> "Enter manually" -> manual form opens with any partial data
- [ ] Live total recalculation: change subtotal -> grand total updates immediately; change tax -> grand total updates
- [ ] Reconciliation warning: mock response with mismatch -> banner renders on confirmation screen
- [ ] Low-confidence field flagging: mock response with confidence 0.3 on one field -> amber indicator renders
- [ ] Camera permission denied: explanation UI with settings link shown
- [ ] Image too large: correct error message shown

**Edge case tests**
- [ ] Crumpled receipt: partial parse, total null, user fills in manually
- [ ] Steep-angle photo: parse fails or partial, not a silently wrong number
- [ ] Very long grocery receipt exceeding size limit: `IMAGE_TOO_LARGE` handled gracefully
- [ ] Foreign currency receipt: numeric values extracted, no crash, no auto-conversion
- [ ] Double-tap capture button: only one capture registered
- [ ] App backgrounded during parse: returns to clean state, no orphaned expense
- [ ] Receipt with two "Total" labels: correct (bottom-most / highest) value selected; reconciliation warning fires if needed

**Performance tests**
- [ ] Camera open latency <= 2s: measure on iPhone 12 and Pixel 6 (minimum)
- [ ] Parse latency <= 5s p95: run 20 consecutive parses on each platform, log times
- [ ] OCR accuracy >= 85%: run 100-receipt test corpus, compare extracted totals to ground truth

**Regression tests (existing flows to re-verify)**
- [ ] Manual expense creation (non-OCR path) still works end-to-end
- [ ] Expense list correctly displays expenses created via OCR (source tag does not break rendering)
- [ ] Notification and split flows are unaffected by new `source` and `merchant` fields on the expense model
- [ ] Camera permission state does not affect other app flows that do not use the camera

---

## Integration Handshake

Both frontend and backend must agree on the following contract before any code is written. This is the single interface that cannot drift between the two sides.

**Parse result shape (the canonical contract):**

```typescript
interface ParsedReceiptResult {
  parseStatus: "success" | "partial" | "failed";
  merchant:   string | null;
  date:       string | null;        // ISO 8601, e.g. "2026-03-27"
  subtotal:   number | null;        // decimal, e.g. 12.50
  tax:        number | null;
  tip:        number | null;
  total:      number | null;
  confidence: {
    merchant:  number;              // 0.0 to 1.0
    date:      number;
    subtotal:  number;
    tax:       number;
    tip:       number;
    total:     number;
  };
}
```

**Rules both sides must enforce:**
1. A null field value MUST be accompanied by a confidence of 0.0 for that field. Never return a non-zero confidence for a null value.
2. `parseStatus: "failed"` MUST result in the frontend showing the error banner — not the confirmation screen.
3. `parseStatus: "success"` or `"partial"` MUST result in the confirmation screen, even if some fields are null.
4. The frontend uses `confidence[field] < CONFIDENCE_THRESHOLD` (threshold TBD by engineering + design, see Open Questions) to decide whether to apply the amber low-confidence flag. Backend passes raw confidence and does not apply the threshold itself.
5. Monetary values are plain numbers (not strings, not currency-prefixed). The frontend owns currency formatting.
6. Error responses follow the structure: `{ "error": "ERROR_CODE", "message": "Human-readable string." }` — the frontend shows a derived friendly message and MUST NOT display the raw `error` code to the user.

**On-device vs. cloud path:** The contract above is identical for both. The native module bridge (`NativeOcrModule.parseImage()`) returns the same shape as the HTTP endpoint. This keeps the frontend entirely path-agnostic.

---

## Open Questions

The following unresolved questions were raised across the three plans. They need answers before or during development.

| # | Question | Raised by | Blocking? |
|---|---|---|---|
| 1 | **OCR service choice:** On-device (Apple Vision / ML Kit) vs. cloud (Google Cloud Vision / AWS Textract)? Recommendation: build on-device first, switch to cloud only if accuracy falls below 85% in production. | Backend | YES — affects native module build scope and whether the `/api/receipts/parse` endpoint is needed for v1 |
| 2 | **Confidence threshold:** What numeric value (e.g., 0.70, 0.80) triggers low-confidence field flagging vs. global parse failure? This gates both the amber underline UX and the error banner. | Engineering + Design | YES — needed before confirmation screen and error banner logic can be finalized |
| 3 | **Receipt image retention:** Even temporarily on-device for dispute reference? The spec says process and discard for v1, which this plan implements. Confirm this is still the intent before writing the native module. | Product + Legal | No — can ship without, revisit in v2 |
| 4 | **Multiple payment methods on one receipt:** No special UI in v1; user manually corrects total. Confirm this is acceptable. | Product | No — manual override is acceptable for v1 per spec |
| 5 | **Reconciliation mismatch on confirm:** Should the app allow confirming an expense where subtotal + tax + tip does not equal total (user override), and if so, should there be a secondary confirmation prompt? | Product + Design | No — can ship with a simple "Confirm anyway" secondary prompt as default |
| 6 | **OCR accuracy test corpus:** Who builds and maintains the 100-receipt test corpus for the 85% accuracy benchmark? Format, ground truth labeling, and storage location need to be decided before QA can run performance benchmarks. | QA + Engineering | No — can be built in parallel with development, but must be ready before launch |

---

## Build Order

Suggested sequencing based on dependencies across all three plans:

**Phase 1 — Decision gate (before writing any code)**
1. Resolve Open Question 1 (OCR service choice) and Open Question 2 (confidence threshold). These two decisions gate almost everything else.
2. Lock the Integration Handshake contract above — both frontend and backend sign off on the response shape.

**Phase 2 — Parallel foundations (frontend and backend work independently)**
- **Backend:** Write database migrations (expense `source` and `merchant` fields). Build `extractFields` and `assignConfidence` logic with a large fixture test suite. Build `NativeOcrModule` for iOS and Android (or cloud client if that path is chosen).
- **Frontend:** Scaffold navigation routes and `ReceiptCameraView`. Implement camera permission flow. Define the `ParsedReceipt` TypeScript type and the `useOcrParse` hook against a mock that returns the locked contract shape.
- **QA:** Assemble the 100-receipt test corpus and ground-truth label it.

**Phase 3 — Integration layer (frontend and backend connect)**
1. Wire the real `NativeOcrModule` (or API endpoint) into the `useOcrParse` hook.
2. Build `ReceiptConfirmationForm` with live total recalculation, low-confidence flagging, and reconciliation banner — driven by real parse responses.
3. Build and wire `ErrorBanner` with all error code-to-UI-message mappings.
4. QA runs smoke tests and integration test suite against the live integration.

**Phase 4 — Polish and edge cases**
1. Haptics, loading copy cycling, accessibility audit.
2. Edge case testing (crumpled receipts, angle, low-light, large files, foreign currency, double-tap).
3. Performance benchmarks: camera open latency, parse latency p95, accuracy corpus run.
4. Regression tests: existing manual entry and split flows unaffected.

**Phase 5 — P1 features (if time allows before launch)**
- Scan quality guidance overlay
- Tip auto-suggestion chips
- Vendor memory / category pre-fill
- Photo library import
