import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubStore, Cycle } from '../store/useSubStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { GlassCard } from '../components/ui/GlassCard';

export default function AddSubscription() {
  const router = useRouter();
  const addSubscription = useSubStore((state) => state.addSubscription);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [category, setCategory] = useState('Other');

  const handleSave = () => {
    if (!name || !price) return;

    addSubscription({
      id: Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      currency: '$',
      cycle,
      startDate: new Date().toISOString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      category: category as any,
    });

    router.back();
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View className="flex-row items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-10 h-10 rounded-full bg-surface-highlight justify-center items-center mr-4"
            >
                <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">New Subscription</Text>
        </View>
        
        <View className="space-y-6">
            {/* Name Input */}
            <View>
                <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Service Name</Text>
                <GlassCard style={{ padding: 0 }}>
                    <TextInput
                        className="text-white p-5 text-lg font-medium"
                        placeholder="e.g. Netflix"
                        placeholderTextColor="#64748B"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />
                </GlassCard>
            </View>

            {/* Price Input */}
            <View>
                <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Price</Text>
                <GlassCard style={{ padding: 0 }}>
                    <View className="flex-row items-center px-5">
                        <Text className="text-shadow-blue-grey text-lg mr-2">$</Text>
                        <TextInput
                            className="flex-1 text-white py-5 text-lg font-medium"
                            placeholder="0.00"
                            placeholderTextColor="#64748B"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                </GlassCard>
            </View>

            {/* Billing Cycle */}
            <View>
                <Text className="text-shadow-blue-grey mb-3 ml-1 font-medium">Billing Cycle</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity 
                        className="flex-1"
                        onPress={() => setCycle('monthly')}
                        activeOpacity={0.8}
                    >
                        <GlassCard 
                            variant={cycle === 'monthly' ? 'highlight' : 'default'}
                            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}
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
                            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}
                        >
                            <Text className={`font-bold text-lg ${cycle === 'yearly' ? 'text-neon-pink' : 'text-shadow-blue-grey'}`}>Yearly</Text>
                        </GlassCard>
                    </TouchableOpacity>
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
                                    paddingHorizontal: 24, 
                                    paddingVertical: 12, 
                                    borderRadius: 24, 
                                    backgroundColor: category === cat ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                                    borderWidth: 1,
                                    borderColor: category === cat ? '#FFFFFF' : 'rgba(255,255,255,0.1)'
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
            className="mt-10"
            onPress={handleSave}
            activeOpacity={0.8}
        >
            <GlassCard variant="highlight" style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text className="text-neon-blue text-center font-bold text-xl uppercase tracking-widest">Save Subscription</Text>
            </GlassCard>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
