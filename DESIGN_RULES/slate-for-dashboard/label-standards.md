# Label Standards

> Consistent use of `Text` variants and tones for data labels, values, and metadata.

## Data display patterns

### Amount display

Amounts are the most important data in GoDutch. Give them the highest visual weight:

```tsx
// Large balance (hero)
<Text variant="display" weight="extrabold">₹4,280.00</Text>

// Card amount
<Text variant="titleXl" weight="extrabold">₹840</Text>

// List row amount
<Text weight="extrabold" style={{ fontSize: 24 }}>₹120.50</Text>

// Currency symbol (smaller, beside amount)
<Text weight="extrabold" style={{ fontSize: 13, opacity: 0.8 }}>₹</Text>
```

### Labels above values (eyebrow pattern)

```tsx
<Text variant="eyebrow" tone="primary">YOUR BALANCE</Text>
<Text variant="display" weight="extrabold">₹4,280</Text>
```

Always use `variant="eyebrow"` for section labels above a primary value — it applies `textTransform: uppercase` automatically.

### Metadata (dates, categories)

```tsx
<Text variant="label" tone="muted">12 Apr 2025</Text>
<Text variant="label" tone="subtle">Shared equally</Text>
```

### Error / status

```tsx
<Text variant="label" tone="danger">Amount must be greater than 0</Text>
<Text variant="label" tone="success">Settled</Text>
```

## Title Case rule

All screen headings, card titles, and section headers must be **Title Case**:
- ✅ "Add New Expense"
- ✅ "Your Groups"  
- ❌ "add new expense"
- ❌ "YOUR GROUPS" (reserve ALL CAPS for eyebrow variant only)

Eyebrow variant auto-uppercases — pass Title Case text and let the variant handle it:
```tsx
<Text variant="eyebrow">Your Groups</Text>  // renders "YOUR GROUPS"
```

## Further reading

- [../user-interface/guides/typography.md](../user-interface/guides/typography.md)
- [../components/text/](../components/text/README.md)
