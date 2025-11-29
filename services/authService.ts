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
