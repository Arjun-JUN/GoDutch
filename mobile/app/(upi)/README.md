# mobile/app/(upi)

> UPI payment flow screens: account management, send money, and the UPI home hub.

## Overview

Three screens that handle all in-app money movement. The group is separate from `(tabs)` because UPI flows are entered from the Settle tab or Profile and return there — they are not persistent tabs.

## Key files

| File | Route | What it does |
|------|-------|-------------|
| `_layout.tsx` | — | Stack header config for UPI screens |
| `index.tsx` | `/upi` | UPI home — linked accounts, transaction history |
| `send.tsx` | `/upi/send` | Enter UPI ID, amount, note → deep-link to UPI app |
| `accounts/add.tsx` | `/upi/accounts/add` | 4-field form to link a new bank account |

## Interactions

| Direction | Who | How |
|-----------|-----|-----|
| Upstream | `(tabs)/profile.tsx` | Navigate to `/upi` |
| Upstream | `(tabs)/settlements.tsx` | Navigate to `/upi/send` with pre-filled amount |
| Downstream | `src/api/client.ts` | POST `/api/upi/*` |
| Downstream | OS / UPI app | `Linking.openURL('upi://')` deep link |

## Gotchas

- `send.tsx` pre-fills amount and UPI ID when navigated from Settlements — access via `router.params`.
- Deep links (`upi://`) are not universally handled on all Android devices. Always show a fallback copy-UPI-ID path.

## Further reading

- [src/api/](../../src/api/README.md)
- [backend/app/routes/upi.py](../../../backend/app/routes/README.md)
