# Feature Team Brief: Voice Input for Expenses

## At a Glance

GoDutch is adding tap-to-speak expense logging so users can go from "I just paid" to "it's logged" in under 10 seconds without touching a form. The key technical bet is a lightweight on-device NLP parser (regex + pattern matching) that operates on the speech-to-text transcript — avoiding a round-trip LLM call on every voice entry while still hitting the 85% parse accuracy target. The primary acceptance bar is that amount and description are correctly extracted from ≥ 85% of well-formed utterances, and the median end-to-end time (mic tap → confirmed expense) stays at or below 10 seconds.

---

## Frontend Plan

### 1. Screen Inventory

| Screen | Purpose | Trigger |
|---|---|---|
| **Main Screen** (updated) | Houses the prominent mic button alongside existing expense entry actions | Always visible; mic button is the primary CTA |
| **Recording Screen** | Full-screen or bottom-sheet overlay; shows active recording state with pulsing animation, elapsed time, and "Type instead" escape hatch | User taps mic button |
| **Processing Screen** | Transitional loading state shown while transcription + parsing runs (≤ 3 seconds) | Recording stops (manual tap or silence timeout) |
| **Confirmation Screen** | Displays raw transcription at top; editable fields for amount, description, currency, and split; low-confidence fields flagged visually; Re-record and Type instead buttons | Processing completes |
| **Manual Entry Screen** (existing, re-used) | Standard expense form | User taps "Type instead" from any voice screen, or on transcription failure |
| **Microphone Permission Screen** | Pre-permission explanation screen before the iOS/Android permission dialog fires | First-time mic tap when permission has not been granted |

---

### 2. Component Breakdown

**New components:**

- **MicButton** — Primary recording trigger. Props: `isRecording: boolean`, `onPress: () => void`, `disabled: boolean`. Renders large, prominent mic icon; changes color and scale when active. Lives on Main Screen and can be embedded in other screens.
- **RecordingOverlay** — Full-screen or bottom-sheet overlay that takes over during recording. Props: `onStop: () => void`, `onTypeInstead: () => void`, `elapsedSeconds: number`. Shows pulsing animation, waveform visualization (optional), and "Type instead" button.
- **SilenceTimer** — Invisible timer component that auto-stops recording after configurable silence duration. Props: `silenceThresholdMs: number` (default 2000), `onSilenceDetected: () => void`.
- **ProcessingSpinner** — Transitional overlay shown while transcription + parse runs. Props: `message: string`.
- **TranscriptionBanner** — Read-only display of the raw transcript string. Props: `transcript: string`. Shown at the top of the Confirmation Screen to build user trust.
- **ParsedFieldForm** — The editable confirmation form. Props: `parsedResult: ParsedExpense`, `onFieldChange: (field, value) => void`, `onConfirm: () => void`, `onReRecord: () => void`, `onTypeInstead: () => void`. Low-confidence fields rendered with a visual warning indicator (e.g. yellow border + info icon).
- **ConfidenceIndicator** — Small badge/icon shown inline with a field when `confidence < threshold`. Props: `confidence: number`, `label: string`.
- **PermissionGate** — Wrapper that checks mic permission status and conditionally renders the pre-permission explanation screen or triggers the system dialog. Props: `onGranted: () => void`, `onDenied: () => void`.

**Existing components reused:**

- Manual Entry Form (existing expense form — reused as the fallback and final save step)
- Navigation stack / bottom sheet modal patterns

---

### 3. User Flow

**Happy path (clear speech, quiet environment):**

1. User is on Main Screen, taps the mic button.
2. If first use: PermissionGate shows pre-permission explanation → system permission dialog fires → user grants.
3. RecordingOverlay appears. Pulsing animation + color change confirm active recording. Haptic fires on start (P1).
4. User speaks: "I paid $85 for dinner, split between me, Jordan, and Priya."
5. 2-second silence timeout fires. Recording stops. Haptic fires on stop (P1).
6. ProcessingSpinner shown while backend transcribes + parses (≤ 3 seconds).
7. Confirmation Screen loads. TranscriptionBanner shows raw text. ParsedFieldForm shows: Amount: $85, Description: dinner, Split: Jordan, Priya (and self). All fields pre-filled; confidence is high so no warnings.
8. User taps Confirm. Expense is saved. Returns to Main Screen with success toast.

**Primary error path (transcription fails — e.g., too noisy, no speech detected):**

1. Steps 1–5 same as happy path.
2. Transcription API returns an error or empty result.
3. ProcessingSpinner clears. An error banner appears: "We couldn't hear that clearly. Try again or type your expense."
4. Two CTAs: "Try again" (re-triggers recording flow) and "Type instead" (navigates to Manual Entry Screen).
5. No dead end; user always has an exit.

**Edge-case paths:**

- **Partial speech** ("I paid fifty" — no description): Confirmation Screen loads with Amount: $50, Description: [blank with placeholder "Add a description"]. User completes manually.
- **Low-confidence parse** (amount ambiguous — "thirty"): Amount field shows "30.00" with ConfidenceIndicator warning. User taps to confirm or correct before submitting.
- **User re-records**: From Confirmation Screen, user taps "Re-record." RecordingOverlay re-opens. Parsed fields are cleared and repopulated when the new recording resolves.
- **Permission denied**: PermissionGate shows a persistent banner: "Microphone access is needed for voice input. Enable it in Settings." Deep-link to app settings provided.

