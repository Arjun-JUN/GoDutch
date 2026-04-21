// FAB placeholder route. The center tab in `_layout.tsx` intercepts presses via
// a custom `tabBarButton` and navigates to `/new-expense`, so this screen is
// never actually rendered in normal use. It exists only so expo-router has a
// file to resolve for the `add` tab name.
export default function AddPlaceholder() {
  return null;
}
