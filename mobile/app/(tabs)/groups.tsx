import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AppShell } from '../../src/slate/AppShell';
import { GroupsList } from '../../src/components/GroupsList';

export default function GroupsTab() {
  const { create } = useLocalSearchParams<{ create?: string }>();
  return (
    <AppShell>
      <GroupsList autoOpenCreate={create === '1'} />
    </AppShell>
  );
}
