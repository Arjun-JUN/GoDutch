# Feature Team Brief: Expense Splitting & Settlement (Feature 003)

## At a Glance

GoDutch Feature 003 delivers the full lifecycle of a shared expense: creating a group, logging an expense with equal/percentage/exact splits, viewing net balances, and recording settlements with two-party confirmation. The key technical bet is computing all balances from an append-only transaction log (never from a mutable counter), ensuring correctness when expenses are edited and providing an auditable history. The primary acceptance bar is that 60% of outstanding balances are marked settled within 7 days of being logged.

---

## Frontend Plan

### 1. Screen Inventory

| Screen | Purpose | Trigger |
|---|---|---|
| Balance Dashboard | Net balance (owe vs. owed), per-person breakdown | Home nav tab |
| Group List Screen | All groups the user belongs to | App home |
| Group Detail Screen | Members, expense history, group-level balances | Tap a group |
| Create Group Screen | Name a group, add members/guests | "+" on Group List |
| Create Expense Screen | Log amount, description, payer, participants, split mode | "Add Expense" on Group Detail |
| Split Configuration Screen | Choose/adjust split mode; real-time per-person amounts | Embedded in / modal-pushed from Create Expense |
| Expense Detail Screen | Full breakdown: payer, splits, settlements, edit history | Tap expense in history |
| Settle Up Screen | All outstanding amounts with one person; record lump payment | Balance Dashboard or Group Detail |
| Settlement Confirmation Screen | Celebratory closure state | On Settle Up submission |
| Edit Expense Screen (P1) | Pre-filled Create Expense form | Expense Detail → Edit |

### 2. Component Breakdown

- **BalanceSummaryCard** — large net balance, color-coded green (owed to you) / red (you owe). Props: `netAmount`, `currency`.
- **PerPersonBalanceRow** — name, avatar, amount, "Settle Up" CTA. Props: `user`, `balance`, `onSettleUp`.
- **GroupCard** — group name, member count, last activity, net group balance. Props: `group`.
- **ExpenseListItem** — description, payer, total, date. Props: `expense`, `onPress`.
- **SplitModeSelector** — segmented control: Equal / Percentage / Exact. Props: `mode`, `onChange`.
- **SplitAmountRow** — per-participant editable row. Props: `participant`, `value`, `mode`, `onChange`.
- **SplitTotalValidator** — inline green/red indicator showing whether split sums to total. Props: `total`, `splitSum`, `mode`.
- **GuestUserBadge** — renders "Name (not on GoDutch)" with distinct styling. Props: `name`.
- **SettlementConfirmationBanner** — celebratory state. Props: `payerName`, `receiverName`, `amount`.
- **MemberPickerModal** — search app users + add guests by name. Props: `selected`, `onAdd`, `onRemove`.

### 3. User Flow

**Happy path — friend pays restaurant bill:**
1. Open app → Balance Dashboard.
2. Tap Groups → tap "+" → Create Group: "Dinner Crew", add 3 friends → Confirm.
3. Tap group → Group Detail → "Add Expense".
4. Enter $80, "Thai dinner", payer = self, select 4 participants.
5. Equal split defaults: $20 each shown in real time.
6. Tap Confirm → expense saved, Group Detail shows 3 friends each owe user $20.
7. Balance Dashboard: "+$60 owed to you" in green.

**Primary error path — split doesn't sum to total (Exact mode):**
1. User enters exact amounts; SplitTotalValidator shows red "Amounts total $75 — $5.00 unassigned."
2. Confirm button disabled until totals balance.
3. User adjusts one amount → validator goes green → Confirm enabled.

**Edge case — guest member:**
1. User adds "Sam" as guest (no app account).
2. GuestUserBadge renders consistently in all views.
3. Settle Up with Sam auto-confirms (no counterparty available).

### 4. State Management

| State | Where | Notes |
|---|---|---|
| Balance data | Server-derived, app cache | Refresh on expense create/edit/settlement. Optimistic update with rollback on error. |
| Group list + membership | Server-derived, app cache | Refresh on group create/member add. |
| Active expense form | Local component state | Discarded on cancel. |
| Split mode + values | Local state | Derived/validated against expense total in real time. |
| Settlement in progress | Local state | Until submitted. |
| User auth token | Persisted (secure storage) | Survives app restart. |