---

### 4. State Management

| State | Where it lives | Notes |
|---|---|---|
| `micPermissionStatus` | Shared app state | Checked once and cached; re-checked on app foreground |
| `isRecording` | Local (RecordingOverlay) | Transient; reset when overlay closes |
| `recordingElapsed` | Local (RecordingOverlay) | Drive timer display |
| `transcriptRaw` | Local (Confirmation Screen) | Not persisted; thrown away on re-record or cancel |
| `parsedExpense` | Local (Confirmation Screen) | Editable form state; not persisted until user confirms |
| `voiceFlowError` | Local (Recording/Processing screens) | Cleared on retry or navigation away |
| Confirmed expense data | Server-derived (written via API on confirm) | Persists; drives expense list |
| `lastUsedCurrency` | Shared app state, persisted across sessions | Used as currency default when not spoken |

Nothing in the voice flow itself needs to persist across sessions — if the user closes the app mid-flow, the session resets cleanly.

---

### 5. API Consumption Points

**Transcription + Parse (single call):**
- Trigger: Recording stops (silence timeout or manual tap)
- Request: `POST /api/voice/parse` with `{ audioData: base64String, mimeType: "audio/m4a", groupId: string, locale: string }`
- Response (success): `{ transcript: string, parsed: { amount: number | null, currency: string | null, description: string | null, split: [{ name: string, matchedUserId: string | null }], confidence: { amount: number, description: number, split: number } } }`
- Response (failure): `{ error: "TRANSCRIPTION_FAILED" | "NO_SPEECH_DETECTED" | "PARSE_FAILED", message: string }`
- Failure display: Error banner with "Try again" and "Type instead" CTAs. No raw error codes shown to user.

**Save Expense (existing endpoint, reused):**
- Trigger: User taps Confirm on ParsedFieldForm
- Request: Existing `POST /api/expenses` shape — voice flow populates same fields as manual entry
- No new API shape needed here; voice is just another way to fill the form

---

### 6. Design Considerations

**From the spec:**
- Mic button is the dominant action on the main screen — no competing actions at the same visual weight.
- Recording state is unambiguous: pulsing animation, color change (e.g., red while recording), and on iOS, the system's status bar mic indicator activates automatically via AVAudioSession.
- Confirmation screen: amount field is large and visually primary. Raw transcription shown in a muted banner above the form.
- Low-confidence fields are visually flagged (yellow border, caution icon) — do not silently accept bad data.

**Additional design notes:**
- RecordingOverlay should be dismissible (swipe down or tap outside) but should warn the user that dismissing cancels the recording.
- "Type instead" button must be visible at all times during the voice flow — use a persistent footer or floating button, not buried in a menu.
- Loading state (ProcessingSpinner) must appear immediately after recording stops so there's no blank moment; a message like "Listening…" or "Processing…" reassures the user the app is working.
- Tap targets: mic button min 56×56dp. All editable fields on the Confirmation Screen min 44pt height. "Confirm" CTA full-width.
- Screen reader support: MicButton labeled "Start voice recording." RecordingOverlay announces state change via accessibility live region ("Recording started," "Recording stopped"). ConfidenceIndicator reads "Low confidence — please verify this field."
- Small phones (< 375pt width): Confirmation Screen fields may need to scroll; avoid fixed-height containers. Amount field stays pinned at top.
- Haptics: Light impact on recording start; medium impact on recording stop (P1, gated behind haptic permission).

---

### 7. Frontend Implementation Checklist

**Foundations**
- [ ] Add mic button to Main Screen with placeholder `onPress` handler
- [ ] Wire mic permission check via PermissionGate; build pre-permission explanation screen
- [ ] Scaffold RecordingOverlay as a bottom-sheet modal with open/close animation
- [ ] Scaffold Confirmation Screen with static mock data (no API yet)
- [ ] Add "Type instead" navigation from RecordingOverlay and Confirmation Screen to Manual Entry

**Data layer**
- [ ] Build `POST /api/voice/parse` API client call with loading, success, and error states
- [ ] Map API response to local `parsedExpense` state shape
- [ ] Handle all three error codes (`TRANSCRIPTION_FAILED`, `NO_SPEECH_DETECTED`, `PARSE_FAILED`) and display appropriate copy
- [ ] Pass confirmed fields to existing `POST /api/expenses` save call

**Recording mechanics**
- [ ] Implement native speech recording (platform audio API) with start/stop controls
- [ ] Implement SilenceTimer with configurable threshold (default 2000ms)
- [ ] Add pulsing animation to MicButton and RecordingOverlay during active recording
- [ ] Add elapsed timer display on RecordingOverlay

