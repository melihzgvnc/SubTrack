import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSubStore } from '../store/useSubStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp } from 'lucide-react-native';
import { format } from 'date-fns';

export default function Dashboard() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);
  const router = useRouter();

  const activeCount = subscriptions.length;
  const yearlyCount = subscriptions.filter(s => s.cycle === 'yearly').length;
  const monthlyCount = subscriptions.filter(s => s.cycle === 'monthly').length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8 mt-2">
            <View>
                <Text className="text-text-secondary text-lg">Welcome back,</Text>
                <Text className="text-text-primary text-2xl font-bold">My Subscriptions</Text>
            </View>
            <TouchableOpacity 
                onPress={() => router.push('/add')}
                className="w-12 h-12 rounded-full bg-accent-mint justify-center items-center"
            >
                <Plus color="black" size={24} />
            </TouchableOpacity>
        </View>

        {/* Hero / Total Spend Section */}
        <View className="items-center mb-8 py-8 bg-card rounded-4xl border border-card-lighter">
            <Text className="text-text-secondary mb-2 uppercase tracking-widest text-xs font-bold">Total Monthly Spend</Text>
            <Text className="text-text-primary text-6xl font-light mb-2">
                ${totalMonthlyCost().toFixed(2)}
            </Text>
            <Text className="text-text-secondary text-sm">
                across {activeCount} active services
            </Text>
        </View>

        {/* Summary Grid */}
        <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-card-lighter p-5 rounded-3xl">
                <View className="w-10 h-10 rounded-full bg-accent-blue/20 justify-center items-center mb-4">
                    <Calendar color="#BAE6FD" size={20} />
                </View>
                <Text className="text-text-secondary text-xs uppercase font-bold mb-1">Monthly</Text>
                <Text className="text-text-primary text-2xl font-bold">{monthlyCount}</Text>
            </View>
            <View className="flex-1 bg-card-lighter p-5 rounded-3xl">
                <View className="w-10 h-10 rounded-full bg-accent-peach/20 justify-center items-center mb-4">
                    <TrendingUp color="#FDBA74" size={20} />
                </View>
                <Text className="text-text-secondary text-xs uppercase font-bold mb-1">Yearly</Text>
                <Text className="text-text-primary text-2xl font-bold">{yearlyCount}</Text>
            </View>
        </View>

        {/* Subscription List */}
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text-primary text-xl font-bold">Your Subscriptions</Text>
            <Text className="text-text-secondary text-sm">{activeCount} Active</Text>
        </View>

        <View className="gap-3 pb-24">
            {subscriptions.map((sub) => (
                <TouchableOpacity 
                    key={sub.id} 
                    onPress={() => router.push(`/subscription/${sub.id}`)}
                    className="flex-row items-center bg-card p-4 rounded-3xl border border-card-lighter"
                >
                    <View 
                        className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                        style={{ backgroundColor: sub.color || '#333' }}
                    >
                        <Text className="text-white font-bold text-lg">{sub.name.charAt(0)}</Text>
                    </View>
                    
                    <View className="flex-1">
                        <Text className="text-text-primary font-bold text-lg">{sub.name}</Text>
                        <Text className="text-text-secondary text-xs">
                            {sub.category} • {sub.cycle}
                        </Text>
                    </View>

                    <View className="items-end">
                        <Text className="text-text-primary font-bold text-lg">
                            ${sub.price}
                        </Text>
                        <Text className="text-text-secondary text-xs">
                            /{sub.cycle === 'monthly' ? 'mo' : 'yr'}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
