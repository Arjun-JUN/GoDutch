# Feature Spec: Voice Input for Expenses

**Feature #:** 002
**Status:** ✅ Specced
**Created:** 2026-03-27
**Last updated:** 2026-03-27

---

## Problem Statement

Opening an app, finding the right screen, and tapping through a form to log an expense takes 30–60 seconds — and that's in a quiet moment. In practice, expenses happen at the worst times: hands full with grocery bags, mid-conversation at a restaurant, or while juggling transit. Voice input lets users log expenses in a single spoken sentence without unlocking their phone, navigating menus, or typing a single character. For both friend groups ("I paid $120 for dinner, split four ways") and roommates ("I picked up laundry detergent for $14"), voice is the fastest path from "I just paid" to "it's logged."

---

## Goals

1. **Achieve sub-10-second expense logging** — from tapping the mic to a confirmed expense entry in under 10 seconds for a clear spoken input.
2. **Parse natural language accurately** — amount, description, and (optionally) people or split instructions extracted correctly from ≥ 85% of well-formed utterances.
3. **Serve on-the-go use cases** — 40% of voice-logged expenses submitted without the user editing any parsed field (measures how often we get it right on the first try).
4. **Increase logging frequency** — users who use voice input log expenses 2× more often per week than users who use manual entry only.
5. **Reduce abandonment at the entry step** — voice-initiated expenses are abandoned (started but not confirmed) at a lower rate than manual-entry expenses.

---

## Non-Goals

1. **Hands-free / always-on listening** — there is no wake word or background listening; the mic only activates on explicit user tap. Privacy and battery life are non-negotiable.
2. **Multi-expense dictation in one utterance** — "I paid for dinner and drinks" is treated as one expense, not two. Splitting into multiple expenses from one utterance is out of scope for v1.
3. **Multi-language support beyond English** — v1 is English-only. Other languages are architecturally possible but require separate validation and tuning.
4. **Voice-driven navigation or commands** — voice is only for logging expenses, not for navigating the app or editing past entries.
5. **Real-time live transcription display** — the app does not show word-by-word transcription during recording; it processes and displays the result after the user stops speaking.

---

## User Stories

### Friend group persona

- As a friend who just picked up the tab, I want to say "I paid $85 for dinner, split between me, Jordan, and Priya" so that the expense is logged and assigned before we even leave the restaurant.
- As a friend group member, I want to review the parsed result before confirming so that I can catch if the voice recognition misheard an amount or name.
- As a user in a noisy environment, I want to edit the transcription result if it got something wrong so that I'm not stuck with an incorrect expense.

### Roommate persona

- As a roommate, I want to say "I bought dish soap for $6.50" so that I can log a small shared expense in under 5 seconds without opening a form.
- As a roommate, I want the app to recognize my housemates' names from my contact list so that I can mention them by first name and have them auto-assigned to the split.

### Both personas (error / edge cases)

- As a user in a loud environment where transcription fails, I want a clear error message and a fast path to manual entry so that I'm never blocked from logging an expense.
- As a user, I want to re-record my voice input if I misspoke so that I don't have to manually correct multiple fields.

---

## Requirements

### Must-Have (P0)

- **Tap-to-record mic button** — a prominent, single-tap mic button on the main screen and expense entry screen activates recording.
  - *Acceptance criteria:* Recording starts within 500ms of tap. A clear visual and audio indicator confirms recording is active. Recording stops when the user taps again or after a configurable silence timeout (default: 2 seconds of silence).
- **Speech-to-text transcription** — spoken audio is transcribed to text using the device's native speech recognition (or a cloud API).
  - *Acceptance criteria:* Transcription completes within 3 seconds of recording ending. The raw transcription is displayed on the confirmation screen.
