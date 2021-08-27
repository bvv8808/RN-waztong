import {useQuery, gql} from '@apollo/client';
import {BannerAd, BannerAdSize, TestIds} from '@react-native-firebase/admob';
import React, {useEffect} from 'react';
import {Image, SafeAreaView, View} from 'react-native';
import {BannerKey} from '~/lib/admobKey';
import theme from '~/lib/theme';

const adUnitId = __DEV__ || !BannerKey ? TestIds.BANNER : BannerKey;

interface Props {
  children: JSX.Element | JSX.Element[];
}

const BaseAdScreen = ({children}: Props) => {
  const {data: bgData, error: bgError} = useQuery(gql`
    query {
      getADBackground
    }
  `);
  useEffect(() => {
    if (bgError) {
      console.log(`bgError:: `, JSON.stringify(bgError));
    }
  }, [bgError]);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#888'}}>
      <View style={{width: '100%', height: '100%', alignItems: 'center'}}>
        {bgData && (
          <Image
            source={{uri: bgData.getADBackground}}
            style={{width: '100%', height: '100%', position: 'absolute'}}
            resizeMode="cover"
          />
        )}
        <View
          style={{
            width: '85%',
            marginTop: 20,
            ...theme.center,
          }}>
          <BannerAd size={BannerAdSize.LARGE_BANNER} unitId={adUnitId} />
        </View>

        {children}
      </View>
    </SafeAreaView>
  );
};

export default BaseAdScreen;
