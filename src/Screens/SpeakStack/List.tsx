import React, {useCallback, useEffect, useState} from 'react';
import {
  BackHandler,
  Image,
  LogBox,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import theme from '~/lib/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {FlatList} from 'react-native';
import toast from 'react-native-simple-toast';
import {useRecoilState, useRecoilValue} from 'recoil';
import {__token, __myInfo, __coinConfig} from '~/lib/recoil/atom';
import {useRef} from 'react';
import {
  icoLock,
  icoSpeakLearn,
  icoSpeakLearnFinish,
  icoSpeakSpeak,
  icoSpeakSpeakFinish,
  mainBannerMan,
} from '~/images';
import AdContainer from '~/base/AdContainer';
import ListHeader from '~/components/ListHeader';
import {Dimensions} from 'react-native';
import {TSpeakLesson, TSpeakStackParams} from '~/lib/types';
import ChapterProgress from '~/components/ChapterProgress';
import {StackScreenProps} from '@react-navigation/stack';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import ModalLanguage from '~/components/Modals/ModalLanguage';
import {toFullInitCap, toShortLower, toShortUpper} from '~/lib/util';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import BaseLayout from '~/base/BaseLayout';
import {gql, useMutation} from '@apollo/client';
import {useMemo} from 'react';

const screenHeight = Dimensions.get('screen').height;

const emptyHeight = screenHeight * 0.5;

const levelContainerHeight = 60;
const titleTextHeight = 60;

LogBox.ignoreLogs(['Virt']);

const enclosedNum = [
  '\u2460',
  '\u2461',
  '\u2462',
  '\u2463',
  '\u2464',
  '\u2465',
  '\u2466',
  '\u2467',
  '\u2468',
  '\u2469',
  '\u246A',
  '\u246B',
  '\u246C',
  '\u246D',
  '\u246E',
  '\u246F',
  '\u2670',
  '\u2671',
  '\u2672',
  '\u2673',
];

const SpeakListScreen = ({
  navigation,
}: StackScreenProps<TSpeakStackParams, 'speakList'>) => {
  // Recoil
  const token = useRecoilValue(__token);
  const [me, r_setMe] = useRecoilState(__myInfo);
  const coinConfig = useRecoilValue(__coinConfig);

  const focused = useIsFocused();
  const refAdBase = useRef<AdContainer>(null);
  const refBase = useRef<BaseLayout>(null);
  const refModalLanguage = useRef<ModalLanguage>(null);

  const myLanguage = useMemo(() => toShortUpper(me.language), [me.language]);

  // layout 관련 state
  const [reachedTop, setReachedTop] = useState(false);
  const [innerScrollHeight, setInnerScrollHeight] = useState(0);

  // data 관련 state
  const [chapterList, setChapterList] = useState<TSpeakLesson[]>([]);
  const [levelList, setLevelList] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [objEnd, setObjEnd] = useState<any>({});

  const [loadChapters, {data: chapterData, error: chapterError}] =
    useBLazyQuery('speakChapters');

  const [loadLevels, {data: levelData, error: levelError}] =
    useBLazyQuery('speakLevels');

  useEffect(() => {
    if (levelError) console.log(`Level Error ::: `, JSON.stringify(levelError));
  }, [levelError]);

  const [mutSetLanguage] = useBMutation('language');
  const [mutSetLearn] = useBMutation('finishLearn');
  const [mutSetSpeak] = useBMutation('finishSpeak');
  const [mutAfterAd] = useMutation(gql`
      mutation($idx: Int!) {
        setBuy(session: "${token}", idx: $idx, boardType: ST withAD: true)
      }
    `);

  useEffect(() => {
    PermissionsAndroid.request('android.permission.RECORD_AUDIO');
  }, []);

  useEffect(() => {
    loadLevels({
      variables: {language: toShortUpper(me.language)},
    });
  }, [me.language]);

  useEffect(() => {
    if (levelData) {
      setLevelList(
        Array.from(
          {length: levelData.getConfig.getChapterCountForST},
          (x, i) => i + 1,
        ),
      );
    }
  }, [levelData]);

  useEffect(() => {
    refBase.current?.startLoading();
    loadChapters({
      variables: {token, language: myLanguage, level: selectedLevel},
    });
  }, [selectedLevel, me.language]);

  const onBack = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Main');
    return true;
  }, []);

  useEffect(() => {
    if (!focused) {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
      return;
    }

    BackHandler.addEventListener('hardwareBackPress', onBack);

    loadChapters({
      variables: {token, language: myLanguage, level: selectedLevel},
    });
  }, [focused]);

  useEffect(() => {
    if (chapterData) {
      // console.log(`chapterData:: `, chapterData.getSpeakTraining);
      setChapterList(chapterData.getSpeakTraining.lesson);
      refBase.current?.stopLoading();
    }
  }, [chapterData]);

  useEffect(() => {
    const msg = chapterError?.message;
    if (msg) toast.show(msg, 1);
    console.log(`Error:: `, JSON.stringify(chapterError));
  }, [chapterError]);

  useEffect(() => {
    console.log(`chapterList::: `, chapterList);
  }, [chapterList]);

  // // # Error occured
  // useEffect(() => {
  //   const msg = listError?.message || levelError?.message || '';
  //   // const translatedMsg = trans(msg, lang);
  //   if (msg) toast.show(msg, 1);
  // }, [listError, levelError]);

  const LevelButton = ({lv}: {lv: number}) => (
    <View
      style={{
        height: '100%',
        justifyContent: 'center',
        marginHorizontal: 5,
      }}>
      <TouchableOpacity
        onPress={() => {
          setSelectedLevel(lv);
        }}
        style={[
          {
            width: levelContainerHeight * 0.8,
            height: levelContainerHeight * 0.8,
            borderRadius: levelContainerHeight / 5,
            backgroundColor:
              selectedLevel === lv ? theme.colors.mint : '#ffffff55',
            ...theme.center,
          },
          selectedLevel === lv
            ? {
                backgroundColor: reachedTop ? '#666' : theme.colors.mint,
              }
            : {
                backgroundColor: reachedTop ? theme.colors.border : '#ffffff55',
              },
          Platform.OS === 'ios'
            ? {borderColor: '#00000033'}
            : {
                borderColor: selectedLevel === lv ? '#5e161d66' : '#79757466',
              },
        ]}>
        <Text
          style={{
            ...theme.fontSizes.small,
            paddingVertical: 0,
            color: reachedTop && selectedLevel !== lv ? '#444' : '#fff',
            fontWeight: 'bold',
          }}>
          Lv.{lv}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChapter = ({
    item,
    index,
  }: {
    item: TSpeakLesson;
    index: number;
  }) => {
    const ended =
      objEnd[selectedLevel] && objEnd[selectedLevel].includes(item.idx);

    return (
      <View style={{width: '100%', paddingHorizontal: 15, marginTop: 5}}>
        <View
          style={{
            width: '100%',
            height: 70,
            ...theme.boxes.rowBetweenCenter,
          }}>
          <View style={{...theme.boxes.rowStartCenter, flex: 1}}>
            <View
              style={{
                width: 70,
                height: 70,
                ...theme.center,
              }}>
              {item.learnDatas && item.learnDatas.length === 0 ? (
                <Image
                  source={icoLock.src}
                  style={{width: 20, height: 20 * icoLock.ratio}}
                />
              ) : (
                <Text
                  style={{
                    ...theme.fontSizes.ultra,
                    color: theme.colors.mint,
                    fontWeight: 'bold',
                  }}>
                  {enclosedNum[index]}
                </Text>
              )}
            </View>
            <Text style={{flex: 1}} numberOfLines={2}>
              {item.subject[toShortLower(me.subtitle)]}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // [Learn]
              // ##. 문제 수나 구매여부에 따라 "광고 표시", "코인 지불", "테스트 입장"으로 분기

              // ##. 서버에 Learn 완료 쿼리 전송
              // ##. chapterList에서 해당 idx를 가진 아이템의 isLearn을 true로 변경
              // ##. 화면 전환
              console.log(`item::::::::::\n`, item.learnDatas);

              if (item.learnDatas?.length) {
                if (!item.isLearn) {
                  mutSetLearn({
                    variables: {
                      session: token,
                      idx: item.idx,
                      language: toShortUpper(me.language),
                    },
                  })
                    .then(() => {
                      setChapterList(list => {
                        const idx = list.findIndex(l => l.idx === item.idx);
                        let copied = list.slice();
                        copied[idx] = {...copied[idx], isLearn: true};
                        return copied;
                      });
                    })
                    .catch(e => {
                      console.log(`ERRORRRRR `, JSON.stringify(e));
                    });
                }

                navigation.push('adLearn', {
                  learnData: item.learnDatas,
                  chapterIdx: item.idx,
                });
                return;
              } else {
                setSelectedIdx(item.idx);
                if (me.coin < coinConfig.getPointForSpeak) {
                  // #1 광고 시청 제안
                  refAdBase.current?.showAdModal();
                } else {
                  console.log(`#1`);
                  // #2 컨텐츠 구매 제안
                  refAdBase.current?.showSpendModal(
                    coinConfig.getPointForSpeak,
                    'speak',
                    item.idx,
                  );
                }
              }
            }}>
            <Image
              source={
                item.isLearn ? icoSpeakLearnFinish.src : icoSpeakLearn.src
              }
              style={{width: 50, height: 50, marginRight: 10}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // [Speak]
              // ##. 문제 수나 구매여부에 따라 "광고 표시", "코인 지불", "테스트 입장"으로 분기

              const enter = () => {
                if (item.speakDatas?.length) {
                  if (!item.isTested) {
                    mutSetSpeak({
                      variables: {
                        session: token,
                        idx: item.idx,
                        language: toShortUpper(me.language),
                      },
                    })
                      .then(() => {
                        setChapterList(list => {
                          const idx = list.findIndex(l => l.idx === item.idx);
                          let copied = list.slice();
                          copied[idx] = {...copied[idx], isTested: true};
                          return copied;
                        });
                      })
                      .catch(e => {
                        console.log(`ERROR Speak `, JSON.stringify(e));
                      });
                  }

                  navigation.push('speakGateway', {
                    chapterData: item,
                  });
                  return;
                } else {
                  setSelectedIdx(item.idx);
                  if (me.coin < coinConfig.getPointForSpeak) {
                    // #1 광고 시청 제안
                    refAdBase.current?.showAdModal();
                  } else {
                    console.log(`#1`);
                    // #2 컨텐츠 구매 제안
                    refAdBase.current?.showSpendModal(
                      coinConfig.getPointForSpeak,
                      'speak',
                      item.idx,
                    );
                  }
                }
              };

              if (Platform.OS === 'android') {
                PermissionsAndroid.check(
                  'android.permission.RECORD_AUDIO',
                ).then(granted => {
                  if (granted) enter();
                  else
                    toast.show(
                      'Can not enter becusae did not give us a record permission',
                      1.5,
                    );
                });
              } else enter();
            }}>
            <Image
              source={
                item.isTested ? icoSpeakSpeakFinish.src : icoSpeakSpeak.src
              }
              style={{width: 50, height: 50, marginRight: 10}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <BaseLayout ref={refBase}>
      <AdContainer
        ref={refAdBase}
        token={token}
        onChangeCoin={(coin, type) => {
          if (coin !== -1)
            r_setMe(m => ({
              ...m,
              coin,
            }));

          if (!type) {
            console.log(`selectedIdx: `, selectedIdx, selectedLevel, token);
            mutAfterAd({
              variables: {idx: selectedIdx},
            })
              .then(() => {
                loadChapters({
                  variables: {
                    token,
                    language: myLanguage,
                    level: selectedLevel,
                  },
                });
              })
              .catch(e => {
                console.log(`e:: `, e);
                toast.show('Error occured', 1.5);
              });
          }

          type === 'spend' &&
            loadChapters({
              variables: {token, language: myLanguage, level: selectedLevel},
            });
        }}>
        <View style={{flex: 1}}>
          <Image
            source={{uri: chapterList[0]?.speakDatas[0].pic}}
            resizeMode="cover"
            style={{
              width: '100%',
              height: emptyHeight + levelContainerHeight * 2,
              position: 'absolute',
            }}
          />

          {/* Header --> */}
          <ListHeader background="#00000077" refModal={refModalLanguage} />
          {/* <-- Header */}

          {/* MAIN Section --> */}
          <View
            onLayout={({nativeEvent}) => {
              setInnerScrollHeight(
                nativeEvent.layout.height - levelContainerHeight - 40,

                // titleTextHeight,
              );
            }}
            style={{
              flex: 1,
            }}>
            {/* <Image
            source={listBackground.src}
            style={{width: '100%', height: '100%', position: 'absolute'}}
            resizeMode="cover"
          /> */}

            <ScrollView
              bounces={false}
              style={{
                backgroundColor: '#ffffff00',
              }}
              scrollEventThrottle={16}
              // nestedScrollEnabled
              onScroll={({nativeEvent}) => {
                const offsetY = nativeEvent.contentOffset.y;
                // console.log(
                //   `offset: `,
                //   offsetY,
                //   levelContainerHeight + emptyHeight,
                // );
                if (offsetY >= emptyHeight - 5) {
                  !reachedTop && setReachedTop(true);
                  // setFixedTop(offsetY);
                } else {
                  reachedTop && setReachedTop(false);
                }
              }}>
              {/* Empty Box */}
              <View style={{height: emptyHeight}} />

              {/* Level Container --> */}
              <View
                style={{
                  width: '100%',
                  height: levelContainerHeight,
                  backgroundColor: reachedTop ? '#fff' : '#00000077',
                  flexDirection: 'row',
                }}>
                <ScrollView horizontal style={{}}>
                  <View style={{width: 10}} />
                  {/* Level --> */}
                  {/* {levelData?.getConfig.wordLectureTitle.map(
                  (title: string, i: number) => {
                    if (!title) return null;

                    return (
                      <LevelButton key={title + i} lv={i + 1} subject={title} />
                    );
                  },
                )} */}
                  {/* <-- Level */}
                  {levelList.map((level: number) => {
                    return <LevelButton key={level} lv={level} />;
                  })}
                  <View style={{width: 10}} />
                </ScrollView>
              </View>
              {/* <-- Level Container */}

              <ChapterProgress
                now={Number(chapterData?.getSpeakTraining.progress || 0)}
                total={Number(chapterData?.getSpeakTraining.allCount || 0)}
                // now={0}
                // total={0}
              />
              {/* Inner ScollView */}
              <FlatList
                scrollEnabled={reachedTop}
                data={
                  chapterList
                  // fakeSpeakTraining.lesson
                }
                renderItem={renderChapter}
                keyExtractor={item => item.idx + ''}
                nestedScrollEnabled
                style={{
                  height: innerScrollHeight,
                  backgroundColor: '#fff',
                }}
              />
            </ScrollView>
          </View>
          {/* <-- MAIN Section */}
        </View>

        <ModalLanguage
          ref={refModalLanguage}
          // @ts-ignore
          initialSelected={toShortUpper(me.language)}
          onSelect={selected => {
            // mutSetMe
            mutSetLanguage({
              variables: {session: token, language: selected.value},
            })
              .then(() => {
                r_setMe(m => ({
                  ...m,
                  language: toFullInitCap(selected.value),
                }));
                setSelectedLevel(1);
              })
              .catch(e => {
                console.log(`Error in mutSetLanguage@@@@@@`, JSON.stringify(e));
                toast.show('Error occured', 1);
              });
          }}
        />
      </AdContainer>
    </BaseLayout>
  );
};

export default SpeakListScreen;
