# GoDutch

> Split bills in seconds — snap a receipt or just say it out loud.

**Status:** Pre-development — speccing features &nbsp;|&nbsp; **Last updated:** 2026-03-27

---

## What is GoDutch?

Manual expense entry is the #1 reason people stop using bill-splitting apps. Opening the app mid-dinner, navigating menus, and typing in every line item kills the habit before it starts.

GoDutch eliminates manual entry entirely. Point your camera at a receipt and the expense is auto-filled in under 30 seconds. Or just say *"I paid $80 for dinner, split four ways"* and it's logged in under 10. No typing required.

GoDutch is the only expense-splitting app offering both OCR receipt scanning and voice input as first-class, free-tier features.

---

## Features

| Feature | What It Does | Target |
|---|---|---|
| **Receipt OCR** (`001`) | Scan a receipt to auto-fill merchant, total, tax, and tip | < 30s from scan to confirmed split; ≥ 85% parse accuracy |
| **Voice Input** (`002`) | Say "I paid $40 for dinner" to log an expense hands-free | < 10s end-to-end; ≥ 85% parse accuracy |
| **Expense Splitting** (`003`) | Split equal, by percentage, or exact amount; track balances; record settlement | Three split modes; debt simplification; settlement recording |

All three features are fully specced and ready for engineering. See [`specs/features/`](./specs/features/) for detailed requirements.

---

## Positioning

**Differentiator:** GoDutch is the only expense-splitting app where users never have to manually type in an expense — both voice and OCR are free-tier, first-class features.

**Main competition displaced:**
- **Splitwise** — market leader, but paywalls OCR behind Pro and caps free users at 3 expenses/day, driving significant churn
- **SplitterUp** (2025) — closest threat: has AI receipt scanning, but no voice input

**Positioning claim:** *"The expense splitting app where you never have to manually type in an expense."*

See [`competitive-briefs/`](./competitive-briefs/) for full market analysis.

---

## Repo Structure

```
GoDutch/
├── README.md                                    ← you are here
├── CLAUDE.md                                    ← project intelligence: conventions, decisions, context
├── .gitignore
├── specs/
│   ├── FEATURE_LOG.md                           ← master tracker: all features + statuses
│   └── features/
│       ├── _TEMPLATE.md                         ← copy this for new specs
│       ├── 001_receipt-ocr.md                   ← ✅ Specced
│       ├── 002_voice-input.md                   ← ✅ Specced
│       └── 003_expense-splitting.md             ← ✅ Specced
└── competitive-briefs/
    ├── COMPETITIVE_LOG.md                       ← master tracker: all briefs + review dates
    ├── 2026-03-27_godutch-vs-market.md          ← full market competitive analysis
    └── weekly-updates/
        └── competitor-monitor-2026-03-27.md     ← weekly competitor signal report
```

---

## How to Navigate

- **Understand the product** — Start here, then [`CLAUDE.md`](./CLAUDE.md) for conventions and key decisions
- **See all features** — [`specs/FEATURE_LOG.md`](./specs/FEATURE_LOG.md) for the full list and statuses
- **Read a feature spec** — [`specs/features/NNN_feature-name.md`](./specs/features/) for requirements, acceptance criteria, and open questions
- **Read competitive context** — [`competitive-briefs/COMPETITIVE_LOG.md`](./competitive-briefs/COMPETITIVE_LOG.md) for the index, then open any brief
- **Add a new spec** — Copy [`specs/features/_TEMPLATE.md`](./specs/features/_TEMPLATE.md), name it `NNN_feature-name.md`, add a row to `FEATURE_LOG.md`
- **Add a competitive brief** — Name it `YYYY-MM-DD_topic.md` in `competitive-briefs/`, add a row to `COMPETITIVE_LOG.md`

---

## Key Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-03-26 | Markdown spec files in `specs/features/` | Lightweight, versionable, easy to evolve |
| 2026-03-26 | `FEATURE_LOG.md` as master tracker | Single place to see all features at a glance |
| 2026-03-27 | `competitive-briefs/` folder with `COMPETITIVE_LOG.md` | Track market positioning alongside feature specs |

See [`CLAUDE.md`](./CLAUDE.md) for the full decisions log and project conventions.

---

## Status

**Phase:** Pre-development — speccing features (as of 2026-03-27)

### Done
- [x] 3 core feature specs complete: OCR receipt scanning, voice input, expense splitting
- [x] Initial competitive analysis complete (GoDutch vs. full market)
- [x] First weekly competitor monitor published

### Up Next
- [ ] Tech stack decision
- [ ] Architecture and data model design
- [ ] Engineering kickoff

---

*This is a private pre-development repository. See [CLAUDE.md](./CLAUDE.md) for project conventions.*
