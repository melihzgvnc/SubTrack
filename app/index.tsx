import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSubStore } from '../store/useSubStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp, CreditCard, Settings } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { NativeAdCard } from '../components/NativeAdCard';
import { Squircle } from '../components/ui/Squircle';
import { format, addMonths, addYears, parseISO, differenceInDays } from 'date-fns';
import { getCurrency } from '../utils/currency';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useResponsive, useResponsiveValue } from '../hooks/useResponsive';

export default function Dashboard() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);
  const currency = useSubStore((state) => state.currency);
  const router = useRouter();
  const { isTablet, height } = useResponsive();

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
        return `Due in ${daysDiff} days`;
    }
    return `Next bill on ${format(nextDate, 'MMM d')}`;
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
            <View>
                <Text className="text-shadow-blue-grey text-lg font-medium opacity-80">Welcome back,</Text>
                <Text 
                    className="text-white text-3xl tracking-tight"
                    style={{ fontFamily: typography.fontFamily.display }}
                >
                    My Subscriptions
                </Text>
            </View>
            <TouchableOpacity 
                onPress={() => router.push('/settings')}
                className="w-10 h-10 rounded-full bg-white/10 justify-center items-center"
            >
                <Settings color={colors.text.primary} size={20} />
            </TouchableOpacity>
        </View>

        {/* Bento Grid Layout */}
        <View className="gap-4 mb-8">
            {/* Hero: Total Spend */}
            <GlassCard variant="highlight" style={{ minHeight: heroCardHeight }}>
                <View className="flex-1 justify-between">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-neon-blue font-bold tracking-widest uppercase text-xs">Total Monthly Spend</Text>
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
                            across {activeCount} active services
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
                                    Monthly
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
                                    Yearly
                                </Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>
            </View>
        </View>

        {/* Subscription List */}
        <View className="mb-4">
            <Text 
                className="text-white text-xl mb-4"
                style={{ fontFamily: typography.fontFamily.display }}
            >
                Your Subscriptions
            </Text>
            
            <View>
                {subscriptions.map((sub, index) => (
                    <React.Fragment key={sub.id}>
                        <TouchableOpacity 
                            onPress={() => router.push(`/subscription/${sub.id}`)}
                            activeOpacity={0.7}
                            style={{ marginBottom: spacing.md }}
                        >
                            <GlassCard style={{ padding: spacing.none }}>
                                 <View className="flex-row items-center p-1">
                                    {/* Icon Container with Squircle */}
                                    <View style={{ width: 56, height: 56, marginRight: spacing.md }}>
                                        <Squircle 
                                            width={56} 
                                            height={56} 
                                            cornerRadius={18} 
                                            backgroundColor={sub.color || colors.background.surface}
                                            showBorder={true}
                                            borderColor={colors.border.highlight}
                                        >
                                            <View className="flex-1 justify-center items-center">
                                                <Text className="text-white font-bold text-xl">{sub.name.charAt(0)}</Text>
                                            </View>
                                        </Squircle>
                                    </View>
                                    
                                    <View className="flex-1 py-3">
                                        <Text className="text-white font-bold text-lg">{sub.name}</Text>
                                        {(() => {
                                            const info = getBillingInfo(sub);
                                            const isDueSoon = info.startsWith('Due');
                                            return (
                                                <Text className={`text-xs font-medium mt-0.5 ${isDueSoon ? 'text-neon-pink' : 'text-gray-300'}`}>
                                                    {info}
                                                </Text>
                                            );
                                        })()}
                                    </View>

                                    <View className="items-end py-3 pr-4">
                                        <Text className="text-white font-bold text-lg">
                                            {sub.currency}{sub.price}
                                        </Text>
                                        <Text className="text-shadow-blue-grey text-xs">
                                            {sub.cycle === 'monthly' ? 'monthly' : 'yearly'}
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                        {index === 2 && (
                            <View style={{ marginBottom: spacing.md }}>
                                <NativeAdCard />
                            </View>
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
