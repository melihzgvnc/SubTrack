import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useProStore } from '../store/useProStore';

// TODO: Replace with your actual RevenueCat API Keys
const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY || 'appl_placeholder_key',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || 'goog_placeholder_key',
};

const ENTITLEMENT_ID = 'pro_access';

export const useRevenueCat = () => {
  const { setCustomerInfo, isPro } = useProStore();
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: API_KEYS.google });
      } else {
        await Purchases.configure({ apiKey: API_KEYS.apple });
      }

      // Set listener for real-time updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
      });

      // Fetch initial info
      try {
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        
        // Fetch offerings
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setCurrentOffering(offerings.current);
        }
      } catch (e) {
        console.error('RevenueCat init error:', e);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  const purchasePackage = async (pkg: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);
      return true;
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Error', e.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);
      
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert('Success', 'Purchases restored successfully!');
      } else {
        Alert.alert('Notice', 'No active subscriptions found to restore.');
      }
    } catch (e: any) {
      Alert.alert('Restore Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInitialized,
    currentOffering,
    isPro,
    purchasePackage,
    restorePurchases,
    isLoading
  };
};
