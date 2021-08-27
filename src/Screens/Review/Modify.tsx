import React, {createRef, useEffect, useMemo, useState} from 'react';
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

import {arrowLeftWhite, icoAddImg, icoX} from '~/images';
import theme from '~/lib/theme';
import ImageCropPicker from 'react-native-image-crop-picker';
import toast from 'react-native-simple-toast';
import {gql, useMutation} from '@apollo/client';
import {useRecoilValue} from 'recoil';
import {__token} from '~/lib/recoil/atom';
import {StackScreenProps} from '@react-navigation/stack';
import {TReviewStackParams} from '~/lib/types';
import StackHeader from '~/components/StackHeader';
import BaseButton from '~/base/BaseButton';

const screenWidth = Dimensions.get('screen').width;
const iconWidth = 22;

const ReviewModifyScreen = ({
  navigation,
  route,
}: StackScreenProps<TReviewStackParams, 'reviewModify'>) => {
  const reviewData = useMemo(() => route.params.reviewData, []);

  const token = useRecoilValue(__token);
  const [title, setTitle] = useState(reviewData.subject);
  const [content, setContent] = useState(reviewData.content);
  const [imgs, setImgs] = useState<any[]>(
    [
      ...reviewData.pics.map((p, i) => [i, p]),
      [-1, ''],
      [-1, ''],
      [-1, ''],
      [-1, ''],
    ].slice(0, 4),
  );
  const [deleteIdxs, setDeleteIdxs] = useState<number[]>([]);
  const [mutModify] = useMutation(gql`
    mutation ($img: [String]!, $deleteImg: [Int], $subject: String!, $content: String!) {
      setLive(session: "${token}", subject: $subject, content: $content, img: $img, idx: ${reviewData.idx}, deleteImg: $deleteImg )
    }
  `);

  const onPressOK = () => {
    // ## Write
    if (!title.length) {
      toast.show('Please Enter a title', 0.7);
      return;
    } else if (!content.length) {
      toast.show('Please Enter a content', 0.7);
      return;
    }

    // console.log(`@@ new IMGS @@\n`, deleteIdxs, '\n', imgs);

    const newImgs = imgs.reduce((acc, item) => {
      if (!item[1].length) return acc;
      item[0] === -1 && acc.push(item[1]);
      return acc;
    }, []);
    const body = {
      subject: title,
      content,
      img: newImgs,
      deleteImg: deleteIdxs,
      session: token,
    };
    mutModify({
      variables: body,
    })
      .then(() => {
        console.log(`success`);
        navigation.pop();
        // Actions.pop();
      })
      .catch(({message: msg}) => {
        console.log(`error@@@@@\n`, msg);
        if (msg) toast.show(msg.toString(), 1);
      });
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
                    defaultValue={title}
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
                    defaultValue={content}
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
                        ...theme.fontSizes.small,
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
                    {imgs.map((item, idx) => {
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => {
                            if (!item[1].length)
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
                                  copied[idx] = [-1, img.data];
                                  return copied;
                                });
                              });
                            else {
                              // 이미지가 이미 있을 때 터치 시
                              //   console.log(`item, img`, item, idx, item[0]);

                              if (item[0] !== -1) {
                                setDeleteIdxs(d => {
                                  let copiedIdxs = d.slice();
                                  copiedIdxs.push(item[0]);
                                  return copiedIdxs;
                                });
                              }
                              setImgs(imgs => {
                                let copied = imgs.slice();

                                copied[idx] = [-1, ''];
                                return copied.sort((a, b) => {
                                  if (a[1].length && b[1].length) return 0;
                                  else if (a[1].length && !b[1].length)
                                    return -1;
                                  else return 1;
                                });
                              });
                            }
                          }}>
                          {item[1].length ? (
                            <>
                              <Image
                                source={{
                                  uri:
                                    item[0] === -1
                                      ? `data:image/png;base64, ${item[1]}`
                                      : item[1],
                                }}
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
                    text="Post modify"
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

export default ReviewModifyScreen;