**Confirmation UI**
- [ ] Build TranscriptionBanner (read-only, muted styling)
- [ ] Build ParsedFieldForm with all four fields (amount, description, currency, split)
- [ ] Build ConfidenceIndicator and wire to confidence scores from API response
- [ ] Add Re-record button that clears parsed state and reopens RecordingOverlay
- [ ] Validate required fields (amount, description) before enabling Confirm button

**Polish and edge cases**
- [ ] Add haptic feedback on recording start and stop (P1)
- [ ] Handle permission denied state with Settings deep-link banner
- [ ] Test on smallest supported screen size; fix any overflow or scroll issues
- [ ] Add accessibility labels and live region announcements for recording state changes
- [ ] Add analytics events: `voice_recording_started`, `voice_parse_success`, `voice_parse_failed`, `voice_confirmed`, `voice_fallback_to_manual`, `voice_rerecord`

---

## Backend Plan

### 1. Data Models

**New: `VoiceParseLog`** (for analytics and debugging — not user-visible)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `userId` | UUID | FK → users, not null | |
| `groupId` | UUID | FK → groups, nullable | Context for contact name matching |
| `audioHash` | string | nullable | SHA-256 of audio blob; for dedup — audio itself is NOT stored |
| `transcript` | string | nullable | Raw STT output |
| `parsedAmount` | decimal | nullable | Extracted amount |
| `parsedDescription` | string | nullable | Extracted description |
| `parsedCurrency` | string(3) | nullable | ISO 4217 |
| `parsedSplitNames` | string[] | nullable | Raw names as spoken |
| `confidenceAmount` | float | nullable | 0–1 |
| `confidenceDescription` | float | nullable | 0–1 |
| `confidenceSplit` | float | nullable | 0–1 |
| `parseErrorCode` | string | nullable | `TRANSCRIPTION_FAILED`, `NO_SPEECH_DETECTED`, `PARSE_FAILED` |
| `fallbackToManual` | boolean | default false | Did user tap "Type instead"? |
| `rerecordCount` | int | default 0 | Number of re-records in this session |
| `createdAt` | timestamp | not null | |

**Existing model extension: `Expense`** — add `voiceInitiated: boolean` (default false) so analytics can segment voice-logged vs. manual-logged expenses.

Audio data is ephemeral — it is passed to the STT service and immediately discarded. It is never written to persistent storage.

---

### 2. API Endpoints

#### `POST /api/voice/parse`

**Purpose:** Accept audio, run speech-to-text, parse the transcript, return structured fields.

**Auth:** Required (JWT bearer token). User must be authenticated.

**Request body:**
```json
{
  "audioData": "base64-encoded audio string",   // required
  "mimeType": "audio/m4a",                      // required; "audio/m4a" | "audio/webm" | "audio/wav"
  "locale": "en-US",                             // required; BCP 47 locale tag
  "groupId": "uuid"                              // optional; if present, used for contact name resolution
}
```

**Success response (200):**
```json
{
  "transcript": "I paid eighty-five dollars for dinner split between me Jordan and Priya",
  "parsed": {
    "amount": 85.00,
    "currency": "USD",
    "description": "dinner",
    "split": [
      { "name": "Jordan", "matchedUserId": "uuid-or-null" },
      { "name": "Priya",  "matchedUserId": "uuid-or-null" }
    ],
    "confidence": {
      "amount": 0.97,
      "description": 0.88,
      "split": 0.72
    }
  }
}
```

**Error responses:**

| Code | Error body | When |
|---|---|---|
| 422 | `{ "error": "NO_SPEECH_DETECTED", "message": "No speech was detected in the recording." }` | STT returned empty transcript |
| 422 | `{ "error": "TRANSCRIPTION_FAILED", "message": "We couldn't transcribe your recording." }` | STT service error or confidence too low |
| 422 | `{ "error": "PARSE_FAILED", "message": "We heard you, but couldn't parse an amount or description." }` | Transcript exists but NLP extracted nothing useful |
| 400 | `{ "error": "INVALID_REQUEST", "message": "audioData and mimeType are required." }` | Missing required fields |
| 413 | `{ "error": "AUDIO_TOO_LARGE", "message": "Recording exceeds maximum length." }` | Audio > 60 seconds |
| 503 | `{ "error": "SERVICE_UNAVAILABLE", "message": "Voice processing is temporarily unavailable." }` | STT service down |

---

### 3. Business Logic

Step-by-step processing pipeline for `POST /api/voice/parse`:

1. **Validate request** — check required fields, mime type whitelist, audio size limit (max 60 seconds / ~5MB). Return 400 or 413 on failure.

2. **Invoke STT service** — pass audio to the chosen speech-to-text provider (see External Integrations). Receive raw transcript string and provider-level confidence. If the provider returns an error or empty result, short-circuit with `NO_SPEECH_DETECTED` or `TRANSCRIPTION_FAILED`.

3. **Pre-process transcript** — normalize text: lowercase, expand common contractions, strip filler words ("um", "uh"), normalize number words ("eighty-five" → "85", "a dollar fifty" → "1.50").

