import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSubStore } from '../store/useSubStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp, CreditCard } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { Squircle } from '../components/ui/Squircle';

export default function Dashboard() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);
  const router = useRouter();

  const activeCount = subscriptions.length;
  const yearlyCount = subscriptions.filter(s => s.cycle === 'yearly').length;
  const monthlyCount = subscriptions.filter(s => s.cycle === 'monthly').length;

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
            <View>
                <Text className="text-shadow-blue-grey text-lg font-medium opacity-80">Welcome back,</Text>
                <Text className="text-white text-3xl font-bold tracking-tight">My Subscriptions</Text>
            </View>
            {/* Optional Header Action - maybe Profile or Search? Keeping it clean for now */}
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
                            ${totalMonthlyCost().toFixed(2)}
                        </Text>
                        <Text className="text-shadow-blue-grey text-sm font-medium mt-1">
                            across {activeCount} active services
                        </Text>
                    </View>
                </View>
            </GlassCard>

            {/* Stats Row */}
            <View className="flex-row gap-4">
                <View className="flex-1">
                    <GlassCard style={{ minHeight: 140 }}>
                        <View className="flex-1 justify-between">
                             <View className="bg-surface-highlight w-10 h-10 rounded-full justify-center items-center">
                                <Calendar color="#B5FFCD" size={20} />
                            </View>
                            <View>
                                <Text className="text-shadow-blue-grey text-xs uppercase font-bold mb-1">Monthly</Text>
                                <Text className="text-white text-3xl font-bold">{monthlyCount}</Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>
                <View className="flex-1">
                    <GlassCard style={{ minHeight: 140 }}>
                        <View className="flex-1 justify-between">
                            <View className="bg-surface-highlight w-10 h-10 rounded-full justify-center items-center">
                                <TrendingUp color="#E7B5FF" size={20} />
                            </View>
                            <View>
                                <Text className="text-shadow-blue-grey text-xs uppercase font-bold mb-1">Yearly</Text>
                                <Text className="text-white text-3xl font-bold">{yearlyCount}</Text>
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
                                    <Text className="text-shadow-blue-grey text-xs">
                                        {sub.category} • {sub.cycle}
                                    </Text>
                                </View>

                                <View className="items-end py-3 pr-4">
                                    <Text className="text-white font-bold text-lg">
                                        ${sub.price}
                                    </Text>
                                    <Text className="text-shadow-blue-grey text-xs">
                                        /{sub.cycle === 'monthly' ? 'mo' : 'yr'}
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
