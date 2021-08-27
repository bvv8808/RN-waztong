import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {useMemo} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  LogBox,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Shimmer from 'react-native-shimmer';
import {useRecoilValue} from 'recoil';
import {arrowLeftWhite, icoMic, micSlide} from '~/images';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TSpeak, TSpeakStackParams} from '~/lib/types';
import {toShortLower} from '~/lib/util';

LogBox.ignoreLogs(['Did not retain']);
const screenWidth = Dimensions.get('screen').width;
const lessonWidth = screenWidth * 0.7;
const lessonMarginH = 15;
const lessonMarginV = 20;
const slideWidth = screenWidth * 0.7;

let timer: any = null;
const SpeakGatewayScreen = ({
  navigation,
  route,
}: StackScreenProps<TSpeakStackParams, 'speakGateway'>) => {
  const chapterData = useMemo(() => route.params.chapterData, []);
  const me = useRecoilValue(__myInfo);

  const [slided, setSlided] = useState(false);

  const slideOffset = useRef(new Animated.Value(0)).current;
  const refScroll = useRef<FlatList>(null);

  const refPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const {dx} = gestureState;
        if (dx > 0 && dx < slideWidth - 60)
          return Animated.event([null, {dx: slideOffset}])(e, gestureState);
      },
      onPanResponderRelease: (e, gestureState) => {
        const {dx} = gestureState;

        Animated.timing(slideOffset, {
          toValue: dx < slideWidth * 0.8 - 60 ? 0 : slideWidth - 60,
          duration: 200,
          useNativeDriver: false,
        }).start();

        if (dx < slideWidth * 0.8 - 60) setSlided(false);
        else setSlided(true);

        // pan.flattenOffset();
      },
    }),
  ).current;

  useEffect(() => {
    if (slided) {
      navigation.replace('adSpeak', {chapterData});
    }
  }, [slided]);

  const renderLesson = ({item, index}: {item: TSpeak; index: number}) => {
    return (
      <View
        key={item.subject.en}
        style={{
          width: lessonWidth,
          height: 100,
          marginHorizontal: lessonMarginH,
          marginVertical: lessonMarginV,
          ...theme.boxes.rowCenter,
          padding: 20,
          backgroundColor: theme.colors.black5,
          borderRadius: 13,
        }}>
        <View style={{flex: 1, height: 80}}>
          <Text style={s.tLessonNumber}>Lesson {index + 1}</Text>
          <Text style={s.tLessonSubject}>
            {item.subject[toShortLower(me.subtitle)]}
          </Text>
          <Text style={s.tLessonDesc}>
            {item.description[toShortLower(me.subtitle)]}
          </Text>
        </View>
        <View style={{...theme.center, height: 100}}>
          <Image
            source={{uri: chapterData.speakDatas[0]?.pic}}
            style={{width: 80, height: 80, borderRadius: 30}}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        <Image
          source={{uri: chapterData.speakDatas[0]?.pic || ''}}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          resizeMode="cover"
        />

        {/* Header --> */}
        <View
          style={{
            ...theme.boxes.rowBetweenCenter,
            height: 60,
            backgroundColor: '#00000077',
          }}>
          <Pressable
            style={{width: 60, height: 60, ...theme.center}}
            onPress={() => {
              navigation.pop();
            }}>
            <Image
              source={arrowLeftWhite.src}
              style={{width: 25, height: 25}}
              resizeMode="contain"
            />
          </Pressable>
          <Text
            style={{
              ...theme.fontSizes.small,
              paddingVertical: 0,
              color: '#fff',
            }}>
            {chapterData.subject[toShortLower(me.subtitle)]}
          </Text>
          <View style={{width: 60}} />
        </View>
        {/* <-- Header */}
        {/* <View style={{height: '70%'}}></View> */}
        <View
          style={{
            position: 'absolute',
            bottom: 200,
            alignSelf: 'center',
            width: slideWidth,
            height: 60,
            backgroundColor: '#000000aa',
            borderRadius: 30,
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              ...theme.center,
              position: 'absolute',
            }}>
            <Shimmer>
              <Text
                style={{
                  ...theme.fontSizes.large,
                  fontWeight: 'bold',
                  color: '#fff',
                }}>
                Slide to Speak
              </Text>
            </Shimmer>
          </View>
          <Animated.View
            style={{
              transform: [{translateX: slideOffset}],
              width: 60,
            }}
            {...refPan.panHandlers}>
            <Image source={micSlide.src} style={{width: 60, height: 60}} />
          </Animated.View>
        </View>

        <View
          style={{width: '100%', height: 140, position: 'absolute', bottom: 0}}>
          <FlatList
            horizontal
            ref={refScroll}
            style={{backgroundColor: '#000000cc'}}
            contentContainerStyle={{height: 120}}
            data={chapterData.speakDatas}
            renderItem={renderLesson}
            onScroll={({nativeEvent: e}) => {
              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(() => {
                const offsetX = e.contentOffset.x;
                const lessonFullWidth = lessonWidth + lessonMarginH * 2;
                const centerIdx = Math.round(offsetX / lessonFullWidth);
                if (centerIdx === 0) {
                  refScroll.current?.scrollToOffset({offset: 0});
                  return;
                } else if (centerIdx === chapterData.speakDatas.length - 1) {
                  // 실제로는 2가 아닌 flatlist.data.length
                  refScroll.current?.scrollToEnd();
                  return;
                }
                const offsetToScroll =
                  lessonFullWidth * centerIdx -
                  (screenWidth - lessonFullWidth) / 2;
                refScroll.current?.scrollToOffset({offset: offsetToScroll});
              }, 300);
            }}
          />
        </View>
      </View>
      {/* </View> */}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  tLessonSubject: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
  },
  tLessonNumber: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
    marginBottom: 25,
  },
  tLessonDesc: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: theme.colors.mint,
  },
});

export default SpeakGatewayScreen;