4. **Extract amount** — run amount regex patterns (currency symbols, numeric values, ordinal/word numbers). Patterns in priority order:
   - `\$\d+(\.\d{1,2})?` (explicit dollar sign)
   - `\d+\s*(dollars?|bucks?)(\s+and\s+\d+\s+cents?)?`
   - Word-form ordinals via lookup table
   If multiple candidates, pick the one with highest contextual confidence. If none found, set `amount = null` and mark `PARSE_FAILED` if description is also null.

5. **Extract currency** — if explicit currency symbol or word found, use it. Otherwise, default to `locale`-derived currency (e.g., `en-US` → `USD`).

6. **Extract description** — strip the amount phrase and preamble phrases ("I paid", "I bought", "split it") from the transcript. What remains is the description candidate. Apply a minimum length filter (≥ 2 chars) and a stopword filter. If nothing meaningful remains, set `description = null`.

7. **Extract split participants** — look for patterns: "split between X and Y", "for me and X", "between X, Y, and Z", "split N ways". Extract name tokens. If `groupId` was provided, fuzzy-match each name against group members (Levenshtein distance ≤ 2). Return `matchedUserId` if found, null if not. Flag: silent false-positive matches are the main risk here — a short name like "Jo" could match multiple group members. Apply a minimum name length (≥ 3 chars) for auto-matching.

8. **Compute confidence scores** — for each field, compute a 0–1 confidence score based on: pattern match strength, number of competing candidates, and transcript quality signal from the STT provider. Fields that fell back to defaults (e.g., currency defaulted from locale) get a lower confidence score to surface them to the user.

9. **Write VoiceParseLog** — persist the parse attempt for analytics (not the audio itself).

10. **Return structured response** — return the full parsed object. Fields that could not be extracted are returned as `null`, not omitted. The client must handle null fields by showing empty editable inputs.

**Silent failure risk:** Step 7 (split name matching) can produce false-positive matches if names are short or common. Mitigation: require ≥ 3 character name tokens for auto-match and return `matchedUserId: null` on ambiguous matches rather than guessing.

---

### 4. External Integrations

**Speech-to-Text (STT) — open question from spec, recommendations:**

The spec identifies this as a blocking open question (privacy vs. accuracy trade-off).

- **Option A: On-device (Apple SFSpeechRecognizer / Android SpeechRecognizer)** — invoked entirely on the client side; no audio leaves the device. Latency: ~1–2 seconds. Accuracy: good for clear speech, struggles with accents and noise. Privacy-preserving by default.
- **Option B: Cloud STT (OpenAI Whisper API or Google Cloud Speech-to-Text)** — audio sent to cloud. Latency: ~1–3 seconds over network. Accuracy: significantly better for accented speech, background noise. Privacy: audio transmitted to third party; must be disclosed in privacy policy.

**Recommendation for v1:** Start with on-device (Option A) invoked client-side to avoid privacy concerns and eliminate network round-trip for STT. Backend receives only the transcript text (not audio), and runs NLP parsing server-side. If parse accuracy falls below 85% threshold post-launch, switch to cloud STT with explicit user consent opt-in.

If cloud STT is chosen, the `POST /api/voice/parse` endpoint accepts the audio blob; if on-device STT is chosen, a revised endpoint `POST /api/voice/nlp` accepts only the transcript string — the API contract changes depending on this decision. **This must be resolved before implementation begins.**

**NLP Parsing — on-device rule-based (spec recommendation):**

Implemented as a server-side library (or can be a client-side package). Uses regex + pattern matching per the spec's technical notes. No external service dependency. Fully controllable, zero per-call cost, deterministic in testing.

---

### 5. Storage & Persistence

| Data | Where stored | Retention | Privacy notes |
|---|---|---|---|
| Audio blob | NOT stored | Ephemeral — passed to STT and discarded | Never persisted; mention in privacy policy |
| Raw transcript | `VoiceParseLog.transcript` | 90 days, then auto-purged | Retained for debugging and ML training (future); disclose in privacy policy |
| Parsed fields (pre-confirm) | NOT stored | Ephemeral — lives in client memory until user confirms | |
| Confirmed expense | `Expense` table (existing) | Indefinite (user-controlled deletion) | Standard expense data |
| `VoiceParseLog` analytics record | Database | 90 days | Contains parse attempt metadata; no raw audio |

---

### 6. Error Handling Strategy

**Expected errors (surfaced to client with structured error body):**

| Error | API response | Client display |
|---|---|---|
| No speech detected | 422 `NO_SPEECH_DETECTED` | "We couldn't hear that. Try again or type your expense." |
| STT service failure | 422 `TRANSCRIPTION_FAILED` | "We couldn't transcribe your recording. Try again or type instead." |
| Parse failed (transcript exists, no useful parse) | 422 `PARSE_FAILED` | "We heard you, but couldn't pull out an amount. Try again or type instead." |
| Audio too large | 413 `AUDIO_TOO_LARGE` | "Recording is too long. Please keep it under 60 seconds." |
| Invalid request | 400 `INVALID_REQUEST` | Generic "Something went wrong" (this is a developer error, not a user error) |

**Unexpected errors (logged server-side, generic response to client):**

