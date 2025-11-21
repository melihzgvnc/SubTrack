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
    const startDate = parseISO(start);
    const now = new Date();
    
    let nextDate = startDate;
    
    // If start date is in the future, that's the next bill date
    if (nextDate > now) {
        return format(nextDate, 'MMM do, yyyy');
    }

    // Otherwise, add cycles until we pass today
    while (nextDate <= now) {
        if (cycle === 'monthly') {
            nextDate = addMonths(nextDate, 1);
        } else {
            nextDate = addYears(nextDate, 1);
        }
    }
    
    return format(nextDate, 'MMM do, yyyy');
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
