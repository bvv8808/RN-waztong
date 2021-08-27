import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {View} from 'react-native';
import BaseLayout from '~/base/BaseLayout';
import theme from '~/lib/theme';
import GradientView from 'react-native-linear-gradient';
import {
  arrowRightGrayThin,
  icoCredit,
  icoPlus,
  icoStar,
  moreMenuMembership,
  profileEmpty,
} from '~/images';
import MenuItem from '~/components/MenuItem';
import DisplayCoin from '~/components/DisplayCoin';
import langs from '~/lib/lang/languageList';
import {useRecoilState, useRecoilValue} from 'recoil';
import {__myInfo, __token} from '~/lib/recoil/atom';
import {TLang} from '~/lib/types';
import ActionSheet from 'react-native-actions-sheet';
import {useRef} from 'react';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import toast from 'react-native-simple-toast';
import useUpdateMe from '~/lib/hooks/useUpdateMe';
import * as fs from 'react-native-fs';
import {toShortUpper} from '~/lib/util';

const screenWidth = Dimensions.get('screen').width;

type TMenu = {
  routeName: string;
  name: string;
};
const menus: TMenu[] = [
  {
    routeName: 'MyReviewList',
    name: 'Real time review',
  },
  {
    routeName: 'coinMenu',
    name: 'My coin',
  },
  {
    routeName: 'information',
    name: 'My information',
  },
  {
    routeName: 'qna',
    name: '1:1 Q&A',
  },
  {
    routeName: 'faq',
    name: 'FAQ',
  },
  {
    routeName: 'notice',
    name: 'Notice',
  },
  {
    routeName: 'settings',
    name: 'APP Settings',
  },
];

interface Props {
  navigation: any;
  route: any;
}

