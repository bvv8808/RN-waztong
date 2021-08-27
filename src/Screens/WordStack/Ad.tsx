import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {Image, Text, View, Animated} from 'react-native';
import theme from '~/lib/theme';
import {TWordStackParams} from '~/lib/types';
import {flowerWhite, loadingCircleBlue} from '~/images';
import {useRef} from 'react';
import BaseAdScreen from '~/base/BaseAdScreen';

const timeToGo = 2000;

const AdWordScreen = ({
  navigation,
  route,
}: StackScreenProps<TWordStackParams, 'ad'>) => {
  const [rotateDeg, setRotateDeg] = useState(0);

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 360,
        duration: 1500,
        delay: 100,
        useNativeDriver: false,
      }),
      {iterations: -1},
    ).start();

    anim.addListener(({value}) => {
      setRotateDeg(value);
    });
  }, [anim]);

  useEffect(() => {
    setTimeout(() => {
      navigation.replace('wordStudy', {wordData: route.params.wordData});
    }, timeToGo);
  }, []);

  return (
    <BaseAdScreen>
      <Image
        source={flowerWhite.src}
        style={{width: 30, height: 30, marginTop: 40}}
        resizeMode="contain"
      />
      <Text
        style={{
          textAlign: 'center',
          ...theme.fontSizes.ultra,
          paddingVertical: 0,
          color: '#fff',
          fontWeight: 'bold',
          marginTop: 20,
        }}>
        WE WILL HAVE A SHORT TEST!
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.ocean,
          borderRadius: 40,
          paddingVertical: 2,
          paddingHorizontal: 10,
          marginTop: 10,
          marginBottom: 30,
        }}>
        <Text
          style={{
            ...theme.fontSizes.small,
            paddingVertical: 0,
            color: '#fff',
          }}>
          You can do it!
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          width: '100%',
          alignItems: 'center',
        }}>
        <Image
          source={loadingCircleBlue.src}
          style={{
            height: '60%',
            transform: [{rotateZ: `${rotateDeg}deg`}],
          }}
          resizeMode="contain"
        />
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '60%',
            top: 0,
            ...theme.center,
          }}>
          <Text
            style={{
              ...theme.fontSizes.largest,
              paddingVertical: 0,
              color: '#fff',
              fontWeight: 'bold',
            }}>
            LOADING...
          </Text>
        </View>
      </View>
    </BaseAdScreen>
  );
};

export default AdWordScreen;
