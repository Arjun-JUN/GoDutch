import { useRouter } from 'expo-router';
import {
  Screen,
  Stack,
  Text,
  Button,
  Icon,
} from '@godutch/slate';

export default function SettlementConfirmationScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Stack padding={8} gap={6} align="center" justify="center" style={{ flex: 1 }}>
        <Icon name="celebrate" size="xl" color="textPositive" />
        <Text variant="heading2" align="center" color="textPositive">
          All square!
        </Text>
        <Text variant="body" align="center" color="textSecondary">
          The settlement has been recorded and both parties are notified.
        </Text>
        <Button
          label="Back to Balance"
          variant="primary"
          onPress={() => router.replace('/(tabs)/balance')}
        />
      </Stack>
    </Screen>
  );
}
