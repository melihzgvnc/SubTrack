import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useProStore } from '../store/useProStore';
import { useSubStore } from '../store/useSubStore';
import { useSyncStore } from '../store/useSyncStore';
import { syncService } from '../services/syncService';
import type { Subscription } from '../store/useSubStore';

const SYNC_DEBOUNCE_MS = 3000;

export function useCloudSync() {
    const { user, isAuthenticated } = useAuthStore();
    const { isPro } = useProStore();
    const subscriptions = useSubStore((s) => s.subscriptions);
    const {
        isSyncing,
        lastSyncedAt,
        syncError,
        pendingChanges,
        setSyncing,
        setLastSynced,
        setSyncError,
        setPendingChanges,
    } = useSyncStore();

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const canSync = isAuthenticated && isPro && user;

    // Initial sync on login
    useEffect(() => {
        if (canSync) {
            performInitialSync();
        }
    }, [canSync, user?.id]);

    // Subscribe to real-time changes
    useEffect(() => {
        if (!canSync || !user) return;

        const channel = syncService.subscribeToChanges(user.id, (payload) => {
            handleRemoteChange(payload);
        });

        return () => {
            channel.unsubscribe();
        };
    }, [canSync, user?.id]);

    // Debounced sync on local changes
    useEffect(() => {
        if (!canSync) return;

        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            syncLocalChanges();
        }, SYNC_DEBOUNCE_MS);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [subscriptions, canSync]);

    const performInitialSync = async () => {
        if (!user) return;

        setSyncing(true);
        setSyncError(null);

        try {
            // Fetch cloud data
            const cloudSubs = await syncService.fetchSubscriptions(user.id);

            if (cloudSubs.length === 0 && subscriptions.length > 0) {
                // First sync: upload local data
                await syncService.uploadSubscriptions(user.id, subscriptions);
            } else if (cloudSubs.length > 0) {
                // Merge cloud data with local (cloud wins for conflicts)
                mergeCloudData(cloudSubs);
            }

            setLastSynced(new Date().toISOString());
        } catch (err: any) {
            setSyncError(err.message || 'Sync failed');
            console.error('Initial sync error:', err);
        } finally {
            setSyncing(false);
        }
    };

    const syncLocalChanges = async () => {
        if (!user || isSyncing) return;

        setSyncing(true);
        try {
            await syncService.uploadSubscriptions(user.id, subscriptions);
            setLastSynced(new Date().toISOString());
            setPendingChanges(0);
        } catch (err: any) {
            setSyncError(err.message || 'Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    const mergeCloudData = (cloudSubs: any[]) => {
        const { subscriptions: localSubs, addSubscription, updateSubscription } = useSubStore.getState();
        const localIds = new Set(localSubs.map((s) => s.id));

        cloudSubs.forEach((cloudSub) => {
            const localSub = syncService.mapToLocal(cloudSub);
            if (localIds.has(cloudSub.localId)) {
                // Update existing
                updateSubscription(localSub);
            } else {
                // Add new
                addSubscription(localSub);
            }
        });
    };

    const handleRemoteChange = (payload: any) => {
        // Handle real-time updates from other devices
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // Update local store with remote change
            const localSub = syncService.mapToLocal(
                syncService.mapFromCloud(newRecord)
            );

            const { subscriptions, addSubscription, updateSubscription } = useSubStore.getState();
            const exists = subscriptions.some(s => s.id === localSub.id);

            if (exists) {
                updateSubscription(localSub);
            } else {
                addSubscription(localSub);
            }
        } else if (eventType === 'DELETE') {
            // Remove from local store
            useSubStore.getState().removeSubscription(oldRecord.local_id);
        }
    };

    const forceSync = useCallback(async () => {
        if (!canSync) return;
        await performInitialSync();
    }, [canSync, user?.id]);

    return {
        isSyncing,
        lastSyncedAt,
        syncError,
        pendingChanges,
        canSync,
        forceSync,
    };
}
