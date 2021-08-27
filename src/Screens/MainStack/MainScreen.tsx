import CardView from '@hyeonwoo/react-native-cardview';
import AsyncStorage from '@react-native-community/async-storage';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useRef} from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {useRecoilState, useRecoilValue} from 'recoil';
import BaseLayout from '~/base/BaseLayout';
import CustomDotActive, {Dot} from '~/components/CustomDot';
import DisplayCoin from '~/components/DisplayCoin';
import {
  bannerMainWoman,
  icoMenu,
  logoColor,
  logoWhite2,
  mainBackgrounQna,
  mainBannerMan,
  profileEmpty,
  tutorial1,
  tutorial2,
  tutorial3,
  woman,
} from '~/images';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import langs from '~/lib/lang/languageList';
import {__myInfo, __showTutorial, __token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TMainStackParams, TReview} from '~/lib/types';
import {toFullInitCap, toShortUpper} from '~/lib/util';
import toast from 'react-native-simple-toast';
import BaseButton from '~/base/BaseButton';
import {LogBox} from 'react-native';
import {useCallback} from 'react';

LogBox.ignoreLogs(['source.uri']);

let cntPressed = 0;
let timer: any = null;

const screenWidth = Dimensions.get('screen').width;

const MainScreen = ({
  navigation,
}: StackScreenProps<TMainStackParams, 'Main'>) => {
  const [showTutorial, r_setShowTutorial] = useRecoilState(__showTutorial);
  const [me, r_setMe] = useRecoilState(__myInfo);
  const token = useRecoilValue(__token);

  const focused = useIsFocused();

  const [currentTutorialTab, setCurrentTutorialTab] = useState(0);
  const [myLanguage, setMyLanguage] = useState('EN');
  const [from, setFrom] = useState(0);
  const [endFetching, setEndFetching] = useState(false);
  const [reviewList, setReviewList] = useState<TReview[][]>([]);
  const [feedHeight, setFeedHeight] = useState(0);

  const refBase = useRef<BaseLayout>(null);

  const [loadMainReivews, {data: reviewsData, error: reviewsError}] =
    useBLazyQuery('reviews');

  const [loadMainData, {data: mainData, error: mainError}] =
    useBLazyQuery('main');

  useEffect(() => {
    setMyLanguage(toShortUpper(me.language));
    loadMainData({
      variables: {
        language: toShortUpper(me.language),
        subtitle: toShortUpper(me.subtitle),
      },
    });
  }, [me.language, me.subtitle]);

  useEffect(() => {
    refBase.current?.startLoading();
    loadMainReivews({variables: {from: from, limit: 10, notice: true, token}});
  }, []);

  useEffect(() => {
    if (reviewsData && reviewsData.getLive) {
      console.log(`Fetched!`);
      let cnt = 0;
      let innerArr: TReview[] = [];
      let addArr: TReview[][] = [];
      for (let i = 0; i < reviewsData.getLive.length; i++) {
        innerArr.push(reviewsData.getLive[i]);
        if (++cnt === 2) {
          cnt = 0;
          addArr.push(innerArr);
          innerArr = [];
        }
      }
      if (cnt === 1) addArr.push(innerArr);
      setReviewList(list => [...list, ...addArr]);

      if (reviewsData.getLive.length < 10) {
        setEndFetching(true);
      } else setFrom(f => f + 10);
    }
  }, [reviewsData]);
  // useEffect(() => {
  //   if (mainData && mainData.getMainData) {
  //     console.log(`mainData::: `, mainData.getMainData);
  //     // console.log('##', mainData.getMainData.purchaseImage);
  //   }
  // }, [mainData]);
  useEffect(() => {
    if (reviewsData && mainData) refBase.current?.stopLoading();
  }, [reviewsData, mainData]);

  useEffect(() => {
    const msg = reviewsError?.message || mainError?.message;
    if (msg) {
      toast.show(msg, 1);
      if (reviewsError)
        console.log(`Error in MainReview@@@ `, JSON.stringify(reviewsError));
      if (mainError)
        console.log(`Error in MainData@@@ `, JSON.stringify(mainError));

      refBase.current?.stopLoading();
    }
  }, [reviewsError, mainError]);

  const onBack = useCallback(() => {
    if (!cntPressed++) {
      toast.show('Press again to exit', 1.5);
      timer = setTimeout(() => {
        cntPressed = 0;
      }, 1500);
    } else BackHandler.exitApp();

    return true;
  }, []);
  useEffect(() => {
    // focus 되었을 때
    if (focused) BackHandler.addEventListener('hardwareBackPress', onBack);
    else BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [focused]);

  useEffect(() => {
    AsyncStorage.getItem('didTutorial').then(didTutorial => {
      if (!didTutorial || (didTutorial && didTutorial === 'false')) {
        r_setShowTutorial(true);
      }
    });
  }, []);

  const onEndTutorial = () => {
    AsyncStorage.setItem('didTutorial', 'true').then(() => {
      r_setShowTutorial(false);
    });
  };

  const ReviewFeed = ({review}: {review: TReview}) => {
    return (
      <TouchableOpacity
        onLayout={({nativeEvent: e}) => {
          setFeedHeight(Math.ceil(e.layout.height));
        }}
        activeOpacity={1}
        onPress={() => {
          // Actions.push('liveDetail', {idx: item.idx});
          // @ts-ignore
          navigation.push('MyReviewDetail', {reviewIdx: review.idx});
        }}
        style={{
          width: 120,
        }}>
        {Platform.OS === 'ios' ? (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 15,
              marginBottom: 5,
              backgroundColor: '#eee',
              shadowColor: '#888',
              shadowOffset: {width: 2, height: 2},
              shadowOpacity: 0.9,
              shadowRadius: 3,
            }}>
            {review.pics.length ? (
              <Image
                source={{uri: review.pics[0]}}
                resizeMode="cover"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 15,
                }}
              />
            ) : (
              <Image
                source={logoColor.src}
                resizeMode="contain"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 15,
                  marginBottom: 5,
                }}
              />
            )}
          </View>
        ) : (
          <CardView
            cardElevation={4}
            cornerRadius={15}
            style={{
              width: 120,
              height: 120,
              borderRadius: 15,
              marginBottom: 5,
            }}>
            {review.pics.length ? (
              <Image
                source={{uri: review.pics[0]}}
                resizeMode="cover"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 15,
                }}
              />
            ) : (
              <Image
                source={logoColor.src}
                resizeMode="contain"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 15,
                  marginBottom: 5,
                }}
              />
            )}
          </CardView>
        )}

        <View style={{width: '100%', flexDirection: 'row'}}>
          <Image
            source={
              review.writer?.img?.length
                ? {uri: review.writer.img}
                : profileEmpty.src
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginRight: 5,
            }}
          />
          <Text
            style={{
              flex: 1,
              ...theme.fontSizes.smallest,
              fontWeight: 'bold',
              color: theme.colors.black,
            }}
            numberOfLines={1}>
            {review.writer?.name || ''}
          </Text>
        </View>
        <Text
          style={{
            width: '100%',
            minHeight: 50,
            paddingHorizontal: 5,
            marginTop: 10,
            ...theme.fontSizes.smallest,
            paddingVertical: 0,
            color: theme.colors.grayLv2,
          }}
          numberOfLines={2}>
          {review.subject}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BaseLayout ref={refBase} style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Header --> */}
      <View
        style={{
          height: 60,
          ...theme.boxes.rowBetweenCenter,
          backgroundColor: theme.colors.mint,
        }}>
        <Pressable
          style={{
            width: 60,
            marginRight: 20,
            height: 60,
            ...theme.center,
          }}
          onPress={() => {
            navigation.push('myMenu');
          }}>
          <Image
            source={icoMenu.src}
            style={{width: 25, height: 25}}
            resizeMode="contain"
          />
        </Pressable>
        <Image
          source={logoWhite2.src}
          style={{height: 30, width: 30 / logoWhite2.ratio}}
        />
        <DisplayCoin style={{marginRight: 10}} />
      </View>
      {/* <-- Header */}
      <ScrollView>
        {/* Language --> */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 30,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
          <Text style={s.tLanguage}>TRY EACH LANGUAGE</Text>
          <FlatList
            horizontal
            data={langs}
            renderItem={({item}) => (
              <Pressable
                onPress={() => {
                  item.value !== myLanguage &&
                    r_setMe(m => ({
                      ...m,
                      language: toFullInitCap(item.value),
                    }));
                }}>
                <Image
                  source={item.img}
                  style={[
                    {width: 50, height: 50, marginRight: 10, borderRadius: 50},
                    myLanguage === item.value && {
                      borderWidth: 2,
                      borderColor: theme.colors.mint,
                    },
                  ]}
                />
              </Pressable>
            )}
            keyExtractor={item => item.value}
          />
        </View>
        {/* <-- Language */}

        {/* Speak --> */}
        <Swiper
          style={{height: screenWidth * 0.9 * mainBannerMan.ratio + 90}}
          activeDot={<CustomDotActive />}
          dot={<Dot />}
          paginationStyle={{bottom: 15}}>
          <View key={1} style={{flex: 1, alignItems: 'center'}}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Speak');
              }}
              style={{
                width: screenWidth * 0.8,
                height: screenWidth * 0.8 * bannerMainWoman.ratio,
                marginVertical: 15,
              }}>
              <Image
                source={{
                  uri:
                    mainData?.getMainData?.speakData?.speakDatas[0]?.pic || '',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 7,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={{width: screenWidth * 0.8}}>
              <Text
                style={{
                  ...s.tLanguage,
                }}>
                'TAEMIN'
              </Text>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  color: '#787878',
                  paddingVertical: 0,
                }}>
                Your K word teacher
              </Text>
            </View>
          </View>

          <View key={2} style={{flex: 1, alignItems: 'center'}}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Word');
                // # Press Woman
                // Actions.push('selectWord', {teacher: 'joohee'});
              }}
              style={{
                width: screenWidth * 0.8,
                height: screenWidth * 0.8 * bannerMainWoman.ratio,
                marginVertical: 15,
              }}>
              <Image
                source={bannerMainWoman.src}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 7,
                }}
              />
            </TouchableOpacity>
            <View style={{width: screenWidth * 0.8}}>
              <Text
                style={{
                  ...s.tLanguage,
                  color: '#787878',
                }}>
                'JOOHEE'
              </Text>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  color: '#787878',
                  paddingVertical: 0,
                }}>
                Your K word teacher
              </Text>
            </View>
          </View>
        </Swiper>
        {/* <-- Speak */}

        {/* Review --> */}
        <View style={{...theme.boxes.rowBetweenCenter, paddingHorizontal: 25}}>
          <Text
            style={{
              ...theme.fontSizes.large,
              fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
              color: theme.colors.black3,
            }}>
            REAL TIME REVIEW
          </Text>

          <TouchableOpacity
            onPress={() => {
              // onPressMore();
              // @ts-ignore
              navigation.navigate('Review');
            }}
            style={{
              width: 54,
              height: 18,
              borderRadius: 10,
              ...theme.center,
              backgroundColor: theme.colors.mint,
            }}>
            <Text
              style={[
                {
                  fontSize: Platform.OS === 'ios' ? 9 : 7,
                  fontWeight: 'bold',
                  color: '#fff',
                },
              ]}>
              MORE
            </Text>
          </TouchableOpacity>
        </View>
        {/* <FlatList
          style={{marginBottom: 20, marginHorizontal: 20}}
          horizontal
          data={reviewList}
          renderItem={renderReviewFeed}
        /> */}
        <Swiper
          dotColor="#ffffff00"
          activeDotColor="#ffffff00"
          loop={false}
          onIndexChanged={i => {
            console.log(`i:: `, i);
            if (
              i === reviewList.length - 1 &&
              reviewList[reviewList.length - 1].length === 2
            ) {
              refBase.current?.startLoading();
              loadMainReivews({
                variables: {from: from, limit: 10, notice: true, token},
              });
            }
          }}
          containerStyle={{
            height: feedHeight,
            marginBottom: 10,
          }}>
          {reviewList.map((list, i) => (
            <View
              key={i}
              style={{
                width: screenWidth - 40,
                ...theme.boxes.rowEvenlyCenter,
                alignSelf: 'center',
              }}>
              <ReviewFeed review={list[0]} />
              {list.length === 1 ? (
                <View style={{width: 120}} />
              ) : (
                <ReviewFeed review={list[1]} />
              )}
            </View>
          ))}
        </Swiper>
        {/* <-- Review */}

        <Pressable
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Store');
          }}
          style={{
            width: screenWidth - 40,
            alignSelf: 'center',
            marginBottom: 30,
          }}>
          {mainData && mainData.getMainData && (
            <Image
              source={{uri: mainData.getMainData.purchaseImage}}
              onLoad={e => {
                const {width: iWidth, height: iHeight} = e.nativeEvent.source;
                // @ts-ignore
                e.target.setNativeProps({
                  height: screenWidth - 40 * (iHeight / iWidth),
                });
              }}
              style={{width: screenWidth - 40, height: 10}}
            />
          )}
        </Pressable>

        {/* MailTo --> */}
        <View style={{width: '100%', marginBottom: 20}}>
          <View
            style={{
              width: '100%',
              ...theme.center,
              paddingBottom: 20,
              marginTop: 60,
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                color: theme.colors.tabBlack,
                ...theme.fontSizes.medium,
                paddingVertical: 0,
              }}>
              WAZTONG CONTACT
            </Text>
            <Text
              style={{
                ...theme.fontSizes.smallest,
                paddingVertical: 0,
                color: '#b2b2b2',
              }}>
              Please email us for any assistance
            </Text>
          </View>
          <View
            style={{
              width: screenWidth,
              height: screenWidth * mainBackgrounQna.ratio,
              ...theme.center,
            }}>
            <Image
              source={mainBackgrounQna.src}
              style={{width: '100%', height: '100%', position: 'absolute'}}
            />
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                ...theme.fontSizes.smallest,
                letterSpacing: 3,
              }}>
              Email Address
            </Text>
            <Text
              style={{
                color: theme.colors.mint,
                ...theme.fontSizes.largest,
                fontWeight: '200',
              }}>
              waztong@gmail.com
            </Text>
            <BaseButton
              text="SEND"
              size="small"
              style={{borderRadius: 0, width: '50%'}}
              onPress={() => {
                Linking.openURL('mailto:waztong@gmail.com');
              }}
            />
            <Text
              style={{
                color: '#fff',
                ...theme.fontSizes.smallest,
                fontWeight: '400',
              }}>
              We will respond ASAP.
            </Text>
          </View>
        </View>
        {/* <-- MailTo */}
      </ScrollView>

      {/* Tutorial ==> */}
      <Modal visible={showTutorial} animationType="slide">
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
          }}>
          <Swiper
            loop={false}
            dot={<View />}
            activeDot={<View />}
            onIndexChanged={i => {
              // console.log(`index:: `, i);
              setCurrentTutorialTab(i);
            }}>
            <View
              style={{
                width: '100%',
                height: '100%',
              }}>
              <Image
                source={tutorial1.src}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
            </View>
            <View
              style={{
                width: '100%',
                height: '100%',
              }}>
              <Image
                source={tutorial2.src}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
            </View>
            <View
              style={{
                width: '100%',
                height: '100%',
              }}>
              <Image
                source={tutorial3.src}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
            </View>
          </Swiper>
          <View
            style={[
              {
                width: '100%',
                height: 50,
                position: 'absolute',
                flexDirection: 'row',
              },
              Platform.OS === 'ios' && theme.marginIOS,
            ]}>
            <View style={{width: 100}} />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={{
                    width: '30%',
                    height: 8,
                    backgroundColor:
                      currentTutorialTab === i
                        ? theme.colors.gray
                        : theme.colors.border,
                    borderRadius: 20,
                    marginHorizontal: i === 1 ? 5 : 0,
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={onEndTutorial}
              disabled={currentTutorialTab !== 2}
              style={{
                width: 100,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
              <Text
                style={{
                  ...theme.fontSizes.large,
                  paddingVertical: 0,
                  color: theme.colors.mint,
                  fontWeight: 'bold',
                }}>
                {currentTutorialTab === 2 && 'BEGIN'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* <== Tutorial */}
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  tLanguage: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: theme.colors.black3,
    marginBottom: 10,
  },
});

export default MainScreen;
