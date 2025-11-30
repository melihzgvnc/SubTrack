import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import { NativeAd, NativeAdView, NativeAsset, NativeAssetType, TestIds } from 'react-native-google-mobile-ads';
import { GlassCard } from './ui/GlassCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTranslation } from 'react-i18next';

interface NativeAdCategoryCardProps {
    height: number;
}

export const NativeAdCategoryCard: React.FC<NativeAdCategoryCardProps> = ({ height }) => {
    const [nativeAd, setNativeAd] = useState<NativeAd>();
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
        <View style={{ width: '48%', marginBottom: spacing.md, height }}>
            <NativeAdView nativeAd={nativeAd} style={{ width: '100%', height: '100%' }}>
                <GlassCard style={{ height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {/* Ad Badge */}
                            <View
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <Text style={{ color: colors.text.secondary, fontSize: 10, fontWeight: 'bold' }}>{t('common.ad')}</Text>
                            </View>

                            {/* Icon */}
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.border.highlight,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <NativeAsset assetType={NativeAssetType.ICON}>
                                    <Image
                                        source={{ uri: nativeAd.icon?.url }}
                                        style={{ width: 40, height: 40 }}
                                        resizeMode="cover"
                                    />
                                </NativeAsset>
                            </View>
                        </View>

                        <View>
                            <NativeAsset assetType={NativeAssetType.HEADLINE}>
                                <Text
                                    style={{
                                        color: colors.text.primary,
                                        fontSize: typography.size.lg,
                                        fontWeight: 'bold',
                                        marginBottom: spacing.xxs,
                                    }}
                                    numberOfLines={1}
                                >
                                    {nativeAd.headline}
                                </Text>
                            </NativeAsset>

                            <NativeAsset assetType={NativeAssetType.BODY}>
                                <Text
                                    style={{
                                        color: colors.text.secondary,
                                        fontSize: typography.size.xs,
                                    }}
                                    numberOfLines={2}
                                >
                                    {nativeAd.body}
                                </Text>
                            </NativeAsset>

                            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                                <Text
                                    style={{
                                        color: colors.accent.secondary,
                                        fontSize: typography.size.xs,
                                        fontWeight: 'bold',
                                        marginTop: spacing.xs
                                    }}
                                >
                                    {nativeAd.callToAction}
                                </Text>
                            </NativeAsset>
                        </View>
                    </View>
                </GlassCard>
            </NativeAdView>
        </View>
    );
};
