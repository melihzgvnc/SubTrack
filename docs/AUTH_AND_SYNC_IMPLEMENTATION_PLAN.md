# User Authentication & Cloud Sync - Implementation Plan

## Overview

This document outlines the implementation plan for adding user authentication and cross-device data synchronization to SubTrack. Cloud sync will be a **Pro-tier feature**, providing additional value to paying users while keeping infrastructure costs manageable.

---

## Goals

1. Allow users to create accounts and sign in
2. Sync subscription data across multiple devices (Pro feature)
3. Link RevenueCat purchases to user accounts for purchase restoration
4. Maintain offline-first experience with seamless cloud sync
5. Comply with privacy regulations (GDPR, CCPA)

---

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Backend | **Supabase** | PostgreSQL, real-time sync, built-in auth, generous free tier |
| Authentication | Supabase Auth | Supports Apple, Google, Email/Password |
| Database | PostgreSQL (Supabase) | Relational, RLS for security |
| Real-time | Supabase Realtime | WebSocket-based sync |
| State Management | Zustand | Already in use, works well |

---

## Feature Tier Breakdown

| Feature | Free | Pro |
|---------|------|-----|
| Local data storage | ✅ | ✅ |
| Account creation | ✅ | ✅ |
| Cloud backup & sync | ❌ | ✅ |
| Multi-device access | ❌ | ✅ |
| Purchase restoration | ✅ | ✅ |


---

## Authentication Methods

### Priority Order

1. **Apple Sign-In** (Required for iOS if offering social login)
2. **Google Sign-In** (Most common account type)
3. **Email/Password** (Fallback option)

### Anonymous to Account Linking

Users can use the app without signing in. When they decide to create an account:
- Existing local data is preserved
- Data uploads to cloud upon first sync (Pro users)
- RevenueCat ID links to new account

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        SubTrack App                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ useAuthStore │  │ useSubStore  │  │   useProStore    │  │
│  │              │  │   (local)    │  │   (RevenueCat)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┼────────────────────┘            │
│                           │                                 │
│                    ┌──────▼───────┐                         │
│                    │ useSyncStore │                         │
│                    │ (orchestrator)│                        │
│                    └──────┬───────┘                         │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │        Supabase         │
               ├─────────────────────────┤
               │  • Auth Service         │
               │  • PostgreSQL Database  │
               │  • Real-time Engine     │
               │  • Row Level Security   │
               └─────────────────────────┘
```

### Data Flow

```
Local Change → Zustand Store → Debounced Sync (3s) → Supabase
                                                         │
Cloud Change ← Real-time Subscription ←──────────────────┘
```

---

## Database Schema

### Tables

```sql
-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  revenuecat_app_user_id text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  local_id text not null, -- Original client-side ID for mapping
  name text not null,
  price decimal(10,2) not null,
  currency_code text not null,
  currency_symbol text not null,
  cycle text not null check (cycle in ('monthly', 'yearly')),
  start_date timestamptz not null,
  color text,
  category text not null check (category in (
    'Entertainment', 'Music', 'Productivity', 
    'Utilities', 'Shopping', 'Other'
  )),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz, -- Soft delete for sync
  
  unique(user_id, local_id)
);

-- User Settings
create table public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  currency_code text default 'USD' not null,
  currency_symbol text default '$' not null,
  notifications_enabled boolean default true not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_updated_at on public.subscriptions(updated_at);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_settings enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Subscriptions policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- User settings policies
