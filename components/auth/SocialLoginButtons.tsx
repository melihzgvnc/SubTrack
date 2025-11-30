import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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
                {/* Google Icon SVG here - using text for now */}
                <Text style={styles.googleText}>{t('auth.login.google')}</Text>
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
