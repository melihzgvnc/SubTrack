import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, DollarSign, Globe, ChevronRight, Check } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { useSubStore } from '../store/useSubStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useResponsive, useResponsiveValue } from '../hooks/useResponsive';

import { currencies } from '../utils/currencies';

import { AccountCard } from '../components/auth/AccountCard';
import { useAuth } from '../hooks/useAuth';
import { useProStore } from '../store/useProStore';

export default function Settings() {
    const router = useRouter();
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguageStore();
    const [showLanguageOptions, setShowLanguageOptions] = useState(false);

    const {
        notificationsEnabled,
        toggleNotifications,
        currency,
        setCurrency
    } = useSubStore();
    const { signOut, openLoginModal } = useAuth();
    const { isPro, toggleProForTesting } = useProStore();
    const { isTablet, height } = useResponsive();

    // Responsive currency list height
    const currencyListHeight = useResponsiveValue({
        sm: 240,
        md: 256,
        lg: 320,
        xl: 400,
        default: 256,
    });

    return (
        <SafeAreaView className="flex-1" edges={['top']}>
            <View className="flex-1 px-4 pt-2">
                {/* Header */}
                <View className="flex-row items-center mb-6 mt-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/10 justify-center items-center mr-4"
                    >
                        <ArrowLeft color={colors.text.primary} size={24} />
                    </TouchableOpacity>
                    <Text
                        className="text-white text-3xl"
                        style={{ fontFamily: typography.fontFamily.display }}
                    >
                        {t('common.settings.title')}
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}>
                    {/* Account Section */}
                    <View className="mb-6">
                        <Text className="text-shadow-blue-grey text-sm font-bold uppercase mb-3 ml-1">{t('common.settings.account')}</Text>
                        <AccountCard
                            onSignInPress={() => openLoginModal()}
                            onSignOutPress={signOut}
                        />
                    </View>

                    {/* Notifications Section */}
                    <View className="mb-6">
                        <Text className="text-shadow-blue-grey text-sm font-bold uppercase mb-3 ml-1">{t('common.settings.general')}</Text>
                        <GlassCard>
                            <View className="flex-row justify-between items-center py-2">
                                <View className="flex-row items-center gap-4">
                                    <View className="w-10 h-10 rounded-full bg-neon-blue/20 justify-center items-center">
                                        <Bell color={colors.accent.secondary} size={isTablet ? 24 : 20} />
                                    </View>
                                    <View>
                                        <Text
                                            className="text-white text-lg font-bold"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.2}
                                        >
                                            {t('common.settings.notifications.title')}
                                        </Text>
                                        <Text
                                            className="text-shadow-blue-grey text-xs"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.3}
                                        >
                                            {t('common.settings.notifications.subtitle')}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={toggleNotifications}
                                    trackColor={{ false: colors.background.surface, true: colors.accent.tertiary }}
                                    thumbColor={notificationsEnabled ? colors.text.primary : colors.text.secondary}
                                />
                            </View>

                            {/* Divider */}
                            <View className="h-[1px] bg-white/10 my-2" />

                            {/* Language Selector */}
                            <TouchableOpacity
                                onPress={() => setShowLanguageOptions(!showLanguageOptions)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between items-center py-2">
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-10 h-10 rounded-full bg-neon-purple/20 justify-center items-center">
                                            <Globe color={colors.accent.quaternary} size={isTablet ? 24 : 20} />
                                        </View>
                                        <View>
                                            <Text
                                                className="text-white text-lg font-bold"
                                                allowFontScaling
                                                maxFontSizeMultiplier={1.2}
                                            >
                                                {t('common.language')}
                                            </Text>
                                            <Text
                                                className="text-shadow-blue-grey text-xs"
                                                allowFontScaling
                                                maxFontSizeMultiplier={1.3}
                                            >
                                                {language === 'en' ? t('common.english') : t('common.turkish')}
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight
                                        color={colors.text.secondary}
                                        size={20}
                                        style={{ transform: [{ rotate: showLanguageOptions ? '90deg' : '0deg' }] }}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Language Options (Expandable) */}
                            {showLanguageOptions && (
                                <View className="mt-2 pl-14">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setLanguage('en');
                                            setShowLanguageOptions(false);
                                        }}
                                        className="py-3 flex-row justify-between items-center border-b border-white/5"
                                    >
                                        <Text className={language === 'en' ? "text-neon-blue font-bold" : "text-gray-400"}>
                                            {t('common.english')}
                                        </Text>
                                        {language === 'en' && <Check size={16} color={colors.accent.secondary} />}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setLanguage('tr');
                                            setShowLanguageOptions(false);
                                        }}
                                        className="py-3 flex-row justify-between items-center"
                                    >
                                        <Text className={language === 'tr' ? "text-neon-blue font-bold" : "text-gray-400"}>
                                            {t('common.turkish')}
                                        </Text>
                                        {language === 'tr' && <Check size={16} color={colors.accent.secondary} />}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </GlassCard>
                    </View>

                    {/* Currency Section */}
                    <View className="mb-6">
                        <Text className="text-shadow-blue-grey text-sm font-bold uppercase mb-3 ml-1">{t('common.settings.preferences')}</Text>
                        <GlassCard>
                            <View className="mb-4">
                                <View className="flex-row items-center gap-4 mb-4">
                                    <View className="w-10 h-10 rounded-full bg-neon-green/20 justify-center items-center">
                                        <DollarSign color={colors.accent.tertiary} size={isTablet ? 24 : 20} />
                                    </View>
                                    <View>
                                        <Text
                                            className="text-white text-lg font-bold"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.2}
                                        >
                                            {t('common.settings.currency.title')}
                                        </Text>
                                        <Text
                                            className="text-shadow-blue-grey text-xs"
                                            allowFontScaling
                                            maxFontSizeMultiplier={1.3}
                                        >
                                            {t('common.settings.currency.subtitle')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ height: currencyListHeight }}>
                                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                                        <View className="gap-2 pb-2">
                                            {currencies.map((curr) => (
                                                <TouchableOpacity
                                                    key={curr.code}
                                                    onPress={() => setCurrency({ code: curr.code, symbol: curr.symbol })}
                                                    activeOpacity={0.7}
                                                >
                                                    <View
                                                        className={`flex-row justify-between items-center p-3 rounded-xl border ${currency.code === curr.code
                                                            ? 'bg-white/10 border-neon-green/50'
                                                            : 'bg-transparent border-white/5'
                                                            }`}
                                                    >
                                                        <View className="flex-row items-center gap-3">
                                                            <Text className="text-white text-lg font-bold w-8 text-center">{curr.symbol}</Text>
                                                            <Text className={`text-base font-medium ${currency.code === curr.code ? 'text-white' : 'text-gray-400'}`}>
                                                                {t(`currencies.${curr.code}`)}
                                                            </Text>
                                                        </View>
                                                        {currency.code === curr.code && (
                                                            <View className="w-3 h-3 rounded-full bg-neon-green" />
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        </GlassCard>
                    </View>

                    {/* Debug Section */}
                    {/* <View className="mb-6">
                        <Text className="text-shadow-blue-grey text-sm font-bold uppercase mb-3 ml-1">{t('common.settings.debug')}</Text>
                        <GlassCard>
                            <TouchableOpacity
                                onPress={() => router.push('/onboarding')}
                                className="flex-row justify-between items-center py-2"
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className="w-10 h-10 rounded-full bg-neon-pink/20 justify-center items-center">
                                        <Text className="text-neon-pink text-lg">🚀</Text>
                                    </View>
                                    <View>
                                        <Text className="text-white text-lg font-bold">
                                            {t('common.settings.onboarding.title')}
                                        </Text>
                                        <Text className="text-shadow-blue-grey text-xs">
                                            {t('common.settings.onboarding.subtitle')}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity> */}

                            {/* Divider */}
                            {/* <View className="h-[1px] bg-white/10 my-2" /> */}

                            {/* Pro Testing Toggle */}
                            {/* <TouchableOpacity
                                onPress={toggleProForTesting}
                                className="flex-row justify-between items-center py-2"
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className="w-10 h-10 rounded-full bg-neon-purple/20 justify-center items-center">
                                        <Text className="text-neon-purple text-lg">✨</Text>
                                    </View>
                                    <View>
                                        <Text className="text-white text-lg font-bold">
                                            Toggle Pro (Testing)
                                        </Text>
                                        <Text className="text-shadow-blue-grey text-xs">
                                            Status: {isPro ? '🟢 Pro Active' : '🔴 Free'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </GlassCard>
                    </View> */}


                </ScrollView>
            </View >
        </SafeAreaView >
    );
}
