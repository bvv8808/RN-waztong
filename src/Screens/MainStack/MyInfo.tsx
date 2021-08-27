import React, {useEffect, useState} from 'react';
import {useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuItem from '~/components/MenuItem';
import StackHeader from '~/components/StackHeader';
import theme from '~/lib/theme';
import toast from 'react-native-simple-toast';
import {validPassword} from '~/lib/validator';
import {useRecoilValue} from 'recoil';
import {__loginType, __myInfo, __token} from '~/lib/recoil/atom';
import {useBMutation} from '~/lib/gql/gqlBuilder';
import {useResetData} from '~/lib/hooks/useResetData';
import AsyncStorage from '@react-native-community/async-storage';

interface Props {
  navigation: any;
}

const MyInfoScreen = ({navigation}: Props) => {
  const me = useRecoilValue(__myInfo);
  const loginType = useRecoilValue(__loginType);
  const token = useRecoilValue(__token);
  const resetAll = useResetData();

  const [pwModifing, setPwModifing] = useState(false);
  const [loginTypeFullname, setLoginTypeFullname] = useState('');

  const curPassword = useRef('');
  const newPassword = useRef('');
  const newPassword2 = useRef('');

  const [mutSetPassword] = useBMutation('password');

  useEffect(() => {
    AsyncStorage.getItem('loginType').then(type => {
      switch (type) {
        case 'NO':
          setLoginTypeFullname('email');
          break;
        case 'AP':
          setLoginTypeFullname('apple');
          break;
        case 'FA':
          setLoginTypeFullname('facebook');
          break;
        case 'GO':
          setLoginTypeFullname('google');
          break;
        case 'KA':
          setLoginTypeFullname('kakao');
          break;
        default:
          setLoginTypeFullname('');
      }
    });
  }, []);

  const logout = () => {
    // reset recoil
    // reset storage
    resetAll();
    navigation.reset({
      index: 1,
      routes: [{name: 'SignInHome'}],
    });
  };

  const modifyPassword = () => {
    console.log(`curPassword: `, curPassword.current);
    console.log(`newPassword: `, newPassword.current);
    console.log(`newPassword2: `, newPassword2.current);

    if (!curPassword.current.length) {
      toast.show('Please enter your current password', 1);
      return;
    }
    const valid1 = validPassword(curPassword.current);
    if (valid1 !== 'pass') {
      toast.show('Password must be 6-13 numbers and letters', 1);
      return;
    }
    if (!newPassword.current.length) {
      toast.show('Please enter your new password', 1);
      return;
    }
    const valid2 = validPassword(newPassword.current);
    if (valid2 !== 'pass') {
      toast.show('Password must be 6-13 numbers and letters', 1);
      return;
    }

    if (!newPassword2.current.length) {
      toast.show('Please confirm your new password', 1);
      return;
    }
    if (newPassword.current !== newPassword2.current) {
      toast.show('Your new passwords are not matched', 1);
      return;
    }

    // 패스워드 변경 요청
    mutSetPassword({
      variables: {
        session: token,
        current: curPassword.current,
        change: newPassword.current,
      },
    })
      .then(() => {
        console.log(`변경 성공`);
        setPwModifing(false);
        toast.show('Successly changed', 1);
      })
      .catch(e => {
        toast.show(e.message, 1);
        console.log(`변경 실패 `, JSON.stringify(e));
      });
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader title="My page" navigation={navigation} />
      <ScrollView>
        <Text style={s.tLargestDarkMint}>My Information</Text>
        <MenuItem
          title="Name"
          other={() => <Text style={theme.menuText}>{me.name}</Text>}
        />

        {/* PW --> */}
        {loginTypeFullname === 'email' && (
          <View
            style={[
              {
                ...theme.boxes.rowBetweenCenter,
                paddingHorizontal: 20,
                minHeight: 60,
                width: '100%',
              },
              pwModifing && {alignItems: 'flex-start'},
            ]}>
            <View style={{...theme.center, height: 60}}>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  paddingVertical: 0,
                  color: '#888',
                  // marginTop: pwModifing ? 20 : 0,
                }}>
                password
              </Text>
            </View>
            {pwModifing ? (
              <View
                style={{
                  flex: 1,
                  paddingLeft: 30,
                }}>
                <TextInput
                  style={s.input}
                  placeholder="Current password"
                  onChangeText={t => (curPassword.current = t)}
                  secureTextEntry
                />
                <TextInput
                  style={s.input}
                  placeholder="New password"
                  onChangeText={t => (newPassword.current = t)}
                  secureTextEntry
                />
                <TextInput
                  style={s.input}
                  placeholder="New password confirmation"
                  onChangeText={t => (newPassword2.current = t)}
                  secureTextEntry
                />
                <View
                  style={{
                    alignSelf: 'flex-end',
                    ...theme.boxes.rowCenter,
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    style={[
                      s.btnPassword,
                      {backgroundColor: theme.colors.black5, marginRight: 5},
                    ]}
                    onPress={() => {
                      curPassword.current = '';
                      newPassword.current = '';
                      newPassword2.current = '';
                      setPwModifing(false);
                    }}>
                    <Text style={s.tPassword}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.btnPassword,
                      {backgroundColor: theme.colors.mint},
                    ]}
                    onPress={modifyPassword}>
                    <Text style={[s.tPassword]}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setPwModifing(true)}
                style={{
                  paddingVertical: 5,
                  paddingLeft: 15,
                }}>
                <View
                  style={{
                    ...theme.center,
                    backgroundColor: theme.colors.black5,
                    borderRadius: 15,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{
                      ...theme.fontSizes.smallest,
                      paddingVertical: 0,
                      color: '#fff',
                    }}>
                    MODIFY
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* <-- PW */}

        <MenuItem
          title="Email"
          other={() => <Text style={theme.menuText}>{me.email}</Text>}
        />
        <MenuItem
          title="Member code"
          other={() => (
            <Text style={theme.menuText}>
              {me.myIndexCode.padStart(5, '0')}
            </Text>
          )}
        />
        <MenuItem
          title="Sign up"
          other={() => <Text style={theme.menuText}>{loginTypeFullname}</Text>}
        />
        <MenuItem title="Log out" onPress={logout} />
        <MenuItem
          title="Delete account"
          onPress={() => {
            navigation.push('leave');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  tLargestDarkMint: {
    ...theme.texts.largestTitle,
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 30,
  },

  input: {
    width: '100%',
    height: 30,
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: 20,
    marginBottom: 5,
    paddingHorizontal: 10,
  },

  btnPassword: {
    width: 100,
    height: 25,
    ...theme.center,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tPassword: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
  },
});

export default MyInfoScreen;