create policy "Users can manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id);
```

### Database Functions

```sql
-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  
  insert into public.user_settings (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();
```


---

## File Structure

### New Files to Create

```
SubTrack/
├── lib/
│   └── supabase.ts                    # Supabase client initialization
│
├── store/
│   ├── useAuthStore.ts                # Authentication state
│   └── useSyncStore.ts                # Sync state & operations
│
├── services/
│   ├── authService.ts                 # Auth API operations
│   ├── syncService.ts                 # Sync API operations
│   └── revenueCatService.ts           # RevenueCat linking
│
├── hooks/
│   ├── useAuth.ts                     # Auth hook for components
│   └── useCloudSync.ts                # Sync hook for components
│
├── types/
│   └── auth.ts                        # Auth-related types
│
├── app/
│   └── (auth)/
│       ├── _layout.tsx                # Auth stack layout
│       ├── login.tsx                  # Login screen
│       └── welcome.tsx                # Post-signup welcome
│
├── components/
│   └── auth/
│       ├── SocialLoginButtons.tsx     # Apple/Google sign-in buttons
│       ├── AccountCard.tsx            # Account info in settings
│       ├── SyncStatusBadge.tsx        # Sync indicator
│       └── DeleteAccountModal.tsx     # Account deletion confirmation
│
└── utils/
    └── syncUtils.ts                   # Sync helper functions
```

### Files to Modify

```
SubTrack/
├── app/
│   ├── _layout.tsx                    # Add auth state check
│   ├── settings.tsx                   # Add account section
│   └── onboarding.tsx                 # Add optional sign-in step
│
├── store/
│   └── useSubStore.ts                 # Add sync metadata fields
│
├── hooks/
│   └── useRevenueCat.ts               # Add user ID linking
│
└── .env                               # Add Supabase credentials
```

---

## Type Definitions

```typescript
// types/auth.ts

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
```

---

## Store Implementations

### useAuthStore

```typescript
// store/useAuthStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser, AuthState } from '../types/auth';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      signOut: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### useSyncStore

```typescript
// store/useSyncStore.ts

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
```


---

## Service Implementations

### Supabase Client

```typescript
// lib/supabase.ts

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Auth Service

```typescript
// services/authService.ts

import { supabase } from '../lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import type { AuthUser, AuthProvider } from '../types/auth';

export const authService = {
  // Sign in with Apple
  async signInWithApple(): Promise<AuthUser> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!,
    });

    if (error) throw error;
    return this.mapUser(data.user!, 'apple');
  },

  // Sign in with Google
  async signInWithGoogle(idToken: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    return this.mapUser(data.user!, 'google');
  },

  // Sign in with Email/Password
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return this.mapUser(data.user!, 'email');
  },

  // Sign up with Email/Password
  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');
    return this.mapUser(data.user, 'email');
  },

  // Sign out
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Delete account
  async deleteAccount(): Promise<void> {
    // Call edge function to delete user data and auth account
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) throw error;
  },

  // Map Supabase user to AuthUser
  mapUser(user: any, provider: AuthProvider): AuthUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || user.email,
      avatarUrl: user.user_metadata?.avatar_url || null,
      provider,
      createdAt: user.created_at,
    };
  },
};
```

### Sync Service

```typescript
// services/syncService.ts

import { supabase } from '../lib/supabase';
import type { Subscription } from '../store/useSubStore';
import type { CloudSubscription } from '../types/auth';

export const syncService = {
  // Fetch all subscriptions from cloud
  async fetchSubscriptions(userId: string): Promise<CloudSubscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(this.mapFromCloud);
  },

  // Upload local subscriptions to cloud
  async uploadSubscriptions(
    userId: string, 
    subscriptions: Subscription[]
  ): Promise<void> {
    const cloudSubs = subscriptions.map((sub) => ({
      user_id: userId,
      local_id: sub.id,
      name: sub.name,
      price: sub.price,
      currency_code: sub.currency,
      currency_symbol: sub.currency,
      cycle: sub.cycle,
      start_date: sub.startDate,
      color: sub.color || null,
      category: sub.category,
    }));

    const { error } = await supabase
      .from('subscriptions')
      .upsert(cloudSubs, { 
        onConflict: 'user_id,local_id',
        ignoreDuplicates: false,
      });

    if (error) throw error;
  },

  // Sync a single subscription change
  async syncSubscription(
    userId: string, 
    subscription: Subscription
  ): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        local_id: subscription.id,
        name: subscription.name,
        price: subscription.price,
        currency_code: subscription.currency,
        currency_symbol: subscription.currency,
        cycle: subscription.cycle,
        start_date: subscription.startDate,
        color: subscription.color || null,
        category: subscription.category,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,local_id',
      });

    if (error) throw error;
  },

  // Soft delete a subscription
  async deleteSubscription(userId: string, localId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('local_id', localId);

    if (error) throw error;
  },

  // Fetch user settings
  async fetchSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update user settings
  async updateSettings(userId: string, settings: {
    currencyCode?: string;
    currencySymbol?: string;
    notificationsEnabled?: boolean;
  }): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        currency_code: settings.currencyCode,
        currency_symbol: settings.currencySymbol,
        notifications_enabled: settings.notificationsEnabled,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribeToChanges(userId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        onUpdate
      )
      .subscribe();
  },

  // Map cloud subscription to local format
  mapFromCloud(cloud: any): CloudSubscription {
    return {
      id: cloud.id,
      localId: cloud.local_id,
      userId: cloud.user_id,
      name: cloud.name,
      price: parseFloat(cloud.price),
      currencyCode: cloud.currency_code,
      currencySymbol: cloud.currency_symbol,
      cycle: cloud.cycle,
      startDate: cloud.start_date,
      color: cloud.color,
      category: cloud.category,
      createdAt: cloud.created_at,
      updatedAt: cloud.updated_at,
      deletedAt: cloud.deleted_at,
    };
  },

  // Map cloud subscription to local Subscription type
  mapToLocal(cloud: CloudSubscription): Subscription {
    return {
      id: cloud.localId,
      name: cloud.name,
      price: cloud.price,
      currency: cloud.currencySymbol,
      cycle: cloud.cycle,
      startDate: cloud.startDate,
      color: cloud.color || undefined,
      category: cloud.category as Subscription['category'],
    };
  },
};
```


---

## Custom Hooks

### useAuth Hook

```typescript
// hooks/useAuth.ts

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useProStore } from '../store/useProStore';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import Purchases from 'react-native-purchases';

