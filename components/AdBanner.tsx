import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { adUnitIDs } from '../utils/ads';

interface AdBannerProps {
  style?: ViewStyle;
}

export const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }, style]}>
      <BannerAd
        unitId={adUnitIDs.banner!}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};
