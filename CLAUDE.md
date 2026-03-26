# GoDutch — Project Intelligence

> This file is the living brain of the project. It should be updated as conventions evolve,
> new decisions are made, and the project grows. Claude reads this at the start of every session.

---

## What is GoDutch?
An expense-splitting app that uses OCR, voice input, and other smart capabilities to make splitting bills effortless. Users can scan receipts, speak expenses aloud, and settle up with friends — no manual entry required.

## Project Status
- **Phase:** Pre-development — speccing features
- **Last updated:** 2026-03-27

---

## Folder Structure

```
GoDutch/
├── CLAUDE.md                  ← you are here (project intelligence, keep updated)
├── competitive-briefs/
│   ├── COMPETITIVE_LOG.md     ← master tracker: all competitive briefs
│   └── [dated briefs]         ← named YYYY-MM-DD_description.md
└── specs/
    ├── FEATURE_LOG.md         ← master tracker: all features + statuses
    └── features/
        ├── _TEMPLATE.md       ← copy this when writing a new spec
        └── [feature specs]    ← one file per feature, named NNN_feature-name.md
```

> As the project grows (e.g. a `src/` directory is added), update this map.

---

## Conventions

### Spec files
- Named `NNN_feature-name.md` (e.g. `001_receipt-ocr.md`)
- Always copied from `_TEMPLATE.md`
- Status kept in sync with `FEATURE_LOG.md`

### Feature Log (`specs/FEATURE_LOG.md`)
- Single source of truth for feature status
- Updated every time a spec is created, changed, or shipped
- Features never deleted — dropped ones move to the Archive section

### Competitive Briefs (`competitive-briefs/`)
- Named `YYYY-MM-DD_description.md` (e.g. `2026-03-27_godutch-vs-market.md`)
- Tracked in `COMPETITIVE_LOG.md`
- Used for positioning research, competitor analysis, and strategic decisions

### CLAUDE.md (this file)
- Updated whenever: a new folder is added, a convention changes, a major decision is made, or a new capability is added to the app
- Treat it as a changelog + map, not a static doc

---

## Key Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-03-26 | Use markdown spec files in `specs/features/` | Lightweight, versionable, easy to evolve |
| 2026-03-26 | FEATURE_LOG.md as master tracker | Single place to see all features at a glance |
| 2026-03-27 | Add `competitive-briefs/` folder with `COMPETITIVE_LOG.md` | Track market positioning and competitor research alongside feature specs |

---

## Known Capabilities (planned)
- **OCR receipt scanning** — parse receipts to auto-fill expenses
- **Voice input** — log expenses by speaking naturally
- **Expense splitting** — split bills evenly or by custom amounts

> Add entries here as new capabilities are confirmed or built.

---

## What Claude Should Always Do
- Update `FEATURE_LOG.md` when creating or changing a spec
- Update `COMPETITIVE_LOG.md` when creating or changing a competitive brief
- Update this file when the project structure or conventions change
- Name spec files with the `NNN_` prefix matching the feature number in the log
- Name competitive briefs with the `YYYY-MM-DD_` date prefix
- Keep decisions in the Key Decisions Log above
