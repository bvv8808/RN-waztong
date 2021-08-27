import {StackScreenProps} from '@react-navigation/stack';
import React, {memo, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  arrowLeftWhiteThin,
  arrowRightWhiteThin,
  icoMic,
  icoSpeakAnswer,
  learnMicButton,
  vJooheeNormal,
  vJooheeTalking,
} from '~/images';
import theme from '~/lib/theme';
import {TSpeakStackParams} from '~/lib/types';
import GradientView from 'react-native-linear-gradient';
import {useMemo} from 'react';
import {useRecoilValue} from 'recoil';
import {__myInfo} from '~/lib/recoil/atom';
import {toShortLower} from '~/lib/util';
import {useRef} from 'react';
import Video from 'react-native-video';
import {useCallback} from 'react';

const screenWidth = Dimensions.get('screen').width;

const LearnScreen = ({
  navigation,
  route,
}: StackScreenProps<TSpeakStackParams, 'learn'>) => {
  const learnData = useMemo(() => route.params.learnData, []);
  const chapterIdx = useMemo(() => route.params.chapterIdx, []);
  const [loadedNormal, setLoadedNormal] = useState(false);

  const me = useRecoilValue(__myInfo);

  const [curIdx, setCurIdx] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [curAudio, setCurAudio] = useState('init');
  const [voiceReady, setVoiceReady] = useState('');
  const [talking, setTalking] = useState(false);

  const refAudio = useRef<Video>(null);
  const refVideo = useRef<Video>(null);
  const refVideo2 = useRef<Video>(null);

  useEffect(() => {
    if (curAudio === '' && voiceReady.length) {
      const v = voiceReady;
      setCurAudio(v);
      setVoiceReady('');
    }
  }, [curAudio]);
  useEffect(() => {
    voiceReady.length && setCurAudio('');
  }, [voiceReady]);

  const onPressMic = useCallback(() => {
    setVoiceReady(learnData[curIdx].playURL);
  }, [curIdx]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f2f2f2'}}>
      {/* Audio */}
      {curAudio !== 'init' && !!curAudio.length && (
        <Video
          ref={refAudio}
          audioOnly
          source={{uri: curAudio}}
          onLoad={e => {
            // console.log(`audio loaded`);
            setTalking(true);
            // refAudio?.current?.seek(0);
          }}
          onProgress={() => {
            console.log(`!!`);
          }}
          onEnd={() => {
            setTalking(false);
            setCurAudio('init');
          }}
          // onError={e => {
          //   console.log(`eee:: `, e);
          // }}
        />
      )}

      {/* Header --> */}
      <View
        style={{
          ...theme.boxes.rowBetweenCenter,
          height: 60,
          backgroundColor: theme.colors.mint,
        }}>
        <TouchableOpacity
          style={s.btnHeader}
          onPress={() => {
            if (curIdx === 0) {
              navigation.pop();
              return;
            }

            setShowSubtitle(false);
            setCurIdx(i => i - 1);
          }}>
          <Image
            source={arrowLeftWhiteThin.src}
            style={{height: 25, width: 25 / arrowLeftWhiteThin.ratio}}
          />
          <Text style={s.tHeader}>{curIdx === 0 ? '' : 'Before'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnHeader}
          onPress={() => {
            if (curIdx === learnData.length - 1) {
              // 학습 완료
              navigation.pop();
              return;
            }
            setShowSubtitle(false);
            setCurIdx(i => i + 1);
          }}>
          <Text style={s.tHeader}>
            {curIdx === learnData.length - 1 ? 'Finish' : 'Next'}
          </Text>
          <Image
            source={arrowRightWhiteThin.src}
            style={{height: 25, width: 25 / arrowLeftWhiteThin.ratio}}
          />
        </TouchableOpacity>
      </View>
      {/* <-- Header */}

      {/* Body ==> */}
      <View style={{flex: 1}}>
        {/* Video --> */}
        <View
          style={{
            width: screenWidth,
            height: screenWidth,
            position: 'absolute',
            bottom: 0,
          }}>
          {/* VIDEO */}
          <Video
            ref={refVideo}
            source={vJooheeNormal.src}
            playInBackground={true}
            onLoad={() => {
              refVideo?.current?.seek(0);
              setLoadedNormal(true);
              //
            }}
            style={{
              width: '100%',
              height: loadedNormal ? '100%' : 0,
              position: 'absolute',
              bottom: 0,
              left: 0,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              backgroundColor: '#fff',
            }}
            controls={false}
            paused={false}
            repeat
            // resizeMode={Platform.OS === 'android' ? 'cover' : 'none'}
            resizeMode="cover"
          />

          <Video
            muted
            ref={refVideo2}
            source={vJooheeTalking.src}
            onLoad={() => {
              //
            }}
            paused={false}
            style={{
              width: '100%',
              height: talking ? '100%' : 0,
              position: 'absolute',
              bottom: 0,
              left: 0,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
            controls={false}
            repeat
            // resizeMode={Platform.OS === 'android' ? 'cover' : 'none'}
            resizeMode="cover"
          />
        </View>
        {/* <-- Video */}

        {/* Progress Bar --> */}
        <View style={{paddingHorizontal: 30}}>
          <View
            style={{
              ...theme.boxes.rowBetweenBottom,
              marginBottom: 5,
              marginTop: 40,
            }}>
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                backgroundColor: theme.colors.mint,
                ...theme.center,
                borderRadius: 30,
              }}>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  paddingVertical: 0,
                  color: '#fff',
                }}>
                Class {chapterIdx.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text
              style={{
                ...theme.fontSizes.medium,
                paddingVertical: 0,
                color: theme.colors.blackMint,
              }}>
              {curIdx + 1}/{learnData.length}
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              height: 10,
              backgroundColor: '#fff',
              borderRadius: 30,
            }}>
            <GradientView
              style={[
                {
                  width: `${((curIdx + 1) / learnData.length) * 100}%`,
                  height: '100%',
                  borderTopLeftRadius: 30,
                  borderBottomLeftRadius: 30,
                },
                curIdx === learnData.length - 1 && {
                  borderRadius: 30,
                },
              ]}
              start={{x: 0, y: 0.5}}
              end={{x: 1, y: 0.5}}
              colors={[theme.colors.mint, '#62f0eb']}
            />
          </View>
        </View>
        {/* <-- Progress Bar */}

        {/* Display --> */}
        <Text
          style={[
            s.tDisplay,
            {
              width: '90%',
              alignSelf: 'center',
              marginTop: 30,
            },
          ]}
          numberOfLines={2}>
          {learnData[curIdx].display}
        </Text>
        <View style={s.subtitleBox}>
          <Text style={[s.tSubtitle, !showSubtitle && {color: '#fff'}]}>
            {learnData[curIdx].subtitle[toShortLower(me.subtitle)]}
          </Text>
        </View>

        {/* <-- Display */}

        <TouchableOpacity style={s.btnMic} onPress={onPressMic}>
          <Image
            source={learnMicButton.src}
            style={{
              width: screenWidth * 0.5,
              height: screenWidth * 0.5 * learnMicButton.ratio,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnAnswer}
          onPress={() => {
            setShowSubtitle(s => !s);
          }}>
          <Image
            source={icoSpeakAnswer.src}
            style={{
              width: 60,
              height: 60,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {/* <== Body */}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  btnHeader: {
    height: 60,
    paddingHorizontal: 10,
    ...theme.boxes.rowCenter,
  },
  tHeader: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    marginHorizontal: 5,
    color: '#fff',
  },
  tDisplay: {
    ...theme.fontSizes.ultra,
    paddingVertical: 0,
    color: theme.colors.blackMint,
    textAlign: 'center',
  },
  tSubtitle: {
    ...theme.fontSizes.ultra,
    paddingVertical: 0,
    color: theme.colors.mint,
    fontWeight: 'bold',
  },
  subtitleBox: {
    marginTop: 10,
    alignSelf: 'center',
    ...theme.center,
    minWidth: '50%',
    maxWidth: '90%',
    padding: 10,
    borderRadius: theme.fontSizes.ultra.fontSize,
    backgroundColor: '#fff',
  },

  btnMic: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  btnAnswer: {
    position: 'absolute',
    right: 20,
    bottom: 130,
  },
});

export default LearnScreen;
