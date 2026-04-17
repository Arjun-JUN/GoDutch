# User Communications Platform

> **Status: Not implemented yet.**

Architecture overview for all GoDutch user communication channels.

## Current state

GoDutch currently has no centralized communications platform. Notifications are ad-hoc and in-app messaging doesn't exist beyond the `Callout` atom.

## Target architecture

```
                        ┌─────────────────────────────┐
                        │   Backend trigger events     │
                        │  (settlement, added_to_group │
                        │   expense_added, reminder)   │
                        └──────────────┬──────────────┘
                                       │
                             ┌─────────▼──────────┐
                             │  Notification Hub   │
                             │ (backend/app/utils/ │
                             │  notifications.py)  │
                             └──┬──────────┬───────┘
                                │          │
               ┌────────────────▼─┐   ┌───▼─────────────┐
               │  Expo Push (FCM/ │   │  In-app tray     │
               │  APNS)           │   │  (bell icon)     │
               └──────────────────┘   └─────────────────-┘
```

## Backend trigger events

Each backend action that should notify users should call a notification helper:

```python
# Pseudo-code — not yet implemented
from app.utils.notifications import notify

await notify(
    user_id=recipient_id,
    type="settlement",
    title=f"{payer_name} settled ₹{amount}",
    data={"expense_id": expense_id},
)
```

## Push token management

- Collect Expo push token on app launch via `expo-notifications`.
- Store token in user profile on the backend (`users` collection, `push_token` field).
- Rotate on re-registration.

## Delivery priorities

| Event type | Push | In-app tray | Urgency |
|------------|------|-------------|---------|
| Settlement recorded | Yes | Yes | Normal |
| Added to group | Yes | Yes | Normal |
| Expense added | Yes | Yes | Normal |
| Balance reminder (>7 days) | Yes | No | Low |
| Feature announcement | No | Yes | Informational |

## Further reading

- [bell-notifications.md](bell-notifications.md)
- [new-features.md](new-features.md)