- STT service returns malformed response: log full response body + request ID, return 503 to client.
- NLP parser throws exception: log stack trace + transcript + request ID, return 503 to client.
- All 5xx errors: client displays "Voice processing is temporarily unavailable. Type your expense instead." and routes to manual entry.
- All errors are logged with `userId`, `requestId`, and timestamp — no audio data in logs.

---

### 7. Backend Implementation Checklist

**Data model**
- [ ] Add `voiceInitiated` boolean field to `Expense` model; write migration
- [ ] Create `VoiceParseLog` table; write migration
- [ ] Verify foreign keys and indexes (userId, groupId, createdAt for time-based queries)

**NLP parser (core logic)**
- [ ] Build amount extraction: currency symbol regex, numeric regex, word-number lookup table
- [ ] Build currency extraction: symbol and word patterns, locale fallback
- [ ] Build description extraction: preamble stripping, stopword filter, min-length check
- [ ] Build split extraction: pattern matching for "split between", "for me and X" etc.
- [ ] Build name fuzzy-matcher against group members (Levenshtein ≤ 2, min name length 3)
- [ ] Build confidence scorer for each field
- [ ] Write unit tests for NLP parser with ≥ 50 utterance fixtures covering happy path, partials, and edge cases
- [ ] Benchmark: parser must process a transcript in < 50ms (well within the 3s budget)

**API layer**
- [ ] Scaffold `POST /api/voice/parse` endpoint with auth middleware
- [ ] Validate request body (required fields, mime type whitelist, size limit)
- [ ] Wire STT call (or transcript-only path if on-device STT is chosen — see Open Questions)
- [ ] Wire NLP parser call
- [ ] Write `VoiceParseLog` record on every attempt (success and failure)
- [ ] Set `voiceInitiated: true` on expenses created from a voice-confirmed flow (client passes flag)

**Integration and error handling**
- [ ] Implement STT client with timeout (3 second hard limit to stay within latency budget)
- [ ] Map all STT provider errors to internal error codes
- [ ] Add global error handler for unexpected exceptions → 503 response
- [ ] Add structured logging for all voice parse attempts (no audio in logs)

**Testing**
- [ ] Integration test: `POST /api/voice/parse` with mock STT — verify response shape for success, each error code
- [ ] Load test: confirm endpoint handles concurrent requests without degrading below 3s p95

---

## QA Plan

### 1. Acceptance Criteria

> **Tap-to-record mic button — recording start latency:** Given the user has microphone permission granted, when they tap the mic button, then recording begins within 500ms (verified via timestamp instrumentation).

> **Tap-to-record mic button — visual indicator:** Given recording is active, when the user looks at the screen, then the mic button shows a distinct pulsing animation and color change (no ambiguity about active state).

> **Tap-to-record mic button — silence auto-stop:** Given recording is active and the user stops speaking, when 2 seconds of silence have elapsed, then recording stops automatically and the processing state begins.

> **Speech-to-text transcription — latency:** Given the user has finished recording, when the recording stops, then the raw transcription appears on the confirmation screen within 3 seconds.

> **Speech-to-text transcription — display:** Given transcription is complete, when the confirmation screen loads, then the raw transcript string is displayed verbatim at the top of the screen.

> **Natural language parsing — accuracy:** Given a test set of ≥ 100 well-formed utterances, when parsed by the NLP engine, then amount and description are correctly extracted from ≥ 85 of those utterances (≥ 85% parse success rate).

> **Natural language parsing — safe failure:** Given the NLP parser cannot extract a field with confidence, when the confirmation screen loads, then that field is blank (not populated with a wrong value).

> **Editable confirmation screen — all fields editable:** Given the confirmation screen is showing parsed fields, when the user taps any field, then it becomes editable inline.

> **Editable confirmation screen — re-record:** Given the confirmation screen is visible, when the user taps "Re-record," then the recording overlay re-opens and all previously parsed fields are cleared.

> **Editable confirmation screen — raw transcript visible:** Given the confirmation screen is loaded, when the user inspects the top of the screen, then the raw transcript is displayed (not just the inferred values).

> **Fallback to manual entry — "Type instead" always visible:** Given any screen in the voice flow (recording, processing, confirmation), when the user looks for an escape, then "Type instead" is always visible without scrolling.

> **Fallback to manual entry — transcription error:** Given transcription fails, when the error is returned, then a human-readable error message is displayed (not a raw error code) and the user can tap "Type instead" or "Try again."

> **End-to-end latency target:** Given a well-formed utterance in a quiet environment, when measured across 20 representative test runs, then the median time from mic tap to confirmed expense submission is ≤ 10 seconds.

> **No-edit confirmation rate target (production metric):** Given the feature is live, when measured across the first 14 days of voice sessions, then ≥ 40% of voice entries are confirmed without any field being edited.

---

### 2. Happy Path Scenarios

**Scenario A — Friend group: Full expense with split (primary persona)**

