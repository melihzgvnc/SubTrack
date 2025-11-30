import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    runOnJS
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const LoginModal = () => {
    const { isLoginModalOpen, closeLoginModal, signInWithApple, signInWithGoogle, isLoading, error } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const progress = useSharedValue(0);
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
        if (isLoginModalOpen) {
            setIsVisible(true);
            progress.value = withSpring(1, {
                damping: 15,
                stiffness: 100,
                mass: 0.8,
            });
        } else {
            progress.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setIsVisible)(false);
                }
            });
        }
    }, [isLoginModalOpen]);

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [0.1, 1]);
        const translateY = interpolate(progress.value, [0, 1], [-height / 2, 0]);
        const opacity = interpolate(progress.value, [0, 1], [0, 1]);
        const borderRadius = interpolate(progress.value, [0, 1], [100, 24]);

        return {
            transform: [
                { translateY },
                { scale },
            ],
            opacity,
            borderRadius,
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [0, 1]),
        };
    });

    const handleAppleLogin = async () => {
        try {
            await signInWithApple();
            closeLoginModal();
            // Optional: Navigate to welcome if needed, or just stay on current screen
        } catch (err) {
            console.error(err);
        }
    };

    const handleGoogleLogin = async () => {
        console.log('Google login pressed');
    };

    if (!isVisible) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="justify-center items-center z-50">
            {/* Backdrop */}
            <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={closeLoginModal}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableOpacity>
            </Animated.View>

            {/* Modal Content */}
            <Animated.View style={[{ width: width * 0.9, maxWidth: 400 }, animatedStyle]}>
                {/* Main Card */}
                <GlassCard style={{ minHeight: 350, padding: 32, paddingBottom: 48, zIndex: 10 }}>
                    <View className='flex-1 justify-center'>



                        <View className="items-center mt-2 mb-6">
                            <Text
                                className="text-white text-3xl text-center mb-3"
                                style={{ fontFamily: typography.fontFamily.display }}
                            >
                                {t('auth.login.title')}
                            </Text>
                            <Text className="text-gray-400 text-sm text-center px-4 leading-5">
                                {t('auth.login.subtitle')}
                            </Text>
                        </View>

                        {error && (
                            <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-6">
                                <Text className="text-red-400 text-center font-medium text-xs">{error}</Text>
                            </View>
                        )}
                        <SocialLoginButtons
                            onApplePress={handleAppleLogin}
                            onGooglePress={handleGoogleLogin}
                            isLoading={isLoading}
                        />
                    </View>
                </GlassCard>

            </Animated.View>
        </View>
    );
};
