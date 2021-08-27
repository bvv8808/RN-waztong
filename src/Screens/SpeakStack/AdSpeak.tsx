import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import theme from '~/lib/theme';
import {TSpeakStackParams} from '~/lib/types';
import {loadingSpeakStart, loadingThumbSpeak} from '~/images';
import {useRecoilValue} from 'recoil';
import {__myInfo} from '~/lib/recoil/atom';

import BaseAdScreen from '~/base/BaseAdScreen';
import {toShortLower} from '~/lib/util';

const screenWidth = Dimensions.get('screen').width;

const AdSpeakScreen = ({
  navigation,
  route,
}: StackScreenProps<TSpeakStackParams, 'adSpeak'>) => {
  const me = useRecoilValue(__myInfo);

  return (
    <BaseAdScreen>
      <View style={{flex: 1, ...theme.center, width: '60%'}}>
        <Image
          source={loadingThumbSpeak.src}
          style={{width: 50, height: 50, marginTop: 40}}
          resizeMode="contain"
        />
        <Text
          style={{
            textAlign: 'center',
            ...theme.fontSizes.ultra,
            paddingVertical: 0,
            color: '#444',
            fontWeight: 'bold',
            marginTop: 20,
          }}>
          SITUATION
        </Text>
        <Text style={s.tSituation}>
          {
            route.params.chapterData.speakDatas[0].description[
              toShortLower(me.subtitle)
            ]
          }
        </Text>
      </View>
      <TouchableOpacity
        style={{marginBottom: 50, padding: 10}}
        onPress={() => {
          navigation.replace('speakStudy', {
            chapterData: route.params.chapterData,
          });
        }}>
        <Image
          source={loadingSpeakStart.src}
          style={{
            width: screenWidth / 3,
            height: (screenWidth / 3) * loadingSpeakStart.ratio,
          }}
        />
      </TouchableOpacity>
    </BaseAdScreen>
  );
};

const s = StyleSheet.create({
  tSituation: {
    ...theme.fontSizes.small,
    color: '#444',
    textAlign: 'center',
  },
});

export default AdSpeakScreen;
