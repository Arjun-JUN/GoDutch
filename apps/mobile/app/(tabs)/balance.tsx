import { Screen, Stack, Text, Spinner, EmptyState } from '@godutch/slate';

export default function BalanceScreen() {
  return (
    <Screen>
      <Stack padding={4} gap={4}>
        <Text variant="heading2">Balance</Text>
        <EmptyState
          icon="wallet"
          title="No expenses yet"
          body="Add an expense to a group to see your balance here."
        />
      </Stack>
    </Screen>
  );
}
