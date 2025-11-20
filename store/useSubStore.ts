import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Cycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  cycle: Cycle;
  startDate: string; // ISO date string
  color?: string;
  category: 'Entertainment' | 'Music' | 'Productivity' | 'Utilities' | 'Shopping' | 'Other';
}

interface SubState {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  totalMonthlyCost: () => number;
}

export const useSubStore = create<SubState>()(
  persist(
    (set, get) => ({
      subscriptions: [
        {
          id: '1',
          name: 'Netflix',
          price: 15.99,
          currency: '$',
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#E50914',
          category: 'Entertainment',
        },
        {
          id: '2',
          name: 'Amazon Prime',
          price: 139,
          currency: '$',
          cycle: 'yearly',
          startDate: new Date().toISOString(),
          color: '#00A8E1',
          category: 'Shopping',
        },
        {
          id: '3',
          name: 'Spotify',
          price: 10.99,
          currency: '$',
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#1DB954',
          category: 'Music',
        },
        {
          id: '4',
          name: 'ChatGPT Plus',
          price: 20.00,
          currency: '$',
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#10A37F',
          category: 'Productivity',
        },
        {
          id: '5',
          name: 'iCloud+',
          price: 2.99,
          currency: '$',
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#007AFF',
          category: 'Utilities',
        },
      ],
      addSubscription: (sub) =>
        set((state) => ({ subscriptions: [...state.subscriptions, sub] })),
      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
      totalMonthlyCost: () => {
        const { subscriptions } = get();
        return subscriptions.reduce((total, sub) => {
          let monthlyPrice = sub.price;
          if (sub.cycle === 'yearly') {
            monthlyPrice = sub.price / 12;
          }
          return total + monthlyPrice;
        }, 0);
      },
    }),
    {
      name: 'sub-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
