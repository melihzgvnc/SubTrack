import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const productionAdUnits = {
  banner: {
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx', // Replace with your production ID
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',     // Replace with your production ID
  },
  interstitial: {
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx', // Replace with your production ID
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',     // Replace with your production ID
  },
};

export const adUnitIDs = {
  banner: __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: productionAdUnits.banner.ios,
        android: productionAdUnits.banner.android,
        default: TestIds.BANNER,
      }),
  interstitial: __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: productionAdUnits.interstitial.ios,
        android: productionAdUnits.interstitial.android,
        default: TestIds.INTERSTITIAL,
      }),
};

let subscriptionAddCount = 0;
export const shouldShowInterstitial = () => {
  subscriptionAddCount++;
  return subscriptionAddCount % 3 === 0;
};
