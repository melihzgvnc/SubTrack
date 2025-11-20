import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSubStore } from '../../store/useSubStore';
import { format, differenceInMonths, parseISO } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2 } from 'lucide-react-native';

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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-2">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-10 h-10 rounded-full border border-card-lighter justify-center items-center"
            >
                <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-text-secondary font-medium">Details</Text>
            <TouchableOpacity 
                onPress={handleDelete}
                className="w-10 h-10 rounded-full border border-red-900/30 bg-red-900/10 justify-center items-center"
            >
                <Trash2 color="#EF4444" size={20} />
            </TouchableOpacity>
        </View>

        {/* Main Card */}
        <View className="bg-card rounded-4xl p-8 items-center mb-6">
            <View 
                className="w-24 h-24 rounded-full justify-center items-center mb-6 shadow-lg"
                style={{ backgroundColor: color || '#333' }}
            >
                <Text className="text-white font-bold text-4xl">{name.charAt(0)}</Text>
            </View>
            <Text className="text-text-primary text-3xl font-bold mb-2">{name}</Text>
            <Text className="text-text-secondary text-lg capitalize">{cycle} Plan • {subscription.category}</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-4">
            <View className="flex-1 bg-accent-blue rounded-4xl p-6 h-40 justify-between">
                <Text className="text-black/60 font-bold uppercase text-xs">Monthly Cost</Text>
                <View>
                    <Text className="text-black text-3xl font-bold">{currency}{price}</Text>
                    <Text className="text-black/60 text-xs">per {cycle === 'monthly' ? 'month' : 'year'}</Text>
                </View>
            </View>
            <View className="flex-1 bg-accent-mint rounded-4xl p-6 h-40 justify-between">
                <Text className="text-black/60 font-bold uppercase text-xs">Total Spend</Text>
                <View>
                    <Text className="text-black text-3xl font-bold">{currency}{totalSpend.toFixed(2)}</Text>
                    <Text className="text-black/60 text-xs">lifetime</Text>
                </View>
            </View>
        </View>

        <View className="bg-card-lighter rounded-4xl p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-text-secondary">Status</Text>
                <View className="bg-green-900/30 px-3 py-1 rounded-full">
                    <Text className="text-green-400 text-xs font-bold uppercase">Active</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-text-secondary">Started On</Text>
                <Text className="text-text-primary font-medium">{format(start, 'MMM do, yyyy')}</Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