### 5. API Consumption Points

| Call | Trigger | Request | Success | Failure UX |
|---|---|---|---|---|
| `POST /api/groups` | Create Group confirm | `{name, member_ids[], guest_names[]}` | 201 `{group_id, ...}` | Toast: "Couldn't create group" |
| `GET /api/groups` | Group List mount | — | 200 `[{group_id, ...}]` | Empty state |
| `GET /api/groups/:id` | Group Detail mount | — | 200 full group | "Group not available" screen |
| `POST /api/expenses` | Create Expense confirm | `{group_id, amount, description, payer_id, date, splits[]}` | 201 `{expense_id, ...}` | Inline validation (422); toast (503) |
| `GET /api/expenses/:id` | Expense Detail mount | — | 200 full expense | "Expense not found" |
| `GET /api/balances` | Balance Dashboard mount | `?group_id=` optional | 200 `{net_total, per_person[]}` | Skeleton → error state |
| `POST /api/settlements` | Settle Up confirm | `{payer_id, receiver_id, amount, group_id, date}` | 201 `{settlement_id, status: "pending"}` | Toast error |
| `POST /api/settlements/:id/confirm` | Counterparty confirms | — | 200 `{status: "confirmed"}` | Toast: "Couldn't confirm" |
| `PATCH /api/expenses/:id` (P1) | Edit Expense save | Same as POST | 200 `{expense}` | Toast error |

### 6. Design Considerations

- **Balance Dashboard**: net balance number is the first thing seen — large, full-width, color-coded. Color alone is never the only differentiator: show explicit +/– sign for accessibility.
- **Split Confirmation**: show each person's final dollar amount before tap. Summary card collapses/expands per-person breakdown.
- **Settlement flow**: celebratory animation on settlement confirmation. Copy: "You're all square with Jordan."
- **Guest users**: consistent "(not on GoDutch)" sub-label; no broken avatar.
- **Loading states**: skeleton placeholders for balance rows and expense list on first load.
- **Accessibility**: min 44×44pt tap targets; balance amounts read as "You owe forty dollars" by screen reader.
- **Small phones**: Split Configuration scrolls if >5 participants; Confirm button fixed above keyboard.

### 7. Frontend Implementation Checklist

1. Add Group List, Group Detail, Balance Dashboard to tab navigator; scaffold all screens.
2. Implement Group List + Create Group (GET/POST /api/groups).
3. Build MemberPickerModal: app user search + guest name entry.
4. Implement Group Detail: expense history list, member balances.
5. Build Create Expense form: amount, description, payer selector.
6. Build SplitModeSelector + SplitAmountRow components.
7. Implement SplitTotalValidator with real-time feedback and Confirm gate.
8. Wire Create Expense to POST /api/expenses with optimistic list update + rollback.
9. Build Expense Detail screen (GET /api/expenses/:id).
10. Build Balance Dashboard (GET /api/balances): BalanceSummaryCard + PerPersonBalanceRow.
11. Build Settle Up screen + POST /api/settlements.
12. Build Settlement Confirmation banner/animation.
13. Handle all error paths: toast system, form inline errors, empty states.
14. Accessibility audit: tap targets, screen reader labels, color contrast.
15. Edge cases: guest display, single-participant split, zero-balance states, optimistic rollback.

---

## Backend Plan

### 1. Data Models

**Group** — `group_id` (UUID PK), `name` (VARCHAR 255, NOT NULL), `created_by` (FK → users), `created_at`, `currency` (VARCHAR 3, DEFAULT 'USD').

**GroupMember** — `group_id` (FK), `user_id` (FK, nullable for guests), `guest_name` (VARCHAR 255, nullable), `joined_at`. Constraint: exactly one of `user_id` / `guest_name` must be set.

**Expense** — `expense_id` (UUID PK), `group_id` (FK), `payer_id` (FK → users), `amount` (DECIMAL 12,2), `description` (VARCHAR 500), `date`, `created_at`, `updated_at`, `is_deleted` (BOOLEAN, soft delete).

