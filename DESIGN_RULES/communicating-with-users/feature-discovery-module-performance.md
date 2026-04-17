# Feature Discovery Module Performance

> **Status: Not implemented yet.**

How to measure whether a discovery module is working.

## Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **Impression rate** | % of eligible users who saw the module | — (establish baseline) |
| **CTA click-through rate (CTR)** | % of impressions that led to CTA tap | ≥ 20% |
| **Dismiss rate** | % of impressions dismissed without CTA | Track, don't optimize to 0 |
| **Feature adoption rate** | % of users who used the feature after seeing the module | ≥ 15% net lift |
| **Re-engagement rate** | % of users who used the feature more than once | ≥ 30% of adopters |

## What to instrument

For each module, emit events:

```
module_impressed    { module_id, user_id, trigger_screen }
module_cta_tapped   { module_id, user_id }
module_dismissed    { module_id, user_id, time_to_dismiss_ms }
```

## When to retire a module

Remove a module if:
- CTR < 5% after 500 impressions — the copy or trigger is wrong.
- Feature adoption rate < 5% — the feature itself may need rethinking.
- The feature has reached >60% adoption — the module has done its job.

See [removing-a-module.md](removing-a-module.md).

## Further reading

- [running-an-experiment.md](running-an-experiment.md)
- [removing-a-module.md](removing-a-module.md)
