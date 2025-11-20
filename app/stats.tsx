import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { Music, ShoppingBag, MonitorPlay, Briefcase, Zap } from 'lucide-react-native';
import { useSubStore } from '../store/useSubStore';

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
      const year = currentMonthDate.getFullYear();
      
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
        frontColor: '#A7F3D0', // Default Mint
        topLabelComponent: () => (
            <Text className="text-text-secondary text-[10px] mb-1">{monthlyTotal > 0 ? Math.round(monthlyTotal) : ''}</Text>
        ),
      });
    }
    return months;
  };

  const projectionData = React.useMemo(() => {
      const data = getProjections();
      if (selectedBarIndex !== null && data[selectedBarIndex]) {
          data[selectedBarIndex].frontColor = '#FDBA74'; // Highlight Peach
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
      // Map UI titles back to internal category values if needed, or just use the internal values directly
      // Current mapping: Media->Entertainment, Work->Productivity. Others match.
      let targetCat = selectedCategory;
      if (selectedCategory === 'Media') targetCat = 'Entertainment';
      if (selectedCategory === 'Work') targetCat = 'Productivity';
      
      return subscriptions.filter(s => s.category === targetCat);
  };

  const CategoryCard = ({ title, count, icon: Icon, color, height = 200, onPress }: any) => (
    <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.9}
        className="rounded-4xl p-6 justify-between mb-4 w-[48%]"
        style={{ backgroundColor: color, height }}
    >
        <View className="items-end">
             {/* Abstract line decoration could go here */}
        </View>
        <View>
            <Text className="text-black text-2xl font-bold mb-1">{title}</Text>
            <View className="flex-row justify-between items-end">
                <Text className="text-black/60 font-medium">{count} subs</Text>
                <View className="w-10 h-10 rounded-full bg-black/10 justify-center items-center">
                    <Icon color="black" size={20} />
                </View>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-text-secondary mb-1">Total Monthly</Text>
                <Text className="text-text-primary text-4xl font-light">${totalMonthlyCost().toFixed(2)}</Text>
            </View>
        </View>

        {/* Chart Section */}
        <View className="bg-card p-4 rounded-4xl mb-8 items-center border border-card-lighter">
            <View className="w-full flex-row justify-between items-center mb-4">
                <Text className="text-text-secondary font-bold">Projected Spend (6 Months)</Text>
                {selectedBarIndex !== null && (
                    <View className="bg-zinc-800 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">
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
                frontColor="#A7F3D0"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: '#52525B' }}
                xAxisLabelTextStyle={{ color: '#A1A1AA' }}
                hideRules
                height={180}
                width={screenWidth - 80}
                isAnimated
                onPress={(item: any, index: number) => setSelectedBarIndex(index)}
                disablePress={false}
            />
        </View>

        {/* Categories Header */}
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text-primary text-xl font-bold">Categories</Text>
        </View>

        {/* Category Grid */}
        <View className="flex-row flex-wrap justify-between pb-24">
             <CategoryCard 
                title="Media" 
                count={getCategoryCount('Entertainment')} 
                icon={MonitorPlay} 
                color="#BAE6FD" // Blue
                height={200}
                onPress={() => setSelectedCategory('Media')}
             />
             <CategoryCard 
                title="Music" 
                count={getCategoryCount('Music')} 
                icon={Music} 
                color="#DDD6FE" // Lavender
                height={160}
                onPress={() => setSelectedCategory('Music')}
             />
             <CategoryCard 
                title="Shopping" 
                count={getCategoryCount('Shopping')} 
                icon={ShoppingBag} 
                color="#A7F3D0" // Mint
                height={160}
                onPress={() => setSelectedCategory('Shopping')}
             />
             <CategoryCard 
                title="Work" 
                count={getCategoryCount('Productivity')} 
                icon={Briefcase} 
                color="#FDBA74" // Peach
                height={200}
                onPress={() => setSelectedCategory('Work')}
             />
             {/* Added missing categories */}
             <CategoryCard 
                title="Utilities" 
                count={getCategoryCount('Utilities')} 
                icon={Zap} 
                color="#E4E4E7" // Zinc 200
                height={160}
                onPress={() => setSelectedCategory('Utilities')}
             />
             <CategoryCard 
                title="Other" 
                count={getCategoryCount('Other')} 
                icon={Zap} 
                color="#FEF3C7" // Amber 100
                height={160}
                onPress={() => setSelectedCategory('Other')}
             />
        </View>

      </ScrollView>

      {/* Category Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedCategory !== null}
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
            <View className="bg-card rounded-t-4xl h-[60%] p-6 border-t border-card-lighter">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-text-primary text-2xl font-bold">{selectedCategory} Subscriptions</Text>
                    <TouchableOpacity 
                        onPress={() => setSelectedCategory(null)}
                        className="w-8 h-8 bg-card-lighter rounded-full justify-center items-center"
                    >
                        <Text className="text-text-secondary font-bold">X</Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {getCategorySubs().length > 0 ? (
                        getCategorySubs().map(sub => (
                            <View key={sub.id} className="flex-row justify-between items-center bg-background p-4 rounded-2xl mb-3 border border-card-lighter">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: sub.color + '20' }}>
                                        <Text className="text-lg font-bold" style={{ color: sub.color }}>{sub.name[0]}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-text-primary font-bold text-lg">{sub.name}</Text>
                                        <Text className="text-text-secondary text-sm capitalize">{sub.cycle}</Text>
                                    </View>
                                </View>
                                <Text className="text-text-primary font-bold text-lg">
                                    {sub.currency}{sub.price}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-text-secondary text-center mt-10">No subscriptions in this category.</Text>
                    )}
                </ScrollView>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
