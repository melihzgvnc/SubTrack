import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, LogOut, Cloud, CloudOff } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { Squircle } from '../ui/Squircle';
import { useAuth } from '../../hooks/useAuth';
import { useCloudSync } from '../../hooks/useCloudSync';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface AccountCardProps {
    onSignInPress: () => void;
    onSignOutPress: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
    onSignInPress,
    onSignOutPress,
}) => {
    const { t } = useTranslation();
    const { user, isAuthenticated, isPro, canSync } = useAuth();
    const { isSyncing, lastSyncedAt, forceSync } = useCloudSync();

    if (!isAuthenticated) {
        return (
            <GlassCard style={styles.card}>
                <View style={styles.signedOutContent}>
                    <User color={colors.text.secondary} size={32} />
                    <Text style={styles.signedOutTitle}>{t('auth.signInToSync')}</Text>
                    <Text style={styles.signedOutSubtitle}>
                        {t('auth.accessSubscriptions')}
                    </Text>
                    <TouchableOpacity
                        onPress={onSignInPress}
                        activeOpacity={0.8}
                        style={{ marginTop: spacing.md }}
                    >
                        <Squircle
                            width={200}
                            height={48}
                            cornerRadius={16}
                            backgroundColor={colors.accent.tertiary}
                            showBorder
                            borderColor="rgba(255,255,255,0.5)"
                        >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.signInButtonText}>{t('common.signIn')}</Text>
                            </View>
                        </Squircle>
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
                                ? t('auth.syncing')
                                : lastSyncedAt
                                    ? t('auth.syncedAgo', { time: formatDistanceToNow(new Date(lastSyncedAt)) })
                                    : t('auth.notSyncedYet')
                            }
                        </Text>
                    </>
                ) : (
                    <>
                        <CloudOff color={colors.text.muted} size={16} />
                        <Text style={styles.syncTextDisabled}>
                            {t('auth.upgradeToSync')}
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
                        <Text style={styles.actionButtonText}>{t('auth.syncNow')}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, styles.signOutButton]}
                    onPress={onSignOutPress}
                >
                    <LogOut color={colors.status.error} size={16} />
                    <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
                </TouchableOpacity>
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
    },
    signedOutContent: {
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
    },
    signedOutTitle: {
        color: colors.text.primary,
        fontSize: typography.size.lg,
        fontWeight: 'bold',
    },
    signedOutSubtitle: {
        color: colors.text.secondary,
        fontSize: typography.size.sm,
        textAlign: 'center',
    },
    signInButtonText: {
        color: colors.text.inverse,
        fontWeight: 'bold',
        fontSize: typography.size.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.accent.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: typography.size.xl,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: colors.text.primary,
        fontSize: typography.size.base,
        fontWeight: 'bold',
    },
    userEmail: {
        color: colors.text.secondary,
        fontSize: typography.size.sm,
    },
    syncStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: spacing.sm,
        borderRadius: 8,
        marginBottom: spacing.md,
    },
    syncText: {
        color: colors.text.secondary,
        fontSize: typography.size.xs,
    },
    syncTextDisabled: {
        color: colors.text.muted,
        fontSize: typography.size.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    actionButtonText: {
        color: colors.text.primary,
        fontSize: typography.size.sm,
        fontWeight: '600',
    },
    signOutButton: {
        flexDirection: 'row',
        gap: spacing.xs,
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    signOutText: {
        color: colors.status.error,
        fontSize: typography.size.sm,
        fontWeight: '600',
    },
});