1. User opens app on the main screen. Expected: Large mic button is visible as the dominant action.
2. User taps mic button. Expected: Recording overlay appears within 500ms. Pulsing animation starts. No system permission dialog (already granted).
3. User speaks: "I paid eighty-five dollars for dinner, split between me, Jordan, and Priya." Expected: Waveform or visual activity indicator responds to voice input.
4. User stops speaking. Expected: 2-second silence timer starts automatically.
5. Silence timer fires. Expected: Recording stops, processing spinner appears with message (e.g., "Processing…").
6. Confirmation screen loads. Expected: Raw transcript displayed at top. Amount field shows $85.00. Description shows "dinner." Split shows Jordan and Priya. No confidence warnings.
7. User reviews all fields. No edits needed. Taps "Confirm." Expected: Expense is saved. User is returned to main screen with a success confirmation.

**Scenario B — Roommate: Quick small expense**

1. User taps mic button on main screen. Expected: Recording starts within 500ms.
2. User speaks: "I bought dish soap for six fifty." Expected: Audio captured.
3. Silence auto-stop fires after 2 seconds. Expected: Processing begins.
4. Confirmation screen loads. Expected: Amount: $6.50, Description: "dish soap," Split: none (or default to group even split). Raw transcript visible.
5. User taps Confirm. Expected: Expense saved. Total flow under 10 seconds.

**Scenario C — User with a manual correction**

1. User completes recording: "I paid one twenty for dinner with the team."
2. Confirmation screen shows Amount: $120.00, Description: "dinner with the team."
3. User notices description should be "team lunch" and taps description field. Expected: Field becomes editable inline.
4. User types "team lunch" and taps Confirm. Expected: Expense saved with corrected description. voiceInitiated flag is still true.

---

### 3. Edge Cases

1. **Recording with background noise only (no speech):** User is in a loud environment and taps the mic but doesn't speak clearly. STT returns empty or very low confidence. Expected: `NO_SPEECH_DETECTED` error surfaced. App does not crash or hang. "Try again" and "Type instead" CTAs are shown.

