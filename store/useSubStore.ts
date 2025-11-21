import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrency } from '../utils/currency';

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

interface SubscriptionState {
  subscriptions: Subscription[];
  hasSeenOnboarding: boolean;
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
  completeOnboarding: () => void;
  totalMonthlyCost: () => number;
  currency: { code: string; symbol: string };
  setCurrency: (currency: { code: string; symbol: string }) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

export const useSubStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [
        {
          id: '1',
          name: 'Netflix',
          price: 15.99,
          currency: getCurrency().symbol,
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#E50914',
          category: 'Entertainment',
        },
        {
          id: '2',
          name: 'Amazon Prime',
          price: 139,
          currency: getCurrency().symbol,
          cycle: 'yearly',
          startDate: new Date().toISOString(),
          color: '#00A8E1',
          category: 'Shopping',
        },
        {
          id: '3',
          name: 'Spotify',
          price: 10.99,
          currency: getCurrency().symbol,
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#1DB954',
          category: 'Music',
        },
        {
          id: '4',
          name: 'ChatGPT Plus',
          price: 20.00,
          currency: getCurrency().symbol,
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#10A37F',
          category: 'Productivity',
        },
        {
          id: '5',
          name: 'iCloud+',
          price: 2.99,
          currency: getCurrency().symbol,
          cycle: 'monthly',
          startDate: new Date().toISOString(),
          color: '#007AFF',
          category: 'Utilities',
        },
      ],
      hasSeenOnboarding: false,
      currency: getCurrency(),
      notificationsEnabled: true,
      addSubscription: (subscription) =>
        set((state) => ({ subscriptions: [...state.subscriptions, subscription] })),
      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      totalMonthlyCost: () => {
        const { subscriptions } = get();
        return subscriptions.reduce((total, sub) => {
          if (sub.cycle === 'monthly') {
            return total + sub.price;
          }
          return total + sub.price / 12;
        }, 0);
      },
      setCurrency: (currency) => set({ currency }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
