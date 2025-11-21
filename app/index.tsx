import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSubStore } from '../store/useSubStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp, CreditCard, Settings } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { Squircle } from '../components/ui/Squircle';
import { format, addMonths, addYears, parseISO, differenceInDays } from 'date-fns';
import { getCurrency } from '../utils/currency';

export default function Dashboard() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);
  const currency = useSubStore((state) => state.currency);
  const router = useRouter();

  const activeCount = subscriptions.length;
  const yearlyCount = subscriptions.filter(s => s.cycle === 'yearly').length;
  const monthlyCount = subscriptions.filter(s => s.cycle === 'monthly').length;

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
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
            <View>
                <Text className="text-shadow-blue-grey text-lg font-medium opacity-80">Welcome back,</Text>
                <Text className="text-white text-3xl font-bold tracking-tight">My Subscriptions</Text>
            </View>
            <TouchableOpacity 
                onPress={() => router.push('/settings')}
                className="w-10 h-10 rounded-full bg-white/10 justify-center items-center"
            >
                <Settings color="#FFF" size={20} />
            </TouchableOpacity>
        </View>

        {/* Bento Grid Layout */}
        <View className="gap-4 mb-8">
            {/* Hero: Total Spend */}
            <GlassCard variant="highlight" style={{ minHeight: 180 }}>
                <View className="flex-1 justify-between">
                    <View className="flex-row justify-between items-start">
                        <View className="bg-surface-highlight p-2 rounded-full">
                             <CreditCard color="#B5DEFF" size={24} />
                        </View>
                        <Text className="text-neon-blue font-bold tracking-widest uppercase text-xs">Total Monthly Spend</Text>
                    </View>
                    
                    <View>
                        <Text className="text-white text-6xl font-light tracking-tighter">
                            {currency.symbol}{totalMonthlyCost().toFixed(2)}
                        </Text>
                        <Text className="text-shadow-blue-grey text-sm font-medium mt-1">
                            across {activeCount} active services
                        </Text>
                    </View>
                </View>
            </GlassCard>

            {/* Stats Row */}
            <View className="flex-row">
                <View className="flex-1 mr-2">
                    <GlassCard style={{ minHeight: 80, padding: 12 }}>
                        <View className="flex-row items-center justify-between h-full">
                             <View className="bg-surface-highlight w-10 h-10 rounded-full justify-center items-center mr-3">
                                <Calendar color="#B5FFCD" size={20} />
                            </View>
                            <View className="items-end">
                                <Text className="text-white text-2xl font-bold">{monthlyCount}</Text>
                                <Text className="text-shadow-blue-grey text-[10px] uppercase font-bold mb-0.5">Monthly</Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>
                <View className="flex-1 ml-2">
                    <GlassCard style={{ minHeight: 80, padding: 12 }}>
                        <View className="flex-row items-center justify-between h-full">
                            <View className="bg-surface-highlight w-10 h-10 rounded-full justify-center items-center mr-3">
                                <TrendingUp color="#E7B5FF" size={20} />
                            </View>
                            <View className="items-end">
                                <Text className="text-white text-2xl font-bold">{yearlyCount}</Text>
                                <Text className="text-shadow-blue-grey text-[10px] uppercase font-bold mb-0.5">Yearly</Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>
            </View>
        </View>

        {/* Subscription List */}
        <View className="mb-4">
            <Text className="text-white text-xl font-bold mb-4">Your Subscriptions</Text>
            
            <View className="gap-3">
                {subscriptions.map((sub) => (
                    <TouchableOpacity 
                        key={sub.id} 
                        onPress={() => router.push(`/subscription/${sub.id}`)}
                        activeOpacity={0.7}
                    >
                        <GlassCard style={{ padding: 0 }}>
                             <View className="flex-row items-center p-1">
                                {/* Icon Container with Squircle */}
                                <View style={{ width: 56, height: 56, marginRight: 16 }}>
                                    <Squircle 
                                        width={56} 
                                        height={56} 
                                        cornerRadius={18} 
                                        backgroundColor={sub.color || '#333'}
                                        showBorder={true}
                                        borderColor="rgba(255,255,255,0.2)"
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
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