**Split** — `split_id` (UUID PK), `expense_id` (FK), `user_id` (FK, nullable for guests), `guest_member_id` (FK for guests), `share_amount` (DECIMAL 12,2). Note: SUM(share_amount) per expense validated in business logic (not DB constraint) due to rounding.

**Settlement** — `settlement_id` (UUID PK), `group_id` (FK), `payer_id` (FK), `receiver_id` (FK), `amount` (DECIMAL 12,2), `date`, `created_at`, `confirmed_at` (null until confirmed), `confirmed_by` (FK), `status` (ENUM: pending / confirmed / disputed).

### 2. API Endpoints

**Groups:**
- `POST /api/groups` — Auth. Body: `{name, member_ids[], guest_names[]}`. 201 `{group_id, name, members[]}`. 400 if name empty.
- `GET /api/groups` — Auth. 200 `[{group_id, name, member_count, net_balance, last_activity}]`.
- `GET /api/groups/:id` — Auth, must be member. 200 `{group, members[], expenses[], balances{}}`. 403 if not member, 404 if not found.
- `POST /api/groups/:id/members` — Auth, must be member. Body: `{user_id?}` or `{guest_name?}`. 201 `{member}`. 409 if already member.

**Expenses:**
- `POST /api/expenses` — Auth, must be group member. Body: `{group_id, amount, description, payer_id, date, splits: [{user_id, share_amount}]}`. Validates splits sum to amount (±$0.01). 201 `{expense_id, ...expense, splits[]}`. 422 `{error: "split_mismatch", diff: X}` if invalid.
- `GET /api/expenses/:id` — Auth, must be in expense's group. 200 `{expense, splits[], settlements[], edit_history[]}`. 403/404 as applicable.
- `PATCH /api/expenses/:id` (P1) — Auth, must be group member. Same optional fields. 200 `{expense}`. Recomputes all affected balances; emits group notification.

**Balances:**
- `GET /api/balances` — Auth. Query: `?group_id=` (optional). 200 `{net_total, per_person: [{user_id, name, balance}], by_group: [{group_id, balance}]}`. Computed from transaction log, never from a stored mutable counter.

**Settlements:**
- `POST /api/settlements` — Auth, must be involved party. Body: `{payer_id, receiver_id, amount, group_id, date}`. 201 `{settlement_id, status: "pending"}`. Triggers notification to receiver.
- `POST /api/settlements/:id/confirm` — Auth, must be receiver. 200 `{status: "confirmed", confirmed_at}`. 403 if wrong user, 409 if already confirmed.

### 3. Business Logic

**Balance computation (pure, testable, computed from log):**
1. Fetch all non-deleted expenses for scope (group or all groups for user).
2. For each expense: credit payer `amount`; debit each split participant their `share_amount`.
3. Fetch all confirmed settlements: debit payer, credit receiver.
4. Net per-person pairs: `balance[A][B] = Σ(A paid for B) − Σ(B paid for A) − settlements(A→B) + settlements(B→A)`.
5. Return net per-person balances. Positive = owed to current user; negative = current user owes.

**Split validation:**
1. Sum all `share_amount` values in request.
2. Compare to `expense.amount` with ±$0.01 rounding tolerance.
3. If mismatch exceeds tolerance → 422 with `{error: "split_mismatch", diff: X}`.
4. Validate all split `user_id` values are group members → 422 if unknown.

**Debt simplification — P1 (greedy min-transfer algorithm):**
1. Compute net balances across all pairs; collapse to single net-per-person.
2. Separate into creditors (positive) and debtors (negative).
3. Match largest debtor to largest creditor; create transfer for min(|debtor|, |creditor|); reduce both; repeat until all zero.
4. Return `[{from, to, amount}]` suggested transfers.

**Settlement confirmation model:**
- Initiating party creates settlement (status: `pending`); not yet counted in balances.
- Counterparty confirms via `/confirm`; status becomes `confirmed`; balances recomputed.
- Only `confirmed` settlements affect balance computation.
- Guest settlements: auto-confirmed on initiation (guest cannot confirm).

**Silent failure risks to guard:**
- Use integer arithmetic (cents) internally; convert to decimal only at API boundary to avoid floating-point accumulation.
- Expense edits must recompute all downstream splits and re-evaluate against existing confirmed settlements.
- Double-confirmation blocked with 409.

