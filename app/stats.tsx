import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { Music, ShoppingBag, MonitorPlay, Briefcase, Zap } from 'lucide-react-native';
import { useSubStore } from '../store/useSubStore';
import { GlassCard } from '../components/ui/GlassCard';
import { getCurrency } from '../utils/currency';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
          style={{ width: '48%', marginBottom: spacing.md, height }}
      >
          {/* Front of Card */}
          <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }, flipToFrontStyle]}>
              <GlassCard style={{ height: '100%' }}>
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border.highlight, justifyContent: 'center', alignItems: 'center' }}>
                               <Icon color={color} size={20} />
                          </View>
                      </View>
                      <View>
                          <Text style={{ color: colors.text.primary, fontSize: typography.size.xl, fontWeight: 'bold', marginBottom: spacing.xxs }}>{title}</Text>
                          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>{count} subs</Text>
                      </View>
                  </View>
              </GlassCard>
          </Animated.View>

          {/* Back of Card */}
          <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }, flipToBackStyle]}>
              <GlassCard style={{ height: '100%' }}>
                  <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                          <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: 'bold' }}>{title}</Text>
                          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>{subs.length}</Text>
                      </View>
                      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                          {subs.map((sub, idx) => (
                              <View 
                                  key={sub.id} 
                                  style={{ 
                                      flexDirection: 'row', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      backgroundColor: colors.border.subtle,
                                      padding: spacing.xs,
                                      borderRadius: spacing.sm,
                                      marginBottom: 6,
                                      borderWidth: 1,
                                      borderColor: colors.border.highlight
                                  }}
                              >
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
                                      <View style={{ width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: sub.color + '20' }}>
                                          <Text style={{ fontSize: typography.size.xs, fontWeight: 'bold', color: sub.color }}>{sub.name[0]}</Text>
                                      </View>
                                      <View style={{ flex: 1 }}>
                                          <Text style={{ color: colors.text.primary, fontSize: typography.size.xs, fontWeight: '600' }} numberOfLines={1}>{sub.name}</Text>
                                          <Text style={{ color: colors.text.secondary, fontSize: 10 }}>{sub.cycle}</Text>
                                      </View>
                                  </View>
                                  <Text style={{ color: colors.text.primary, fontSize: typography.size.xs, fontWeight: 'bold' }}>{sub.currency}{sub.price.toFixed(2)}</Text>
                              </View>
                          ))}
                          {subs.length === 0 && (
                              <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg, fontSize: typography.size.xs }}>No subscriptions</Text>
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
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.bottomScroll }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-2">
            <Text className="text-white text-3xl font-bold">Insights</Text>
        </View>

        {/* Chart Section - Spending by Category */}
        <GlassCard style={{ marginBottom: spacing.xxl }}>
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
                <View className="w-full flex-row justify-center items-end" style={{ height: 160, gap: spacing.md }}>
                    {(() => {
                        // Get category color mapping
                        const categoryColors: Record<string, string> = {
                            'Entertainment': colors.accent.secondary,
                            'Productivity': colors.accent.primary,
                            'Utilities': colors.accent.tertiary,
                            'Music': colors.accent.quaternary,
                            'Shopping': colors.accent.primary,
                            'Other': colors.accent.neutral,
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
                                color: categoryColors[category] || colors.text.secondary,
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
                                            marginBottom: spacing.xs,
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
                color={colors.accent.secondary}
                height={165}
                category="Entertainment"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Music" 
                count={getCategoryCount('Music')} 
                icon={Music} 
                color={colors.accent.quaternary}
                height={165}
                category="Music"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Shopping" 
                count={getCategoryCount('Shopping')} 
                icon={ShoppingBag} 
                color={colors.accent.tertiary}
                height={160}
                category="Shopping"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Work" 
                count={getCategoryCount('Productivity')} 
                icon={Briefcase} 
                color={colors.accent.primary}
                height={165}
                category="Productivity"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Utilities" 
                count={getCategoryCount('Utilities')} 
                icon={Zap} 
                color={colors.text.primary}
                height={160}
                category="Utilities"
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
             />
             <CategoryCard 
                title="Other" 
                count={getCategoryCount('Other')} 
                icon={Zap} 
                color={colors.accent.neutral}
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
