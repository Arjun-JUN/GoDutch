import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Screen,
  Stack,
  Row,
  Text,
  Button,
  Input,
  Card,
  Banner,
  Icon,
} from '@godutch/slate';
import { useToast } from '@godutch/slate';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { show } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    setLoading(true);
    try {
      // TODO: call POST /api/groups
      show('Group created!', { type: 'success' });
      router.back();
    } catch {
      show('Could not create group', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Stack padding={4} gap={6}>
        <Row gap={3} align="center">
          <Button
            label=""
            variant="ghost"
            onPress={() => router.back()}
            leftIcon={<Icon name="arrow-back" size="md" color="textPrimary" />}
          />
          <Text variant="heading3">New Group</Text>
        </Row>

        <Card>
          <Stack gap={4}>
            <Input
              label="Group name"
              placeholder="e.g. Weekend Trip, Dinner Crew"
              value={name}
              onChangeText={v => { setName(v); setError(undefined); }}
              error={error}
              clearable
              autoFocus
            />
          </Stack>
        </Card>

        <Button
          label="Create Group"
          variant="primary"
          fullWidth
          loading={loading}
          onPress={handleCreate}
        />
      </Stack>
    </Screen>
  );
}