export function useAuth() {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    error,
    setUser, 
    setLoading, 
    setError,
    signOut: clearAuth,
  } = useAuthStore();

  const { isPro } = useProStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const authUser = authService.mapUser(
            session.user, 
            session.user.app_metadata.provider as any
          );
          setUser(authUser);
          
          // Link RevenueCat
          await Purchases.logIn(session.user.id);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = authService.mapUser(
            session.user,
            session.user.app_metadata.provider as any
          );
          setUser(authUser);
          await Purchases.logIn(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
          await Purchases.logOut();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithApple = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithApple();
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Apple sign-in failed');
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithGoogle(idToken);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      clearAuth();
    } catch (err: any) {
      setError(err.message || 'Sign-out failed');
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    try {
      await authService.deleteAccount();
      clearAuth();
    } catch (err: any) {
      setError(err.message || 'Account deletion failed');
      throw err;
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    isPro,
    canSync: isAuthenticated && isPro,
    error,
    signInWithApple,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    deleteAccount,
  };
}
```

### useCloudSync Hook

```typescript
// hooks/useCloudSync.ts

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
    const { subscriptions: localSubs } = useSubStore.getState();
    const localIds = new Set(localSubs.map((s) => s.id));
    
    // Add cloud subs that don't exist locally
    cloudSubs.forEach((cloudSub) => {
      if (!localIds.has(cloudSub.localId)) {
        const localSub = syncService.mapToLocal(cloudSub);
        useSubStore.getState().addSubscription(localSub);
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
      // Implement merge logic here
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
```


---

## UI Components

### Social Login Buttons

```typescript
// components/auth/SocialLoginButtons.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SocialLoginButtonsProps {
  onApplePress: () => void;
  onGooglePress: () => void;
  isLoading?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onApplePress,
  onGooglePress,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Apple Sign-In (iOS only) */}
      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={onApplePress}
        />
      )}

      {/* Google Sign-In */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGooglePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {/* Google Icon SVG here */}
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  appleButton: {
    height: 50,
    width: '100%',
  },
  googleButton: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  googleText: {
    color: '#1F1F1F',
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
});
```

### Account Card (Settings)

```typescript
// components/auth/AccountCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, LogOut, Cloud, CloudOff } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import { useCloudSync } from '../../hooks/useCloudSync';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDistanceToNow } from 'date-fns';

