import React from 'react';
import { AppShell } from '../../src/slate/AppShell';
import { GroupsList } from '../../src/components/GroupsList';

/**
 * Legacy /groups route — kept for deep-link compatibility. The primary entry
 * is the Groups tab at `(tabs)/groups.tsx`. Both render the same underlying
 * component so behavior stays in lockstep.
 */
export default function GroupsIndex() {
  return (
    <AppShell>
      <GroupsList />
    </AppShell>
  );
}
