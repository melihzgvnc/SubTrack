import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSubStore } from '../../store/useSubStore';
import { format, differenceInMonths, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { Squircle } from '../../components/ui/Squircle';

export default function SubscriptionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const subscription = useSubStore((state) => 
    state.subscriptions.find((s) => s.id === id)
  );
  const removeSubscription = useSubStore((state) => state.removeSubscription);

  if (!subscription) return null;

  const { name, price, currency, cycle, startDate, color } = subscription;
  const start = parseISO(startDate);
  const now = new Date();
  const monthsActive = differenceInMonths(now, start) + 1;
  
  let totalSpend = cycle === 'monthly' ? price * monthsActive : (price / 12) * monthsActive;

  const handleDelete = () => {
    removeSubscription(id as string);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-10 h-10 rounded-full bg-surface-highlight justify-center items-center"
            >
                <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-shadow-blue-grey font-medium">Details</Text>
            <TouchableOpacity 
                onPress={handleDelete}
                className="w-10 h-10 rounded-full bg-red-500/10 justify-center items-center"
            >
                <Trash2 color="#FFB5E8" size={20} />
            </TouchableOpacity>
        </View>

        {/* Main Card */}
        <GlassCard style={{ alignItems: 'center', paddingVertical: 32, marginBottom: 24 }}>
            <View style={{ width: 96, height: 96, marginBottom: 24 }}>
                <Squircle 
                    width={96} 
                    height={96} 
                    cornerRadius={32} 
                    backgroundColor={color || '#333'}
                    showBorder={true}
                    borderColor="rgba(255,255,255,0.3)"
                >
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-white font-bold text-4xl">{name.charAt(0)}</Text>
                    </View>
                </Squircle>
            </View>
            <Text className="text-white text-3xl font-bold mb-2">{name}</Text>
            <Text className="text-shadow-blue-grey text-lg capitalize">{cycle} Plan • {subscription.category}</Text>
        </GlassCard>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
                <GlassCard variant="highlight" style={{ height: 160, padding: 20, justifyContent: 'space-between' }}>
                    <Text className="text-neon-blue font-bold uppercase text-xs tracking-widest">Monthly Cost</Text>
                    <View>
                        <Text className="text-white text-3xl font-bold">{currency}{price}</Text>
                        <Text className="text-shadow-blue-grey text-xs">per {cycle === 'monthly' ? 'month' : 'year'}</Text>
                    </View>
                </GlassCard>
            </View>
            <View className="flex-1">
                <GlassCard variant="active" style={{ height: 160, padding: 20, justifyContent: 'space-between' }}>
                    <Text className="text-neon-pink font-bold uppercase text-xs tracking-widest">Total Spend</Text>
                    <View>
                        <Text className="text-white text-3xl font-bold">{currency}{totalSpend.toFixed(2)}</Text>
                        <Text className="text-shadow-blue-grey text-xs">lifetime</Text>
                    </View>
                </GlassCard>
            </View>
        </View>

        <GlassCard style={{ padding: 24, marginBottom: 24 }}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-shadow-blue-grey">Status</Text>
                <View className="bg-neon-green/20 px-3 py-1 rounded-full">
                    <Text className="text-neon-green text-xs font-bold uppercase">Active</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-shadow-blue-grey">Started On</Text>
                <Text className="text-white font-medium">{format(start, 'MMM do, yyyy')}</Text>
            </View>
        </GlassCard>

      </ScrollView>
    </SafeAreaView>
  );
}