interface AccountCardProps {
  onSignInPress: () => void;
  onSignOutPress: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  onSignInPress,
  onSignOutPress,
}) => {
  const { user, isAuthenticated, isPro, canSync } = useAuth();
  const { isSyncing, lastSyncedAt, forceSync } = useCloudSync();

  if (!isAuthenticated) {
    return (
      <GlassCard style={styles.card}>
        <View style={styles.signedOutContent}>
          <User color={colors.text.secondary} size={32} />
          <Text style={styles.signedOutTitle}>Sign in to sync</Text>
          <Text style={styles.signedOutSubtitle}>
            Access your subscriptions on any device
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={onSignInPress}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Sync Status */}
      <View style={styles.syncStatus}>
        {canSync ? (
          <>
            <Cloud color={colors.accent.tertiary} size={16} />
            <Text style={styles.syncText}>
              {isSyncing 
                ? 'Syncing...' 
                : lastSyncedAt 
                  ? `Synced ${formatDistanceToNow(new Date(lastSyncedAt))} ago`
                  : 'Not synced yet'
              }
            </Text>
          </>
        ) : (
          <>
            <CloudOff color={colors.text.muted} size={16} />
            <Text style={styles.syncTextDisabled}>
              Upgrade to Pro to enable sync
            </Text>
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {canSync && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={forceSync}
            disabled={isSyncing}
          >
            <Text style={styles.actionButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.signOutButton]}
          onPress={onSignOutPress}
        >
          <LogOut color={colors.status.error} size={16} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  // ... styles
});
```

### Sync Status Badge

```typescript
// components/auth/SyncStatusBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react-native';
import { useCloudSync } from '../../hooks/useCloudSync';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const SyncStatusBadge: React.FC = () => {
  const { isSyncing, canSync, syncError, pendingChanges } = useCloudSync();
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [isSyncing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!canSync) {
    return (
      <View style={styles.badge}>
        <CloudOff color={colors.text.muted} size={14} />
      </View>
    );
  }

  if (isSyncing) {
    return (
      <View style={styles.badge}>
        <Animated.View style={animatedStyle}>
          <RefreshCw color={colors.accent.secondary} size={14} />
        </Animated.View>
      </View>
    );
  }

  if (syncError) {
    return (
      <View style={[styles.badge, styles.errorBadge]}>
        <Cloud color={colors.status.error} size={14} />
      </View>
    );
  }

  if (pendingChanges > 0) {
    return (
      <View style={[styles.badge, styles.pendingBadge]}>
        <Cloud color={colors.accent.neutral} size={14} />
        <Text style={styles.pendingCount}>{pendingChanges}</Text>
      </View>
    );
  }

  return (
    <View style={styles.badge}>
      <Cloud color={colors.accent.tertiary} size={14} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: colors.border.subtle,
  },
  errorBadge: {
    backgroundColor: 'rgba(255, 181, 232, 0.2)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(254, 243, 199, 0.2)',
  },
  pendingCount: {
    color: colors.accent.neutral,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
```


---

## User Flows

### Flow 1: Fresh Install (Anonymous User)

```
1. App Launch
   └── Show onboarding
       └── Complete onboarding
           └── Use app locally (no account)
               └── Data stored in AsyncStorage only

2. Optional: User taps "Sign In" in Settings
   └── Show login screen
       └── Sign in with Apple/Google
           └── Account created
               └── If Pro: Initial sync uploads local data
               └── If Free: Account linked, no sync
```

### Flow 2: Existing User Signs In on New Device

```
1. App Launch (new device)
   └── Show onboarding
       └── User taps "I have an account"
           └── Sign in with Apple/Google
               └── Fetch cloud data
                   └── Populate local store
                       └── Ready to use
```

### Flow 3: Conflict Resolution (Same User, Two Devices)

```
Device A: Adds "Disney+" subscription
Device B: Adds "HBO Max" subscription (offline)

When Device B comes online:
1. Device B pushes "HBO Max" to cloud
2. Real-time subscription notifies Device A
3. Device A adds "HBO Max" locally
4. Both devices now have both subscriptions

Conflict scenario (same subscription edited):
- Last-write-wins based on updated_at timestamp
- Future: Could show conflict UI for user to choose
```

### Flow 4: Account Deletion

```
1. User taps "Delete Account" in Settings
   └── Show confirmation modal
       └── User confirms
           └── Call delete-account edge function
               └── Delete all user data from cloud
               └── Delete auth account
               └── Clear local auth state
               └── Keep local subscription data (optional)
```

---

## RevenueCat Integration

### Linking User ID

```typescript
// hooks/useRevenueCat.ts (updated)

import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useProStore } from '../store/useProStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!;

export function useRevenueCat() {
  const { setCustomerInfo } = useProStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });

      // If user is authenticated, log them in to RevenueCat
      if (isAuthenticated && user) {
        try {
          const { customerInfo } = await Purchases.logIn(user.id);
          setCustomerInfo(customerInfo);

          // Store RevenueCat app user ID in Supabase profile
          await supabase
            .from('profiles')
            .update({ revenuecat_app_user_id: customerInfo.originalAppUserId })
            .eq('id', user.id);
        } catch (error) {
          console.error('RevenueCat login error:', error);
        }
      }

      // Listen for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
      });
    };

    init();
  }, [isAuthenticated, user?.id]);
}
```

### Purchase Restoration

```typescript
// When user signs in, purchases are automatically restored
// because we use their Supabase user ID as RevenueCat app user ID

const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    setCustomerInfo(customerInfo);
    
    if (customerInfo.entitlements.active['pro_access']) {
      // User has Pro, enable sync
      await performInitialSync();
    }
  } catch (error) {
    console.error('Restore purchases error:', error);
  }
};
```

---

## Environment Variables

```bash
# .env

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY=your-revenuecat-key

