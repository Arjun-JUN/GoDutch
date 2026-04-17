# Layout

> How Slate components compose into full-screen layouts.

## The layout stack

Every GoDutch screen follows the same nesting order:

```
AppShell (gradient bg + SafeAreaView)
  └── Header (optional, placed above scroll)
  └── ScrollView or FlatList
        └── PageContent (horizontal padding)
              └── PageHero (optional hero section)
              └── [screen content]
  └── KeyboardAvoidingView footer (forms only)
```

## AppShell

Full-screen gradient wrapper. See [shell/](shell/README.md) for full docs.

```tsx
<AppShell>           // gradient bg, safe area top
<AppShell edges={['top', 'bottom']}>  // tab root screens
<AppShell flat>      // solid bg for custom screens
```

## PageContent

Horizontal padding container (`px-6` = 24px). Use `padded={false}` for edge-to-edge lists:

```tsx
<PageContent>              // 24px horizontal padding
<PageContent padded={false}>  // no padding (for FlatList)
```

## Common spacing patterns

```tsx
// Between a hero section and a list
<PageHero ... />
<Breath size="sm" />    // 16px
<FlatList .../>

// Between form fields
<Field label="Merchant" .../>
<Breath size="sm" />    // 16px
<Field label="Amount" .../>

// Between functional groups on a dashboard
<View style={{ flexDirection: 'row', gap: 12 }}>
  <StatCard ... />
  <StatCard ... />
</View>
<Breath size="md" />    // 32px
<Text variant="title">Recent Expenses</Text>
```

## Two-column stat row

```tsx
<View style={{ flexDirection: 'row', gap: 12 }}>
  <StatCard label="You owe" value="₹840" tone="negative" style={{ flex: 1 }} />
  <StatCard label="Owed to you" value="₹5,120" tone="positive" style={{ flex: 1 }} />
</View>
```

## Floating action button

```tsx
<View style={{ flex: 1 }}>
  <FlatList ... />
  <View style={{ position: 'absolute', right: 24, bottom: 24 }}>
    <AppButton
      variant="primary"
      size="icon"
      onPress={handleAdd}
      leftIcon={<Plus size={22} color={colors.primaryForeground} />}
      accessibilityLabel="Add expense"
    />
  </View>
</View>
```

## Sticky bottom buttons (forms)

```tsx
<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <ScrollView>
    <PageContent>{/* fields */}</PageContent>
  </ScrollView>
  <View style={{ padding: 24, paddingBottom: 32, gap: 12 }}>
    <AppButton variant="primary" size="lg" onPress={submit}>Save</AppButton>
    <AppButton variant="ghost" size="md" onPress={discard}>Cancel</AppButton>
  </View>
</KeyboardAvoidingView>
```

## Further reading

- [shell/](shell/README.md)
- [atoms/](atoms/README.md) — `Breath`
- [../../user-interface/guides/spacing-and-rhythm.md](../../user-interface/guides/spacing-and-rhythm.md)
- [../../slate-for-dashboard/page-templates.md](../../slate-for-dashboard/page-templates.md)
