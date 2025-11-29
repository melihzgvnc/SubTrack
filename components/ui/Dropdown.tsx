import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  width?: number | string;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onSelect, width = '100%' }) => {
  const [visible, setVisible] = useState(false);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.highlight,
      }}
      onPress={() => {
        onSelect(item);
        setVisible(false);
      }}
    >
      <Text style={{ color: item === value ? colors.accent.tertiary : colors.text.primary, fontSize: typography.size.base, fontWeight: item === value ? 'bold' : 'normal' }}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ width: width as any }}>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.8}>
        <GlassCard style={{ padding: spacing.none }}>
            <View style={{ padding: spacing.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text 
                        style={{ color: colors.text.secondary, fontSize: 10, marginBottom: 2 }}
                        numberOfLines={1}
                    >
                        {label}
                    </Text>
                    <Text 
                        style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: 'bold' }}
                        numberOfLines={1}
                    >
                        {value}
                    </Text>
                </View>
                <ChevronDown color={colors.text.muted} size={16} />
            </View>
        </GlassCard>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <View style={{ width: '80%', maxHeight: '50%', backgroundColor: colors.background.surface, borderRadius: spacing.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border.highlight }}>
                <View style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.highlight, backgroundColor: colors.background.elevated }}>
                    <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: 'bold', textAlign: 'center' }}>Select {label}</Text>
                </View>
                <FlatList
                  data={options}
                  renderItem={renderItem}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
