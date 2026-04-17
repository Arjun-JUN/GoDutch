# Feature Discovery

> **Status: Not implemented yet.**

Teaching users about capabilities they haven't used yet — without nagging.

## Why it's here

GoDutch has non-obvious features (AI smart-split, receipt OCR, QR-code payments). Users who don't discover these miss significant value. Feature discovery modules surface them at the right moment.

## Principles

1. **One module at a time.** Never show two discovery prompts in the same session.
2. **Contextual trigger.** Show the module near the feature's entry point, not on the home screen.
3. **Soft dismissal.** A single swipe or tap closes it permanently (stored in user preferences).
4. **No dark patterns.** Never make the dismiss action smaller than the CTA.

## Discovery module anatomy

A discovery module is a `Callout`-style card with:

- An `eyebrow` label (e.g., "NEW FEATURE")
- A short `title` (one line, Title Case)
- A `body` description (two sentences max)
- A primary CTA button
- An `×` dismiss button (always visible)

## Target API

```tsx
import { DiscoveryModule } from '@/slate'; // not yet exported

<DiscoveryModule
  id="smart-split"
  eyebrow="NEW FEATURE"
  title="Smart Split with AI"
  description="Take a photo of your receipt and let AI split the items automatically."
  cta={{ label: 'Try it', onPress: openReceiptScanner }}
  onDismiss={() => markDiscovered('smart-split')}
/>
```

## When to show

| Module | Trigger screen | Trigger event |
|--------|---------------|--------------|
| `smart-split` | New Expense screen | User manually enters >3 items |
| `receipt-ocr` | New Expense screen | User visits the screen for the 3rd time without using OCR |
| `qr-payment` | Settle Up screen | User's first time settling |
| `group-budgets` | Group detail | Group has >10 expenses |

## Further reading

- [implementing-feature-discovery-modules.md](implementing-feature-discovery-modules.md)
- [feature-discovery-module-performance.md](feature-discovery-module-performance.md)
- [removing-a-module.md](removing-a-module.md)
