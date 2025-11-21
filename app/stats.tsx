import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { Music, ShoppingBag, MonitorPlay, Briefcase, Zap } from 'lucide-react-native';
import { useSubStore } from '../store/useSubStore';
import { GlassCard } from '../components/ui/GlassCard';
import { getCurrency } from '../utils/currency';

const CategoryCard = ({ title, count, icon: Icon, color, height = 200, category, selectedCategory, onSelect }: any) => {
    const subscriptions = useSubStore((state) => state.subscriptions);
    const [flipAnim] = React.useState(new Animated.Value(0));
    const isFlipped = selectedCategory === title;

    React.useEffect(() => {
      Animated.spring(flipAnim, {
        toValue: isFlipped ? 180 : 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }, [isFlipped]);

    const flipToFrontStyle = {
      transform: [
        { rotateY: flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }) }
      ],
    };

    const flipToBackStyle = {
      transform: [
        { rotateY: flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] }) }
      ],
    };

    const subs = React.useMemo(() => {
      if (!category) return [];
      return subscriptions.filter(s => s.category === category);
    }, [category, subscriptions]);

    return (
      <TouchableOpacity 
          onPress={() => onSelect(isFlipped ? null : title)}
          activeOpacity={0.8}
          style={{ width: '48%', marginBottom: 16, height }}
      >
          {/* Front of Card */}
          <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }, flipToFrontStyle]}>
              <GlassCard style={{ height: '100%' }}>
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                               <Icon color={color} size={20} />
                          </View>
                      </View>
                      <View>
                          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>{title}</Text>
                          <Text style={{ color: '#94A3B8', fontSize: 14 }}>{count} subs</Text>
                      </View>
                  </View>
              </GlassCard>
          </Animated.View>

          {/* Back of Card */}
          <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }, flipToBackStyle]}>
              <GlassCard style={{ height: '100%' }}>
                  <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
                          <Text style={{ color: '#94A3B8', fontSize: 12 }}>{subs.length}</Text>
                      </View>
                      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                          {subs.map((sub, idx) => (
                              <View 
                                  key={sub.id} 
                                  style={{ 
                                      flexDirection: 'row', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      backgroundColor: 'rgba(255,255,255,0.05)',
                                      padding: 8,
                                      borderRadius: 12,
                                      marginBottom: 6,
                                      borderWidth: 1,
                                      borderColor: 'rgba(255,255,255,0.1)'
                                  }}
                              >
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                      <View style={{ width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: sub.color + '20' }}>
                                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: sub.color }}>{sub.name[0]}</Text>
                                      </View>
                                      <View style={{ flex: 1 }}>
                                          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }} numberOfLines={1}>{sub.name}</Text>
                                          <Text style={{ color: '#94A3B8', fontSize: 10 }}>{sub.cycle}</Text>
                                      </View>
                                  </View>
                                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>{sub.currency}{sub.price.toFixed(2)}</Text>
                              </View>
                          ))}
                          {subs.length === 0 && (
                              <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20, fontSize: 12 }}>No subscriptions</Text>
                          )}
                      </ScrollView>
                  </View>
              </GlassCard>
          </Animated.View>
      </TouchableOpacity>
    );
  };

export default function Stats() {
  const screenWidth = Dimensions.get('window').width;
  const subscriptions = useSubStore((state) => state.subscriptions);
  const totalMonthlyCost = useSubStore((state) => state.totalMonthlyCost);
  const currency = useSubStore((state) => state.currency);

  // State for selected category popup
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Calculate category counts
  const getCategoryCount = (cat: string) => subscriptions.filter(s => s.category === cat).length;

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
        
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
                            {currency.symbol}{totalMonthlyCost().toFixed(2)}
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
                                        {currency.symbol}{cat.value.toFixed(2)}
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
                color="#B5DEFF"
                height={165}
                category="Entertainment"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Music" 
                count={getCategoryCount('Music')} 
                icon={Music} 
                color="#E7B5FF"
                height={165}
                category="Music"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Shopping" 
                count={getCategoryCount('Shopping')} 
                icon={ShoppingBag} 
                color="#B5FFCD"
                height={160}
                category="Shopping"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Work" 
                count={getCategoryCount('Productivity')} 
                icon={Briefcase} 
                color="#FFB5E8"
                height={165}
                category="Productivity"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Utilities" 
                count={getCategoryCount('Utilities')} 
                icon={Zap} 
                color="#FFFFFF"
                height={160}
                category="Utilities"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Other" 
                count={getCategoryCount('Other')} 
                icon={Zap} 
                color="#FEF3C7"
                height={160}
                category="Other"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
