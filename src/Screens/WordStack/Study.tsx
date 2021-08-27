import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import ModalOX from '~/components/Modals/ModalOX';
import {
  arrowLeftMint,
  icoSpeaker,
  vJooheeNormal,
  vJooheeTalking,
  //   imgMainBackPart,
  //   vJooheeNormal,
  //   vJooheeTalking,
  //   vTaeminNormal,
  //   vTaeminTalking,
} from '~/images';
import theme from '~/lib/theme';
import toast from 'react-native-simple-toast';
import {StackScreenProps} from '@react-navigation/stack';
import {TWordStackParams} from '~/lib/types';
import BaseButton from '~/base/BaseButton';
import {useBMutation} from '~/lib/gql/gqlBuilder';
import {useRecoilState, useRecoilValue} from 'recoil';
import {__myInfo, __token} from '~/lib/recoil/atom';

const screenWidth = Dimensions.get('screen').width;
const iconHeight = 20;
const progressBarRadius = 15;
const boxBlack = '#414141';
const boxGray = '#e8e8e8';

interface Props {
  teacher: 'taemin' | 'joohee';
  problems: any;
  idx: number;
}

const ExamScreen = ({
  navigation,
  route,
}: StackScreenProps<TWordStackParams, 'wordStudy'>) => {
  const {idx: chapterIdx, problem: problems} = route.params.wordData;

  const [me, r_setMe] = useRecoilState(__myInfo);
  const token = useRecoilValue(__token);

  const refVideo = useRef<any>();
  const refVideo2 = useRef<any>();
  const refAudio = useRef<Video>(null);
  const [curVideo, setCurVideo] = useState('normal');
  const [curWordIdx, setCurWordIdx] = useState(0);
  const [curAudio, setCurAudio] = useState('init');
  const [voiceReady, setVoiceReady] = useState('');
  const [selected, setSelected] = useState<any>([]);
  const [testResult, setTestResult] = useState('');
  const [talking, setTalking] = useState(false);
  const [loadedNormal, setLoadedNormal] = useState(false);

  const [mutFinish] = useBMutation('finishWord');

  useEffect(() => {
    switch (curVideo) {
      case 'normal':
        break;
      case 'talking':
        break;
    }
  }, [curVideo]);
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
  // useEffect(() => {

  // }, [curWordIdx])

  const onPressVoice = () => {
    setVoiceReady(problems[curWordIdx].playURL);
  };

  const WordBox = (word: string, i: number) => {
    return (
      <TouchableOpacity
        onPress={() => {
          const found = selected.findIndex(
            (s: any) => s[0] === i && s[1] === word,
          );
          console.log(`found: `, found);
          if (found === -1) {
            setSelected((s: any) => {
              let copied = s.slice();
              copied.push([i, word]);
              console.log(`Changed1: `, copied);
              return copied;
            });
          } else {
            setSelected((s: any) => {
              let copied = s.slice();
              copied = [...copied.slice(0, found), ...copied.slice(found + 1)];
              console.log(`Changed2: `, copied);
              return copied;
            });
          }
        }}
        style={{
          width: '48%',
          height: 45,
          ...theme.center,
          backgroundColor:
            selected.findIndex((s: any) => s[0] === i && s[1] === word) === -1
              ? theme.colors.blackMint
              : theme.colors.mint,
          borderRadius: 100,
          marginBottom: 5,
        }}>
        <Text
          style={{
            ...theme.fontSizes.medium,
            paddingVertical: 0,
            fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
            color: '#fff',
            textAlign: 'center',
          }}>
          {word}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: theme.colors.mainBackgroundColor}}>
      {curAudio !== 'init' && !!curAudio.length && (
        <Video
          ref={refAudio}
          source={{uri: curAudio}}
          style={{width: 0, height: 0}}
          onLoad={e => {
            refAudio?.current?.seek(0);
            setTalking(true);
          }}
          onEnd={() => {
            setCurAudio('init');
            setTalking(false);
          }}
          paused={!!!curAudio.length}
        />
      )}

      {/* Inner Wrapper ==> */}
      <View style={{flex: 1}}>
        <View
          style={{
            backgroundColor: theme.colors.mint,
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '60%',
          }}
        />
        <View
          style={{
            width: screenWidth - 40,
            height: '80%',
            position: 'absolute',
            borderRadius: 15,
            backgroundColor: '#fff',
            alignSelf: 'center',
            marginTop: 10,
          }}
        />

        {/* Video Section --> */}
        <View
          style={{
            width: '100%',
            height: screenWidth - 40,
            position: 'absolute',
            bottom: 0,
            // backgroundColor: the,
          }}>
          <View
            style={{
              width: screenWidth - 40,
              height: screenWidth - 40,
              alignSelf: 'center',
            }}>
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
        </View>
        {/* <-- Video Section */}

        {/* Body (Arrow + Inner Body) --> */}
        <View
          style={{
            width: screenWidth - 40,
            height: '80%',
            alignSelf: 'center',
            marginTop: 10,
          }}>
          {/* Arrow For Pop */}
          <TouchableOpacity
            onPress={() => {
              //   Actions.pop();
              navigation.pop();
            }}
            style={{
              marginLeft: 15,
              marginTop: 15,
              marginBottom: 8,
              width: 20,
              height: 20 * arrowLeftMint.ratio,
            }}>
            <Image
              source={arrowLeftMint.src}
              style={{
                width: 20,
                height: 20 * arrowLeftMint.ratio,
              }}
            />
          </TouchableOpacity>

          {/* Inner Body --> */}
          <View style={{paddingHorizontal: 20}}>
            {/* Progress Bar --> */}
            <View style={{marginBottom: 15}}>
              {/* <View style={{...theme.boxes.rowBetweenCenter}}>
                <Text
                  style={{
                    ...theme.fontSizes.medium,
                    color: theme.colors.black,
                  }}>
                  step
                </Text>
                <Text
                  style={{
                    ...theme.fontSizes.medium,
                    color: theme.colors.black,
                  }}>
                  {curWordIdx + 1}/{problems.length}
                </Text>
              </View> */}

              <View
                style={{
                  flexDirection: 'row',
                  height: 20,
                  borderRadius: progressBarRadius,
                  backgroundColor: theme.colors.grayInMainLight,
                }}>
                <View
                  style={[
                    {
                      backgroundColor: theme.colors.mint,
                      width: `${((curWordIdx + 1) / problems.length) * 100}%`,
                      //   borderTopLeftRadius: progressBarRadius,
                      //   borderBottomLeftRadius: progressBarRadius,
                      borderRadius: progressBarRadius,
                    },
                  ]}>
                  <View
                    style={{
                      width: '80%',
                      height: 3,
                      alignSelf: 'center',
                      top: '20%',
                      backgroundColor: '#ffffff66',
                      borderRadius: progressBarRadius,
                    }}
                  />
                </View>
              </View>
            </View>
            {/* <-- Progress Bar */}

            <Text
              style={{
                ...theme.fontSizes.ultra,
                paddingVertical: 0,
                color: theme.colors.blackMint,
                fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
                marginTop: Platform.OS === 'ios' ? 5 : 0,
                textAlign: 'center',
              }}>
              {Object.values(problems[curWordIdx].datas)[0].problem}
            </Text>
            <Text
              style={{
                ...theme.fontSizes.small,
                paddingVertical: 0,
                color: theme.colors.gray,
                textAlign: 'center',
              }}>
              Please complete
            </Text>

            {/* Speaker */}
            <TouchableOpacity
              onPress={() => onPressVoice()}
              style={{
                alignSelf: 'flex-end',
              }}>
              <Image
                source={icoSpeaker.src}
                style={{
                  width: iconHeight / icoSpeaker.ratio,
                  height: iconHeight,
                }}
              />
            </TouchableOpacity>

            {/* Ansewr Box --> */}
            <View
              style={{
                width: '100%',
                paddingVertical: 20,
                ...theme.boxes.rowCenter,
                // justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: boxGray,
                borderRadius: 10,
                marginTop: 5,
              }}>
              {/* Answer Title Box --> */}
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  top: -10,
                  height: 20,
                  width: '50%',
                  ...theme.center,
                  backgroundColor: theme.colors.mint,
                  borderRadius: 100,
                }}>
                <Text
                  style={{
                    ...theme.fontSizes.smallest,
                    paddingVertical: 0,
                    color: '#fff',
                    fontWeight: 'bold',
                  }}>
                  ANSWER
                </Text>
              </View>
              {/* <-- Answer Title Box */}
              <Text
                style={{
                  ...theme.fontSizes.medium,
                  paddingVertical: 0,
                  color: theme.colors.mint,
                  fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
                  //   textAlign: 'center',
                }}>
                {selected.map((s: any) => s[1]).join(' ')}
              </Text>
            </View>
            {/* <-- Answer Box */}

            <View
              style={{
                width: '95%',
                alignSelf: 'center',
                ...theme.boxes.rowBetweenCenter,
                flexWrap: 'wrap',
                marginTop: 10,
              }}>
              {Object.values(problems[curWordIdx].datas)[0].clickWord.map(
                WordBox,
              )}
            </View>
          </View>
          {/* <-- Inner Body */}
        </View>
        {/* <-- Body */}

        {/* Word --> */}
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            alignItems: 'center',
            top: '30%',
          }}>
          <Text
            style={{
              ...theme.fontSizes.ultra,
              color: theme.colors.mainRed,
              fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
              // marginBottom: 10,
            }}>
            {/* {problems[curWordIdx].word} */}
          </Text>
          <Text
            style={{
              ...theme.fontSizes.largest,
              color: theme.colors.black,
              fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
            }}>
            {/* {problems[curWordIdx][showKorean ? 'korean' : 'speak']} */}
          </Text>
        </View>
        {/* <-- Word */}

        {/* Next Button */}
        <BaseButton
          size="medium"
          style={{
            borderRadius: 7,
            width: screenWidth - 40,
            alignSelf: 'center',
            position: 'absolute',
            bottom: 20,
          }}
          onPress={() => {
            const result =
              Object.values(problems[curWordIdx].datas)[0].answer ===
              selected.map((s: any) => s[1]).join(' ');

            setCurAudio('init');
            setTestResult(result ? 'o' : 'x');
          }}
          text="FINISHED"
        />
      </View>
      {/* <== Inner Wrapper */}
      <ModalOX
        isLast={curWordIdx === problems.length - 1}
        correct={testResult}
        onPressAgain={() => {
          setTestResult('');
          setSelected([]);
        }}
        onPressNext={() => {
          if (curWordIdx === problems.length - 1) {
            setTestResult('oe');
            mutFinish({
              variables: {
                session: token,
                language: me.language,
                idx: chapterIdx,
              },
            })
              .then(() => {
                r_setMe(m => ({
                  ...m,
                  totalTest: m.totalTest + 1,
                }));
              })
              .catch(e => {
                console.log(`Error in mutFinish@@@`, JSON.stringify(e));
                toast.show('Error occured', 1);
              });
            return;
          }
          setTestResult('');
          setSelected([]);
          setCurWordIdx(i => i + 1);
        }}
        onFinish={() => {
          setTestResult('');
          toast.show('Test Finished. Well done!', 1);
          //   Actions.pop();
          //   Actions.pop();
          navigation.pop();
        }}
        onPressReset={() => {
          setTestResult('');
          setSelected([]);
          setCurWordIdx(0);
        }}
        navi={navigation}
      />
    </SafeAreaView>
  );
};

export default ExamScreen;
