import { create } from 'zustand';
import type { SyncState } from '../types/auth';

interface SyncStore extends SyncState {
    setSyncing: (isSyncing: boolean) => void;
    setLastSynced: (timestamp: string) => void;
    setSyncError: (error: string | null) => void;
    setPendingChanges: (count: number) => void;
    incrementPending: () => void;
    decrementPending: () => void;
    reset: () => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
    isSyncing: false,
    lastSyncedAt: null,
    syncError: null,
    pendingChanges: 0,

    setSyncing: (isSyncing) => set({ isSyncing }),
    setLastSynced: (timestamp) => set({ lastSyncedAt: timestamp }),
    setSyncError: (error) => set({ syncError: error }),
    setPendingChanges: (count) => set({ pendingChanges: count }),
    incrementPending: () => set((s) => ({ pendingChanges: s.pendingChanges + 1 })),
    decrementPending: () => set((s) => ({
        pendingChanges: Math.max(0, s.pendingChanges - 1)
    })),
    reset: () => set({
        isSyncing: false,
        lastSyncedAt: null,
        syncError: null,
        pendingChanges: 0,
    }),
}));
