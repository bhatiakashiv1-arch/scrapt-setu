import type { SyncQueueItem } from '@/types';
import { getItem, setItem } from './storage';

const QUEUE_KEY = 'syncQueue';
const SYNC_STATUS_KEY = 'syncStatus';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced';

export function getSyncQueue(): SyncQueueItem[] {
  return getItem<SyncQueueItem[]>(QUEUE_KEY) ?? [];
}

export function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'created_at' | 'synced'>): void {
  const queue = getSyncQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    synced: false,
  });
  setItem(QUEUE_KEY, queue);
}

export function getPendingSyncCount(): number {
  return getSyncQueue().filter((i) => !i.synced).length;
}

export function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (!item.synced) {
      // In a real app, this would push to the backend
      // For the demo, we just mark as synced
      item.synced = true;
      synced++;
    }
  }

  setItem(QUEUE_KEY, queue);
  setItem(SYNC_STATUS_KEY, { status: 'synced', lastSync: new Date().toISOString() });
  return Promise.resolve({ synced, failed });
}

export function getSyncStatus(): { status: SyncStatus; lastSync?: string } {
  return getItem<{ status: SyncStatus; lastSync?: string }>(SYNC_STATUS_KEY) ?? { status: 'online' };
}

export function setSyncStatus(status: SyncStatus): void {
  const current = getSyncStatus();
  setItem(SYNC_STATUS_KEY, { status, lastSync: current.lastSync });
}

export function getLastSynced(): string | undefined {
  return getSyncStatus().lastSync;
}
