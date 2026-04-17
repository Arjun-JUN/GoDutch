# Viewing Feature Discovery Modules

> **Status: Not implemented yet.**

Inventory of all active and retired discovery modules.

## Active modules

No modules are active yet.

## Retired modules

_(None retired yet.)_

## How to add an entry

When you ship a new module, add a row to the Active modules table:

| ID | Screen | Trigger | CTA | Shipped |
|----|--------|---------|-----|---------|
| `smart-split` | New Expense | User enters >3 items manually | "Try it" → OCR scanner | — |
| `receipt-ocr` | New Expense | 3rd session without OCR use | "Scan receipt" → camera | — |

When a module is retired, move its row to the Retired table and add the retirement date and final metrics.

## Further reading

- [implementing-feature-discovery-modules.md](implementing-feature-discovery-modules.md)
- [removing-a-module.md](removing-a-module.md)
