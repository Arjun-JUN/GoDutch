import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Screen,
  Stack,
  Row,
  Text,
  Button,
  Card,
  Icon,
  Callout,
} from '@godutch/slate';

export default function SettleUpScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <Screen>
      <Stack padding={4} gap={5}>
        <Row gap={3} align="center">
          <Button
            label=""
            variant="ghost"
            onPress={() => router.back()}
            leftIcon={<Icon name="arrow-back" size="md" color="textPrimary" />}
          />
          <Text variant="heading3">Settle Up</Text>
        </Row>

        <Callout
          type="info"
          body="Record a payment to settle your balance. Both parties will need to confirm."
        />

        <Button
          label="Confirm Settlement"
          variant="positive"
          fullWidth
          onPress={() => router.replace('/(settlement)/confirmation')}
        />
      </Stack>
    </Screen>
  );
}