### 4. External Integrations

- **Push notifications (P1):** Firebase Cloud Messaging (FCM) for cross-platform delivery. Triggers: user added to expense, settlement created (notify receiver), settlement confirmed (notify initiator). Fallback: silent if device token absent (no blocking).
- **No payment integrations in v1** per spec non-goals.

### 5. Storage & Persistence

- **Primary DB:** PostgreSQL. All entities stored permanently.
- **Balance computation:** on-the-fly from transaction log; no mutable balance columns.
- **Caching:** balance results cached per-user (short TTL, e.g., 30s); invalidated on expense create/edit/settlement confirm.
- **Audit:** expenses soft-deleted (`is_deleted`) to preserve edit history. No hard deletes.
- **Privacy:** no PII beyond user-entered data. Expense descriptions never logged to server logs.

### 6. Error Handling Strategy

**Expected errors:**
- `422 split_mismatch` — return diff amount.
- `403 not_member` — clear message, no data leaked.
- `409 already_confirmed` — settlement already confirmed.
- `404 not_found` — resource doesn't exist.
- `400 validation_error` — missing required fields.

**Unexpected errors:**
- DB failure → 503; log with request ID; client sees generic retry message.
- Unhandled exception → 500; log with correlation ID; no stack traces to client.

### 7. Backend Implementation Checklist

1. Write DB migrations: groups, group_members, expenses, splits, settlements tables.
2. Implement balance computation function (pure, no DB side effects), unit-tested.
3. Implement split validation function with rounding tolerance.
4. Build Group endpoints: POST/GET /api/groups, GET /api/groups/:id, POST members.
5. Build Expense endpoints: POST /api/expenses (with split validation), GET /api/expenses/:id.
6. Build Balance endpoint: GET /api/balances (computed, not stored).
7. Build Settlement endpoints: POST /api/settlements, POST /api/settlements/:id/confirm.
8. Implement auth middleware (all endpoints require valid session).
9. Implement permission checks (group membership, settlement party validation).
10. Wire error handling middleware: classify, log 5xx, return safe messages.
11. Add balance caching with invalidation hooks.
12. Implement debt simplification algorithm (greedy min-transfer) — P1.
13. Add FCM push notification triggers — P1.
14. Integration tests: group → expense → balances → settle → confirm → zero balance.

---

## QA Plan

### 1. Acceptance Criteria

> **Group creation:** Given an authenticated user, when they create a group with a name and at least one member, then the group appears in their Group List and all added members see it, completed in < 3 taps.

> **Guest member:** Given a group, when a user adds a guest by name, then the guest appears labeled "(not on GoDutch)" and can be included in splits.

> **Equal split:** Given a group with N members, when a user creates an expense and selects equal split, then each member's share = total / N (rounded), displayed in real time before confirmation.

> **Percentage split:** Given percentage mode selected, when values are entered, then amounts update in real time and confirmation is blocked until percentages sum to 100%.

> **Exact split:** Given exact mode selected, when amounts are entered, then confirmation is blocked until amounts sum to the expense total (±$0.01 tolerance).

> **Balance view — net total:** Given expenses are logged, when the user opens Balance Dashboard, then a single net balance (positive = green = owed to user; negative = red = user owes) is displayed prominently.

> **Balance view — per-person:** Given balances across multiple people, then each person appears with the correct net amount.

> **Settlement — two-party confirmation:** Given user A initiates a settlement to user B, then it shows as "pending" and balance does not change until B confirms; after B confirms, both balances update to reflect the payment.

> **Settlement — guest auto-confirm:** Given a settlement involves a guest, when the initiating party marks it paid, then it is automatically confirmed.

> **Expense history:** Given a group with expenses, then all expenses appear in reverse chronological order; tapping any shows the full detail.

> **Group creation speed:** The create-group flow completes in < 3 taps.

> **Settlement rate:** ≥ 60% of outstanding balances are settled within 7 days (analytics target, measured post-launch).

### 2. Happy Path Scenarios

