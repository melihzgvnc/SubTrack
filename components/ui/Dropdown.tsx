import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { GlassCard } from './GlassCard';

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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
      }}
      onPress={() => {
        onSelect(item);
        setVisible(false);
      }}
    >
      <Text style={{ color: item === value ? '#B5FFCD' : '#FFFFFF', fontSize: 16, fontWeight: item === value ? 'bold' : 'normal' }}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ width: width as any }}>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.8}>
        <GlassCard style={{ padding: 0 }}>
            <View style={{ padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#94A3B8', fontSize: 10, marginBottom: 2 }}>{label}</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>{value}</Text>
                </View>
                <ChevronDown color="#64748B" size={16} />
            </View>
        </GlassCard>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <View style={{ width: '80%', maxHeight: '50%', backgroundColor: '#1E293B', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', backgroundColor: '#0F172A' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Select {label}</Text>
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