# Google OAuth (for expo-auth-session)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-google-android-client-id
```

---

## Dependencies to Install

```bash
# Supabase
npx expo install @supabase/supabase-js react-native-url-polyfill

# Apple Authentication
npx expo install expo-apple-authentication

# Google Authentication
npx expo install expo-auth-session expo-crypto expo-web-browser

# Date formatting (already installed)
# date-fns is already in package.json
```

### app.json Updates

```json
{
  "expo": {
    "plugins": [
      // ... existing plugins
      "expo-apple-authentication"
    ],
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

---

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce `auth.uid() = user_id`

### Data Encryption
- Supabase encrypts data at rest
- HTTPS for all API calls
- Sensitive data (passwords) never stored client-side

### Token Management
- Supabase handles JWT refresh automatically
- Tokens stored securely in AsyncStorage
- Session expires after inactivity (configurable)

### Account Deletion
- GDPR/CCPA compliant
- All user data deleted from cloud
- Option to keep local data

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Supabase project
- [ ] Create database schema and RLS policies
- [ ] Install dependencies
- [ ] Create Supabase client (`lib/supabase.ts`)
- [ ] Create type definitions (`types/auth.ts`)

### Phase 2: Authentication (Week 1-2)
- [ ] Implement `useAuthStore`
- [ ] Implement `authService`
- [ ] Create login screen UI
- [ ] Implement Apple Sign-In
- [ ] Implement Google Sign-In
- [ ] Update `_layout.tsx` for auth state

### Phase 3: Cloud Sync (Week 2-3)
- [ ] Implement `useSyncStore`
- [ ] Implement `syncService`
- [ ] Implement `useCloudSync` hook
- [ ] Add sync logic to subscription operations
- [ ] Implement real-time subscriptions
- [ ] Test conflict resolution

### Phase 4: UI Integration (Week 3)
- [ ] Create `AccountCard` component
- [ ] Create `SyncStatusBadge` component
- [ ] Update Settings screen
- [ ] Add sync status to header
- [ ] Create account deletion flow

### Phase 5: RevenueCat Integration (Week 3-4)
- [ ] Update `useRevenueCat` hook
- [ ] Link user IDs
- [ ] Test purchase restoration
- [ ] Test Pro-gated sync

### Phase 6: Testing & Polish (Week 4)
- [ ] End-to-end testing
- [ ] Edge case handling
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Documentation

---

## Testing Checklist

### Authentication
- [ ] Apple Sign-In works on iOS
- [ ] Google Sign-In works on iOS and Android
- [ ] Sign out clears all auth state
- [ ] Session persists across app restarts
- [ ] Token refresh works correctly

### Cloud Sync
- [ ] Initial sync uploads local data
- [ ] Changes sync within 3 seconds
- [ ] Real-time updates work across devices
- [ ] Offline changes sync when online
- [ ] Conflict resolution works correctly

### RevenueCat
- [ ] User ID links correctly
- [ ] Purchases restore on new device
- [ ] Pro status enables sync
- [ ] Free users cannot sync

### Edge Cases
- [ ] No network connection handling
- [ ] Partial sync failure recovery
- [ ] Large data sets (100+ subscriptions)
- [ ] Rapid successive changes
- [ ] Account deletion cleans up properly

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Foundation | 3-4 days | None |
| Authentication | 4-5 days | Foundation |
| Cloud Sync | 5-6 days | Authentication |
| UI Integration | 3-4 days | Cloud Sync |
| RevenueCat Integration | 2-3 days | Authentication |
| Testing & Polish | 4-5 days | All |
| **Total** | **~4 weeks** | |

---

## Cost Estimates

### Supabase (Free Tier)
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- **Cost: $0/month** (sufficient for launch)

### Supabase (Pro Tier - if needed)
- 8 GB database
- 100 GB file storage
- 50 GB bandwidth
- Unlimited users
- **Cost: $25/month**

### When to Upgrade
- > 500 MB data (unlikely with text-only subscriptions)
- > 50,000 MAU
- Need for advanced features (branching, PITR)

---

## Future Enhancements

1. **Email/Password Auth** - Add as fallback option
2. **Conflict UI** - Show conflicts for user resolution
3. **Selective Sync** - Choose what to sync
4. **Export Data** - Download all data as JSON/CSV
5. **Share Subscriptions** - Family sharing feature
6. **Sync History** - View sync activity log
