import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
} from 'react-native';
// import {Actions} from 'react-native-router-flux';
// import {
//   icoSigninApple,
//   icoSigninEmail,
//   icoSigninFacebook,
//   icoSigninGoogle,
//   logoRed,
// } from '~/images';
import theme from '~/lib/theme';
// import {Settings} from 'react-native-fbsdk-next';

import toast from 'react-native-simple-toast';
import socialLogin from '~/lib/socialLogin';
import {gql, useLazyQuery} from '@apollo/client';
// import {TSocialLoginResult} from '~/lib/types';
import AsyncStorage from '@react-native-community/async-storage';
import {arrowLeftWhite, icoFlowerMint, logoColor} from '~/images';
import BaseButton from '~/base/BaseButton';
import {validEmail, validPassword} from '~/lib/validator';
import BaseLayout from '~/base/BaseLayout';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import {StackScreenProps} from '@react-navigation/stack';
import {TRootStackParams} from '~/lib/types';
import {useSetRecoilState} from 'recoil';
import {
  __loginType,
  __myInfo,
  __showTutorial,
  __token,
} from '~/lib/recoil/atom';
// import {trans} from '~/lib/lang';

const logoWidth = 100;

interface Props {
  navigation: any;
}

const SignInScreen = ({
  navigation,
}: StackScreenProps<TRootStackParams, 'SignIn'>) => {
  const r_setShowTutorial = useSetRecoilState(__showTutorial);
  const r_setToken = useSetRecoilState(__token);
  const r_setMe = useSetRecoilState(__myInfo);
  const r_setLoginType = useSetRecoilState(__loginType);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  const [login, {data: loginResult, error: loginError}] =
    useBLazyQuery('loginEmail');

  const [loadMe, {data: meResult, error: meError}] = useBLazyQuery('me');

  useEffect(() => {
    // FB login initialize
    // Settings.initializeSDK();
  }, []);

  useEffect(() => {
    if (meResult && meResult.getMe) {
      r_setMe(meResult.getMe);
    }
  }, [meResult]);

  useEffect(() => {
    console.log(`loginResult:: `, loginResult);
    refBase.current?.stopLoading();
    if (loginResult && loginResult.getLogin) {
      const token = loginResult.getLogin;
      r_setToken(token);

      AsyncStorage.setItem('token', token)
        .then(() => AsyncStorage.setItem('loginType', 'NO'))
        .then(() => {
          loadMe({variables: {session: token}});
          r_setLoginType('NO');

          navigation.reset({
            index: 1,
            routes: [{name: 'MainTab'}],
          });
        });
    }
  }, [loginResult]);
  useEffect(() => {
    const msg = loginError?.message || meError?.message || '';
    if (msg) {
      console.log(`loginError::: `, JSON.stringify(meError));
      // console.log(`Err:: `, msg)
      refBase.current?.stopLoading();
      setTimeout(() => toast.show(msg, 1), 300);
    }
  }, [loginError, meError]);

  const onPressSignIn = () => {
    // console.log(`pressed`);
    refBase.current?.startLoading();
    login({variables: {email, pw, loginType: 'NO'}});
    // navigation.reset('MainTab', {didTutorial: true});
  };

  const refBase = useRef<BaseLayout>(null);
  return (
    <BaseLayout
      ref={refBase}
      style={{flex: 1, alignItems: 'center', backgroundColor: '#fff'}}>
      <KeyboardAvoidingView
        style={{flex: 1, width: '100%'}}
        behavior={'padding'}
        enabled={Platform.OS === 'ios'}>
        <ScrollView style={{width: '100%'}}>
          <View style={{alignItems: 'center'}}>
            <View
              style={{
                width: '100%',
                height: 50,
                backgroundColor: theme.colors.mint,
              }}>
              <Pressable
                style={{width: 50, height: 50, ...theme.center}}
                onPress={() => {
                  navigation.pop();
                }}>
                <Image
                  source={arrowLeftWhite.src}
                  style={{width: 20 / arrowLeftWhite.ratio, height: 20}}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            {/* <Image
        source={logoRed.src}
        style={{
          width: logoWidth,
          height: logoWidth * logoRed.ratio,
          marginVertical: 40,
        }}
      /> */}

            {/* Fake Logo */}
            <Image
              source={logoColor.src}
              style={{
                width: logoWidth,
                height: logoWidth,
                marginVertical: 40,
              }}
              resizeMode="contain"
            />
            <View
              style={{
                ...theme.boxes.rowCenter,
                marginBottom: 20,
              }}>
              <View style={s.notMemberWrapper}>
                <Text style={s.notMember}>Not yet a member?</Text>
              </View>
              <TouchableOpacity
                style={{paddingRight: 10, paddingVertical: 3}}
                onPress={() => {
                  navigation.push('SignUpAgreement');
                }}>
                <Text style={s.signup}> sign up</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '90%',
                alignSelf: 'center',
                ...theme.boxes.rowStartCenter,
              }}>
              <Image
                source={icoFlowerMint.src}
                style={{width: 13, height: 13, marginRight: 5}}
                resizeMode="contain"
              />
              <Text style={s.label}>Email</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor="#aeaeae"
              onChangeText={t => setEmail(t)}
              keyboardType="email-address"
            />

            <View
              style={{
                width: '90%',
                alignSelf: 'center',
                ...theme.boxes.rowStartCenter,
              }}>
              <Image
                source={icoFlowerMint.src}
                style={{width: 13, height: 13, marginRight: 5}}
                resizeMode="contain"
              />
              <Text style={s.label}>Password</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor="#aeaeae"
              secureTextEntry={true}
              onChangeText={t => setPw(t)}
            />
            <View
              style={{alignItems: 'flex-end', width: '90%', marginBottom: 20}}>
              <TouchableOpacity
                style={{
                  ...theme.boxes.rowCenter,
                  paddingVertical: 5,
                  borderBottomWidth: 1.5,
                  borderColor: '#aeaeae',
                  paddingBottom: 3,
                }}
                onPress={() => {
                  navigation.push('Forgot');
                }}>
                {/* <Text style={{color: theme.colors.mainRed}}>●</Text> */}
                <Text style={s.forgot}> Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={{width: '90%', marginTop: 60, marginBottom: 30}}>
              <BaseButton
                // disabled={
                //   validEmail(email) !== 'pass' || validPassword(pw) !== 'pass'
                // }
                text="LOGIN"
                onPress={onPressSignIn}
                size="big"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  desc: {
    textAlign: 'center',
    color: '#fff',
    ...theme.fontSizes.small,
  },
  notMemberWrapper: {
    borderBottomColor: theme.colors.textGray,
    borderBottomWidth: 1,
    // paddingBottom: 2,
  },
  notMember: {
    ...theme.fontSizes.small,
    paddingVertical: 2,
    color: theme.colors.textGray,
    // fontWeight: 'bold',
  },
  signup: {
    ...theme.fontSizes.small,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 45,
    marginBottom: 10,
    paddingHorizontal: 15,
    color: '#333',
  },
  btnSignin: {
    width: '100%',
    backgroundColor: '#d8d8d8',
    borderRadius: 25,
    height: 50,
    marginVertical: 20,
    ...theme.center,
  },
  signin: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
  },
  forgot: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    // color: theme.colors.gray,
    color: '#aeaeae',
    fontWeight: 'bold',
    // textDecorationLine: 'underline',
  },
  btnSocial: {
    width: 60,
    height: 60,
    marginRight: 15,
  },

  label: {
    ...theme.fontSizes.small,
    paddingVertical: 10,
    color: theme.colors.black5,
    // fontWeight: 'bold',
  },
});

export default SignInScreen;
