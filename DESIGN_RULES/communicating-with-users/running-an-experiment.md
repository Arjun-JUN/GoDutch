# Running an Experiment

> **Status: Not implemented yet.**

A/B testing discovery module copy or trigger conditions.

## Setup

GoDutch does not yet have a feature flag / experimentation platform. When one is added, experiments for discovery modules should follow this pattern:

1. **Define variants.** Variant A (control) = current behavior. Variant B = alternative copy or trigger.
2. **Randomize by user ID.** Hash the user ID to assign consistently across sessions.
3. **Instrument both variants** with the same event schema (`module_impressed`, `module_cta_tapped`, `module_dismissed`).
4. **Run for ≥ 2 weeks** or until you reach 200+ impressions per variant.
5. **Evaluate on CTA CTR and feature adoption rate** — not dismiss rate alone.

## What to test

Good experiment candidates:
- Copy changes (different description or CTA label)
- Trigger timing (show on 2nd visit vs 3rd visit)
- Module position (top of screen vs inline vs bottom sheet)

Bad experiment candidates:
- Visual design changes (keep Slate-compliant design stable)
- Showing multiple modules simultaneously (always 1 at a time)

## Further reading

- [feature-discovery-module-performance.md](feature-discovery-module-performance.md)
- [feature-discovery.md](feature-discovery.md)
