import { useRouter } from 'expo-router';
import { Screen, Stack, Row, Text, Button, EmptyState, Spacer } from '@godutch/slate';

export default function GroupsScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Stack padding={4} gap={4}>
        <Row justify="space-between" align="center">
          <Text variant="heading2">Groups</Text>
          <Button
            label="New Group"
            variant="primary"
            size="sm"
            onPress={() => router.push('/(groups)/create')}
          />
        </Row>
        <EmptyState
          icon="people"
          title="No groups yet"
          body="Create a group to start splitting expenses with friends."
          ctaLabel="Create a group"
          onCta={() => router.push('/(groups)/create')}
        />
      </Stack>
    </Screen>
  );
}
