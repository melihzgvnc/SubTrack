export type AuthProvider = 'apple' | 'google' | 'email';

export interface AuthUser {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    provider: AuthProvider;
    createdAt: string;
}

export interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

export interface SyncState {
    isSyncing: boolean;
    lastSyncedAt: string | null;
    syncError: string | null;
    pendingChanges: number;
}

export interface CloudSubscription {
    id: string;
    localId: string;
    userId: string;
    name: string;
    price: number;
    currencyCode: string;
    currencySymbol: string;
    cycle: 'monthly' | 'yearly';
    startDate: string;
    color: string | null;
    category: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