- **Natural language parsing** — the transcription is parsed to extract: amount (required), description (required), currency (optional, defaults to user's locale), and people/split (optional).
  - *Acceptance criteria:* Amount and description are extracted from ≥ 85% of well-formed utterances. Unrecognized or ambiguous fields are left blank for manual completion rather than populated with wrong data.
- **Editable confirmation screen** — the user sees all parsed fields in an editable form before the expense is saved.
  - *Acceptance criteria:* All fields are editable. The raw transcription is shown at the top for reference. A "Re-record" button allows starting over.
- **Fallback to manual entry** — if transcription or parsing fails, the user is offered manual entry without a dead end.
  - *Acceptance criteria:* Transcription failures surface a clear error message. A "Type instead" button is always visible on the recording and result screens.

### Nice-to-Have (P1)

- **Contact name recognition** — if the user says a name that matches someone in their contacts (or the current group), auto-assign them to the split.
- **Amount disambiguation** — if the amount is ambiguous (e.g., "thirty" vs. "$30" vs. "thirty dollars"), surface the interpreted value and let the user confirm quickly.
- **Common expense shortcuts** — recognize shorthand phrases like "split evenly" or "just between us two" and translate them to the appropriate split mode.
- **Haptic feedback** — brief haptic when recording starts and stops, useful when the user can't look at the screen.

### Future Considerations (P2)

- **Multi-language support** — Spanish, French, Hindi, and other languages based on user demand.
- **Custom vocabulary** — let users teach the app recurring vendor names (e.g., "The Noodle Place" always maps to a specific restaurant tag).
- **Widget / lock-screen shortcut** — a home screen widget or lock-screen action for one-tap mic access without opening the app.
- **Voice editing of past entries** — "Change that last expense to $45."

---

## Success Metrics

### Leading indicators (days 1–14 post-launch)
| Metric | Target |
|---|---|
| Parse success rate | ≥ 85% of attempts extract a valid amount + description |
| No-edit confirmation rate | ≥ 40% of voice entries confirmed without editing any field |
| Time from mic tap to confirmed expense | Median ≤ 10 seconds |
| Fallback-to-manual rate | ≤ 15% of voice attempts |
| Re-record rate | ≤ 10% of attempts (measures UX clarity and mic quality) |

### Lagging indicators (30–90 days post-launch)
| Metric | Target |
|---|---|
| Voice-initiated expenses as % of all logged expenses | ≥ 30% among active users |
| Logging frequency: voice users vs. manual-only users | 2× more expenses/week for voice users |
| D30 retention for voice users vs. non-voice users | Voice users retain at higher rate |

---

## Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | Native on-device speech (Apple SFSpeechRecognizer / Android SpeechRecognizer) vs. cloud API (Whisper, Google Speech-to-Text)? On-device is private and offline-capable; cloud handles accents and noise better. | Engineering | Yes — privacy and accuracy trade-off |
| 2 | Where does NLP parsing live — on-device rule-based, on-device ML model, or cloud LLM call? | Engineering | Yes — affects latency, cost, and accuracy |
| 3 | How do we handle currency when the user doesn't specify? Default to device locale? Last-used currency? | Product | No — can default to locale for v1, refine later |
| 4 | Do we need explicit microphone permission prompting flow? iOS requires a permission dialog; we need to design the pre-permission explanation. | Design | No — standard permission flow, but needs copy |
| 5 | How do we handle partial speech — user says only "I paid fifty" without a description? Do we prompt, or populate description as blank? | Design + Product | No — can launch with blank field + prompt on confirmation |

---

## Design Notes

- The mic button should be the most prominent action on the main screen. It competes with nothing. Users should reach for it instinctively.
- Recording state must be unambiguously clear — pulsing animation, color change, and (on iOS) a status bar indicator. Users in noisy environments cannot rely on hearing a beep.
- The confirmation screen carries the same design principles as OCR: errors caught here are fine; errors that slip through are not. Make the amount field especially large and easy to correct at a glance.
- The raw transcription displayed on the confirmation screen is important for trust — users want to see what the app heard, not just what it inferred.

---

## Technical Notes

- NLP parsing can be a lightweight rule-based system for v1: regex + pattern matching for currency amounts, ordinal numbers, and common split phrases. This avoids an LLM API call on every voice entry.
- Silence detection for auto-stop should be tunable — default 2 seconds, but consider 1.5 seconds for a snappier feel in testing.
- The parsed result should include a confidence score per field. Low-confidence fields should be visually flagged on the confirmation screen.
- Contact name matching requires the contacts permission. This is a P1 feature and must be gated behind permission; the core voice flow should work without it.

---

## Change Log

| Date | Change |
|---|---|
| 2026-03-27 | Spec created |
