import {StackScreenProps} from '@react-navigation/stack';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {useCallback} from 'react';
import {useMemo} from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import {useRecoilState, useRecoilValue} from 'recoil';
import {__myInfo, __token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TSpeak, TSpeakStackParams, TSubject} from '~/lib/types';
import {dictForSTTLang, toShortLower} from '~/lib/util';
import vttToJson from '~/lib/vttToJson';
import Voice from '@react-native-voice/voice';
import toast from 'react-native-simple-toast';
import {
  icoExitWhite,
  icoFlowerMint,
  icoMic,
  icoPlay,
  icoSpeakCircle,
} from '~/images';
import {useRef} from 'react';
import {useBMutation} from '~/lib/gql/gqlBuilder';
import langs from '~/lib/lang/languageList';
import useUpdateMe from '~/lib/hooks/useUpdateMe';
import BaseLayout from '~/base/BaseLayout';

type TSpeakState = 'intro' | 'ready' | 'success' | 'fail';
type TSpeakVideoURL = 'introURL' | 'readyURL' | 'successURL' | 'failURL';

const SpeakStudyScreen = ({
  navigation,
  route,
}: StackScreenProps<TSpeakStackParams, 'speakStudy'>) => {
  const chapterData = useMemo(() => route.params.chapterData, []);
  const me = useRecoilValue(__myInfo);
  const token = useRecoilValue(__token);

  const [speakState, setSpeakState] = useState<TSpeakState>('intro');
  const [curLessonIdx, setCurLessonIdx] = useState(0);
  const [subtitleIntro, setSubtitleIntro] = useState({});
  const [subtitleSuccess, setSubtitleSuccess] = useState({});
  const [subtitleFail, setSubtitleFail] = useState({});
  const [tempSubtitleLang, setTempSubtitleLang] = useState(
    toShortLower(me.subtitle),
  );

  const [displayMainSubtitle, setDisplayMainSubtitle] = useState('');
  const [displayMySubtitle, setDisplayMySubtitle] = useState('');
  const [displayPronounce, setDisplayPronounce] = useState('');

  const [curSubtitleInfo, setCurSubtitleInfo] = useState({end: 0, idx: -1});

  const [recording, setRecording] = useState<boolean>(false);
  const [recordedText, setRecordedText] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [studyPaused, setStudyPaused] = useState(false);
  const [channel, setChannel] = useState({
    intro: '',
    ready: '',
    success: '',
    fail: '',
  });
  const [curAudio, setCurAudio] = useState('init');
  const [voiceReady, setVoiceReady] = useState('');

  const myLanguage = useMemo(() => toShortLower(me.language), []);

  const [mutSetSubtitle] = useBMutation('subtitle');
  const refreshMe = useUpdateMe();

  const refVideoIntro = useRef<Video>(null);
  const refVideoReady = useRef<Video>(null);
  const refVideoFail = useRef<Video>(null);
  const refVideoSuccess = useRef<Video>(null);
  const refAudio = useRef<Video>(null);

  const refBase = useRef<BaseLayout>(null);

  useEffect(() => {
    refBase.current?.stopLoading();
  }, [me]);

  useEffect(() => {
    if (curAudio === '' && voiceReady.length) {
      const v = voiceReady;
      setCurAudio(v);
      setVoiceReady('');
    }
  }, [curAudio]);
  useEffect(() => {
    console.log(`voiceReady:: `, voiceReady);
    voiceReady.length && setCurAudio('');
  }, [voiceReady]);

  useEffect(() => {
    console.log(`recording:: `, recording);
  }, [recording]);

  useEffect(() => {
    // console.log(`:: `, Object.keys(chapterData.speakDatas[0]));
    // console.log(
    //   `::::::::: `,
    //   chapterData.speakDatas[0].problem[myLanguage as TLangDomainLower],
    //   chapterData.speakDatas[0].answer,
    //   chapterData.speakDatas[0].answerWithSub[myLanguage as TLangDomainLower],
    // );

    // STT check
    Voice.isAvailable()
      .then(async () => {
        const services = await Voice.getSpeechRecognitionServices();
        console.log(`services:: `, services);
        Voice.onSpeechStart = () => {
          console.log(`record start`);
          setRecording(true);
        };
        Voice.onSpeechEnd = () => {
          console.log(`record stop`);
          setSpeakState('fail');
          setDisplayPronounce('');
          setRecording(false);
        };
        Voice.onSpeechResults = ({value}) => {
          console.log(`Recorded:: `, value);
          setRecordedText(value ? value[0] : 'Unknown');
        };
        Voice.onSpeechError = e => {
          console.log(`Error :::: `, e);
          console.log(`isRecording:::   `, recording);
          if (e.error?.message === '7/No match') {
            speakState === 'ready' && Voice.start('en-US');

            return;
          }
          setSpeakState('fail');
          setDisplayPronounce('');
          setRecording(false);
        };
        Voice.onSpeechVolumeChanged = e => {
          // console.log(`speechVolumeChanged`);
          e;
          return e;
        };
        Voice.isAvailable().then(av => {
          Platform.OS === 'android' && console.log(`V:: `, av);
        });
      })
      .catch(e => {
        console.log(`STT Error:: `, e);
        toast.show('STT system is not available', 2);
        navigation.pop();
      });

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  useEffect(() => {
    if (recordedText) {
      Platform.OS === 'ios' && Voice.stop();
      const {answer} = chapterData.speakDatas[curLessonIdx];
      setDisplayPronounce('');
      setRecording(false);
      if (chapterData.speakDatas[curLessonIdx].answer === recordedText) {
        // 정답
        setSpeakState('success');
      } else if (answer !== recordedText && failCount === 2) {
        // Good Try
      } else {
        // 오답
        setSpeakState('fail');
        setRecording(false);
        setFailCount(c => c + 1);
      }
    }
  }, [recordedText]);

  useEffect(() => {
    setSpeakState('intro');

    setChannel({
      intro: chapterData.speakDatas[curLessonIdx].introURL,
      ready: chapterData.speakDatas[curLessonIdx].readyURL,
      success: chapterData.speakDatas[curLessonIdx].successURL,
      fail: chapterData.speakDatas[curLessonIdx].failURL,
    });

    const {introSubtitle, successSubtitle, failSubtitle} =
      chapterData.speakDatas[curLessonIdx];
    // console.log(`introSubtitle`, Object.keys(chapterData.speakDatas[0]));

    getVtts(Object.entries(introSubtitle)).then(vtt => {
      //   console.log(`vtt:: `, typeof vtt, vtt);
      setSubtitleIntro(vtt);
    });
    getVtts(Object.entries(successSubtitle)).then(vtt => {
      //   console.log(`vtt:: `, typeof vtt, vtt);
      setSubtitleSuccess(vtt);
    });
    getVtts(Object.entries(failSubtitle)).then(vtt => {
      //   console.log(`vtt:: `, typeof vtt, vtt);
      setSubtitleFail(vtt);
    });
  }, [curLessonIdx]);

  useEffect(() => {
    if (curSubtitleInfo.idx === -1) return;
    let subtitleOfCurrentState;
    switch (speakState) {
      case 'intro':
        subtitleOfCurrentState = subtitleIntro;
        break;
      case 'ready':
        break;
      case 'success':
        subtitleOfCurrentState = subtitleSuccess;
        break;
      case 'fail':
        subtitleOfCurrentState = subtitleFail;
        break;
      default:
        subtitleOfCurrentState = subtitleIntro;
    }
    if (!subtitleOfCurrentState) return;

    setDisplayMainSubtitle(
      // @ts-ignore
      subtitleOfCurrentState[myLanguage][curSubtitleInfo.idx].text,
    );
    setDisplayMySubtitle(
      // @ts-ignore
      subtitleOfCurrentState[tempSubtitleLang][curSubtitleInfo.idx].text,
    );
  }, [curSubtitleInfo]);

  // #update speakState
  useEffect(() => {
    if (speakState === 'ready') {
      console.log(`##`);
      setDisplayMainSubtitle(chapterData.speakDatas[curLessonIdx].answer);
      setDisplayMySubtitle(
        chapterData.speakDatas[curLessonIdx].problem[tempSubtitleLang],
      );
      setDisplayPronounce(
        chapterData.speakDatas[curLessonIdx].answerWithSub[tempSubtitleLang],
      );
      setRecording(true);
      refVideoFail.current?.seek(0);

      !recording && Voice.start(dictForSTTLang(me.language));
    }

    if (speakState === 'fail') {
      setFailCount(c => c + 1);
      refVideoReady.current?.seek(0);
    } else if (speakState === 'success') {
      setFailCount(0);
      if (curLessonIdx === chapterData.speakDatas.length - 1) return;

      setChannel(c => ({
        intro: chapterData.speakDatas[curLessonIdx + 1].introURL,
        ready: chapterData.speakDatas[curLessonIdx + 1].readyURL,
        fail: chapterData.speakDatas[curLessonIdx + 1].failURL,
        success: c.success,
      }));
    }
  }, [speakState]);
  useEffect(() => {
    if (failCount === 3) {
      setFailCount(0);
      setSpeakState('success');
    }
  }, [failCount]);

  const onVideoProgress = useCallback(
    ({currentTime: t}) => {
      // console.log(`t: `, t);
      chapterData.speakDatas[curLessonIdx];

      let subtitleOfCurrentState;
      switch (speakState) {
        case 'intro':
          subtitleOfCurrentState = subtitleIntro;
          break;
        case 'ready':
          break;
        case 'success':
          subtitleOfCurrentState = subtitleSuccess;
          break;
        case 'fail':
          subtitleOfCurrentState = subtitleFail;
          break;
        default:
          subtitleOfCurrentState = subtitleIntro;
      }
      if (!subtitleOfCurrentState) return;
      if (t < curSubtitleInfo.end) return;

      try {
        const next =
          // @ts-ignore
          subtitleOfCurrentState[tempSubtitleLang][curSubtitleInfo.idx + 1];
        if (!next) return;
        if (t > curSubtitleInfo.end && t < next.startTime) {
          setDisplayMainSubtitle('');
          setDisplayMySubtitle('');
        }
        if (t >= next.startTime) {
          //   console.log(`t: `, t, next.startTime, next.endTime);
          setCurSubtitleInfo(prev => ({end: next.endTime, idx: prev.idx + 1}));
        }
      } catch (e) {
        console.log(`@@@@@@ `, e, curSubtitleInfo.idx + 1);
      }
      //   console.log(subtitleIntro[mySubtitle][curSubtitleInfo.idx + 1].start);
    },
    [curLessonIdx, speakState, subtitleIntro, curSubtitleInfo],
  );

  useEffect(() => {}, [speakState]);

  const onVideoEnd = useCallback(() => {
    setCurSubtitleInfo({end: 0, idx: -1});
    setDisplayMainSubtitle('');
    setDisplayMySubtitle('');
    switch (speakState) {
      case 'intro':
        console.log(`intro end`);
        setSpeakState('ready');
        // setCurChannel('b');
        setChannel(c => ({
          ...c,
          a: chapterData.speakDatas[curLessonIdx].successURL,
        }));
        break;
      case 'ready':
        console.log(`ready end`);
        setRecording(false);
        setRecordedText('');
        setDisplayPronounce('');
        setSpeakState('fail');
        Voice.stop();
        break;
      case 'fail':
        console.log(`fail end`);
        setSpeakState('ready');
        // setCurChannel('b');
        break;
      case 'success':
        console.log(`success end`);
        if (curLessonIdx !== chapterData.speakDatas.length - 1)
          setCurLessonIdx(i => i + 1);
        else navigation.pop();
        break;
    }
  }, [speakState]);

  const getVtts = async (entries: any) => {
    // console.log(`entries:: `, entries);
    let res: any = {};
    for await (const e of entries.filter((e: any) => e[1].length)) {
      if (e[0] === '__typename') continue;
      if (e[1].length) {
        const strVtt: string = (await axios.get(e[1])).data.replace(/\r/gi, '');

        const objVtt = vttToJson(
          strVtt
            .trimLeft()
            .substring(Platform.OS === 'android' ? 7 : 6)
            .trimLeft(),
        );

        // console.log(`::::: `, objVtt);
        res[e[0]] = objVtt;
      }
    }
    return res;
  };

  const renderLesson = ({item, index}: {item: TSpeak; index: number}) => {
    return (
      <View style={{marginHorizontal: 5}}>
        <View style={{width: 20, height: 20, ...theme.center}}>
          <Image
            source={icoSpeakCircle.src}
            style={{width: '100%', height: '100%', position: 'absolute'}}
          />
          <Text
            style={{
              ...theme.fontSizes.smallest,
              paddingVertical: 0,
              color: '#fff',
              fontWeight: 'bold',
            }}>
            {(index + 1 + '').padStart(2, '0')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setCurLessonIdx(index);
            setFailCount(0);
            setDisplayMainSubtitle('');
            setDisplayMySubtitle('');
            setSpeakState('intro');
            setStudyPaused(false);
          }}>
          <Image
            source={{uri: item.pic}}
            style={{
              width: 120,
              height: 120 * (16 / 9),
              borderWidth: 3,
              borderColor: theme.colors.gray,
              borderRadius: 20,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BaseLayout ref={refBase} style={{flex: 1}}>
      <View style={{flex: 1}}>
        <View
          onTouchEnd={() => {
            setStudyPaused(true);
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}>
          <Video
            ref={refVideoIntro}
            source={{
              uri: channel.intro,
            }}
            resizeMode="cover"
            paused={speakState === 'intro' ? studyPaused : true}
            style={{
              width: '100%',
              height: speakState === 'intro' ? '100%' : 0,
            }}
            onError={e => {
              console.log(`EEE `, e);
            }}
            onLoad={() => {
              // speakState === 'intro' && setStudyPaused(false);
            }}
            onProgress={onVideoProgress}
            onEnd={onVideoEnd}
          />
          <Video
            ref={refVideoReady}
            source={{
              uri: channel.ready,
            }}
            resizeMode="cover"
            paused={speakState === 'ready' ? studyPaused : true}
            style={{
              width: '100%',
              height: speakState === 'ready' ? '100%' : 0,
            }}
            onError={e => {
              console.log(`EEE `, e);
            }}
            onLoad={() => {
              setStudyPaused(false);
            }}
            onProgress={onVideoProgress}
            onEnd={onVideoEnd}
          />
          <Video
            ref={refVideoFail}
            source={{
              uri: channel.fail,
            }}
            resizeMode="cover"
            paused={speakState === 'fail' ? studyPaused : true}
            style={{
              width: '100%',
              height: speakState === 'fail' ? '100%' : 0,
            }}
            onError={e => {
              console.log(`EEE `, e);
            }}
            // onLoad={() => {
            //   speakState === 'intro' && setStudyPaused(false);
            // }}
            onProgress={onVideoProgress}
            onEnd={onVideoEnd}
          />
          <Video
            ref={refVideoSuccess}
            source={{
              uri: channel.success,
            }}
            resizeMode="cover"
            paused={speakState === 'success' ? studyPaused : true}
            style={{
              width: '100%',
              height: speakState === 'success' ? '100%' : 0,
            }}
            onError={e => {
              console.log(`EEE `, e);
            }}
            // onLoad={() => {
            //   speakState === 'intro' && setStudyPaused(false);
            // }}
            onProgress={onVideoProgress}
            onEnd={onVideoEnd}
          />

          {curAudio !== 'init' && !!curAudio.length && (
            <Video
              ref={refAudio}
              source={{uri: curAudio}}
              style={{width: 0, height: 0}}
              onLoad={e => {
                refAudio?.current?.seek(0);
              }}
              onEnd={() => {
                setCurAudio('init');
              }}
              paused={!!!curAudio.length}
            />
          )}
        </View>
        <View
          style={{
            ...theme.center,
            width: '90%',
            alignSelf: 'center',
            marginTop: 30,
          }}>
          {speakState === 'ready' && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                paddingBottom: 10,
                paddingHorizontal: 10,
              }}
              onPress={() => {
                setVoiceReady(chapterData.speakDatas[curLessonIdx].playSample);
              }}>
              <Image source={icoMic.src} style={{width: 40, height: 40}} />
            </TouchableOpacity>
          )}

          {displayMainSubtitle.length > 0 && (
            <View
              style={{
                ...theme.center,
                paddingHorizontal: 10,
                backgroundColor: '#00000099',
              }}>
              <Text
                style={{...theme.fontSizes.largest, color: theme.colors.mint}}>
                {displayMainSubtitle}
              </Text>
            </View>
          )}

          {displayPronounce.length > 0 && (
            <View
              style={{
                ...theme.center,
                paddingHorizontal: 10,
                backgroundColor: '#00000099',
                marginTop: 10,
              }}>
              <Text
                style={{...theme.fontSizes.medium, color: theme.colors.mint}}>
                {displayPronounce}
              </Text>
            </View>
          )}

          {displayMySubtitle.length > 0 && (
            <View
              style={{
                ...theme.center,
                paddingHorizontal: 10,
                backgroundColor: '#00000099',
                marginTop: 10,
              }}>
              <Text style={{...theme.fontSizes.medium, color: '#fff'}}>
                {displayMySubtitle}
              </Text>
            </View>
          )}
        </View>

        {studyPaused && (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#00000066',
              position: 'absolute',
            }}>
            <View style={{paddingLeft: 20, ...theme.boxes.rowBetweenCenter}}>
              <View style={theme.boxes.rowBetweenCenter}>
                <Image
                  source={icoFlowerMint.src}
                  style={{width: 15, height: 15, marginRight: 5}}
                />
                <Text style={{fontSize: 13, color: '#fff'}}>SUBTITLE</Text>
              </View>
              <Pressable
                style={{
                  padding: 20,
                }}
                onPress={() => {
                  navigation.pop();
                }}>
                <Image
                  source={icoExitWhite.src}
                  style={{width: 15, height: 15}}
                />
              </Pressable>
            </View>

            <View
              style={{
                width: '90%',
                alignSelf: 'center',
                backgroundColor: '#000000cc',
                borderRadius: 20,
                height: 60,
                marginTop: 40,
                ...theme.center,
              }}>
              <FlatList
                data={langs}
                horizontal
                renderItem={({item, index}) => {
                  // console.log(`item: `, item.name, item.value, me.subtitle);
                  return (
                    <Pressable
                      disabled={me.subtitle === item.name}
                      style={{height: '100%', ...theme.center}}
                      onPress={() => {
                        setTempSubtitleLang(toShortLower(item.name));
                      }}>
                      <View
                        style={[
                          {
                            width: 80,
                            borderRadius: 10,
                            ...theme.center,
                            paddingVertical: 3,
                          },
                          me.subtitle === item.name && {
                            backgroundColor: theme.colors.mint,
                          },
                        ]}>
                        <Text
                          style={{
                            ...theme.fontSizes.small,
                            paddingVertical: 0,
                            color: '#fff',
                          }}>
                          {item.name}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
                keyExtractor={item => item.value}
              />
            </View>
            <View
              style={{
                flex: 1,
                ...theme.center,
              }}>
              <TouchableOpacity
                style={{padding: 10}}
                onPress={() => {
                  setStudyPaused(false);
                }}>
                <Image source={icoPlay.src} style={{width: 50, height: 50}} />
              </TouchableOpacity>
            </View>
            <View style={{}}>
              <FlatList
                horizontal
                data={chapterData.speakDatas}
                style={{paddingHorizontal: 15, paddingBottom: 30}}
                renderItem={renderLesson}
                keyExtractor={item => JSON.stringify(item)}
              />
            </View>
          </View>
        )}
      </View>
    </BaseLayout>
  );
};

export default SpeakStudyScreen;
