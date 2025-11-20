import React from 'react';
import { View, Text } from 'react-native';
import { Subscription } from '../store/useSubStore';
import { format, addMonths, addYears, parseISO } from 'date-fns';

interface Props {
  subscription: Subscription;
}

export const SubscriptionCard: React.FC<Props> = ({ subscription }) => {
  const { name, price, currency, cycle, startDate, color } = subscription;

  const getNextBillDate = (start: string, cycle: 'monthly' | 'yearly') => {
    const date = parseISO(start);
    const now = new Date();
    // Simple logic: just add one cycle to start date until it's in the future
    // For a real app, we'd calculate based on current date more precisely
    // For this demo, let's just say "Next Bill: [Same Day Next Month/Year]"
    // actually, let's just show the day of month for monthly
    
    if (cycle === 'monthly') {
        return format(addMonths(date, 1), 'MMM do'); // Simplified
    } else {
        return format(addYears(date, 1), 'MMM do, yyyy');
    }
  };

  const displayPrice = cycle === 'yearly' 
    ? `${currency}${price}/yr` 
    : `${currency}${price}/mo`;

  return (
    <View className="bg-gray-800 p-4 rounded-2xl mb-4 flex-row justify-between items-center border border-gray-700">
      <View className="flex-row items-center gap-4">
        <View 
          className="w-12 h-12 rounded-full justify-center items-center"
          style={{ backgroundColor: color || '#333' }}
        >
          <Text className="text-white font-bold text-xl">{name.charAt(0)}</Text>
        </View>
        <View>
          <Text className="text-white text-lg font-bold">{name}</Text>
          <Text className="text-gray-400 text-sm">Next Bill: {getNextBillDate(startDate, cycle)}</Text>
        </View>
      </View>
      <View>
        <Text className="text-white text-lg font-bold text-right">{displayPrice}</Text>
        {cycle === 'yearly' && (
             <Text className="text-gray-500 text-xs text-right">
                ~{currency}{(price / 12).toFixed(2)}/mo
             </Text>
        )}
      </View>
    </View>
  );
};
