import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, DollarSign } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';
import { useSubStore } from '../store/useSubStore';

import { currencies } from '../utils/currencies';

export default function Settings() {
  const router = useRouter();
  const { 
    notificationsEnabled, 
    toggleNotifications, 
    currency, 
    setCurrency 
  } = useSubStore();

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-2">
            <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/10 justify-center items-center mr-4"
            >
                <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-3xl font-bold">Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
            {/* Notifications Section */}
            <View className="mb-6">
                <Text className="text-shadow-blue-grey text-sm font-bold uppercase mb-3 ml-1">General</Text>
                <GlassCard>
                    <View className="flex-row justify-between items-center py-2">
                        <View className="flex-row items-center gap-4">
                            <View className="w-10 h-10 rounded-full bg-neon-blue/20 justify-center items-center">
                                <Bell color="#B5DEFF" size={20} />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-bold">Notifications</Text>
                                <Text className="text-shadow-blue-grey text-xs">Get reminders for upcoming bills</Text>
                            </View>
                        </View>
                        <Switch 
                            value={notificationsEnabled} 
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#334155', true: '#B5FFCD' }}
                            thumbColor={notificationsEnabled ? '#FFFFFF' : '#94A3B8'}
                        />
                    </View>
                </GlassCard>
            </View>

            {/* Currency Section */}
            <View className="mb-6">
                <Text className="text-shadow-blue-grey text-sm font-bold uppercase mb-3 ml-1">Preferences</Text>
                <GlassCard>
                    <View className="mb-4">
                        <View className="flex-row items-center gap-4 mb-4">
                            <View className="w-10 h-10 rounded-full bg-neon-green/20 justify-center items-center">
                                <DollarSign color="#B5FFCD" size={20} />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-bold">Currency</Text>
                                <Text className="text-shadow-blue-grey text-xs">Select your preferred currency</Text>
                            </View>
                        </View>
                        
                        <View className="h-64">
                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                                <View className="gap-2 pb-2">
                                    {currencies.map((curr) => (
                                        <TouchableOpacity 
                                            key={curr.code}
                                            onPress={() => setCurrency({ code: curr.code, symbol: curr.symbol })}
                                            activeOpacity={0.7}
                                        >
                                            <View 
                                                className={`flex-row justify-between items-center p-3 rounded-xl border ${
                                                    currency.code === curr.code 
                                                    ? 'bg-white/10 border-neon-green/50' 
                                                    : 'bg-transparent border-white/5'
                                                }`}
                                            >
                                                <View className="flex-row items-center gap-3">
                                                    <Text className="text-white text-lg font-bold w-8 text-center">{curr.symbol}</Text>
                                                    <Text className={`text-base font-medium ${currency.code === curr.code ? 'text-white' : 'text-gray-400'}`}>
                                                        {curr.name}
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
