# Feature Spec: Expense Splitting & Settlement

**Feature #:** 003
**Status:** ✅ Specced
**Created:** 2026-03-27
**Last updated:** 2026-03-27

---

## Problem Statement

Logging a shared expense is only half the job — the other half is knowing who owes what and getting paid back. Today, people track this in their heads, in Notes apps, or in group chats, which means balances are forgotten, under-counted, or disputed. The problem is worse over time: after a two-week trip or a month of shared household bills, nobody can reconstruct who owes whom without a spreadsheet. GoDutch needs to take a logged expense and turn it into a clear, shared record of who paid, who owes, and how to make everyone whole — with the least friction possible on both sides.

---

## Goals

1. **Make debt transparent** — every user can see their total balance (what they owe vs. what they're owed) at a glance, across all groups and all expenses.
2. **Minimize the number of transfers needed** — when settling up a group, the app should suggest the minimum number of payments required to zero out all balances (debt simplification).
3. **Support both even and custom splits** — 100% of common split scenarios (equal, by percentage, by exact amount) are handled without manual calculation.
4. **Drive settlement** — at least 60% of outstanding balances are marked as settled within 7 days of being logged, up from an estimated baseline of ~20% in informal tracking.
5. **Reduce disputes** — users can view the full history of any expense and any payment so that "I already paid that" is never ambiguous.

---

## Non-Goals

1. **In-app payments / money movement** — GoDutch does not move money in v1. Settlement is recorded as "paid outside the app" (Venmo, cash, bank transfer). Actual payment integration is a future feature.
2. **Per-item splitting within a receipt** — itemized line-item assignment (e.g., "Alice had the steak, Bob had the salad") is not in v1 scope; all splits are at the total level.
3. **Currency conversion across group members** — all members of a group must use the same currency in v1. Multi-currency groups are a future consideration.
4. **Recurring expense automation** — automatically logging repeating bills (rent, subscriptions) on a schedule is out of scope; users log each expense manually.
5. **Group financial reporting or analytics** — charts, spend breakdowns, and category summaries are not in scope for v1. The focus is on balances and settlement.

---

## User Stories

### Friend group persona

- As a friend who paid the restaurant bill, I want to log the expense and split it evenly across everyone who was there so that I know exactly how much each person owes me.
- As a friend who owes money, I want to see a single clear number ("You owe Jordan $27.50") so that I don't have to mentally add up multiple expenses.
- As a group member, I want to record when I've paid someone back so that the balance updates and both of us have a record.
- As a friend, I want to settle up all debts with one person at once (rather than expense by expense) so that we can zero out everything in one Venmo transfer.
- As a group member, I want to see the full history of a specific expense so that I can verify the amount and who was included if there's ever a question.

### Roommate persona

- As a roommate who pays utilities, I want to log the bill and split it with my housemates so that I know who owes me and how much.
- As a roommate who owes money, I want to mark my share as paid after I Venmo my roommate so that the balance clears and we both see it's resolved.
- As a roommate, I want to see a running balance for the month so that I can settle up at the end of the month in one payment rather than after every little expense.
- As a roommate, I want to customize who is included in each expense because not all bills are shared by all housemates equally.

### Both personas (edge cases)

- As a user, I want to split an expense unequally (e.g., 60/40 or $30/$50) when the contribution wasn't even, without the app forcing me into equal shares.
- As a user, I want to edit a split after it's been saved if I made a mistake, and have all affected balances update automatically.
- As a user, if someone in a group doesn't use the app, I want to add them as a non-app contact so they appear in the balance summary even without an account.

---

## Requirements

### Must-Have (P0)

- **Group creation** — users can create a named group and add members (by contact, phone number, or app username).
  - *Acceptance criteria:* Group created in < 3 taps. Members can be added at group creation or later. Non-app users can be added by name as "guests."
- **Expense creation with split** — after logging an expense (amount + description), the user selects who is included and how to split.
  - *Acceptance criteria:* Three split modes supported: equal (default), by percentage, by exact amount. All modes update in real time as the user adjusts. The split must sum to the total before the expense can be confirmed. Confirmation is blocked if amounts don't balance.
- **Balance view** — each user sees their net balance per person and overall, updated in real time as expenses are logged.
  - *Acceptance criteria:* Balance screen shows: total owed, total owed to user, net per-person breakdown. Positive and negative balances are visually distinct.
- **Settlement recording** — a user can mark a debt as settled (recorded as paid outside the app).
  - *Acceptance criteria:* Both parties can mark a payment as made. The balance updates immediately. A settlement record is saved in the expense history. Settlement requires confirmation from both parties OR one party initiates and the other confirms (to prevent unilateral false settlement).
- **Expense history** — users can view all past expenses in a group, including who paid, who owes, amounts, and split details.
  - *Acceptance criteria:* All expenses listed in reverse chronological order. Tapping an expense shows full detail: payer, amount, split breakdown, and any associated settlements.

### Nice-to-Have (P1)

- **Debt simplification** — when settling up a group with circular debts (A owes B, B owes C, C owes A), the app suggests the minimum number of transfers to zero out all balances.
  - *Acceptance criteria:* "Settle up" flow computes the minimum payment graph. Shown as clear suggested transfers (e.g., "A pays C $15, done").
- **Settle-up summary** — a "Settle up with [person]" flow that shows all outstanding amounts with that person in one screen and lets the user record one lump payment.
- **Expense editing** — allow editing amount, description, split, or participants after an expense is saved.
  - *Acceptance criteria:* Edits recompute balances retroactively. All group members see an "expense updated" indicator in history.
- **Push notifications** — notify users when they're added to a new expense or when someone records a payment toward their debt.

### Future Considerations (P2)

- **In-app payment integration** — connect to Venmo, PayPal, UPI, or bank transfer to move money directly within the app.
- **Per-item (itemized) splitting** — assign individual line items from a receipt to specific people.
- **Recurring expense scheduling** — auto-log rent, subscriptions, or regular bills on a defined cadence.
- **Multi-currency groups** — support groups where members operate in different currencies, with exchange rate handling.
- **Spend analytics** — category breakdowns, monthly summaries, and group spending trends.

---

## Success Metrics

### Leading indicators (days 1–14 post-launch)
| Metric | Target |
|---|---|
| Group creation rate | ≥ 70% of new users create or join a group in session 1 |
| Split completion rate | ≥ 90% of started splits are confirmed (not abandoned) |
| Equal split usage | ≥ 60% of expenses use equal split (validates default is right) |
| Settlement recording rate (7 days) | ≥ 60% of balances marked settled within 7 days of creation |
| Edit rate on saved expenses | ≤ 10% of expenses are edited after saving (measures first-time accuracy) |

### Lagging indicators (30–90 days post-launch)
| Metric | Target |
|---|---|
| Monthly active groups | Groups with ≥ 1 expense logged in the last 30 days |
| Group retention | ≥ 50% of groups log a second expense within 14 days of first |
| "Settled" balances vs. outstanding | ≥ 75% of all logged balances settled within 30 days |
| Dispute / correction rate | ≤ 5% of expenses result in a user edit or dispute flag |

---

## Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | How does settlement confirmation work? Does one party marking "paid" settle it, or does the other party need to confirm? One-sided is faster but creates disputes; two-sided is accurate but adds friction. | Product + Design | Yes — affects trust model |
| 2 | How do we handle "guest" members who don't have the app? Their balance exists in the system but they can't see or confirm anything. Do we send them a link? An SMS? | Product + Engineering | No — can ship with guests as display-only for v1 |
| 3 | What happens when a group member leaves a group with an outstanding balance? | Product | No — edge case, can block deletion if balance > $0 for v1 |
| 4 | Should groups have a "close out" concept — a final settlement that archives the group — or do groups persist indefinitely? | Product | No — indefinite persistence is fine for v1 |
| 5 | How do we handle a scenario where more than two people need to settle up and debt simplification produces a counter-intuitive transfer (e.g., A pays someone they don't know well)? | Design | No — can defer simplification to P1, per-pair settlement always works |

---

## Design Notes

- The balance view is the emotional core of this feature. It needs to answer the single question every user has — "do I owe money or am I owed money?" — in the first second. A clear net balance number at the top, green or red, is the design target.
- The split selection screen is high-stakes: mistakes here are errors in someone else's wallet. Provide strong confirmation affordances — show the final amounts each person owes before the user taps "Confirm."
- Settlement flows should feel like closure, not a form. Think: clear, celebratory confirmation that the debt is gone.
- Guest users (non-app members) must still appear credibly in the UI. "Sam (not on GoDutch)" should display alongside registered users without making the UI feel broken.

---

## Technical Notes

- Balance computation is additive: each expense adds to a running tally per user-pair. Balances should be computed from the full transaction log, not stored as a mutable counter, to ensure auditability and correct rollback when expenses are edited.
- Debt simplification algorithm: a minimum-cost flow problem on a directed graph of net balances. A greedy approach (largest creditor pays largest debtor) works well for small groups (< 20 members) and is sufficient for v1.
- Real-time balance updates: on mobile, balance updates should be optimistic (update local state immediately, sync to server asynchronously) to keep the UI snappy.
- Data model must support: expense (amount, payer, description, date, group_id), split (expense_id, user_id, share_amount), settlement (payer_id, receiver_id, amount, date, confirmed_by_both).

---

## Change Log

| Date | Change |
|---|---|
| 2026-03-27 | Spec created |
