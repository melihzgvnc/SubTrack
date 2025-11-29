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
