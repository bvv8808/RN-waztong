import {gql, useQuery} from '@apollo/client';
import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Settings} from 'react-native-fbsdk-next';
import {useSetRecoilState} from 'recoil';
import {logoColor} from '~/images';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import {__coinConfig, __loginType, __myInfo, __token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';

interface Props {
  navigation: any;
}
const mainText = 'Upgrade yourself with a new language!';

const SplashScreen = ({navigation}: Props) => {
  const r_setMe = useSetRecoilState(__myInfo);
  const r_setToken = useSetRecoilState(__token);
  const r_setCoinConfig = useSetRecoilState(__coinConfig);

  const [animatedText, setAnimatedText] = useState(mainText);
  // const anim = useRef(new Animated.Value(0)).current;

  const [loadMe, {data: meData, error: meError}] = useBLazyQuery('me');
  const {data: coinData, error: coinError} = useQuery(gql`
    query {
      getConfig {
        getPointForWord
        getPointForSpeak
        getADPoint
      }
    }
  `);

  useEffect(() => {
    if (coinData) {
      console.log(`coinConfig: :`, coinData.getConfig);
      r_setCoinConfig(coinData.getConfig);
    }
  }, [coinData]);

  useEffect(() => {
    if (meData && meData.getMe) {
      console.log(`getMe:: `, meData.getMe);
      r_setMe(meData.getMe);
      setTimeout(() => {
        navigation.replace('MainTab');
      }, 1000);
    }
  }, [meData]);
  useEffect(() => {
    if (meError) {
      setTimeout(() => {
        navigation.replace('SignInHome');
      }, 2000);
    }
  }, [meError]);

  // # DidMount
  useEffect(() => {
    // # Set Animation
    // Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(anim, {
    //       toValue: mainText.length,
    //       duration: 1500,
    //       useNativeDriver: false,
    //     }),
    //     Animated.delay(500),
    //     Animated.timing(anim, {
    //       toValue: 0,
    //       duration: 0,
    //       useNativeDriver: false,
    //     }),
    //   ]),
    // ).start();

    // anim.addListener(({value}) => {
    //   setAnimatedText(mainText.substring(0, value));
    // });

    // # Login쿼리로 Session 검증 후
    // # 1. 검증 실패
    // # (1) 세션이 없었을 경우: 앱 최초 실행으로 간주. SignIn으로 전환.
    // # (2) 세션이 있었는데 실패한 경우: 중복로그인 등의 이유로 로그인 실패. 모달 띄운 후 SignIn으로 전환.
    // # 2. 검증 성공
    // # AsyncStorage에 방금 온 새로운 세션 저장 후 Main으로 Reset.

    AsyncStorage.getItem('token').then(t => {
      console.log(`t:: `, t);
      if (!t || !t.length) {
        setTimeout(() => {
          navigation.replace('SignInHome');
        }, 2000);
        return;
      }
      r_setToken(t);
      loadMe({variables: {session: t}});
    });

    // setTimeout(() => {
    //   // 로그인 기록이 없을 경우 SelectLang으로,
    //   // 있을 경우 MainTab으로
    //   navigation.replace('SignInHome');
    // }, 1000);

    return () => {
      // anim.removeAllListeners();
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f7',
      }}>
      {/* 배경이미지가 들어갈 자리 (absolute) */}
      <View style={{flex: 1}} />
      <View style={{flex: 1, ...theme.center}}>
        <Image
          source={logoColor.src}
          style={{width: 150, height: 150}}
          resizeMode="contain"
        />
        {/* <View style={s.animContainer}>
          <Text style={s.animatedText}>{animatedText}</Text>
        </View> */}
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        <Text style={s.copyright}>©2021 WAZTONG Inc. All Rights Reserved.</Text>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  animContainer: {
    width: '100%',
    height: 40,
    // borderWidth: 2,
    marginTop: 5,
    // ...theme.center,
    alignItems: 'center',
  },
  animatedText: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    // color: '#555',
    color: theme.colors.mint,
    textShadowColor: '#aaa',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  copyright: {
    color: '#000',
    fontSize: 10,
    marginTop: 25,
    marginBottom: 20,
  },
});

export default SplashScreen;
