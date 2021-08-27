import React, {useEffect, useState} from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import {Actions} from 'react-native-router-flux';
// import {arrowLeftBlack2} from '~/images';
import theme from '~/lib/theme';
import {validEmail} from '~/lib/validator';
import {gql, useLazyQuery, useMutation} from '@apollo/client';
// import {trans} from '~/lib/lang';
import store from '~/lib/store';
import toast from 'react-native-simple-toast';
import BaseButton from '~/base/BaseButton';
import BaseLayout from '~/base/BaseLayout';
import {useRef} from 'react';
import {arrowLeftBlack} from '~/images';
import {StackScreenProps} from '@react-navigation/stack';
import {TRootStackParams} from '~/lib/types';

let timer: any = null;

const ForgotScreen = ({
  navigation,
}: StackScreenProps<TRootStackParams, 'Forgot'>) => {
  const [email, setEmail] = useState('');
  const [availableEmail, setAvailableEmail] = useState('');
  const [display, setDisplay] = useState(0);
  const [visibleComplete, setVisibleComplete] = useState(false);

  const [checkEmail, {data, error}] = useLazyQuery(
    gql`
      query ($email: String) {
        checkDuplicate(email: $email)
      }
    `,
    {
      errorPolicy: 'all',
    },
  );

  const [mutForgot, {data: mutResult, error: mutError}] = useLazyQuery(gql`
    query ($email: String!) {
      findPW(email: $email)
    }
  `);

  useEffect(() => {
    if (data) {
      console.log(`#0: `, data);
      if (data.checkDuplicate) {
        // 존재하지 않는 이메일
        console.log(`#2`);
        setDisplay(2);
      }
    }
  }, [data]);

  useEffect(() => {
    if (mutResult)
      refBase.current?.showModalInfo(
        'Your temporary password has been sent to email',
        () => {
          navigation.pop();
        },
      );
  }, [mutResult]);

  useEffect(() => {
    const msg = error?.message || mutError?.message || '';
    if (!msg) return;

    if (msg === 'Exist Email') {
      // 존재하는 이메일
      console.log(`#1`);
      setDisplay(1);
      setAvailableEmail(email);
    } else toast.show(msg, 1);
  }, [error, mutError]);

  const refBase = useRef<BaseLayout>(null);
  return (
    <BaseLayout ref={refBase} style={{flex: 1, backgroundColor: '#fff'}}>
      <View
        style={{
          ...theme.boxes.rowBetweenCenter,
          paddingHorizontal: 20,
          height: 50,
        }}>
        <TouchableOpacity
          style={{paddingRight: 10, paddingVertical: 3}}
          onPress={() => {
            // Actions.pop();
            navigation.pop();
          }}>
          <Image
            source={arrowLeftBlack.src}
            style={{width: 10, height: 10 * arrowLeftBlack.ratio}}
          />
        </TouchableOpacity>
      </View>
      <View style={{width: '90%', alignSelf: 'center'}}>
        <Text
          style={{...theme.fontSizes.ultra, color: '#000', fontWeight: 'bold'}}>
          <Text style={{color: theme.colors.mint}}>• </Text>Forgot Password?
        </Text>
        <Text
          style={{
            ...theme.fontSizes.small,
            color: theme.colors.mint,
            paddingVertical: 0,
          }}>
          Type email address when you signed up, please{'\n'}Temporary password
          will be sent to the email address
        </Text>

        <Text
          style={[
            {
              ...s.display,
              alignSelf: 'flex-end',
              marginTop: 25,
            },
            display === 1 && {
              color: theme.colors.mint,
            },
          ]}>
          {display === 1
            ? 'Email exists.'
            : display === 2
            ? 'Email does not exist.'
            : ''}
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d8d8d8',
            height: 45,
            marginTop: 3,
            marginBottom: 20,
            paddingHorizontal: 20,
            color: '#333',
          }}
          onChangeText={t => {
            setEmail(t);
            setDisplay(0);
            if (timer) clearTimeout(timer);
            if (validEmail(t) === 'pass') {
              timer = setTimeout(() => {
                timer = null;
                checkEmail({variables: {email: t}});
              }, 500);
            }
          }}
        />

        {/* <TouchableOpacity
          disabled={display !== 1}
          style={[
            s.btnSignin,
            display === 1 ? {backgroundColor: theme.colors.mainRed} : {},
          ]}
          onPress={() => {
            // Mutation 실행
            // mutForgot({variables: {email}});
          }}>
          <Text style={s.signin}>Find</Text>
        </TouchableOpacity> */}
        <BaseButton
          text="Find"
          size="big"
          onPress={() => {
            mutForgot({variables: {email: availableEmail}});
          }}
          style={[
            s.btnSignin,
            display === 1 ? {backgroundColor: theme.colors.mint} : {},
          ]}
          disabled={display !== 1 && email !== availableEmail}
        />
      </View>

      <Modal visible={visibleComplete} transparent>
        <View style={{flex: 1, backgroundColor: '#000000aa', ...theme.center}}>
          <View
            style={{
              width: '70%',
              borderRadius: 30,
              backgroundColor: '#fff',
              paddingTop: 30,
              alignItems: 'center',
            }}>
            {/* <View style={{flex: 1, ...theme.center}}> */}
            <Text
              style={{
                ...theme.fontSizes.largest,
                fontWeight: 'bold',
                color: 'black',
              }}>
              Notification
            </Text>
            <Text
              style={{
                ...theme.fontSizes.small,
                color: theme.colors.textGray,
                textAlign: 'center',
                width: '90%',
                marginBottom: 15,
              }}>
              Your temporary password has been sent to email.
            </Text>

            <View
              style={{
                borderTopWidth: 0.5,
                borderColor: theme.colors.grayInMainLight,
                width: '100%',
              }}>
              <TouchableOpacity
                disabled={false}
                style={{
                  ...theme.center,
                  width: '100%',
                  height: 60,
                }}
                onPress={() => {
                  // # press ok
                  setVisibleComplete(false);
                  // Actions.pop();
                }}>
                <Text
                  style={{
                    ...theme.fontSizes.medium,
                    fontWeight: 'bold',
                    color: theme.colors.mint,
                  }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
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
  display: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: theme.colors.redAlert,
  },
});

export default ForgotScreen;
