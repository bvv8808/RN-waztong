import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useMemo} from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseButton from '~/base/BaseButton';
import {
  arrowDownGray,
  arrowDownGrayThin,
  arrowDownMint,
  arrowLeftWhite,
  arrowRightGrayThin,
  arrowUpGrayThin,
  checkGray,
  checkMint,
  icoCheckCircleGray,
  icoCheckCircleMint,
  logoHeader,
  logoHorizon,
} from '~/images';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import socialLogin from '~/lib/socialLogin';
import theme from '~/lib/theme';
import {GQLResponse, TLang, TRootStackParams} from '~/lib/types';
import Local from 'react-native-localize';
import BaseLayout from '~/base/BaseLayout';
import {useRef} from 'react';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {__loginType, __myInfo, __token} from '~/lib/recoil/atom';
import AsyncStorage from '@react-native-community/async-storage';
import toast from 'react-native-simple-toast';
import {LogBox} from 'react-native';
import Selector from '~/components/Selector';
import {gql, useQuery} from '@apollo/client';

LogBox.ignoreLogs(['Setting a']);

const SignUpAgreementScreen = ({
  navigation,
  route,
}: StackScreenProps<TRootStackParams, 'SignUpAgreement'>) => {
  const socialMethod = useMemo(() => route.params?.socialMethod, []);
  const [token, r_setToken] = useRecoilState(__token);
  const r_setLoginType = useSetRecoilState(__loginType);
  const r_setMe = useSetRecoilState(__myInfo);

  const [visibleLang, setVisibleLang] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showMarketingContent, setShowMarketingContent] = useState(false);

  const [visibleLang1, setVisibleLang1] = useState(false);
  const [visibleLang2, setVisibleLang2] = useState(false);
  const [languageSubtitle, setLanguageSubtitle] = useState<TLang>({
    name: '',
    img: '',
    // @ts-ignore
    value: '',
  });
  const [languageLearn, setLanguageLearn] = useState<TLang>({
    name: '',
    img: '',
    // @ts-ignore
    value: '',
  });

  const refBase = useRef<BaseLayout>(null);

  const onPressAll = () => {
    if (agreeTerms && agreePrivacy) {
      setAgreeTerms(false);
      setAgreePrivacy(false);
      setAgreeMarketing(false);
    } else {
      setAgreeTerms(true);
      setAgreePrivacy(true);
      setAgreeMarketing(true);
    }
  };

  const {data, error} = useQuery<GQLResponse>(gql`
    query {
      getConfig {
        getMarket
      }
    }
  `);

  const [login, {data: loginResult, error: loginError}] =
    useBLazyQuery('loginSocial');

  const [loadMe, {data: meResult, error: meError}] = useBLazyQuery('me');

  const [mutSetLanguage] = useBMutation('language');
  const [mutSetSubtitle] = useBMutation('subtitle');

  useEffect(() => {
    if (error) {
      console.log(`Error:: `, JSON.stringify(error));
    }
  }, [error]);

  useEffect(() => {
    if (loginError) {
      console.log(`LoginError@@@@@@ `, JSON.stringify(loginError));
      refBase.current?.stopLoading();
    }
    if (meError) {
      console.log(`LoginError@@@@@@ `, JSON.stringify(meError));
      refBase.current?.stopLoading();
    }
    const msg = loginError?.message || meError?.message;
    msg && toast.show(msg, 1);
  }, [loginError, meError]);

  useEffect(() => {
    if (meResult && meResult.getMe) {
      console.log(`meResult:: `, meResult.getMe);
      r_setMe(meResult.getMe);
      refBase.current?.stopLoading();
      if (!meResult.getMe.language || !meResult.getMe.subtitle) {
        setVisibleLang(true);
      } else
        navigation.reset({
          index: 1,
          routes: [{name: 'MainTab'}],
        });
    }
  }, [meResult]);

  useEffect(() => {
    console.log(`loginResult:: `, loginResult);
    refBase.current?.stopLoading();
    if (loginResult && loginResult.getLogin) {
      const token = loginResult.getLogin;
      r_setToken(token);

      if (socialMethod)
        AsyncStorage.setItem('token', token)
          .then(() =>
            AsyncStorage.setItem('loginType', socialMethod.substring(0, 2)),
          )
          .then(() => {
            loadMe({variables: {session: token}});
            // @ts-ignore
            r_setLoginType(socialMethod.substring(0, 2));
          });
    }
  }, [loginResult]);

  return (
    <BaseLayout ref={refBase} style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={{height: 50, backgroundColor: theme.colors.mint}}>
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
      <ScrollView>
        <Image
          source={logoHorizon.src}
          style={{
            height: 40,
            width: 40 / logoHorizon.ratio,
            marginLeft: 20,
            marginVertical: 40,
          }}
        />
        <View
          style={{
            ...theme.boxes.rowBetweenCenter,
            height: 50,
            paddingHorizontal: 20,
          }}>
          <Text
            style={{
              ...theme.fontSizes.largest,
              paddingVertical: 0,
              color: theme.colors.black2,
              fontWeight: 'bold',
            }}>
            All agree
          </Text>
          <Pressable
            style={{paddingVertical: 5, paddingLeft: 10}}
            onPress={onPressAll}>
            <Image
              source={
                agreeTerms && agreePrivacy
                  ? icoCheckCircleMint.src
                  : icoCheckCircleGray.src
              }
              style={{width: 30, height: 30}}
            />
          </Pressable>
        </View>
        <View style={s.box}>
          <TouchableOpacity
            style={{...theme.boxes.rowStartCenter, flex: 1, height: '100%'}}
            onPress={() => setAgreeTerms(a => !a)}>
            <Image
              source={agreeTerms ? checkMint.src : checkGray.src}
              style={{width: 25, height: 25 * checkMint.ratio, marginRight: 10}}
            />
            <Text style={s.t}>
              <Text style={{fontWeight: 'normal'}}>(Required)</Text> Terms of
              Service
            </Text>
          </TouchableOpacity>
          <Pressable
            style={{paddingVertical: 5, paddingLeft: 10}}
            onPress={() => {
              navigation.push('Term', {type: 'term'});
            }}>
            <Image
              source={arrowRightGrayThin.src}
              style={{width: 25 / arrowRightGrayThin.ratio, height: 25}}
            />
          </Pressable>
        </View>
        <View style={s.box}>
          <TouchableOpacity
            style={{...theme.boxes.rowStartCenter, flex: 1, height: '100%'}}
            onPress={() => setAgreePrivacy(a => !a)}>
            <Image
              source={agreePrivacy ? checkMint.src : checkGray.src}
              style={{width: 25, height: 25 * checkMint.ratio, marginRight: 10}}
            />
            <Text style={s.t}>
              <Text style={{fontWeight: 'normal'}}>(Required)</Text> Privacy
              Policy
            </Text>
          </TouchableOpacity>
          <Pressable
            style={{paddingVertical: 5, paddingLeft: 10}}
            onPress={() => {
              navigation.push('Term', {type: 'privacy'});
            }}>
            <Image
              source={arrowRightGrayThin.src}
              style={{width: 25 / arrowRightGrayThin.ratio, height: 25}}
            />
          </Pressable>
        </View>

        <View style={s.box}>
          <TouchableOpacity
            style={{...theme.boxes.rowStartCenter, flex: 1, height: '100%'}}
            onPress={() => setAgreeMarketing(a => !a)}>
            <Image
              source={agreeMarketing ? checkMint.src : checkGray.src}
              style={{width: 25, height: 25 * checkMint.ratio, marginRight: 10}}
            />
            <Text style={s.t}>
              <Text style={{fontWeight: 'normal'}}>(Optional)</Text> Agreement
              to receive marketing information
            </Text>
          </TouchableOpacity>
          <Pressable
            style={{paddingVertical: 5, paddingLeft: 10}}
            onPress={() => {
              setShowMarketingContent(s => !s);
            }}>
            <Image
              source={
                showMarketingContent
                  ? arrowUpGrayThin.src
                  : arrowDownGrayThin.src
              }
              style={{width: 25, height: 25 * arrowUpGrayThin.ratio}}
            />
          </Pressable>
        </View>
        {showMarketingContent && (
          <View
            style={{
              width: '100%',
              paddingVertical: 30,
              paddingHorizontal: 45,
              backgroundColor: theme.colors.backgroundGray,
            }}>
            <Text style={s.desc}>{data?.getConfig.getMarket}</Text>
          </View>
        )}
      </ScrollView>
      <View style={{width: '100%', paddingHorizontal: 20, marginBottom: 40}}>
        <BaseButton
          disabled={!agreeTerms || !agreePrivacy}
          size="big"
          onPress={() => {
            if (socialMethod) {
              socialLogin(socialMethod)
                .then(r => {
                  console.log(`::::: Social Login Result ::::`, r);
                  // @ts-ignore
                  const body = {...r, country: Local.getCountry()};
                  console.log(`payload:::::::::::::;;`, body);
                  refBase.current?.startLoading();
                  login({variables: body});
                })
                .catch(e => {
                  console.log(`XXXX Social Login Error XXXX`, e);
                });
            } else navigation.push('SignUp', {agreeMarketing});
          }}
          text="AGREE"
          // textStyle={{fontWeight: 'normal'}}
        />
      </View>

      <Modal visible={visibleLang}>
        <SafeAreaView style={{flex: 1}}>
          <View
            style={{
              height: 60,
              backgroundColor: theme.colors.mint,
              ...theme.center,
            }}>
            <Text style={{...theme.fontSizes.small, color: '#fff'}}>
              Setting langauges
            </Text>
          </View>
          <View style={{flex: 1, ...theme.center, width: '100%'}}>
            {/* Subtitle --> */}
            <View style={{marginTop: 25, width: '90%'}}>
              <View style={{...theme.boxes.rowStartCenter}}>
                {/* <Image source={} style={{}} /> */}
                <Text style={s.label}>Choose a subtitle</Text>
              </View>
              <TouchableOpacity
                onPress={() => setVisibleLang1(true)}
                style={{
                  ...s.input,
                  ...s.border,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{...s.tPlaceholder, color: theme.colors.blackLabel}}>
                  {languageSubtitle.name}
                </Text>
              </TouchableOpacity>
            </View>
            {/* <-- Subtitle */}
            {/* Learn --> */}
            <View style={{marginTop: 25, width: '90%', marginBottom: 100}}>
              <View style={{...theme.boxes.rowStartCenter}}>
                {/* <Image source={} style={{}} /> */}
                <Text style={s.label}>
                  Which language do you want to learn?
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setVisibleLang2(true);
                }}
                style={{
                  ...s.input,
                  ...s.border,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{...s.tPlaceholder, color: theme.colors.blackLabel}}>
                  {languageLearn.name}
                </Text>
              </TouchableOpacity>
            </View>
            {/* <-- Learn */}

            <BaseButton
              disabled={
                // @ts-ignore
                languageSubtitle.value === '' ||
                // @ts-ignore
                languageLearn.value === ''
              }
              text="OK"
              size="big"
              style={{width: '70%'}}
              onPress={() => {
                if (languageLearn.name === '' || languageSubtitle.name === '')
                  return;
                refBase.current?.startLoading();
                // mut
                mutSetLanguage({
                  variables: {session: token, language: languageLearn.value},
                })
                  .then(() =>
                    mutSetSubtitle({
                      variables: {
                        session: token,
                        subtitle: languageSubtitle.value,
                      },
                    }),
                  )
                  .then(() => {
                    // @ts-ignore
                    r_setMe(m => ({
                      ...m,
                      language: languageLearn.name,
                      subtitle: languageSubtitle.name,
                    }));
                    refBase.current?.stopLoading();

                    navigation.reset({
                      index: 1,
                      routes: [{name: 'MainTab'}],
                    });
                  })
                  .catch(e => {
                    console.log(`MutLangauge Error:::::: `, JSON.stringify(e));
                  });
              }}
            />
          </View>
        </SafeAreaView>

        <Selector
          value={languageSubtitle}
          visible={visibleLang1}
          onCancel={() => {
            setVisibleLang1(false);
          }}
          onSelect={selected => {
            console.log(`selectedSubtitle: `, selected);
            setLanguageSubtitle(selected);
            setVisibleLang1(false);
          }}
          type={1}
        />
        <Selector
          value={languageLearn}
          visible={visibleLang2}
          onCancel={() => {
            setVisibleLang2(false);
          }}
          onSelect={selected => {
            console.log(`selectedLearn: `, selected);
            setLanguageLearn(selected);
            setVisibleLang2(false);
          }}
          type={2}
        />
      </Modal>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  box: {
    ...theme.boxes.rowBetweenCenter,
    paddingHorizontal: 20,
    height: 60,
  },
  t: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: theme.colors.black2,
    fontWeight: 'bold',
  },
  desc: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: theme.colors.gray,
  },

  label: {
    ...theme.fontSizes.small,
    // paddingVertical: 0,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    height: 30,
    color: '#333',
    paddingHorizontal: 5,
    ...theme.fontSizes.small,
    paddingVertical: 0,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tPlaceholder: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#aaa',
  },
});

export default SignUpAgreementScreen;