**Scenario 1 — Friend pays and splits evenly:**
1. Open app → Balance Dashboard shows "$0 — All square" (green).
2. Groups tab → "+" → enter "Trip to Vegas", add 3 friends → Confirm. Group appears in list.
3. Tap group → Group Detail: empty history, $0 balance.
4. "Add Expense" → "$200", "Hotel deposit", payer = self, 4 participants. Equal split: $50 each shown in real time.
5. Confirm → 3 friends each owe user $50. Balance Dashboard: "+$150 owed to you" in green.

**Scenario 2 — Roommate settles up:**
1. Balance Dashboard shows "-$80" in red (user owes roommate Alex).
2. Tap "Settle up with Alex" → Settle Up screen shows $80 outstanding.
3. Pay Alex via Venmo, tap "Record Payment", enter $80, confirm.
4. Status shows "Pending Alex's confirmation." Balance not yet cleared.
5. Alex confirms in-app → both balances update to $0.

**Scenario 3 — Custom (unequal) split:**
1. Create expense "$90", "Dinner", 2 friends. Switch to Exact mode.
2. Enter $60 for self, $30 for friend. Validator: "Total: $90 ✓" in green. Confirm enabled.
3. Confirm → friend owes user $30; user owes nobody.

### 3. Edge Cases

1. **Rounding with odd cents:** $10 / 3 = $3.33 + $3.33 + $3.34. Verify one participant gets the extra cent; total still equals $10.00; confirmation not blocked.
2. **Single-participant expense:** User creates expense including only themselves. Verify app either blocks this with a helpful message or handles it gracefully (no phantom debt created).
3. **Edit expense already partially settled:** User edits amount on an expense where one participant has a confirmed settlement. Verify balances recompute correctly; confirmed settlement preserved in history; net balance reflects the edit.
4. **All group members are guests:** Only creator has an app account. Balance view shows all guest balances correctly; all settlements auto-confirm.
5. **Simultaneous expense creation by two members:** Both saved correctly, no race condition produces duplicate data or incorrect balances.
6. **Group member removal with outstanding balance:** App blocks removal and displays outstanding balance.
7. **Zero-amount expense:** Verify the app blocks with a clear error or handles gracefully (no debt created).
8. **Large group (20 members):** $101 equal split — rounding distributes correctly; debt simplification algorithm completes in < 200ms.

### 4. Error State Testing

**Split mismatch (exact mode):**
- Trigger: entered amounts don't sum to expense total.
- Expected UI: red "Amounts total $75.00 — $5.00 still unassigned." Confirm button disabled.
- Recovery: adjust any amount → validator updates in real time → confirm re-enables when balanced.

**Network error during expense save:**
- Trigger: submit expense while offline or server returns 503.
- Expected UI: toast "Couldn't save expense — check your connection and try again." Form data preserved.
- Recovery: user retries without re-entering data.

**Settlement confirm by wrong user:**
- Trigger: initiator tries to confirm their own settlement.
- Expected UI: confirm option not shown to initiator in client. API returns 403; no state change.

**Split with non-member:**
- Trigger (API-level): split includes a user_id not in the group.
- Expected: 422 "User X is not a member of this group." Client shows error toast.

**Group not found:**
- Trigger: navigate to a deleted group or one from which user was removed.
- Expected UI: "This group is no longer available." with navigation back to Group List.

### 5. Performance Benchmarks

| Metric | How to measure | Pass threshold |
|---|---|---|
| Balance load time | Time from screen mount to balance displayed | < 500ms on median device |
| Expense confirmation (perceived) | Time from Confirm tap to expense in list | < 1s (optimistic update immediate) |
| Split recalculation | Time from amount input to per-person amounts updating | < 50ms (local, no network) |
| Group creation end-to-end | Manual timing / session recording | < 10s |
| Balance computation (server-side) | Server timing logs | < 200ms for groups up to 20 members |
| Settlement rate | Analytics event tracking | ≥ 60% of balances settled within 7 days |

### 6. Integration Test Points