2. **Amount expressed as a word: "I owe thirty":** NLP must convert "thirty" → 30.00. Expected: Amount field shows $30.00 with a confidence indicator (since it's word-form, confidence may be medium). Regression risk: "I paid thirty-five fifty" — is this $35.50 or $35 and then something unrelated?

3. **User taps mic, immediately taps again to stop (0-second recording):** Very short or empty audio sent to STT. Expected: Treated the same as NO_SPEECH_DETECTED — error message, not a crash. Silence timer should not fire before user manually stops.

4. **App goes to background mid-recording:** User starts recording, gets a phone call or switches apps. Expected: Recording should stop gracefully (platform audio session interruption). On return to app, user sees a clean state — no orphaned recording session or spinner.

5. **Name in spoken input matches no group member ("split with Alex"):** "Alex" is not in the group. Expected: Split field shows "Alex" as an unmatched name (text, no user ID). User can manually resolve on the confirmation screen. App must not silently drop the name or crash.

6. **Very long recording (user speaks for 30+ seconds):** Transcript is extremely long; NLP may return multiple amount candidates or a garbled description. Expected: NLP returns the best-confidence parse; remaining fields left null or flagged low-confidence. No timeout or crash at the frontend.

7. **Microphone permission denied mid-flow (revoked in settings while app is open):** User revokes mic permission via iOS/Android settings while on the recording screen. Expected: Recording fails gracefully with a permission error — not a crash. App shows permission-required state with a deep-link to settings.

8. **Currency spoken explicitly: "I paid twenty euros for coffee":** Expected: Currency detected as EUR, amount as 20.00, description as "coffee." User's locale may be USD — the explicit spoken currency must override the locale default.

---

### 4. Error State Testing

**TRANSCRIPTION_FAILED (STT service error):**
- Trigger: Mock STT service to return a 5xx or timeout.
- User sees: "We couldn't transcribe your recording. Try again or type instead." Banner with two CTAs.
- App state: Recording overlay is closed. Error banner is visible. "Try again" re-opens recording overlay from scratch. "Type instead" navigates to manual entry form. No broken state.

**NO_SPEECH_DETECTED (empty transcript):**
- Trigger: Submit silent audio or mock STT to return empty string.
- User sees: "We couldn't hear that. Try again or type your expense." Two CTAs.
- App state: Same recovery options as above.

**PARSE_FAILED (transcript exists, no useful extract):**
- Trigger: Speak "um uh um" or mock parse to return all null fields.
- User sees: "We heard you, but couldn't pull out an amount. Try again or type instead."
- App state: Optionally, the raw transcript is still shown so the user can understand what the app heard. Manual entry form pre-filled with the transcript text as a starting point.

**Microphone permission denied:**
- Trigger: Deny mic permission at the system dialog, or revoke in settings.
- User sees: "Microphone access is required for voice input. Enable it in Settings." With a deep-link button to the app's settings page.
- App state: Mic button is visible but tapping it shows the permission banner instead of triggering recording. No dead end.

**Backend 503 (unexpected server error):**
- Trigger: Mock backend to return 503.
- User sees: "Voice processing is temporarily unavailable. Type your expense instead." Single CTA to manual entry.
- App state: Processing spinner clears. Error message shown. User can navigate to manual entry.

---

### 5. Performance Benchmarks

| What to measure | How to measure | Pass threshold |
|---|---|---|
| Recording start latency (tap → recording active) | Instrument with timestamps in app; log delta on each session | ≤ 500ms p95 |
| Transcription latency (recording stops → transcript available) | Timestamp at recording stop and at API response; log delta | ≤ 3000ms p95 |
| End-to-end latency (mic tap → confirmation screen loaded) | Timestamp at tap and at confirmation screen render; log delta | ≤ 6000ms p95 (leaving 4s buffer for user to review and confirm within 10s total) |
| NLP parser execution time | Unit-level benchmark test; run 100 utterances, measure wall time | ≤ 50ms per utterance |
| Parse success rate | Offline evaluation: run NLP parser against 100-utterance labeled test set | ≥ 85% (amount + description both correctly extracted) |
| No-edit confirmation rate | Production analytics: `voice_confirmed` events without a field-changed event | ≥ 40% of voice sessions |
| Fallback-to-manual rate | Production analytics: `voice_fallback_to_manual` / `voice_recording_started` | ≤ 15% |
| Re-record rate | Production analytics: `voice_rerecord` / `voice_recording_started` | ≤ 10% |

---

### 6. Integration Test Points

**Seam 1: Audio/transcript → `POST /api/voice/parse` → parsed fields**

- What passes across: Base64 audio (or transcript string if on-device STT), locale, groupId.
- Assert: Response body matches schema exactly — all expected fields present (including null fields, which must be null not absent). Confidence scores are 0–1 floats.
- Assert: Amount field is a number (not a string). Currency is ISO 4217 (3-char string). Split is an array (not null) even when empty.
- Race condition to watch: If the user taps "Re-record" before the first parse response arrives, the in-flight request response must be discarded — not applied to the new recording session. Implement with a request cancellation token or session ID.

**Seam 2: Confirmed parsed fields → `POST /api/expenses`**

- What passes across: Amount, currency, description, split (with matched userIds), `voiceInitiated: true`.
- Assert: Expense created in the database with the correct field values and `voiceInitiated: true`.
- Assert: If a split name had no `matchedUserId` (null), the expense is still created — the unmatched name is not silently dropped.

**Seam 3: Error codes → frontend error display**

- Assert for each error code (`NO_SPEECH_DETECTED`, `TRANSCRIPTION_FAILED`, `PARSE_FAILED`): frontend displays the correct human-readable string (not the raw code).
- Assert: "Type instead" CTA is rendered and navigates to manual entry form.

**Seam 4: Confidence scores → field visual state**

- Assert: Fields with `confidence < 0.7` (threshold TBD) render with the ConfidenceIndicator component visible.
- Assert: Fields with `confidence ≥ 0.7` render without the indicator (no false alarms).

---

### 7. QA Checklist

**Smoke tests (run first, must all pass before functional testing begins)**
- [ ] Mic button is visible on main screen
- [ ] Tapping mic button starts recording (or shows permission dialog on first use)
- [ ] Recording overlay appears and shows active state
- [ ] Recording stops on second tap
- [ ] Confirmation screen loads after a successful recording
- [ ] "Type instead" from recording screen opens manual entry
- [ ] Confirming a voice expense saves it and returns to main screen

**Functional tests (full scenario coverage)**
- [ ] Happy path A: Full expense with amount, description, and named split — confirm without edits
- [ ] Happy path B: Simple 2-field expense ("I bought X for $Y") — confirm without edits
- [ ] Edit flow: Confirm after correcting one field on confirmation screen
- [ ] Re-record flow: Tap re-record on confirmation screen, speak new input, confirm second result
- [ ] Fallback flow: Trigger transcription failure → verify error message and "Type instead" CTA
- [ ] First-use permission flow: Fresh install, tap mic, grant permission, complete full flow
- [ ] Permission denied flow: Deny permission, verify graceful state and Settings deep-link

**Edge case tests**
- [ ] Word-form amount ("thirty dollars for coffee") — verify correct numeric parse
- [ ] Amount with cents ("six dollars and fifty cents") — verify $6.50
- [ ] Spoken currency override ("twenty euros") — verify EUR overrides locale default
- [ ] Partial input (amount only, no description) — verify blank description field, no crash
- [ ] Empty recording (0-second audio) — verify NO_SPEECH_DETECTED error, no crash
- [ ] App backgrounded mid-recording — verify graceful stop and clean state on return
- [ ] Name not in group — verify unmatched name shown as text, not dropped
- [ ] Very long recording (30 seconds) — verify parse completes, no timeout/crash

**Regression tests (existing flows to re-verify)**
- [ ] Manual expense entry (existing form) — confirm not broken by new navigation additions
- [ ] Expense list — confirm voice-initiated expenses appear correctly alongside manual ones
- [ ] Group member management — confirm contact name matching does not affect group membership data
- [ ] App permissions screen — confirm mic permission state is correctly reflected in app settings view

---

## Integration Handshake

The most critical interface between frontend and backend is the `POST /api/voice/parse` endpoint. Both sides must agree on this contract before writing a line of feature code.

**Request (frontend → backend):**
```json
POST /api/voice/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "audioData": "<base64-encoded audio>",
  "mimeType": "audio/m4a",
  "locale": "en-US",
  "groupId": "uuid"
}
```

**NOTE:** If the team resolves Open Question #1 in favor of on-device STT, this endpoint changes to `POST /api/voice/nlp` and the request body changes to `{ "transcript": string, "locale": string, "groupId": string }`. This decision gates all API implementation work.

**Success response (backend → frontend):**
```json
{
  "transcript": "string — raw text from STT",
  "parsed": {
    "amount": 85.00,            // number | null
    "currency": "USD",          // string (ISO 4217) | null
    "description": "dinner",   // string | null
    "split": [                  // array (never null; empty array if no split detected)
      { "name": "Jordan", "matchedUserId": "uuid | null" }
    ],
    "confidence": {
      "amount": 0.97,           // float 0-1
      "description": 0.88,     // float 0-1
      "split": 0.72            // float 0-1
    }
  }
}
```

**Error responses:** `{ "error": "NO_SPEECH_DETECTED" | "TRANSCRIPTION_FAILED" | "PARSE_FAILED" | "AUDIO_TOO_LARGE" | "INVALID_REQUEST" | "SERVICE_UNAVAILABLE", "message": "Human-readable string" }`

**Non-negotiable contracts:**
- Null fields are returned as `null`, never omitted from the response.
- `split` is always an array — empty `[]` if no split detected, never `null`.
- `confidence` scores are always floats in `[0, 1]` — never strings or absent.
- Error bodies always include both `error` (machine-readable code) and `message` (human-readable string).

---

## Open Questions

The following questions were raised across all three specialist plans and require resolution before or during development:

| # | Question | Raised By | Blocking? | Recommendation |
|---|---|---|---|---|
| 1 | **On-device vs. cloud STT?** Native SFSpeechRecognizer/Android SpeechRecognizer vs. Whisper/Google Cloud Speech-to-Text. Changes the API contract entirely (audio blob vs. transcript string). | Backend + Frontend | **Yes — must decide before API implementation** | Start on-device to preserve privacy and eliminate network latency; switch to cloud if accuracy falls below 85% post-launch |
| 2 | **Where does NLP parsing live?** On-device rule-based, server-side rule-based, or LLM-backed. | Backend | **Yes — affects latency, cost, and accuracy** | Server-side rule-based (regex + patterns) for v1 per the spec's technical notes; revisit if accuracy target not met |
| 3 | **Confidence threshold for visual flagging?** What score (0–1) triggers the ConfidenceIndicator warning on the confirmation screen? | Frontend + QA | No — can start with 0.7 and tune post-launch | Default to 0.7; adjust after reviewing early VoiceParseLog data |
| 4 | **Currency default behavior?** Locale-derived or last-used? | Product | No — spec says locale for v1 | Use device locale for v1; last-used can be a quick follow-up |
| 5 | **Partial speech handling?** If only amount is spoken (no description), prompt on confirmation screen or silently leave blank? | Design + Product | No — spec says blank field + prompt | Show empty field with placeholder copy prompting user to fill it in |
| 6 | **Microphone permission pre-prompt copy?** iOS requires explanation before the system dialog. Copy not yet written. | Design | No — but needed before launch | Assign to design/copy; suggested draft: "GoDutch uses your microphone only when you tap the mic button — never in the background." |
| 7 | **Request cancellation when user re-records?** If an in-flight parse request is pending and the user taps Re-record, how is the race condition handled? | QA + Frontend | No — but must be addressed before QA | Use a request cancellation token (AbortController on web, task cancellation on native); discard response from cancelled request |

---

## Build Order

**Phase 1 — Foundations (can start in parallel across frontend and backend):**

- Backend: Write migrations for `VoiceParseLog` and `Expense.voiceInitiated`. Build and unit-test the NLP parser in isolation (no API, no audio — just text in, structured fields out).
- Frontend: Add mic button to main screen, scaffold RecordingOverlay, scaffold Confirmation Screen with static mock data. Wire navigation between all voice screens and Manual Entry.

**Phase 2 — API contract (requires Open Question #1 resolution first):**

- Backend: Build `POST /api/voice/parse` endpoint. Wire NLP parser. Wire STT (or accept transcript if on-device STT). Implement error handling and VoiceParseLog writes.
- Frontend: Build API client for `POST /api/voice/parse`. Wire response to ParsedFieldForm. Handle all error codes.

**Phase 3 — Integration (frontend and backend join up):**

- End-to-end integration on a staging environment. QA runs smoke tests and integration test cases.
- Resolve any schema mismatches between the agreed API contract and the actual implementation.

**Phase 4 — Polish and edge cases:**

- Frontend: Confidence indicators, haptic feedback (P1), accessibility labels, analytics events.
- Backend: Logging, load testing, STT timeout tuning.
- QA: Full functional test suite, edge case tests, performance benchmarks.

**Phase 5 — Pre-launch regression:**

- QA runs full regression suite including existing expense entry flows.
- Analytics instrumentation verified in staging.
- Go/no-go decision against acceptance criteria (especially the 85% parse accuracy benchmark).
