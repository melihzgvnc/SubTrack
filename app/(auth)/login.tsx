import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MeshBackground } from '../../components/ui/MeshBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import { ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { signInWithApple, signInWithGoogle, isLoading, error } = useAuth();

    const handleAppleLogin = async () => {
        try {
            await signInWithApple();
            router.replace('/(auth)/welcome');
        } catch (err) {
            console.error(err);
        }
    };

    const handleGoogleLogin = async () => {
        // TODO: Implement Google Sign-In logic with expo-auth-session
        console.log('Google login pressed');
    };

    return (
        <View style={styles.container}>
            <MeshBackground />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <GlassCard style={styles.card}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to sync your subscriptions across devices
                    </Text>

                    {error && (
                        <Text style={styles.error}>{error}</Text>
                    )}

                    <SocialLoginButtons
                        onApplePress={handleAppleLogin}
                        onGooglePress={handleGoogleLogin}
                        isLoading={isLoading}
                    />
                </GlassCard>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.main,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        padding: spacing.xl,
    },
    title: {
        color: '#FFF',
        fontSize: typography.size.xxl,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        color: colors.text.secondary,
        fontSize: typography.size.base,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    error: {
        color: colors.status.error,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
});