- **Create expense → GET balances:** POST /api/expenses → GET /api/balances must reflect new split amounts for all involved users. Assert per-person balance changes by exact share_amount.
- **Settle → confirm → GET balances:** POST /api/settlements + POST confirm → GET /api/balances must show reduced balance for that pair. Assert `confirmed_at` is set.
- **Edit expense → GET balances (P1):** PATCH /api/expenses → GET balances must show retroactively recomputed balances. Assert old split amounts are not double-counted.
- **Optimistic update rollback:** Client creates expense, server returns 503. Assert client balance reverts and expense does not appear in history.
- **Split rounding across boundary:** Server returns splits summing exactly to expense amount (±1 cent); client displays totals consistently with server values.
- **Dual settlement confirm race condition:** Two clients attempt to confirm the same settlement simultaneously. Assert only one succeeds (409 on second); no double-credit.

### 7. QA Checklist

**Smoke tests (run first, fast):**
- [ ] App launches; Balance Dashboard renders without error
- [ ] Can create a group with 2+ members
- [ ] Can add an expense with equal split
- [ ] Balance updates after expense creation
- [ ] Can record a settlement

**Functional tests:**
- [ ] All three split modes (equal, percentage, exact) compute and display correctly
- [ ] Split validation blocks confirmation when amounts don't balance
- [ ] Expense history displays in reverse chronological order
- [ ] Expense detail shows full split breakdown, payer, and any settlements
- [ ] Settlement two-party confirmation flow (pending → confirmed)
- [ ] Guest user displays correctly in all views with "(not on GoDutch)" label
- [ ] Balance Dashboard shows correct green/red and per-person breakdown
- [ ] Settle Up screen aggregates all debts with one person into single flow

**Edge case tests:**
- [ ] Rounding: odd-cent splits distribute correctly, total preserved
- [ ] Zero-amount expense handled gracefully
- [ ] Single-participant expense
- [ ] Simultaneous expense creation by two group members
- [ ] Group member removal blocked when outstanding balance exists

**Regression tests:**
- [ ] User auth / login flow unaffected
- [ ] Existing contact/friend list unaffected (if pre-existing)
- [ ] Push notifications delivered on expense add and settlement events (P1)
- [ ] App performance acceptable on low-end device with 20-member group

---

## Integration Handshake

The critical interface both sides must agree on before writing a line of code:

### Expense Creation

**Request** (`POST /api/expenses`):
```json
{
  "group_id": "uuid",
  "amount": 80.00,
  "description": "Thai dinner",
  "payer_id": "uuid",
  "date": "2026-03-28",
  "splits": [
    { "user_id": "uuid", "share_amount": 20.00 },
    { "user_id": "uuid", "share_amount": 20.00 },
    { "guest_member_id": "uuid", "share_amount": 20.00 },
    { "user_id": "uuid", "share_amount": 20.00 }
  ]
}
```

**Success response** (201):
```json
{
  "expense_id": "uuid",
  "group_id": "uuid",
  "amount": 80.00,
  "description": "Thai dinner",
  "payer_id": "uuid",
  "date": "2026-03-28",
  "splits": [
    { "split_id": "uuid", "user_id": "uuid", "share_amount": 20.00 }
  ]
}
```

**Error response** (422 — split mismatch):
```json
{ "error": "split_mismatch", "diff": 5.00, "message": "Split amounts total $75.00; expense is $80.00." }
```

### Balance Response

**GET /api/balances** (200):
```json
{
  "net_total": 60.00,
  "per_person": [
    { "user_id": "uuid", "name": "Jordan", "balance": 20.00 },
    { "user_id": "uuid", "name": "Sam", "balance": 20.00, "is_guest": true },
    { "user_id": "uuid", "name": "Alex", "balance": 20.00 }
  ],
  "by_group": [
    { "group_id": "uuid", "name": "Dinner Crew", "balance": 60.00 }
  ]
}
```
- Positive `balance` = this person owes the current user.
- Negative `balance` = current user owes this person.

### Settlement Creation

**Request** (`POST /api/settlements`):
```json
{
  "payer_id": "uuid",
  "receiver_id": "uuid",
  "amount": 80.00,
  "group_id": "uuid",
  "date": "2026-03-28"
}
```

**Success** (201): `{ "settlement_id": "uuid", "status": "pending" }`

**Confirm** (`POST /api/settlements/:id/confirm`) — no body. Returns `{ "status": "confirmed", "confirmed_at": "2026-03-28T..." }`.

