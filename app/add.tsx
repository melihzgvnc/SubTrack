import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubStore, Cycle } from '../store/useSubStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-2">
        
        {/* Header */}
        <View className="flex-row items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="w-10 h-10 rounded-full border border-card-lighter justify-center items-center mr-4"
            >
                <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-text-primary text-2xl font-bold">New Subscription</Text>
        </View>
        
        <View className="space-y-6">
            {/* Name Input */}
            <View>
                <Text className="text-text-secondary mb-3 ml-1 font-medium">Service Name</Text>
                <TextInput
                    className="bg-card text-text-primary p-5 rounded-3xl text-lg border border-card-lighter"
                    placeholder="e.g. Netflix"
                    placeholderTextColor="#52525B"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />
            </View>

            {/* Price Input */}
            <View>
                <Text className="text-text-secondary mb-3 ml-1 font-medium">Price</Text>
                <View className="flex-row items-center bg-card rounded-3xl border border-card-lighter px-5">
                    <Text className="text-text-secondary text-lg mr-2">$</Text>
                    <TextInput
                        className="flex-1 text-text-primary py-5 text-lg"
                        placeholder="0.00"
                        placeholderTextColor="#52525B"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>
            </View>

            {/* Billing Cycle */}
            <View>
                <Text className="text-text-secondary mb-3 ml-1 font-medium">Billing Cycle</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity 
                        className={`flex-1 p-5 rounded-3xl border ${cycle === 'monthly' ? 'bg-accent-mint border-accent-mint' : 'bg-card border-card-lighter'}`}
                        onPress={() => setCycle('monthly')}
                    >
                        <Text className={`text-center font-bold text-lg ${cycle === 'monthly' ? 'text-black' : 'text-text-secondary'}`}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className={`flex-1 p-5 rounded-3xl border ${cycle === 'yearly' ? 'bg-accent-peach border-accent-peach' : 'bg-card border-card-lighter'}`}
                        onPress={() => setCycle('yearly')}
                    >
                        <Text className={`text-center font-bold text-lg ${cycle === 'yearly' ? 'text-black' : 'text-text-secondary'}`}>Yearly</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category */}
            <View>
                <Text className="text-text-secondary mb-3 ml-1 font-medium">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                    {['Other', 'Entertainment', 'Music', 'Productivity', 'Utilities', 'Shopping'].map((cat) => (
                        <TouchableOpacity 
                            key={cat}
                            className={`px-6 py-3 rounded-full border ${category === cat ? 'bg-white border-white' : 'bg-card border-card-lighter'}`}
                            onPress={() => setCategory(cat as any)}
                        >
                            <Text className={`font-medium ${category === cat ? 'text-black' : 'text-text-secondary'}`}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>

        <TouchableOpacity 
            className="mt-10 bg-accent-blue p-5 rounded-3xl shadow-lg"
            onPress={handleSave}
        >
            <Text className="text-black text-center font-bold text-xl">Save Subscription</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
