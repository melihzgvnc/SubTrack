import React from 'react';
import { View, Text } from 'react-native';
import { Subscription } from '../store/useSubStore';
import { format, addMonths, addYears, parseISO } from 'date-fns';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
    <View style={{
        backgroundColor: colors.background.surface,
        padding: spacing.md,
        borderRadius: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.highlight
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View 
          style={{
            width: spacing.xxxl,
            height: spacing.xxxl,
            borderRadius: 9999,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: color || colors.background.surface
          }}
        >
          <Text style={{ color: colors.text.primary, fontWeight: 'bold', fontSize: typography.size.xl }}>{name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: 'bold' }}>{name}</Text>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Next Bill: {getNextBillDate(startDate, cycle)}</Text>
        </View>
      </View>
      <View>
        <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: 'bold', textAlign: 'right' }}>{displayPrice}</Text>
        {cycle === 'yearly' && (
             <Text style={{ color: colors.text.muted, fontSize: typography.size.xs, textAlign: 'right' }}>
                ~{currency}{(price / 12).toFixed(2)}/mo
             </Text>
        )}
      </View>
    </View>
  );
};
