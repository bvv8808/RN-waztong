import React, {useEffect, useState} from 'react';
import {useRef} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseButton from '~/base/BaseButton';
import theme from '~/lib/theme';
import DatePickerAndroid from '@react-native-community/datetimepicker';
import DatePickerIOS from 'react-native-date-picker';
import {arrowLeftWhite} from '~/images';
import Selector from '~/components/Selector';
import {validEmail, validPassword} from '~/lib/validator';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import {StackScreenProps} from '@react-navigation/stack';
import {TLang, TRootStackParams} from '~/lib/types';
import BaseLayout from '~/base/BaseLayout';
import toast from 'react-native-simple-toast';
import Local from 'react-native-localize';

// interface Props {
//   navigation: any;
//   route: any;
// }

const SignUpScreen = ({
  navigation,
  route,
}: StackScreenProps<TRootStackParams, 'SignUp'>) => {
  // console.log(`route:: `, route.params);
  const [visiblePicker, setVisiblePicker] = useState(false);
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
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');
  const [active, setActive] = useState(false);
  const [birth, setBirth] = useState('');
  const [email, setEmail] = useState('');
  const [availableEmail, setAvailableEmail] = useState('');
  const [name, setName] = useState('');
  const [availableName, setAvailableName] = useState('');
  const [pw, setPw] = useState('');
  const [pwRe, setPwRe] = useState('');
  const [passwordValidResult, setPasswordValidResult] = useState('');

  const [checkEmail, {data: emailResult, error: emailCheckError}] =
    useBLazyQuery('check');
  const [checkName, {data: nameResult, error: nameCheckError}] =
    useBLazyQuery('check');
  const [mutSignUp] = useBMutation('signup');
  // const [checkName, {data: nameResult, error: nameCheckError}] =
  //   useLazyQuery(gql`
  //     query ($name: String) {
  //       checkDuplicate(name: $name)
  //     }
  //   `);

  useEffect(() => {
    console.log(`#1`);
    if (!(availableEmail.length && availableEmail === email)) {
      console.log(`#2`);
      setActive(false);
      return;
    }
    if (passwordValidResult !== 'pass' || pw !== pwRe) {
      console.log(`#3`);
      setActive(false);
      return;
    }
    if (!availableName.length || availableName !== name) {
      console.log(`#4`);
      setActive(false);
      return;
    }
    if (!languageLearn.name.length || !languageSubtitle.name.length) {
      console.log(`#5`);
      setActive(false);
      return;
    }
    setActive(true);
  }, [
    email,
    availableEmail,
    passwordValidResult,
    pw,
    pwRe,
    name,
    availableName,
    languageSubtitle,
    languageLearn,
  ]);

  useEffect(() => {
    if (pw.length) setPasswordValidResult(validPassword(pw));
  }, [pw]);

  useEffect(() => {
    if (nameResult) {
      if (nameResult.checkDuplicate) {
        setAvailableName(name);
        setDisplayName('You can use this name');
      }
    }
  }, [nameResult]);
  useEffect(() => {
    if (emailResult) {
      console.log(`r: `, emailResult);
      if (emailResult.checkDuplicate) {
        setDisplayEmail('You can use this email');
        setAvailableEmail(email);
      }
    }
  }, [emailResult]);

  useEffect(() => {
    if (nameCheckError)
      console.log(`nameCheckErr:: `, JSON.stringify(nameCheckError));
    if (emailCheckError)
      console.log(`emailCheckErr:: `, JSON.stringify(emailCheckError));

    const msg = nameCheckError?.message || emailCheckError?.message || '';
    if (!msg) return;
    toast.show(msg, 1);
  }, [nameCheckError, emailCheckError]);

  const signUp = () => {
    // console.log(`email: `, email);
    // console.log(`pw: `, pw);
    // console.log(`name: `, name);
    // console.log(`birth: `, birth);
    // console.log(`subtitle: `, languageSubtitle);
    // console.log(`learn: `, languageLearn);

    // console.log(`country: `, Local.getCountry());

    refBase.current?.startLoading();

    let body = {
      email,
      password: pw,
      name,
      birth,
      subtitle: languageSubtitle.value,
      language: languageLearn.value,
      country: Local.getCountry(),
      ad: route.params.agreeMarketing ?? false,
    };

    console.log(`body:: `, body);

    mutSignUp({
      variables: body,
    })
      .then(() => {
        console.log(`Suceess`);
        refBase.current?.stopLoading();
        refBase.current?.showModalInfo(
          'Email authentication is required.\nPlease check the authentication mail in the mailbox',
          () => {
            navigation.pop(2);
          },
        );
      })
      .catch(e => {
        console.log('FAIL@@@@ ', JSON.stringify(e));
        refBase.current?.stopLoading();
        toast.show(e.message, 1);
      });
  };

  const refBase = useRef<BaseLayout>(null);
  return (
    <BaseLayout style={{flex: 1, backgroundColor: '#fff'}} ref={refBase}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={'padding'}
        enabled={Platform.OS === 'ios'}>
        <View style={s.header}>
          <Pressable
            onPress={() => {
              navigation.pop();
            }}
            style={{width: 50, height: 50, ...theme.center}}>
            <Image
              source={arrowLeftWhite.src}
              style={{width: 20 / arrowLeftWhite.ratio, height: 20}}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={s.headerTitle}>Sign Up</Text>
          <View style={{width: 50}} />
        </View>
        <ScrollView>
          <View style={{width: '90%', alignSelf: 'center'}}>
            {/* Email --> */}
            <View style={{marginTop: 25}}>
              <View style={theme.boxes.rowBetweenCenter}>
                <Text style={s.label}>Email</Text>
                <Text
                  style={[
                    s.tDisplay,
                    (displayEmail === 'x' ||
                      (email.length > 0 && validEmail(email) !== 'pass')) && {
                      color: theme.colors.redAlert,
                    },
                  ]}>
                  {displayEmail === 'x' ||
                  (email.length > 0 && validEmail(email) !== 'pass')
                    ? 'You cannot use this email'
                    : displayEmail}
                </Text>
              </View>
              <View
                style={{
                  ...theme.boxes.rowBetweenCenter,
                  ...s.border,
                }}>
                <TextInput
                  style={{...s.input, flex: 1, marginRight: 5}}
                  placeholder="waztong@waztong.com"
                  onChangeText={t => setEmail(t)}
                />
                {validEmail(email) === 'pass' && (
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(`avai`, availableEmail, email);
                      availableEmail !== email &&
                        email.length &&
                        checkEmail({variables: {email}});
                    }}
                    style={{
                      width: 50,
                      height: 20,
                      borderRadius: 20,
                      backgroundColor: theme.colors.mint,
                      ...theme.center,
                    }}>
                    <Text style={s.tSmall}>Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* <-- Email */}
            {/* pw --> */}
            <View style={{marginTop: 25}}>
              <View style={{...theme.boxes.rowBetweenCenter}}>
                <Text style={s.label}>Password</Text>
                <Text
                  style={[
                    {
                      ...theme.fontSizes.smallest,
                      paddingVertical: 0,
                    },
                    passwordValidResult !== 'pass' && {
                      color: theme.colors.redAlert,
                    },
                  ]}>
                  {passwordValidResult === 'too short'
                    ? 'Password must more than 6 letters'
                    : passwordValidResult === 'invalid'
                    ? 'Not enough for password'
                    : ''}
                </Text>
              </View>
              <TextInput
                style={{...s.input, ...s.border, flex: 1}}
                placeholder="6 to 13 digits including letters and numbers"
                onChangeText={t => setPw(t)}
                secureTextEntry
                maxLength={13}
              />
            </View>
            <View style={{marginTop: 25}}>
              <View style={{...theme.boxes.rowBetweenCenter}}>
                <Text style={s.label}>Retype Password</Text>
                <Text
                  style={{
                    ...theme.fontSizes.smallest,
                    paddingVertical: 0,
                    color: theme.colors.redAlert,
                  }}>
                  {pw !== pwRe && pwRe.length && pw.length
                    ? 'Passwords do not match'
                    : ''}
                </Text>
              </View>
              <TextInput
                style={{...s.input, ...s.border, flex: 1}}
                placeholder="6 to 13 digits including letters and numbers"
                onChangeText={t => setPwRe(t)}
                secureTextEntry
                maxLength={13}
              />
            </View>
            {/* <-- pw */}
            {/* Username --> */}
            <View style={{marginTop: 25}}>
              <View style={theme.boxes.rowBetweenCenter}>
                <Text style={s.label}>Username</Text>
                <Text
                  style={[
                    s.tDisplay,
                    displayName === 'x' && {color: theme.colors.redAlert},
                  ]}>
                  {displayName === 'x'
                    ? 'You cannot use this name'
                    : displayName}
                </Text>
              </View>
              <View
                style={{
                  ...theme.boxes.rowBetweenCenter,
                  ...s.border,
                }}>
                <TextInput
                  style={{...s.input, flex: 1, marginRight: 5}}
                  placeholder="waztong"
                  onChangeText={t => setName(t)}
                />
                <TouchableOpacity
                  onPress={() => {
                    name.length && checkName({variables: {name}});
                  }}
                  style={{
                    width: 50,
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: theme.colors.mint,
                    ...theme.center,
                  }}>
                  <Text style={s.tSmall}>overlap</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* <-- Username */}
            {/* Birth --> */}
            <View style={{marginTop: 25}}>
              <View style={{...theme.boxes.rowBetweenCenter}}>
                <Text style={s.label}>Date of birth</Text>
                <View
                  style={{
                    width: 50,
                    height: 20,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.colors.mint,
                    ...theme.center,
                  }}>
                  <Text style={[s.tSmall, {color: theme.colors.mint}]}>
                    option
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setVisiblePicker(true);
                }}
                style={{
                  ...s.input,
                  ...s.border,
                  justifyContent: 'center',
                }}>
                {birth.length > 0 ? (
                  <Text style={{...s.tPlaceholder, color: '#000'}}>
                    {birth}
                  </Text>
                ) : (
                  <Text style={s.tPlaceholder}>Select your birthday</Text>
                )}
              </TouchableOpacity>
            </View>
            {/* <-- Birth */}
            {/* Subtitle --> */}
            <View style={{marginTop: 25}}>
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
            <View style={{marginTop: 25}}>
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
              disabled={!active}
              size="big"
              text="sign up"
              onPress={signUp}
              style={{marginTop: 80, marginBottom: 40}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === 'android' ? (
        visiblePicker && (
          <DatePickerAndroid
            value={new Date()}
            onChange={(e: Event, date: Date | undefined) => {
              setVisiblePicker(false);
              if (date) {
                const newDate =
                  date.getFullYear() +
                  '-' +
                  (date.getMonth() + 1).toString().padStart(2, '0') +
                  '-' +
                  date.getDate().toString().padStart(2, '0');

                setBirth(newDate);
              }
            }}
          />
        )
      ) : (
        <Modal visible={visiblePicker} transparent>
          <View
            style={{
              ...theme.center,
              height: '100%',
            }}>
            <View
              onTouchEnd={() => {
                setVisiblePicker(false);
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
            />
            <View style={{backgroundColor: '#076097', borderRadius: 13}}>
              <DatePickerIOS
                textColor="#fff"
                date={undefined}
                onDateChange={date => {
                  const newDate =
                    date.getFullYear() +
                    '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') +
                    '-' +
                    date.getDate().toString().padStart(2, '0');

                  setBirth(newDate);
                }}
                androidVariant="nativeAndroid"
                mode="date"
              />
            </View>
          </View>
        </Modal>
      )}

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
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  header: {
    height: 50,
    ...theme.boxes.rowBetweenCenter,
    backgroundColor: theme.colors.mint,
  },
  headerTitle: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  tSmall: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: '#fff',
  },
  tPlaceholder: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#aaa',
  },
  tDisplay: {
    ...theme.fontSizes.small,
    color: theme.colors.mint,
  },
});

export default SignUpScreen;
