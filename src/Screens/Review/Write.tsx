import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import theme from '~/lib/theme';
import ImageCropPicker from 'react-native-image-crop-picker';
import toast from 'react-native-simple-toast';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {
  __preventReviewRefesh,
  __refreshReviewList,
  __token,
} from '~/lib/recoil/atom';
import {icoAddImg, icoX} from '~/images';
import StackHeader from '~/components/StackHeader';
import {StackScreenProps} from '@react-navigation/stack';
import {TReviewStackParams} from '~/lib/types';
import BaseButton from '~/base/BaseButton';
import {useBMutation} from '~/lib/gql/gqlBuilder';

const ReviewWriteScreen = ({
  navigation,
}: StackScreenProps<TReviewStackParams, 'reviewWrite'>) => {
  const token = useRecoilValue(__token);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imgs, setImgs] = useState<string[]>(['', '', '', '']);

  const [mutWrite] = useBMutation('writeReview');

  const onPressOK = () => {
    // ## Write
    if (!title.length) {
      toast.show('Please Enter a title', 0.7);
      return;
    } else if (!content.length) {
      toast.show('Please Enter a content', 0.7);
      return;
    }

    mutWrite({
      variables: {
        session: token,
        subject: title,
        content,
        img: imgs.filter(i => i !== ''),
      },
    })
      .then(() => {
        navigation.pop();
      })
      .catch(({message: msg}) => {
        // const translatedMsg = trans(msg, lang);
        console.log(`error:: `, msg);
        toast.show(msg.toString(), 1);
      });

    console.log(`::: `, token, title, content);
  };
  return (
    //
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={'padding'}
        enabled={Platform.OS === 'ios'}>
        <ScrollView>
          <View
            style={{
              position: 'relative',
            }}>
            {/* Header */}
            <StackHeader title="Real time review" navigation={navigation} />

            {/* Content */}

            <View style={{width: '100%'}}>
              <View style={s.contentWrapper}>
                <View
                  style={{
                    width: '90%',
                    height: '100%',
                    alignSelf: 'center',
                  }}>
                  <TextInput
                    style={{
                      ...s.input,
                      height: 40,
                      marginTop: 60,
                      color: '#333',
                    }}
                    placeholder="Please enter a title..."
                    placeholderTextColor="#aeaeae"
                    onChangeText={t => setTitle(t)}
                  />
                  <TextInput
                    multiline
                    style={{
                      ...s.input,
                      height: 200,
                      marginVertical: 20,
                      color: '#333',
                      textAlignVertical: 'top',
                    }}
                    placeholder="Please enter your content..."
                    placeholderTextColor="#aeaeae"
                    onChangeText={t => setContent(t)}
                  />
                  <Text
                    style={{
                      ...theme.fontSizes.medium,
                      paddingVertical: 0,
                      color: theme.colors.black5,
                    }}>
                    Please register a picture{' '}
                    <Text
                      style={{
                        ...theme.fontSizes.smallest,
                        paddingVertical: 0,
                        color: theme.colors.textGray,
                      }}>
                      (up to 4 photos)
                    </Text>
                  </Text>
                  <View
                    style={{
                      height: 120,
                      borderWidth: 0,
                      ...theme.boxes.rowBetweenCenter,
                    }}>
                    {imgs.map((i, idx) => {
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => {
                            if (!i.length)
                              ImageCropPicker.openPicker({
                                width: 400,
                                height: 400,
                                cropping: true,
                                includeBase64: true,
                                forceJpg: true,
                                // cropperCircleOverlay: true,
                              }).then((img: any) => {
                                setImgs(imgs => {
                                  let copied = imgs.slice();
                                  copied[idx] = img.data;
                                  return copied;
                                });
                              });
                            else {
                              // 이미지가 이미 있을 때 터치 시
                              setImgs(imgs => {
                                let copied = imgs.slice();
                                copied[idx] = '';
                                return copied;
                              });
                            }
                          }}>
                          {i.length ? (
                            <>
                              <Image
                                source={{uri: `data:image/png;base64, ${i}`}}
                                style={{
                                  width: 70,
                                  height: 70,
                                  borderRadius: 10,
                                  borderWidth: 3,
                                  borderColor: '#fff',
                                }}
                              />
                              <View
                                style={{
                                  backgroundColor: '#aeaeae',
                                  width: 15,
                                  height: 15 * icoX.ratio,
                                  borderRadius: 20,
                                  position: 'absolute',
                                  right: 7,
                                  bottom: 7,
                                  ...theme.center,
                                }}>
                                <Image
                                  source={icoX.src}
                                  style={{width: '100%', height: '100%'}}
                                />
                              </View>
                            </>
                          ) : (
                            <Image
                              source={icoAddImg.src}
                              style={{
                                width: 70,
                                height: 70,
                              }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <BaseButton
                    text="Post registration"
                    onPress={onPressOK}
                    size="big"
                    style={{marginTop: 30}}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  contentWrapper: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    // backgroundColor: theme.colors.,
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    ...theme.fontSizes.small,
    color: theme.colors.black,
  },
  btnOK: {
    width: '100%',
    height: 30,
    borderRadius: 20,
    backgroundColor: theme.colors.mainRed,
    ...theme.center,
    marginVertical: 20,
  },
  textOK: {
    color: '#fff',
    fontWeight: 'bold',
    ...theme.fontSizes.small,
    paddingVertical: 0,
  },
});

// const s = StyleSheet.create({
//   boldBigBlack: {
//     ...theme.fontSizes.large,
//     paddingVertical: 0,
//     lineHeight: Platform.OS === 'ios' ? 18 : 14,
//     color: theme.colors.black,
//     fontWeight: 'bold',
//   },
//   smallBlack: {
//     ...theme.fontSizes.small,
//     color: theme.colors.black,
//     paddingVertical: 0,
//     fontWeight: 'bold',
//   },
// });

export default ReviewWriteScreen;
