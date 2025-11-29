import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check, Star, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { Squircle } from './ui/Squircle';
import { GlassCard } from './ui/GlassCard';
import { useResponsive, useResponsiveValue } from '../hooks/useResponsive';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<Props> = ({ visible, onClose }) => {
  const { currentOffering, purchasePackage, restorePurchases, isLoading, isPro } = useRevenueCat();
  const { isTablet, width } = useResponsive();

  // Responsive icon size
  const heroIconSize = useResponsiveValue({
    sm: 72,
    md: 80,
    lg: 100,
    xl: 120,
    default: 80,
  });

  // Responsive padding
  const horizontalPadding = useResponsiveValue({
    sm: 20,
    md: 24,
    lg: 40,
    xl: 60,
    default: 24,
  });

  // Close automatically if user becomes pro while modal is open
  React.useEffect(() => {
    if (isPro) {
      onClose();
    }
  }, [isPro]);

  const handlePurchase = async (pkg: any) => {
    const success = await purchasePackage(pkg);
    if (success) {
      onClose();
    }
  };

  if (!currentOffering) {
    return null; // Or a loading state
  }

  const features = [
    "Unlimited Subscriptions",
    "Advanced Analytics & Charts",
    "Cloud Sync & Backup",
    "Custom App Icons & Themes",
    "Support Indie Development"
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingTop: isTablet ? 48 : 48, paddingHorizontal: horizontalPadding, paddingBottom: 32 }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <View />
                <TouchableOpacity 
                    onPress={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 justify-center items-center"
                >
                    <X color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Icon */}
                <View className="items-center mb-8">
                    <Squircle 
                        width={heroIconSize} 
                        height={heroIconSize} 
                        cornerRadius={heroIconSize * 0.3} 
                        backgroundColor={colors.accent.primary}
                        showBorder
                        borderColor={colors.border.highlight}
                    >
                        <View className="flex-1 justify-center items-center">
                            <Star color="#fff" size={heroIconSize * 0.5} fill="#fff" />
                        </View>
                    </Squircle>
                    <Text 
                        className="text-white text-3xl mt-6 text-center"
                        style={{ fontFamily: typography.fontFamily.display }}
                        allowFontScaling
                        maxFontSizeMultiplier={1.2}
                    >
                        Unlock <Text style={{ color: colors.accent.primary, fontFamily: typography.fontFamily.display }}>Pro</Text>
                    </Text>
                    <Text 
                        className="text-gray-400 text-center mt-2 text-lg"
                        allowFontScaling
                        maxFontSizeMultiplier={1.3}
                    >
                        Take control of your financial life.
                    </Text>
                </View>

                {/* Features */}
                <View className="gap-4 mb-10">
                    {features.map((feature, index) => (
                        <View key={index} className="flex-row items-center">
                            <View className="bg-neon-green/20 p-1 rounded-full mr-3">
                                <Check size={16} color={colors.accent.secondary} />
                            </View>
                            <Text className="text-white text-lg font-medium">{feature}</Text>
                        </View>
                    ))}
                </View>

                {/* Packages */}
                <View className="gap-4 mb-6">
                    {currentOffering.availablePackages.map((pkg) => {
                        const isAnnual = pkg.packageType === 'ANNUAL';
                        return (
                            <TouchableOpacity 
                                key={pkg.identifier}
                                onPress={() => handlePurchase(pkg)}
                                activeOpacity={0.8}
                            >
                                <GlassCard 
                                    variant={isAnnual ? 'highlight' : 'default'}
                                    style={{ 
                                        padding: spacing.lg,
                                        borderColor: isAnnual ? colors.accent.primary : colors.border.subtle,
                                        borderWidth: isAnnual ? 2 : 1
                                    }}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <View>
                                            <Text className="text-white font-bold text-xl">
                                                {pkg.product.title.split(' ')[0]} {/* Usually "Monthly" or "Annual" */}
                                            </Text>
                                            {isAnnual && (
                                                <Text className="text-neon-blue text-xs font-bold uppercase mt-1">
                                                    Best Value
                                                </Text>
                                            )}
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-white font-bold text-2xl">
                                                {pkg.product.priceString}
                                            </Text>
                                            <Text className="text-gray-400 text-xs">
                                                {isAnnual ? '/year' : '/month'}
                                            </Text>
                                        </View>
                                    </View>
                                </GlassCard>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Restore & Legal */}
                <TouchableOpacity onPress={restorePurchases} className="items-center py-4">
                    <Text className="text-gray-400 font-medium">Restore Purchases</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center gap-6 mt-2">
                    <Text className="text-gray-500 text-xs">Terms of Service</Text>
                    <Text className="text-gray-500 text-xs">Privacy Policy</Text>
                </View>

            </ScrollView>

            {isLoading && (
                <View className="absolute inset-0 justify-center items-center bg-black/50">
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};
