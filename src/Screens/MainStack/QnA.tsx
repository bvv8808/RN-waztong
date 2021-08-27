import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {useRef} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import BaseButton from '~/base/BaseButton';
import BaseLayout from '~/base/BaseLayout';
import StackHeader from '~/components/StackHeader';
import {profileEmptyGray2} from '~/images';
import {useBMutation} from '~/lib/gql/gqlBuilder';
import {__myInfo, __token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TMainStackParams} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {validEmail} from '~/lib/validator';
import trans, {transText} from '~/lib/lang/trans';
import {toShortUpper} from '~/lib/util';

const QnAScreen = ({navigation}: StackScreenProps<TMainStackParams, 'qna'>) => {
  const me = useRecoilValue(__myInfo);
  const token = useRecoilValue(__token);

  const [visibleSuccess, setVisibleSuccess] = useState(false);

  const [mutSend] = useBMutation('qna');

  const inputEmail = useRef('');
  const inputTitle = useRef('');
  const inputContent = useRef('');

  const send = () => {
    console.log(
      `input:: `,
      inputEmail.current,
      inputTitle.current,
      inputContent.current,
    );

    if (!inputEmail.current.length) {
      toast.show('Please enter your email', 1);
      return;
    }
    if (validEmail(inputEmail.current) !== 'pass') {
      toast.show('Invalid email format', 1);
      return;
    }
    if (!inputTitle.current.length) {
      toast.show('Please enter a title', 1);
      return;
    }
    if (!inputContent.current.length) {
      toast.show('Please enter a content', 1);
      return;
    }

    mutSend({
      variables: {
        session: token,
        subject: inputTitle.current,
        content: inputContent.current,
        email: inputEmail.current,
      },
    })
      .then(() => {
        // 모달 띄우기
        console.log(`Successs`);
        setVisibleSuccess(true);
      })
      .catch(e => {
        console.log(`Send Error :::: `, JSON.stringify(e), token);
        toast.show(e.message);
      });
  };

  const SectionTitle = ({text}: {text: string}) => (
    <View style={{...theme.boxes.rowStartCenter}}>
      <Text
        style={{
          ...theme.fontSizes.ultra,
          paddingVertical: 0,
          color: theme.colors.mint,
        }}>
        •
      </Text>
      <Text
        style={{
          ...theme.fontSizes.small,
          color: theme.colors.black5,
        }}>
        {text}
      </Text>
    </View>
  );
  return (
    <BaseLayout style={{backgroundColor: '#fff'}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={'padding'}
        enabled={Platform.OS === 'ios'}>
        <ScrollView>
          <StackHeader title="1:1 Q&A" navigation={navigation} />
          <View style={{paddingHorizontal: 20, width: '100%'}}>
            {/* Member Information --> */}
            <View style={{...theme.boxes.rowStartCenter, marginVertical: 15}}>
              <Image
                source={me.img.length ? {uri: me.img} : profileEmptyGray2.src}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 60,
                  marginRight: 10,
                }}
              />

              <View style={{alignItems: 'flex-start'}}>
                <Text style={s.tTitle}>Member Information</Text>
                <View
                  style={{
                    paddingHorizontal: 20,
                    backgroundColor: theme.colors.mint,
                    borderRadius: 20,
                    paddingVertical: 2,
                  }}>
                  <Text style={s.tName}>
                    {me.name || 'Waztong'} (code:{' '}
                    {me.myIndexCode.padStart(5, '0') || '0000'})
                  </Text>
                </View>
              </View>
            </View>
            {/* <-- Member Information */}

            <SectionTitle text="Your email (We will reply to your email asap!)" />
            <TextInput
              style={{
                backgroundColor: theme.colors.backgroundGray,
                height: 40,
                paddingHorizontal: 15,
                borderRadius: 25,
                color: theme.colors.black4,
                letterSpacing: 1,
                marginTop: 5,
                marginBottom: 20,
                ...theme.fontSizes.small,
              }}
              placeholder="Please enter your email address"
              placeholderTextColor="#aeaeae"
              onChangeText={t => (inputEmail.current = t)}
              defaultValue={me.email}
            />

            <SectionTitle text="Title" />
            <TextInput
              style={{
                backgroundColor: theme.colors.backgroundGray,
                height: 40,
                paddingHorizontal: 15,
                borderRadius: 25,
                color: theme.colors.black4,
                letterSpacing: 1,
                marginTop: 5,
                marginBottom: 20,
                ...theme.fontSizes.small,
              }}
              placeholder="Please enter a title"
              placeholderTextColor="#aeaeae"
              onChangeText={t => (inputTitle.current = t)}
              // defaultValue={me.email}
            />

            <SectionTitle text="Question" />
            <TextInput
              style={{
                backgroundColor: theme.colors.backgroundGray,
                height: 200,
                paddingTop: 15,
                paddingHorizontal: 15,
                borderRadius: 25,
                color: theme.colors.black4,
                letterSpacing: 1,
                marginTop: 5,
                marginBottom: 50,
                ...theme.fontSizes.small,
                textAlignVertical: 'top',
              }}
              multiline
              placeholder="Please enter a title"
              placeholderTextColor="#aeaeae"
              onChangeText={t => (inputContent.current = t)}
              // defaultValue={me.email}
            />

            <BaseButton size="big" text="SEND" onPress={send} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={visibleSuccess} transparent>
        <View
          style={{
            width: '100%',
            height: '100%',
            ...theme.center,
            backgroundColor: '#00000088',
          }}>
          <View
            style={{
              alignItems: 'center',
              width: '80%',
              backgroundColor: '#fff',
              borderRadius: 13,
            }}>
            <Text
              style={{
                ...theme.fontSizes.medium,
                color: theme.colors.black5,
                marginVertical: 30,
              }}>
              {transText('SuccessSend', toShortUpper(me.subtitle))}
            </Text>
            <View style={{height: 50}}>
              <BaseButton
                size="small"
                text="OK"
                onPress={() => {
                  setVisibleSuccess(false);
                  navigation.pop();
                }}
                style={{paddingVertical: 0, paddingHorizontal: 50}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  tTitle: {
    ...theme.fontSizes.ultra,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: theme.colors.black4,
  },
  tName: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
  },
});

export default QnAScreen;
