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
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-shadow-blue-grey mb-1 font-medium">Total Monthly</Text>
                <Text className="text-white text-4xl font-light tracking-tighter">${totalMonthlyCost().toFixed(2)}</Text>
            </View>
        </View>

        {/* Chart Section */}
        <GlassCard style={{ marginBottom: 32 }}>
            <View className="w-full flex-row justify-between items-center mb-6">
                <Text className="text-white font-bold">Projected Spend</Text>
                {selectedBarIndex !== null && (
                    <View className="bg-surface-highlight px-3 py-1 rounded-full">
                        <Text className="text-neon-blue text-xs font-medium">
                            {projectionData[selectedBarIndex].label}: ${projectionData[selectedBarIndex].value.toFixed(2)}
                        </Text>
                    </View>
                )}
            </View>
            
            <BarChart
                data={projectionData}
                barWidth={32}
                noOfSections={3}
                barBorderRadius={8}
                frontColor="#B5FFCD"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: '#64748B' }}
                xAxisLabelTextStyle={{ color: '#94A3B8' }}
                hideRules
                height={180}
                width={screenWidth - 80}
                isAnimated
                onPress={(item: any, index: number) => setSelectedBarIndex(index)}
                disablePress={false}
            />
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
