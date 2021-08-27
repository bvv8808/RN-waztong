import React, {useEffect, useState} from 'react';
import {useRef} from 'react';
import {
  Animated,
  Image,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import theme from '~/lib/theme';
import Video from 'react-native-video';
import {
  icoApple,
  icoEmailBlack,
  icoFb,
  icoGoggle,
  icoKakao,
  logoWhite,
  vSignin,
} from '~/images';
import socialLogin from '~/lib/socialLogin';
import {StackScreenProps} from '@react-navigation/stack';
import {TRootStackParams, TSocial} from '~/lib/types';
import {useFocusEffect} from '@react-navigation/native';

const socialIconSize = 25;
const socialButtonHeight = 44;
const socials = {
  fb: {
    img: icoFb.src,
    bColor: '#6078ea',
    cColor: '#fff',
  },
  google: {
    img: icoGoggle.src,
    bColor: '#fbfbfb',
    cColor: '#000',
  },
  kakao: {
    img: icoKakao.src,
    bColor: 'yellow',
    cColor: '#000',
  },
  apple: {
    img: icoApple.src,
    bColor: '#fff',
    cColor: '#000',
  },
  email: {
    img: icoEmailBlack.src,
    bColor: '#fff',
    cColor: '#000',
  },
};

interface Props {
  navigation: any;
}

const SignInHomeScreen = ({
  navigation,
}: StackScreenProps<TRootStackParams, 'SignInHome'>) => {
  const [more, setMore] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [animatedHeight, setAnimatedHeight] = useState(0);
  const [animatedOpacity, setAnimatedOpacity] = useState(0);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (more) {
      Animated.parallel([
        Animated.timing(animHeight, {
          toValue:
            Platform.OS === 'android'
              ? socialButtonHeight * 2 + 20
              : socialButtonHeight * 3 + 30,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [more]);

  useEffect(() => {
    animHeight.addListener(({value}) => {
      setAnimatedHeight(value);
    });
    animOpacity.addListener(({value}) => {
      setAnimatedOpacity(value);
    });

    return () => {
      animHeight.removeAllListeners();
      animOpacity.removeAllListeners();
    };
  }, []);

  useFocusEffect(() => {
    setVideoPaused(false);

    return () => {
      setVideoPaused(true);
    };
  });

  const signin = (type: TSocial) => {
    navigation.push('SignUpAgreement', {socialMethod: type});
  };

  return (
    <View style={{flex: 1}}>
      <View style={{width: '100%', height: '100%', position: 'absolute'}}>
        <Video
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
          source={vSignin.src}
          paused={videoPaused}
          repeat
        />
      </View>

      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              height: 200,
              ...theme.center,
            }}>
            <Image
              source={logoWhite.src}
              style={{width: 120 / logoWhite.ratio, height: 120}}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                minHeight: socialButtonHeight * 3 + 34,
              }}>
              {/* Button FB */}
              <TouchableOpacity
                style={[s.btnSignIn, {backgroundColor: socials.fb.bColor}]}
                onPress={() => {
                  signin('FACEBOOK');
                }}>
                <Image
                  source={socials.fb.img}
                  style={{width: socialIconSize, height: socialIconSize}}
                  resizeMode="contain"
                />
                <Text style={[s.tSignIn, {color: socials.fb.cColor}]}>
                  SIGN IN WITH FACEBOOK
                </Text>
                <View style={{width: socialIconSize}} />
              </TouchableOpacity>

              {/* Button Google */}
              <TouchableOpacity
                style={[s.btnSignIn, {backgroundColor: socials.google.bColor}]}
                onPress={() => {
                  signin('GOOGLE');
                }}>
                <Image
                  source={socials.google.img}
                  style={{width: socialIconSize, height: socialIconSize}}
                  resizeMode="contain"
                />
                <Text style={[s.tSignIn, {color: socials.google.cColor}]}>
                  SIGN IN WITH GOOGLE
                </Text>
                <View style={{width: socialIconSize}} />
              </TouchableOpacity>

              {!more && (
                <TouchableOpacity
                  style={[
                    s.btnSignIn,
                    {
                      borderWidth: 2,
                      borderColor: '#fff',
                      justifyContent: 'center',
                    },
                  ]}
                  onPress={() => {
                    setMore(true);
                  }}>
                  <Text style={[s.tSignIn, {color: '#fff'}]}>
                    {/* SIGN IN IN A DIFFRENT WAY */}
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  width: '100%',
                  height: animatedHeight,
                  opacity: animatedOpacity,
                  overflow: 'hidden',
                }}>
                <TouchableOpacity
                  style={[s.btnSignIn, {backgroundColor: socials.kakao.bColor}]}
                  onPress={() => {
                    signin('KAKAOTALK');
                  }}>
                  <Image
                    source={socials.kakao.img}
                    style={{width: socialIconSize, height: socialIconSize}}
                    resizeMode="contain"
                  />
                  <Text style={[s.tSignIn, {color: socials.kakao.cColor}]}>
                    SIGN IN WITH KAKAOTALK
                  </Text>
                  <View style={{width: socialIconSize}} />
                </TouchableOpacity>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[
                      s.btnSignIn,
                      {backgroundColor: socials.apple.bColor},
                    ]}
                    onPress={() => {
                      signin('APPLE');
                    }}>
                    <Image
                      source={socials.apple.img}
                      style={{width: socialIconSize, height: socialIconSize}}
                      resizeMode="contain"
                    />
                    <Text style={[s.tSignIn, {color: socials.apple.cColor}]}>
                      SIGN IN WITH APPLE
                    </Text>
                    <View style={{width: socialIconSize}} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[s.btnSignIn, {backgroundColor: socials.email.bColor}]}
                  onPress={() => {
                    navigation.push('SignIn');
                  }}>
                  <Image
                    source={socials.email.img}
                    style={{width: socialIconSize, height: socialIconSize}}
                    resizeMode="contain"
                  />
                  <Text style={[s.tSignIn, {color: socials.email.cColor}]}>
                    SIGN IN WITH EMAIL
                  </Text>
                  <View style={{width: socialIconSize}} />
                </TouchableOpacity>
              </View>

              <View
                pointerEvents="none"
                style={[
                  s.btnSignIn,
                  {
                    borderWidth: 2,
                    borderColor: '#fff',
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: 4,
                    opacity: 1 - animatedOpacity,
                  },
                ]}>
                <Text style={[s.tSignIn, {color: '#fff'}]}>
                  SIGN IN IN A DIFFRENT WAY
                </Text>
              </View>
            </View>
            {/* <TouchableOpacity
            style={[
              s.btnSignIn,
              {backgroundColor: socials[1].bColor},
              {height: animatedHeight, padding: animatedPadding},
            ]}></TouchableOpacity> */}
            {/* <-- Buttons */}
            <TouchableOpacity
              style={s.btnSignUp}
              onPress={() => {
                // navigation.push('SignUp');
                navigation.push('SignUpAgreement');
              }}>
              <Text style={s.tSignUp}>Create a New Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnSignUp}
              onPress={() => {
                navigation.push('Forgot');
              }}>
              <Text style={s.tForgot}>Forgot Password</Text>
            </TouchableOpacity>
            <Text style={s.copyright}>
              ©2021 WONOGONG Inc. All Rights Reserved.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  btnSignIn: {
    width: '85%',
    height: socialButtonHeight,
    alignSelf: 'center',
    ...theme.boxes.rowBetweenCenter,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  tSignIn: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: '#fff',
  },
  btnSignUp: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingTop: 10,
  },
  tSignUp: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
    paddingBottom: 2,
  },
  tForgot: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
    paddingBottom: 2,
  },
  copyright: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: '#fff',
    marginTop: 30,
    marginBottom: 10,
  },
});

export default SignInHomeScreen;
