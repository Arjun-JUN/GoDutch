# Removing a Module

> **Status: Not implemented yet.**

Lifecycle for retiring a feature discovery module.

## When to remove

Remove a module when any of the following is true:
- Feature adoption has exceeded 60% of active users.
- CTR < 5% after 500 impressions with copy tested.
- The feature itself has been removed or merged into another flow.

## Steps

1. **Remove the render call** from the screen(s) that show it.
2. **Keep the `id` in the dismissed set** — do not remove persisted dismissal data. Users who dismissed it should not see it again if it's ever reshown.
3. **Remove the module from the registry** (when the registry is built).
4. **Archive the analytics** — save the final impression/CTR/adoption numbers to the experiment log.
5. **Update this page** if the module entry appeared in [viewing-feature-discovery-modules.md](viewing-feature-discovery-modules.md).

## What NOT to do

- Do not delete the module's dismissed preference key — this prevents re-impression if code is accidentally reverted.
- Do not remove the module mid-experiment — close the experiment first, record results, then remove.

## Further reading

- [feature-discovery-module-performance.md](feature-discovery-module-performance.md)
- [viewing-feature-discovery-modules.md](viewing-feature-discovery-modules.md)