### Agreed Error Codes

| Code | Meaning | Client action |
|---|---|---|
| 400 | Missing/invalid field | Show inline validation |
| 403 | Not authorized (not a member, wrong party) | Show "not available" screen |
| 404 | Resource not found | Show not-found screen |
| 409 | Conflict (already member, already confirmed) | Show inline notice |
| 422 | Business rule violation (split mismatch, unknown member) | Show specific inline error with detail |
| 503 | Server unavailable | Toast: retry |

---

## Open Questions

From all three specialists, the following require resolution before or during development:

1. **Settlement confirmation model** (Product + Design — Blocking): Does one party marking "paid" settle it, or does the other party need to confirm? The spec leans toward two-sided (pending → confirmed) but notes one-sided is faster. This affects trust model, balance computation timing, and the entire Settle Up UX flow. **Recommend:** two-sided with a 48-hour auto-confirm fallback if the receiver doesn't respond.

2. **Guest settlement flow** (Product + Engineering — Partially resolved): Guests cannot confirm settlements in-app. The current proposal is auto-confirm on initiation. But how do guests see their balance at all? Do we send them a link or SMS? Spec says display-only for v1 is acceptable — clarify whether that means no outbound communication at all.

3. **Single-participant expense** (QA + Frontend): Should a user be allowed to create an expense that splits only to themselves (no debt created)? This is a valid personal expense tracking use case but is out of tone for a debt-splitting app. Define behavior: block with error, allow silently, or prompt.

4. **Rounding policy for odd-cent splits** (Backend + QA): Who gets the extra cent when a total doesn't divide evenly? Define a deterministic policy (e.g., first participant in list) so frontend display and backend storage are always consistent.

5. **Expense edit + existing settlements** (Backend + QA — P1 gating question): If an expense is edited after a settlement has been confirmed against it, how should the system resolve the discrepancy? The spec allows editing (P1), but the interaction with confirmed settlements needs a defined rule before PATCH /api/expenses is built.

6. **Group member removal with outstanding balance** (Product): The spec says "block deletion if balance > $0 for v1." Confirm this is the intended UX and that there is no admin override.

---

## Build Order

**Sprint 1 — Foundations (must ship together):**
1. DB migrations (groups, group_members, expenses, splits, settlements).
2. Balance computation function — pure, unit-tested, no stored mutable counter.
3. Split validation function with rounding tolerance.
4. Group endpoints: POST/GET /api/groups, GET /api/groups/:id.
5. Frontend: Group List, Create Group screens + MemberPickerModal.
6. Integration handshake verification: can create a group end-to-end.

**Sprint 2 — Core expense loop:**
7. POST /api/expenses + GET /api/expenses/:id (backend).
8. GET /api/balances (backend, computed).
9. Frontend: Create Expense screen, SplitModeSelector, SplitAmountRow, SplitTotalValidator.
10. Frontend: Group Detail with expense history, Balance Dashboard.
11. Smoke tests: create expense → verify balances correct on all devices.

**Sprint 3 — Settlement:**
12. POST /api/settlements + POST /api/settlements/:id/confirm (backend).
13. Frontend: Settle Up screen, Settlement Confirmation screen.
14. Two-party confirmation UX and pending state display.
15. Guest auto-confirm logic.
16. Functional QA: full happy-path scenarios 1, 2, 3.

**Sprint 4 — Polish + P1:**
17. Edge case coverage: rounding, zero-amount, single-participant, concurrent creates.
18. Error handling: all toast/inline/empty-state paths verified.
19. Accessibility audit.
20. PATCH /api/expenses (expense editing) — gated on open question #5 answer.
21. Debt simplification algorithm.
22. Push notifications (FCM integration).
23. Performance benchmarking and caching tuning.
24. Regression test pass.

**Gating dependencies:**
- Sprint 2 is gated on Sprint 1 (group must exist before expense).
- Sprint 3 is gated on Sprint 2 (balances must be correct before settlement changes them).
- Expense editing (P1) is gated on resolution of open question #5.
- Debt simplification (P1) is gated on balance computation being stable (can be added independently in Sprint 4).
