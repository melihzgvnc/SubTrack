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
