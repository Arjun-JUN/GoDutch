# Implementing Feature Discovery Modules

> **Status: Not implemented yet.**

Step-by-step guide for adding a new discovery module.

## When to build a module

A discovery module is warranted when:
- A feature exists but ≤20% of active users have tried it.
- The feature is contextually discoverable (there's a natural "this is when you'd want it" moment).
- The feature provides enough value to justify interrupting the user's current task.

## Implementation checklist

1. **Define the trigger.** Identify the exact screen and user action that should show the module. Write this in the module's `spec` field.
2. **Define the `id`.** Module IDs are kebab-case strings (`smart-split`, `receipt-ocr`). The ID is stored in user preferences to prevent reshowing.
3. **Write copy.** Eyebrow ≤ 3 words, title ≤ 6 words, description ≤ 30 words. Run it through the Mindful Ledger tone check: calm, informative, no exclamation marks.
4. **Implement dismissal persistence.** Use the user preferences store to record `discoveredModules: string[]`. Check before rendering.
5. **Add the module to the module registry.** (Registry to be built; see [viewing-feature-discovery-modules.md](viewing-feature-discovery-modules.md))
6. **Write a test.** Verify: module renders, CTA navigates correctly, dismiss persists across sessions.

## Dismissal persistence pattern

```tsx
import { useUserPrefs } from '@/stores/userPrefs';

const { discoveredModules, markDiscovered } = useUserPrefs();

if (discoveredModules.includes('smart-split')) return null;

return (
  <DiscoveryModule
    id="smart-split"
    // ...
    onDismiss={() => markDiscovered('smart-split')}
  />
);
```

## Further reading

- [feature-discovery.md](feature-discovery.md)
- [running-an-experiment.md](running-an-experiment.md)