const MenuScreen = ({navigation, route}: Props) => {
  const [me, r_setMe] = useRecoilState(__myInfo);
  const token = useRecoilValue(__token);

  const [myLang, setMyLang] = useState<TLang>();

  const [mutChangeImage] = useBMutation('image');
  const refreshMe = useUpdateMe();

  useEffect(() => {
    console.log(`s: `, me.subtitle);
    const mySubtitle = toShortUpper(me.subtitle);
    setMyLang(langs.find(l => l.value === mySubtitle));
  }, [me]);

  useFocusEffect(() => {
    const onBack = () => {
      navigation.navigate('Main');
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  });

  const changePicture = () => {
    refSheet.current?.setModalVisible(false);

    const change = () => {
      ImageCropPicker.openPicker({
        width: 200,
        height: 200,
        cropping: true,
        includeBase64: true,
        forceJpg: true,
        cropperCircleOverlay: true,
      })
        .then((img: any) => {
          console.log(`token:: `, token);
          mutChangeImage({variables: {img: img.data, session: token}})
            .then(() => {
              refreshMe();
            })
            .catch(e => {
              console.error(
                `@@@@@@ Error in Change Image`,
                JSON.stringify(e.graphQLErrors),
              );
              toast.show(e.message, 1);
            });
        })
        .catch(e => {
          console.log(`Image Load Error: `, e);
        });
    };
    setTimeout(change, 300);
  };
  const deletePicture = () => {
    refSheet.current?.setModalVisible(false);
    const execDelete = () => {
      console.log(`token: :::: `, token);
      mutChangeImage({variables: {img: 'delete', session: token}})
        .then(() => {
          refreshMe();
        })
        .catch(e => {
          console.error(`@@@@@@ Error in Change Image`, e);
          toast.show(e.message, 1);
        });
    };
    setTimeout(execDelete, 300);

    // r_setMe(m => ({...m, img: ''}));
  };
  const takePicture = () => {
    refSheet.current?.setModalVisible(false);

    const execTakePicture = async () => {
      await ImageCropPicker.clean();

      ImageCropPicker.openCamera({
        mediaType: 'photo',
      })
        .then(img => {
          console.log('#1', img);
          if (img && img.path)
            return ImageCropPicker.openCropper({
              mediaType: 'photo',
              path: img.path,
              width: 200,
              height: 200,
            });
        })
        .then(img => {
          if (!img) return;
          console.log(`img:::: `, img);
          return fs.readFile(img.path, 'base64');
          // r_setMe(m => ({...m, img: img.path || ''}));
        })
        .then(imgData => {
          if (!imgData) return;

          mutChangeImage({
            variables: {
              img: imgData,
              session: token,
            },
          })
            .then(() => {
              refreshMe();
            })
            .catch(e => {
              console.error(`@@@@@@ Error in Take Image`, JSON.stringify(e));
              toast.show(e.message, 1);
            });
        })
        .catch(e => {
          console.log(`TakePirture Error @@@@@@@@@@@@@@@ `, JSON.stringify(e));
        });
    };
    setTimeout(execTakePicture, 300);
  };

  const refSheet = useRef<ActionSheet>();
  return (
    <BaseLayout>
      <ScrollView nestedScrollEnabled style={{backgroundColor: '#fff'}}>
        <GradientView
          style={{width: '100%'}}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          colors={[theme.colors.ocean, theme.colors.emerald]}>
          <DisplayCoin
            style={{alignSelf: 'flex-end', marginRight: 10, marginTop: 10}}
          />
          {/* Profile ==> */}
          <View style={theme.boxes.rowStartCenter}>
            <TouchableOpacity
              onPress={() => {
                refSheet.current?.setModalVisible(true);
              }}>
              {me.img.length > 0 ? (
                <Image
                  onLoad={({nativeEvent}) => {
                    console.log(Object.keys(nativeEvent));
                    console.log(nativeEvent);
                  }}
                  source={{uri: me.img}}
                  style={{
                    width: 50,
                    height: 50,
                    marginHorizontal: 15,
                    borderRadius: 50,
                  }}
                />
              ) : (
                <>
                  <Image
                    source={profileEmpty.src}
                    style={{width: 50, height: 50, marginHorizontal: 15}}
                  />
                  <Image
                    source={icoPlus.src}
                    style={{
                      position: 'absolute',
                      right: 15,
                      bottom: 0,
                      width: 15,
                      height: 15,
                    }}
                  />
                </>
              )}
            </TouchableOpacity>
            {/* Right --> */}
            <View>
              {/* Subtitle --> */}
              <View style={theme.boxes.rowStartCenter}>
                <Image source={myLang?.img} style={s.imgSubtitle} />
                <Text style={s.tSubtitle}>{myLang?.name.toUpperCase()}</Text>
              </View>
              {/* <-- Subtitle */}

              <Text style={s.tName}>{me.name || 'Waztong'}</Text>
              <Text style={s.tEmail}>{me.email || 'waztong@gmail.com'}</Text>
            </View>
            {/* <-- Right */}
          </View>
          {/* <== Profile */}

          {me.membership.length > 0 ? (
            <View>
              <ImageBackground
                source={moreMenuMembership.src}
                style={{
                  alignSelf: 'center',
                  width: screenWidth,
                  height: screenWidth * moreMenuMembership.ratio,
                  ...theme.boxes.rowCenter,
                  marginTop: 30,
                }}
                resizeMode="contain">
                <Image
                  source={icoStar.src}
                  style={{width: 10, height: 10 * icoStar.ratio}}
                />
                <Text style={s.tMembership}>
                  You are now a{' '}
                  <Text style={{fontWeight: 'normal'}}>WazTong</Text> Member
                </Text>
                <Image
                  source={icoStar.src}
                  style={{width: 10, height: 10 * icoStar.ratio}}
                />
              </ImageBackground>
            </View>
          ) : (
            <View style={s.signupContainer}>
              <Image
                source={icoCredit.src}
                style={s.imgCredit}
                resizeMode="contain"
              />
              <Text style={s.tSignUp}>Sign up for Waztong membereship</Text>
            </View>
          )}

          <View
            style={[
              s.countContainer,
              me.membership.length > 0 && {marginTop: 10},
            ]}>
            <View style={s.countBox}>
              <Text style={s.tCount}>{me.totalLearn}</Text>
              <Text style={s.tCountDesc}>Total Learned</Text>
            </View>
            <View
              style={[s.countBox, {borderLeftWidth: 2, borderRightWidth: 2}]}>
              <Text style={s.tCount}>{me.totalSpoken}</Text>
              <Text style={s.tCountDesc}>Total Spoken</Text>
            </View>
            <View style={s.countBox}>
              <Text style={s.tCount}>{me.totalTest}</Text>
              <Text style={s.tCountDesc}>Total Test Taken</Text>
            </View>
          </View>
        </GradientView>

        {menus.map(m => (
          <MenuItem
            key={m.routeName}
            title={m.name}
            onPress={() => {
              if (m.name === 'Real time review')
                navigation.push(m.routeName, {searchId: me.memberId});
              else navigation.push(m.routeName);
            }}
          />
        ))}
      </ScrollView>

      <ActionSheet
        containerStyle={{backgroundColor: 'transparent'}}
        // @ts-ignore
        ref={refSheet}>
        <View style={{paddingHorizontal: 20}}>
          <TouchableOpacity
            onPress={changePicture}
            style={[
              s.btnSheet,
              {borderTopLeftRadius: 25, borderTopRightRadius: 25},
            ]}>
            <Text style={s.tSheet}>Change Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={deletePicture}
            style={[
              s.btnSheet,
              {
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: theme.colors.borderModal,
              },
            ]}>
            <Text style={s.tSheet}>Delete Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={takePicture}
            style={[
              s.btnSheet,
              {borderBottomLeftRadius: 25, borderBottomRightRadius: 25},
            ]}>
            <Text style={s.tSheet}>Take a Picture</Text>
          </TouchableOpacity>
          <View style={{height: 15}} />
          <TouchableOpacity
            style={[s.btnSheet, {borderRadius: 25}]}
            onPress={() => {
              refSheet.current?.setModalVisible(false);
            }}>
            <Text style={s.tSheet}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  menu: {
    ...theme.boxes.rowBetweenCenter,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  menuName: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
  },
  imgSubtitle: {width: 13, height: 13},
  tSubtitle: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
  },
  tName: {
    ...theme.fontSizes.largest,
    paddingVertical: 3,
    color: '#fff',
  },
  tEmail: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: '#fff',
  },

  signupContainer: {
    width: '90%',
    ...theme.boxes.rowCenter,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 40,
    alignSelf: 'center',
    marginTop: 50,
    paddingVertical: 5,
  },
  imgCredit: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  tSignUp: {
    ...theme.fontSizes.large,
    paddingVertical: 0,
    color: '#fff',
  },
  countContainer: {
    marginTop: 30,
    flexDirection: 'row',
    // borderTopColor: '#ffffff88',
    // height: 50,
  },
  countBox: {
    flex: 1,
    borderTopWidth: 1.5,
    borderColor: '#ffffff66',
    paddingHorizontal: 10,
  },
  tCount: {
    // ...theme.fontSizes.ultra,
    fontSize: 40,
    paddingVertical: 0,
    color: '#ffffffbb',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  tCountDesc: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 25,
  },

  btnSheet: {
    height: 65,
    ...theme.center,
    backgroundColor: '#ffffff',
  },
  tSheet: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: theme.colors.black4,
  },

  tMembership: {
    ...theme.fontSizes.large,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  star: {
    width: 10,
    height: 15,
  },
});

export default MenuScreen;
