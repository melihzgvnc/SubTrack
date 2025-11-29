import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MeshBackground } from '../../components/ui/MeshBackground';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Check } from 'lucide-react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <MeshBackground />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Check color={colors.accent.primary} size={48} />
                </View>

                <Text style={styles.title}>You're all set!</Text>
                <Text style={styles.subtitle}>
                    Your subscriptions are now syncing to the cloud.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/settings')}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.main,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        color: '#FFF',
        fontSize: typography.size.xxl,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    subtitle: {
        color: colors.text.secondary,
        fontSize: typography.size.base,
        textAlign: 'center',
        marginBottom: spacing.xxl,
    },
    button: {
        backgroundColor: colors.accent.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: typography.size.base,
        fontWeight: 'bold',
    },
});
