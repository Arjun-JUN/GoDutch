# Communicating with Users

> Patterns for notifications, feature discovery, and in-app messaging — keeping users informed without interrupting their flow.

## Overview

GoDutch is a calm, low-friction app. Communication patterns must match: informative but not intrusive, timely but not aggressive. This section covers the full set of patterns for getting information to users.

Most of these patterns are **not yet implemented** as Slate components. Each page documents the intent and target API so implementations land consistently.

## Contents

| File | Status | What it covers |
|------|--------|---------------|
| [bell-notifications.md](bell-notifications.md) | Placeholder | Push + in-app notification patterns |
| [feature-discovery.md](feature-discovery.md) | Placeholder | Introducing users to new capabilities |
| [implementing-feature-discovery-modules.md](implementing-feature-discovery-modules.md) | Placeholder | How to build a discovery module |
| [feature-discovery-module-performance.md](feature-discovery-module-performance.md) | Placeholder | Measuring discovery effectiveness |
| [removing-a-module.md](removing-a-module.md) | Placeholder | Lifecycle: retiring a discovery module |
| [running-an-experiment.md](running-an-experiment.md) | Placeholder | A/B testing discovery messaging |
| [viewing-feature-discovery-modules.md](viewing-feature-discovery-modules.md) | Placeholder | In-app module inventory |
| [new-features.md](new-features.md) | Placeholder | Announcing feature launches |
| [user-communications-platform.md](user-communications-platform.md) | Placeholder | Architecture for push, email, in-app |

## Principles

1. **One thing at a time** — never show more than one discovery prompt per session.
2. **Calm tone** — no exclamation marks, no urgency. Match the Mindful Ledger voice.
3. **Dismissible** — every notification or discovery module must be dismissible with a single tap.
4. **Contextual** — show communication at the point of relevance, not on app launch.

## Further reading

- [../user-interface/guides/accessibility.md](../user-interface/guides/accessibility.md) — accessible notification patterns
- [../components/atoms/](../components/atoms/README.md) — `Callout` atom for inline messaging
