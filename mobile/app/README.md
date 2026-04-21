# mobile/app

> Expo Router file-based navigation: every file is a route, every folder is a route group.

## Overview

Expo Router maps the file system to navigation. `_layout.tsx` files define layout wrappers (stack, tabs). Route files render screen content. Groups like `(tabs)/` and `(upi)/` organize related screens without affecting the URL path.

The root `_layout.tsx` sets up the global `<AuthProvider>` and the root `<Stack>`. `index.tsx` is the entry point — it reads auth state and redirects accordingly.

## How it works

1. App launches → root `_layout.tsx` runs → wraps in `AuthProvider` + `Stack`.
2. `index.tsx` checks `AuthContext.token`. If absent → navigate to `auth`. If present → navigate to `(tabs)`.
3. `(tabs)/_layout.tsx` renders a five-slot tab bar: `Home | Groups | [+FAB] | Activity | You`. The center FAB intercepts presses and navigates to `/new-expense`.
4. Each tab screen imports state from Zustand stores and components from `../src/`.

## Key files

| File | Route | What it does |
|------|-------|-------------|
| `_layout.tsx` | (root) | Global providers, root Stack navigator |
| `index.tsx` | `/` | Auth redirect logic |
| `auth.tsx` | `/auth` | Login / register screen |
| `(tabs)/_layout.tsx` | — | 5-slot tab bar + center FAB |
| `(tabs)/dashboard.tsx` | `/` (Home) | Greeting + net balance + quick actions + groups preview |
| `(tabs)/groups.tsx` | `/groups` (tab) | Groups list (renders shared `GroupsList`) |
| `(tabs)/add.tsx` | `/add` | FAB placeholder; press intercepted by tab bar button |
| `(tabs)/activity.tsx` | `/activity` | Pending settlements + date-grouped expense feed |
| `(tabs)/you.tsx` | `/you` | Profile, UPI, preferences, sign out |
| `(tabs)/expenses.tsx` | `/expenses` | Hidden from tab bar; legacy deep-link |
| `(tabs)/settlements.tsx` | `/settlements` | Hidden from tab bar; reached via quick actions |
| `(tabs)/profile.tsx` | `/profile` | Hidden from tab bar; superseded by `you.tsx` |
| `(upi)/index.tsx` | `/upi` | UPI home — accounts, history |
| `(upi)/send.tsx` | `/upi/send` | Send money flow |
| `(upi)/accounts/add.tsx` | `/upi/accounts/add` | Add bank account |
| `expenses/[id].tsx` | `/expenses/:id` | Expense detail / edit |
| `groups/index.tsx` | `/groups` | Legacy list — renders shared `GroupsList` for deep-link compat |
| `groups/[groupId].tsx` | `/groups/:id` | Colored-header group detail + balance sentence + actions |
| `reports/` | `/reports/:id` | Group reports |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | Expo Runtime | File system → route tree |
| Downstream | `../src/stores/` | Zustand state reads/writes |
| Downstream | `../src/components/` | Shared feature components (e.g. `GroupsList`) |
| Downstream | `../src/slate/` | All visual components |
| Downstream | `../src/api/client.ts` | Direct API calls for one-off fetches |
| Downstream | `../src/contexts/AuthContext.tsx` | User identity |

## Gotchas

- Route groups (parentheses folders) do not appear in the URL. `(tabs)/dashboard.tsx` maps to `/`, not `/tabs/dashboard`.
- The center FAB in the tab bar is not a real tab — it's a custom `tabBarButton` that intercepts the press. The `add.tsx` route resolves to a null-rendering screen.
- `_layout.tsx` at each level wraps all child screens. Navigation within a group should use relative paths.

## Further reading

- [(tabs)/](<(tabs)/README.md>) — main tab screens and FAB wiring
- [(upi)/](<(upi)/README.md>) — UPI payment screens
- [groups/](groups/README.md) — group detail and legacy list route
- [../src/](../src/README.md)
