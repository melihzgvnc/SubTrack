import { create } from 'zustand';
import { CustomerInfo } from 'react-native-purchases';

interface ProState {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  setCustomerInfo: (info: CustomerInfo) => void;
  reset: () => void;
}

export const useProStore = create<ProState>((set) => ({
  isPro: false,
  customerInfo: null,
  setCustomerInfo: (info: CustomerInfo) => {
    // Check for "pro_access" entitlement
    // Replace 'pro_access' with your actual entitlement identifier from RevenueCat dashboard
    const isPro = typeof info.entitlements.active['pro_access'] !== 'undefined';
    set({ customerInfo: info, isPro });
  },
  reset: () => set({ isPro: false, customerInfo: null }),
}));
