import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSubStore } from '../../store/useSubStore';
import { format, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { Squircle } from '../../components/ui/Squircle';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useResponsive, useResponsiveValue } from '../../hooks/useResponsive';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/useLanguageStore';

export default function SubscriptionDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const subscription = useSubStore((state) =>
        state.subscriptions.find((s) => s.id === id)
    );
    const removeSubscription = useSubStore((state) => state.removeSubscription);
    const { t } = useTranslation();
    const { language } = useLanguageStore();

    // Responsive icon size
    const iconSquircleSize = useResponsiveValue({
        sm: 88,
        md: 96,
        lg: 120,
        xl: 140,
        default: 96,
    });

    // Responsive stats card height
    const statsCardHeight = useResponsiveValue({
        sm: 150,
        md: 160,
        lg: 180,
        xl: 200,
        default: 160,
    });

    if (!subscription) return null;

    const { name, price, currency, cycle, startDate, color } = subscription;
    const start = parseISO(startDate);
    const now = new Date();

    // Calculate Total Spend (Lifetime)
    let totalSpend = 0;
    if (cycle === 'monthly') {
        const monthsActive = differenceInMonths(now, start) + 1;
        totalSpend = price * monthsActive;
    } else {
        // For yearly, you pay the full price at the start of each year
        const yearsActive = differenceInYears(now, start) + 1;
        totalSpend = price * yearsActive;
    }

    // Calculate Monthly Equivalent Cost
    const monthlyCost = cycle === 'monthly' ? price : price / 12;

    const handleDelete = () => {
        removeSubscription(id as string);
        router.back();
    };

    const dateLocale = language === 'tr' ? tr : enUS;

    // Helper to capitalize first letter
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Translate cycle for display
    const translatedCycle = t(`addSubscription.${cycle}`);

    return (
        <SafeAreaView className="flex-1" edges={['top']}>
            <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}>

                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-surface-highlight justify-center items-center"
                    >
                        <ArrowLeft color={colors.text.primary} size={20} />
                    </TouchableOpacity>
                    <Text className="text-shadow-blue-grey font-medium">{t('subscriptionDetail.title')}</Text>
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="w-10 h-10 rounded-full bg-red-500/10 justify-center items-center"
                    >
                        <Trash2 color={colors.status.error} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Main Card */}
                <GlassCard style={{ paddingVertical: spacing.xxl, marginBottom: spacing.xl }}>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ width: iconSquircleSize, height: iconSquircleSize, marginBottom: spacing.xl }}>
                            <Squircle
                                width={iconSquircleSize}
                                height={iconSquircleSize}
                                cornerRadius={iconSquircleSize * 0.33}
                                backgroundColor={color || colors.background.surface}
                                showBorder={true}
                                borderColor={colors.border.highlight}
                            >
                                <View className="flex-1 justify-center items-center">
                                    <Text
                                        className="text-white font-bold text-4xl"
                                        allowFontScaling
                                        maxFontSizeMultiplier={1.2}
                                    >
                                        {name.charAt(0)}
                                    </Text>
                                </View>
                            </Squircle>
                        </View>
                        <Text
                            className="text-white text-3xl mb-2 text-center"
                            style={{ fontFamily: typography.fontFamily.display }}
                            allowFontScaling
                            maxFontSizeMultiplier={1.2}
                        >
                            {name}
                        </Text>
                        <Text
                            className="text-shadow-blue-grey text-lg capitalize text-center"
                            allowFontScaling
                            maxFontSizeMultiplier={1.3}
                        >
                            {t('subscriptionDetail.plan', { cycle: translatedCycle })} • {t(`addSubscription.categories.${subscription.category}`)}
                        </Text>
                    </View>
                </GlassCard>

                {/* Stats Grid */}
                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <GlassCard variant="highlight" style={{ height: statsCardHeight, padding: spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
                            <Text
                                className="text-neon-blue font-bold uppercase text-[10px] tracking-widest mb-3"
                                numberOfLines={1}
                            >
                                {t('subscriptionDetail.monthlyCost')}
                            </Text>
                            <View className="items-center">
                                <Text
                                    className="text-white text-2xl font-bold mb-1"
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                >
                                    {currency}{monthlyCost.toFixed(2)}
                                </Text>
                                <Text className="text-shadow-blue-grey text-[10px]">
                                    {t('subscriptionDetail.perMonth')}
                                </Text>
                            </View>
                        </GlassCard>
                    </View>
                    <View className="flex-1">
                        <GlassCard variant="active" style={{ height: statsCardHeight, padding: spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
                            <Text
                                className="text-neon-pink font-bold uppercase text-[10px] tracking-widest mb-3"
                                numberOfLines={1}
                            >
                                {t('subscriptionDetail.totalSpend')}
                            </Text>
                            <View className="items-center">
                                <Text
                                    className="text-white text-2xl font-bold mb-1"
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                >
                                    {currency}{totalSpend.toFixed(2)}
                                </Text>
                                <Text className="text-shadow-blue-grey text-[10px]">
                                    {t('subscriptionDetail.lifetime')}
                                </Text>
                            </View>
                        </GlassCard>
                    </View>
                </View>

                <GlassCard style={{ padding: spacing.xl, marginBottom: spacing.xl }}>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-shadow-blue-grey">{t('subscriptionDetail.status')}</Text>
                        <View className="bg-neon-green/20 px-3 py-1 rounded-full">
                            <Text className="text-neon-green text-xs font-bold uppercase">{t('subscriptionDetail.active')}</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-shadow-blue-grey">{t('subscriptionDetail.startedOn')}</Text>
                        <Text className="text-white font-medium">{format(start, 'MMM do, yyyy', { locale: dateLocale })}</Text>
                    </View>
                </GlassCard>

            </ScrollView>
        </SafeAreaView>
    );
}
