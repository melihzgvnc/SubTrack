import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubStore, Cycle } from '../store/useSubStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { Squircle } from '../components/ui/Squircle';
import { Dropdown } from '../components/ui/Dropdown';
import { scheduleSubscriptionNotifications } from '../utils/notifications';
import { getCurrency } from '../utils/currency';
import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { adUnitIDs, shouldShowInterstitial } from '../utils/ads';
import { useEffect } from 'react';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function AddSubscription() {
  const router = useRouter();
  const addSubscription = useSubStore((state) => state.addSubscription);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [category, setCategory] = useState('Other');
  
  // Date state
  const today = new Date();
  const [day, setDay] = useState(today.getDate().toString());
  const [month, setMonth] = useState((today.getMonth() + 1).toString());
  const [year, setYear] = useState(today.getFullYear().toString());

  // Generate options
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());

  const currency = useSubStore((state) => state.currency);

  // AdMob Interstitial
  const { isLoaded, isClosed, load, show } = useInterstitialAd(adUnitIDs.interstitial!, {
    requestNonPersonalizedAdsOnly: true,
  });
  const [pendingNavigation, setPendingNavigation] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isClosed && pendingNavigation) {
      setPendingNavigation(false);
      router.back();
    }
  }, [isClosed, pendingNavigation]);

  const handleSave = () => {
    if (!name || !price) return;

    // Construct date
    const dateObj = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day)
    );

    const newSub = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      currency: currency.symbol,
      cycle,
      startDate: dateObj.toISOString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      category: category as any,
    };

    addSubscription(newSub);
    scheduleSubscriptionNotifications(newSub);

    if (shouldShowInterstitial() && isLoaded) {
      setPendingNavigation(true);
      show();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}>
        
        {/* Header */}
        <View className="flex-row items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-10 h-10 rounded-full bg-surface-highlight justify-center items-center mr-4"
            >
                <ArrowLeft color={colors.text.primary} size={20} />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">New Subscription</Text>
        </View>
        
        <View className="space-y-6">
            {/* Name Input */}
            <View>
                <View className="flex-row gap-4">
                    {/* Name Input */}
                    <View className="flex-[1.5]">
                        <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Service Name</Text>
                        <GlassCard style={{ padding: spacing.none }}>
                            <TextInput
                                className="text-white p-5 text-lg font-medium"
                                placeholder="e.g. Netflix"
                                placeholderTextColor={colors.text.muted}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                        </GlassCard>
                    </View>

                    {/* Price Input */}
                    <View className="flex-1">
                        <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Price</Text>
                        <GlassCard style={{ padding: spacing.none }}>
                            <View className="flex-row items-center px-4">
                                <Text className="text-white text-lg font-medium mr-1">{currency.symbol}</Text>
                                <TextInput
                                    className="flex-1 text-white py-5 text-lg font-medium"
                                    placeholder="0.00"
                                    placeholderTextColor={colors.text.muted}
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                        </GlassCard>
                    </View>
                </View>
                <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium mt-4">Billing Cycle</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity 
                        className="flex-1"
                        onPress={() => setCycle('monthly')}
                        activeOpacity={0.8}
                    >
                        <GlassCard 
                            variant={cycle === 'monthly' ? 'highlight' : 'default'}
                            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg }}
                        >
                            <Text className={`font-bold text-lg ${cycle === 'monthly' ? 'text-neon-blue' : 'text-shadow-blue-grey'}`}>Monthly</Text>
                        </GlassCard>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className="flex-1"
                        onPress={() => setCycle('yearly')}
                        activeOpacity={0.8}
                    >
                        <GlassCard 
                            variant={cycle === 'yearly' ? 'active' : 'default'}
                            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg }}
                        >
                            <Text className={`font-bold text-lg ${cycle === 'yearly' ? 'text-neon-pink' : 'text-shadow-blue-grey'}`}>Yearly</Text>
                        </GlassCard>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Start Date */}
            <View>
                <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Start Date</Text>
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Dropdown 
                            label="Day" 
                            value={day} 
                            options={days} 
                            onSelect={setDay} 
                        />
                    </View>
                    <View className="flex-1">
                        <Dropdown 
                            label="Month" 
                            value={month} 
                            options={months} 
                            onSelect={setMonth} 
                        />
                    </View>
                    <View className="flex-[1.5]">
                        <Dropdown 
                            label="Year" 
                            value={year} 
                            options={years} 
                            onSelect={setYear} 
                        />
                    </View>
                </View>
            </View>

            {/* Category */}
            <View>
                <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 pl-1">
                    {['Other', 'Entertainment', 'Music', 'Productivity', 'Utilities', 'Shopping'].map((cat) => (
                        <TouchableOpacity 
                            key={cat}
                            onPress={() => setCategory(cat as any)}
                            activeOpacity={0.8}
                        >
                            <View 
                                style={{ 
                                    paddingHorizontal: spacing.xl, 
                                    paddingVertical: spacing.sm, 
                                    borderRadius: spacing.xl, 
                                    backgroundColor: category === cat ? colors.text.primary : colors.border.subtle,
                                    borderWidth: 1,
                                    borderColor: category === cat ? colors.text.primary : colors.border.highlight
                                }}
                            >
                                <Text className={`font-medium ${category === cat ? 'text-black' : 'text-shadow-blue-grey'}`}>{cat}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>

        <TouchableOpacity 
            className="mt-7"
            onPress={handleSave}
            activeOpacity={0.8}
        >
            <Squircle 
                width={Dimensions.get('window').width - (spacing.md * 2)} 
                height={60} 
                cornerRadius={20} 
                backgroundColor={colors.accent.tertiary} 
                showBorder={true}
                borderColor="rgba(255,255,255,0.5)"
                style={{ alignItems: 'center', justifyContent: 'center' }}
            >
                <View className="w-full h-full items-center justify-center">
                    <Text className="text-black text-center font-bold text-xl tracking-widest">Save Subscription</Text>
                </View>
            </Squircle>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
