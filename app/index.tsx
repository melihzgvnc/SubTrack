import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSubStore } from '../store/useSubStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp, CreditCard, Settings, User, ArrowUpDown } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { NativeAdCard } from '../components/NativeAdCard';
import { Squircle } from '../components/ui/Squircle';
import { format, addMonths, addYears, parseISO, differenceInDays } from 'date-fns';
import { getCurrency } from '../utils/currency';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useResponsive, useResponsiveValue } from '../hooks/useResponsive';
import { useAuth } from '../hooks/useAuth';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

type SortOption = 'name' | 'price' | 'billingDate';

export default function Dashboard() {
    const { t } = useTranslation();
    const subscriptions = useSubStore((state) => state.subscriptions);
    const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);
    const currency = useSubStore((state) => state.currency);
    const router = useRouter();
    const { isTablet, height } = useResponsive();
    const { isAuthenticated } = useAuth();
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);

    // Animation values
    const menuHeight = useSharedValue(0);
    const menuOpacity = useSharedValue(0);

    // Animate menu open/close
    useEffect(() => {
        if (sortMenuOpen) {
            menuHeight.value = withTiming(60, { duration: 250 });
            menuOpacity.value = withTiming(1, { duration: 200 });
        } else {
            menuHeight.value = withTiming(0, { duration: 200 });
            menuOpacity.value = withTiming(0, { duration: 150 });
        }
    }, [sortMenuOpen]);

    const animatedMenuStyle = useAnimatedStyle(() => {
        return {
            height: menuHeight.value,
            opacity: menuOpacity.value,
            overflow: 'hidden',
        };
    });

    const activeCount = subscriptions.length;
    const yearlyCount = subscriptions.filter(s => s.cycle === 'yearly').length;
    const monthlyCount = subscriptions.filter(s => s.cycle === 'monthly').length;

    // Responsive hero card height
    const heroCardHeight = useResponsiveValue({
        sm: 160,
        md: 180,
        lg: 220,
        xl: 260,
        default: 180,
    });

    // Responsive stats card height
    const statsCardHeight = useResponsiveValue({
        sm: 72,
        md: 80,
        lg: 100,
        xl: 120,
        default: 80,
    });


    const getBillingInfo = (sub: typeof subscriptions[0]) => {
        const startDate = parseISO(sub.startDate);
        const now = new Date();
        let nextDate = startDate;

        // Find next future date
        if (nextDate <= now) {
            while (nextDate <= now) {
                if (sub.cycle === 'monthly') {
                    nextDate = addMonths(nextDate, 1);
                } else {
                    nextDate = addYears(nextDate, 1);
                }
            }
        }

        const daysDiff = differenceInDays(nextDate, now);

        if (daysDiff <= 7) {
            return t('dashboard.billing.dueInDays', { count: daysDiff });
        }

        // Check if next bill is in a different year
        const isNextYear = nextDate.getFullYear() > now.getFullYear();
        const dateFormat = isNextYear ? 'MMM d, yyyy' : 'MMM d';

        return t('dashboard.billing.nextBillOn', { date: format(nextDate, dateFormat) });
    };

    const getNextBillingDate = (sub: typeof subscriptions[0]) => {
        const startDate = parseISO(sub.startDate);
        const now = new Date();
        let nextDate = startDate;

        if (nextDate <= now) {
            while (nextDate <= now) {
                if (sub.cycle === 'monthly') {
                    nextDate = addMonths(nextDate, 1);
                } else {
                    nextDate = addYears(nextDate, 1);
                }
            }
        }
        return nextDate;
    };

    // Sort subscriptions based on selected option
    const sortedSubscriptions = useMemo(() => {
        const sorted = [...subscriptions];

        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));

            case 'price':
                // Sort by actual displayed price (not normalized to monthly)
                return sorted.sort((a, b) => b.price - a.price); // Descending order (highest first)

            case 'billingDate':
                return sorted.sort((a, b) => {
                    const dateA = getNextBillingDate(a);
                    const dateB = getNextBillingDate(b);
                    return dateA.getTime() - dateB.getTime(); // Ascending order (closest first)
                });

            default:
                return sorted;
        }
    }, [subscriptions, sortBy]);

    return (
        <SafeAreaView className="flex-1" edges={['top']}>
            <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}>

                {/* Header */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <View>
                        <Text className="text-shadow-blue-grey text-lg font-medium opacity-80">{t('dashboard.welcomeBack')}</Text>
                        <Text
                            className="text-white text-3xl tracking-tight"
                            style={{ fontFamily: typography.fontFamily.display }}
                        >
                            {t('dashboard.mySubscriptions')}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        {!isAuthenticated && (
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/login')}
                                activeOpacity={0.8}
                            >
                                <Squircle
                                    width={44}
                                    height={44}
                                    cornerRadius={16}
                                    backgroundColor={colors.accent.tertiary}
                                    showBorder
                                    borderColor="rgba(255,255,255,0.5)"
                                >
                                    <View className="flex-1 justify-center items-center">
                                        <User color={colors.text.inverse} size={20} />
                                    </View>
                                </Squircle>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => router.push('/settings')}
                            className="w-10 h-10 rounded-full bg-white/10 justify-center items-center"
                        >
                            <Settings color={colors.text.primary} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bento Grid Layout */}
                <View className="gap-4 mb-8">
                    {/* Hero: Total Spend */}
                    <GlassCard variant="highlight" style={{ minHeight: heroCardHeight }}>
                        <View className="flex-1 justify-between">
                            <View className="flex-row justify-between items-start">
                                <Text className="text-neon-blue font-bold tracking-widest uppercase text-xs">{t('dashboard.totalMonthlySpend')}</Text>
                                <View className="bg-surface-highlight p-2 rounded-full">
                                    <CreditCard color={colors.accent.secondary} size={24} />
                                </View>
                            </View>

                            <View>
                                <Text
                                    className="text-white text-6xl font-light tracking-tighter"
                                    allowFontScaling
                                    maxFontSizeMultiplier={1.15}
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                >
                                    {currency.symbol}{totalMonthlyCost().toFixed(2)}
                                </Text>
                                <Text
                                    className="text-shadow-blue-grey text-sm font-medium mt-1"
                                    allowFontScaling
                                    maxFontSizeMultiplier={1.3}
                                >
                                    {t('dashboard.activeServices', { count: activeCount })}
                                </Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Stats Row */}
                    <View className="flex-row">
                        <View className="flex-1 mr-2">
                            <GlassCard style={{ minHeight: statsCardHeight, padding: spacing.sm }}>
                                <View className="flex-row items-center justify-between h-full">
                                    <View className="bg-surface-highlight w-10 h-10 rounded-full justify-center items-center mr-3">
                                        <Calendar color={colors.accent.tertiary} size={isTablet ? 24 : 20} />
                                    </View>
                                    <View className="items-end">
                                        <Text
                                            className="text-white text-2xl font-bold"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.2}
                                        >
                                            {monthlyCount}
                                        </Text>
                                        <Text
                                            className="text-shadow-blue-grey text-[10px] uppercase font-bold mb-0.5"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.3}
                                        >
                                            {t('dashboard.monthly')}
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </View>
                        <View className="flex-1 ml-2">
                            <GlassCard style={{ minHeight: statsCardHeight, padding: spacing.sm }}>
                                <View className="flex-row items-center justify-between h-full">
                                    <View className="bg-surface-highlight w-10 h-10 rounded-full justify-center items-center mr-3">
                                        <TrendingUp color={colors.accent.quaternary} size={isTablet ? 24 : 20} />
                                    </View>
                                    <View className="items-end">
                                        <Text
                                            className="text-white text-2xl font-bold"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.2}
                                        >
                                            {yearlyCount}
                                        </Text>
                                        <Text
                                            className="text-shadow-blue-grey text-[10px] uppercase font-bold mb-0.5"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.3}
                                        >
                                            {t('dashboard.yearly')}
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </View>
                    </View>
                </View>

                {/* Subscription List */}
                <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text
                            className="text-white text-xl"
                            style={{ fontFamily: typography.fontFamily.display }}
                        >
                            {t('dashboard.yourSubscriptions')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setSortMenuOpen(!sortMenuOpen)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: sortMenuOpen ? colors.accent.secondary : 'rgba(255,255,255,0.1)',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            activeOpacity={0.7}
                        >
                            <ArrowUpDown color={sortMenuOpen ? colors.text.inverse : colors.text.secondary} size={18} />
                        </TouchableOpacity>
                    </View>

                    {/* Animated Sort Menu */}
                    <Animated.View style={[animatedMenuStyle, { marginBottom: sortMenuOpen ? 16 : 0 }]}>
                        <GlassCard style={{ padding: 8 }}>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-xs font-bold uppercase ml-2">{t('dashboard.sort.sortBy')}</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => { setSortBy('name'); setSortMenuOpen(false); }}
                                        className={`px-3 py-1.5 rounded-full ${sortBy === 'name' ? 'bg-neon-blue/20 border border-neon-blue/50' : 'bg-white/5'}`}
                                    >
                                        <Text className={`text-xs font-bold ${sortBy === 'name' ? 'text-neon-blue' : 'text-shadow-blue-grey'}`}>{t('dashboard.sort.name')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { setSortBy('price'); setSortMenuOpen(false); }}
                                        className={`px-3 py-1.5 rounded-full ${sortBy === 'price' ? 'bg-neon-blue/20 border border-neon-blue/50' : 'bg-white/5'}`}
                                    >
                                        <Text className={`text-xs font-bold ${sortBy === 'price' ? 'text-neon-blue' : 'text-shadow-blue-grey'}`}>{t('dashboard.sort.price')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { setSortBy('billingDate'); setSortMenuOpen(false); }}
                                        className={`px-3 py-1.5 rounded-full ${sortBy === 'billingDate' ? 'bg-neon-blue/20 border border-neon-blue/50' : 'bg-white/5'}`}
                                    >
                                        <Text className={`text-xs font-bold ${sortBy === 'billingDate' ? 'text-neon-blue' : 'text-shadow-blue-grey'}`}>{t('dashboard.sort.billingDate')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {sortedSubscriptions.length === 0 ? (
                        <GlassCard>
                            <View className="items-center py-8">
                                <View className="w-16 h-16 rounded-full bg-surface-highlight justify-center items-center mb-4">
                                    <Plus color={colors.text.secondary} size={32} />
                                </View>
                                <Text className="text-white text-lg font-bold mb-2">{t('dashboard.empty.title')}</Text>
                                <Text className="text-text-secondary text-center max-w-[200px]">
                                    {t('dashboard.empty.subtitle')}
                                </Text>
                            </View>
                        </GlassCard>
                    ) : (
                        <View className="gap-3">
                            {sortedSubscriptions.map((sub) => (
                                <TouchableOpacity
                                    key={sub.id}
                                    onPress={() => router.push(`/subscription/${sub.id}`)}
                                    activeOpacity={0.9}
                                >
                                    <GlassCard>
                                        <View className="flex-row items-center justify-between p-1">
                                            <View className="flex-row items-center gap-3">
                                                <Squircle
                                                    width={48}
                                                    height={48}
                                                    cornerRadius={16}
                                                    backgroundColor={sub.color}
                                                >
                                                    <View className="flex-1 justify-center items-center">
                                                        <Text className="text-white font-bold text-lg">
                                                            {sub.name.charAt(0)}
                                                        </Text>
                                                    </View>
                                                </Squircle>
                                                <View>
                                                    <Text className="text-white font-bold text-lg">{sub.name}</Text>
                                                    <Text className="text-shadow-blue-grey text-xs font-medium">
                                                        {getBillingInfo(sub)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-white font-bold text-lg">
                                                    {currency.symbol}{sub.price.toFixed(2)}
                                                </Text>
                                                <Text className="text-shadow-blue-grey text-xs font-medium capitalize">
                                                    {t(`addSubscription.${sub.cycle}`)}
                                                </Text>
                                            </View>
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity
                    onPress={() => router.push('/add')}
                    activeOpacity={0.8}
                    style={{
                        shadowColor: colors.accent.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.5,
                        shadowRadius: 16,
                        elevation: 10,
                    }}
                >
                    <Squircle
                        width={64}
                        height={64}
                        cornerRadius={24}
                        backgroundColor={colors.accent.primary}
                        showBorder
                        borderColor="rgba(255,255,255,0.3)"
                    >
                        <View className="flex-1 justify-center items-center">
                            <Plus color={colors.text.inverse} size={32} strokeWidth={2.5} />
                        </View>
                    </Squircle>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
