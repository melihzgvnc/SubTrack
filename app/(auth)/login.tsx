import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialLoginButtons } from '../../components/auth/SocialLoginButtons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { MeshBackground } from '../../components/ui/MeshBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
    const router = useRouter();
    const { signInWithApple, signInWithGoogle, isLoading, error } = useAuth();
    const { t } = useTranslation();

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
        <View className="flex-1 bg-background-main">
            <MeshBackground />

            <SafeAreaView className="flex-1">
                <View className="px-4 pt-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/10 justify-center items-center"
                        activeOpacity={0.7}
                    >
                        <ArrowLeft color="#FFF" size={24} />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 justify-center px-6 pb-20">
                    <GlassCard style={{ padding: 32 }}>
                        <View className="items-center mb-8">
                            <Text
                                className="text-white text-4xl text-center mb-3"
                                style={{ fontFamily: typography.fontFamily.display }}
                            >
                                {t('auth.login.title')}
                            </Text>
                            <Text className="text-text-secondary text-base text-center px-4 leading-6">
                                {t('auth.login.subtitle')}
                            </Text>
                        </View>

                        {error && (
                            <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-6">
                                <Text className="text-red-400 text-center font-medium">{error}</Text>
                            </View>
                        )}

                        <SocialLoginButtons
                            onApplePress={handleAppleLogin}
                            onGooglePress={handleGoogleLogin}
                            isLoading={isLoading}
                        />
                    </GlassCard>
                </View>
            </SafeAreaView>
        </View>
    );
}
