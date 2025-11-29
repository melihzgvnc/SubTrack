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
