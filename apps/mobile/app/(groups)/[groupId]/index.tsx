import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  Stack,
  Row,
  Text,
  Button,
  Icon,
  EmptyState,
  Divider,
} from '@godutch/slate';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();

  return (
    <Screen scrollable>
      <Stack padding={4} gap={4}>
        <Row gap={3} align="center">
          <Button
            label=""
            variant="ghost"
            onPress={() => router.back()}
            leftIcon={<Icon name="arrow-back" size="md" color="textPrimary" />}
          />
          <Text variant="heading3" style={{ flex: 1 }}>Group</Text>
          <Button
            label="Add Expense"
            variant="primary"
            size="sm"
            onPress={() => router.push({ pathname: '/(expenses)/create', params: { groupId } })}
          />
        </Row>

        <Divider />

        <EmptyState
          icon="receipt"
          title="No expenses yet"
          body="Tap 'Add Expense' to log your first expense."
          ctaLabel="Add Expense"
          onCta={() => router.push({ pathname: '/(expenses)/create', params: { groupId } })}
        />
      </Stack>
    </Screen>
  );
}
