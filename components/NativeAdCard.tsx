import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import { NativeAd, NativeAdView, NativeAsset, NativeAssetType, TestIds } from 'react-native-google-mobile-ads';
import { GlassCard } from './ui/GlassCard';
import { Squircle } from './ui/Squircle';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useTranslation } from 'react-i18next';

export const NativeAdCard = () => {
  const [nativeAd, setNativeAd] = useState<NativeAd>();
  const nativeAdRef = useRef<NativeAd>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const adUnitId = __DEV__ ? TestIds.NATIVE : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'; // Replace with real ID in prod

    NativeAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    })
      .then((ad) => {
        setNativeAd(ad);
      })
      .catch((error) => {
        console.error('Native Ad error:', error);
      });
  }, []);

  if (!nativeAd) {
    return null;
  }

  return (
    <NativeAdView nativeAd={nativeAd}>
      <GlassCard style={{ padding: spacing.none }}>
        <View className="flex-row items-center p-1">
          {/* Icon Container with Squircle */}
          <View style={{ width: 56, height: 56, marginRight: spacing.md }}>
            <Squircle
              width={56}
              height={56}
              cornerRadius={18}
              backgroundColor={colors.background.surface}
              showBorder={true}
              borderColor={colors.border.highlight}
            >
              <NativeAsset assetType={NativeAssetType.ICON}>
                <Image
                  source={{ uri: nativeAd.icon?.url }}
                  style={{ width: 56, height: 56, borderRadius: 18 }}
                  resizeMode="cover"
                />
              </NativeAsset>
            </Squircle>
          </View>

          <View className="flex-1 py-3">
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text className="text-white font-bold text-lg" numberOfLines={1}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>

            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text className="text-gray-300 text-xs font-medium mt-0.5" numberOfLines={1}>
                {nativeAd.body}
              </Text>
            </NativeAsset>
          </View>

          <View className="items-end py-3 pr-4 justify-center">
            <View className="bg-neon-blue/20 px-2 py-1 rounded-md border border-neon-blue/50">
              <Text className="text-neon-blue text-[10px] font-bold uppercase">
                {t('common.ad')}
              </Text>
            </View>
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <Text className="text-white text-xs font-bold mt-1">
                {nativeAd.callToAction}
              </Text>
            </NativeAsset>
          </View>
        </View>
      </GlassCard>
    </NativeAdView>
  );
};
