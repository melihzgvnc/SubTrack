import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { Music, ShoppingBag, MonitorPlay, Briefcase, Zap } from 'lucide-react-native';
import { useSubStore } from '../store/useSubStore';
import { GlassCard } from '../components/ui/GlassCard';

export default function Stats() {
  const screenWidth = Dimensions.get('window').width;
  const subscriptions = useSubStore((state) => state.subscriptions);
  const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);

  // State for selected bar
  const [selectedBarIndex, setSelectedBarIndex] = React.useState<number | null>(null);

  // Calculate Projected Spending for next 6 months
  const getProjections = () => {
    const today = new Date();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 6; i++) {
      const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthIndex = currentMonthDate.getMonth();
      
      let monthlyTotal = 0;

      subscriptions.forEach(sub => {
        if (sub.cycle === 'monthly') {
          monthlyTotal += sub.price;
        } else if (sub.cycle === 'yearly') {
          const subDate = new Date(sub.startDate);
          if (subDate.getMonth() === monthIndex) {
             monthlyTotal += sub.price;
          }
        }
      });

      months.push({
        value: monthlyTotal,
        label: monthNames[monthIndex],
        frontColor: '#B5FFCD', // Neon Green
        topLabelComponent: () => (
            <Text className="text-shadow-blue-grey text-[10px] mb-1">{monthlyTotal > 0 ? Math.round(monthlyTotal) : ''}</Text>
        ),
      });
    }
    return months;
  };

  const projectionData = React.useMemo(() => {
      const data = getProjections();
      if (selectedBarIndex !== null && data[selectedBarIndex]) {
          data[selectedBarIndex].frontColor = '#FFB5E8'; // Neon Pink Highlight
      }
      return data;
  }, [subscriptions, selectedBarIndex]);

  // State for selected category popup
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Calculate category counts
  const getCategoryCount = (cat: string) => subscriptions.filter(s => s.category === cat).length;
  
  // Get subscriptions for the selected category
  const getCategorySubs = () => {
      if (!selectedCategory) return [];
      let targetCat = selectedCategory;
      if (selectedCategory === 'Media') targetCat = 'Entertainment';
      if (selectedCategory === 'Work') targetCat = 'Productivity';
      
      return subscriptions.filter(s => s.category === targetCat);
  };

  const CategoryCard = ({ title, count, icon: Icon, color, height = 200, onPress }: any) => (
    <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        style={{ width: '48%', marginBottom: 16, height }}
    >
        <GlassCard style={{ height: '100%', padding: 0 }}>
            <View className="flex-1 p-5 justify-between">
                <View className="items-end">
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                         <Icon color={color} size={20} />
                    </View>
                </View>
                <View>
                    <Text className="text-white text-2xl font-bold mb-1">{title}</Text>
                    <Text className="text-shadow-blue-grey font-medium">{count} subs</Text>
                </View>
            </View>
        </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
            <Text className="text-white text-3xl font-bold">Insights</Text>
        </View>

        {/* Chart Section - Spending by Category */}
        <GlassCard style={{ marginBottom: 32 }}>
            <View className="w-full mb-6">
                <View className="flex-row justify-between items-start mb-2">
                    <View>
                        <Text className="text-shadow-blue-grey mb-1 font-medium">Total Spending</Text>
                        <Text className="text-white text-4xl font-light tracking-tighter">
                            ${totalMonthlyCost().toFixed(2)}
                        </Text>
                    </View>
                    {(() => {
                        // Calculate this month's spending
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        
                        // Calculate last month
                        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                        
                        let thisMonthSpending = 0;
                        let lastMonthSpending = 0;
                        
                        subscriptions.forEach(sub => {
                            const subDate = new Date(sub.startDate);
                            const monthlyPrice = sub.cycle === 'monthly' ? sub.price : sub.price / 12;
                            
                            // Check if subscription was active this month
                            if (subDate <= today) {
                                thisMonthSpending += monthlyPrice;
                            }
                            
                            // Check if subscription was active last month
                            const lastMonthDate = new Date(lastMonthYear, lastMonth, 1);
                            if (subDate <= lastMonthDate) {
                                lastMonthSpending += monthlyPrice;
                            }
                        });
                        
                        // Calculate percentage change
                        let percentChange = 0;
                        let changeText = '';
                        let isIncrease = false;
                        
                        if (lastMonthSpending > 0) {
                            percentChange = ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100;
                            isIncrease = percentChange > 0;
                            changeText = `${isIncrease ? '+' : ''}${percentChange.toFixed(1)}%`;
                        } else if (thisMonthSpending > 0) {
                            changeText = 'New';
                            isIncrease = true;
                        }
                        
                        if (!changeText) return null;
                        
                        return (
                            <View className={`px-3 py-1 rounded-full ${isIncrease ? 'bg-red-500/20' : 'bg-neon-green/20'}`}>
                                <Text className={`text-xs font-medium ${isIncrease ? 'text-red-400' : 'text-neon-green'}`}>
                                    This Month {changeText}
                                </Text>
                            </View>
                        );
                    })()}
                </View>
            </View>
            
            {/* Category Spending Bars */}
            {subscriptions.length === 0 ? (
                <View className="w-full py-12">
                    <Text className="text-shadow-blue-grey text-center">No subscriptions</Text>
                </View>
            ) : (
                <View className="w-full flex-row justify-center items-end" style={{ height: 160, gap: 16 }}>
                    {(() => {
                        // Get category color mapping
                        const categoryColors: Record<string, string> = {
                            'Entertainment': '#B5DEFF',
                            'Productivity': '#FFB5E8',
                            'Utilities': '#B5FFCD',
                            'Music': '#E7B5FF',
                            'Shopping': '#FFB5E8',
                            'Other': '#FEF3C7',
                        };

                        // Get category short names
                        const categoryShortNames: Record<string, string> = {
                            'Entertainment': 'Ent.',
                            'Productivity': 'Prod.',
                            'Utilities': 'Cloud',
                            'Music': 'Music',
                            'Shopping': 'Shop',
                            'Other': 'Other',
                        };

                        // Calculate spending per category (only for categories with subscriptions)
                        const categorySpending = subscriptions.reduce((acc, sub) => {
                            const monthlyPrice = sub.cycle === 'monthly' ? sub.price : sub.price / 12;
                            if (!acc[sub.category]) {
                                acc[sub.category] = 0;
                            }
                            acc[sub.category] += monthlyPrice;
                            return acc;
                        }, {} as Record<string, number>);

                        // Convert to array and sort by value (descending)
                        const categoryData = Object.entries(categorySpending)
                            .map(([category, value]) => ({
                                name: categoryShortNames[category] || category,
                                category,
                                color: categoryColors[category] || '#94A3B8',
                                value,
                            }))
                            .sort((a, b) => b.value - a.value);

                        const maxValue = Math.max(...categoryData.map(c => c.value), 1);

                        return categoryData.map((cat, index) => {
                            const heightPercentage = (cat.value / maxValue) * 100;
                            const barHeight = Math.max((heightPercentage / 100) * 140, 40); // Min height 40

                            return (
                                <View key={index} className="items-center">
                                    <Text className="text-shadow-blue-grey text-[10px] mb-1 font-medium">
                                        ${cat.value.toFixed(2)}
                                    </Text>
                                    <View 
                                        style={{ 
                                            width: 48,
                                            height: barHeight,
                                            backgroundColor: cat.color,
                                            borderRadius: 24,
                                            marginBottom: 8,
                                        }}
                                    />
                                    <Text className="text-shadow-blue-grey text-xs font-medium">
                                        {cat.name}
                                    </Text>
                                </View>
                            );
                        });
                    })()}
                </View>
            )}
        </GlassCard>

        {/* Categories Header */}
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Categories</Text>
        </View>

        {/* Category Grid */}
        <View className="flex-row flex-wrap justify-between pb-24">
             <CategoryCard 
                title="Media" 
                count={getCategoryCount('Entertainment')} 
                icon={MonitorPlay} 
                color="#B5DEFF" // Neon Blue
                height={200}
                onPress={() => setSelectedCategory('Media')}
             />
             <CategoryCard 
                title="Music" 
                count={getCategoryCount('Music')} 
                icon={Music} 
                color="#E7B5FF" // Neon Purple
                height={160}
                onPress={() => setSelectedCategory('Music')}
             />
             <CategoryCard 
                title="Shopping" 
                count={getCategoryCount('Shopping')} 
                icon={ShoppingBag} 
                color="#B5FFCD" // Neon Green
                height={160}
                onPress={() => setSelectedCategory('Shopping')}
             />
             <CategoryCard 
                title="Work" 
                count={getCategoryCount('Productivity')} 
                icon={Briefcase} 
                color="#FFB5E8" // Neon Pink
                height={200}
                onPress={() => setSelectedCategory('Work')}
             />
             <CategoryCard 
                title="Utilities" 
                count={getCategoryCount('Utilities')} 
                icon={Zap} 
                color="#FFFFFF" 
                height={160}
                onPress={() => setSelectedCategory('Utilities')}
             />
             <CategoryCard 
                title="Other" 
                count={getCategoryCount('Other')} 
                icon={Zap} 
                color="#FEF3C7" 
                height={160}
                onPress={() => setSelectedCategory('Other')}
             />
        </View>

      </ScrollView>

      {/* Category Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedCategory !== null}
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View className="flex-1 justify-end bg-black/80">
            <View className="h-[60%]">
                <GlassCard style={{ height: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-bold">{selectedCategory} Subscriptions</Text>
                        <TouchableOpacity 
                            onPress={() => setSelectedCategory(null)}
                            className="w-8 h-8 bg-surface-highlight rounded-full justify-center items-center"
                        >
                            <Text className="text-white font-bold">X</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {getCategorySubs().length > 0 ? (
                            getCategorySubs().map(sub => (
                                <View key={sub.id} className="flex-row justify-between items-center bg-surface p-4 rounded-2xl mb-3 border border-white/10">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: sub.color + '20' }}>
                                            <Text className="text-lg font-bold" style={{ color: sub.color }}>{sub.name[0]}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-white font-bold text-lg">{sub.name}</Text>
                                            <Text className="text-shadow-blue-grey text-sm capitalize">{sub.cycle}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-white font-bold text-lg">
                                        {sub.currency}{sub.price}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text className="text-shadow-blue-grey text-center mt-10">No subscriptions in this category.</Text>
                        )}
                    </ScrollView>
                </GlassCard>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
