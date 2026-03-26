# Feature Spec: Receipt Scanning via OCR

**Feature #:** 001
**Status:** ✅ Specced
**Created:** 2026-03-27
**Last updated:** 2026-03-27

---

## Problem Statement

When a group pays a shared bill — at a restaurant, on a trip, or around the house — someone has to manually type in every line item, total, and participant share. This friction means people either skip logging expenses entirely or settle for rough approximations that breed resentment over time. For both friend groups and roommates, the tedious entry step is the single biggest barrier to actually tracking shared spending. By letting users point their phone camera at a receipt and have expenses auto-fill, we eliminate the #1 source of drop-off before a split even begins.

---

## Goals

1. **Reduce time-to-split** — a user should go from receipt in hand to a split ready to send in under 30 seconds for a typical restaurant bill.
2. **Eliminate manual data entry** — 90% of receipts produce a usable, editable expense summary without the user typing a single number.
3. **Drive core activation** — 70% of new users who open the app for the first time complete their first split using OCR rather than manual entry.
4. **Reduce entry errors** — parsed totals match actual receipt totals within ±$0.05 in at least 85% of scans.
5. **Build habit formation** — users who successfully scan a receipt in their first session are 3× more likely to return within 7 days.

---

## Non-Goals

1. **Splitting by line item** — this version extracts the total only; line-item assignment per person is out of scope for v1 (planned for a future "itemized split" feature).
2. **Handwritten receipts** — OCR accuracy on handwriting is too low to be reliable; only printed receipts are supported in v1.
3. **Multi-receipt merging** — combining multiple receipts into one expense is not in scope.
4. **Automatic currency conversion** — foreign currency receipts will be parsed but not auto-converted; users will enter their preferred currency manually.
5. **Cloud storage of receipt images** — images are processed locally or ephemerally; raw receipt photos are not stored in the user's account history in v1 (privacy-first, reduces infra complexity).

---

## User Stories

### Friend group persona

- As a friend who just paid the restaurant bill, I want to scan the receipt so that I don't have to type in the total and can start splitting immediately.
- As a friend in the group, I want to see a preview of the parsed receipt details before confirming so that I can catch any scanning errors before money changes hands.
- As anyone in the group, I want to edit any field the OCR got wrong so that the split is always based on accurate numbers.

### Roommate persona

- As a roommate who pays a shared household bill, I want to scan the invoice or receipt so that I can log the expense without manually entering the vendor, amount, and date.
- As a roommate, I want the app to remember recurring vendors from past scans (e.g., "PG&E", "Whole Foods") so that future scans are confirmed even faster.

### Both personas (error / edge cases)

- As a user whose scan fails or produces garbled output, I want a clear error state with the option to retake the photo or enter manually so that I'm never left stuck.
- As a user with a crumpled or low-light receipt, I want guidance on how to hold the camera so that I can improve the scan quality before submitting.

---

## Requirements

### Must-Have (P0)

- **Camera capture** — the app opens the device camera in-app; the user taps to capture the receipt.
  - *Acceptance criteria:* Camera opens within 2 seconds of tapping "Scan receipt." Capture works on both iOS and Android.
- **OCR parsing** — the captured image is processed to extract: merchant name, date, subtotal, tax, tip (if present), and grand total.
  - *Acceptance criteria:* All six fields are attempted. Any field that cannot be parsed is left blank rather than populated with garbage data. Parse completes within 5 seconds on a standard device.
- **Editable confirmation screen** — after parsing, the user sees all extracted fields in an editable form before proceeding.
  - *Acceptance criteria:* Every parsed field is tappable and editable. Changes update the grand total in real time if the user edits subtotal, tax, or tip.
- **Fallback to manual entry** — if OCR fails entirely, the user is offered a "Enter manually" path with no dead end.
  - *Acceptance criteria:* If parsing fails or confidence is too low, a non-blocking error banner appears and the user is taken to a pre-filled manual entry form.
- **Scan retry** — the user can retake the photo without losing context.
  - *Acceptance criteria:* "Retake" button on the confirmation screen returns to camera. Previously parsed data is discarded and replaced with new scan results.

### Nice-to-Have (P1)

- **Scan quality guidance** — real-time camera overlay hints (e.g., "Move closer," "Better lighting needed") before capture.
- **Tip auto-suggestion** — if no tip line is detected, surface a quick-add tip selector (15%, 18%, 20%, custom) on the confirmation screen.
- **Vendor memory** — if the same vendor name appears in a previous expense, pre-fill the category tag.
- **Image import from photo library** — allow the user to select an existing photo from their camera roll instead of taking a new picture.

### Future Considerations (P2)

- **Line-item extraction** — parse individual items for per-person assignment.
- **Multi-receipt grouping** — merge multiple scans into one shared expense.
- **Receipt history** — store a thumbnail of the receipt linked to the logged expense for reference.
- **International receipt formats** — support VAT invoices, comma-as-decimal formats, and non-Latin merchant names.

---

## Success Metrics

### Leading indicators (days 1–14 post-launch)
| Metric | Target |
|---|---|
| OCR parse success rate | ≥ 85% of scans produce a usable total |
| Parse accuracy | Grand total within ±$0.05 on ≥ 85% of successful scans |
| Time from scan to confirmed split | Median ≤ 30 seconds |
| Fallback-to-manual rate | ≤ 15% of scan attempts |
| Confirmation screen edit rate | ≤ 25% of scans require user correction (tracks OCR quality) |

### Lagging indicators (30–90 days post-launch)
| Metric | Target |
|---|---|
| OCR-initiated splits as % of all splits | ≥ 70% |
| D7 retention for users who scanned in session 1 | 3× higher than manual-entry users |
| Support tickets related to wrong amounts | < 2% of monthly active users |

---

## Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | Which OCR service to use — on-device (Apple Vision / Google ML Kit) vs. cloud (Google Cloud Vision, AWS Textract)? On-device is faster and private; cloud is more accurate on hard receipts. | Engineering | Yes — affects architecture |
| 2 | What confidence threshold should trigger "parse failed" vs. "parse succeeded with warnings"? | Engineering + Design | Yes — determines fallback UX |
| 3 | Should we store the receipt image at all (even temporarily on-device) for dispute reference, or process and discard immediately? | Product + Legal | No — can ship without, revisit in v2 |
| 4 | How should we handle receipts with multiple payment methods (e.g., split between cash and card)? | Product | No — edge case, manual override is acceptable for v1 |

---

## Design Notes

- The camera screen should feel native and fast — avoid heavy chrome or instruction text that slows down the moment.
- The confirmation screen is the most important screen in this flow. Parsing errors caught here are fine; parsing errors that make it to the split are not. Design should make edits feel easy and expected, not like a failure.
- Error states should be friendly and instructional — "We couldn't read that receipt clearly. Try again with better lighting or enter the details yourself." Never a raw error code.

---

## Technical Notes

- On-device OCR (Apple Vision Framework on iOS, Google ML Kit on Android) is preferred for v1: zero latency, no API cost, no receipt data leaving the device.
- If on-device accuracy proves insufficient in testing, move to a cloud OCR API with the receipt image sent over HTTPS and immediately discarded after parsing.
- Confidence scoring from the OCR engine should gate the confirmation screen — fields with low confidence should be visually flagged for user review.
- Grand total reconciliation: if extracted subtotal + tax + tip ≠ extracted total, surface a warning on the confirmation screen.

---

## Change Log

| Date | Change |
|---|---|
| 2026-03-27 | Spec created |
