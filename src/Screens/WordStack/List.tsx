import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  BackHandler,
  Image,
  LogBox,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import GradientView from 'react-native-linear-gradient';
import theme from '~/lib/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {gql, useLazyQuery, useQuery} from '@apollo/client';
import {FlatList} from 'react-native';
import toast from 'react-native-simple-toast';
import {useMutation} from '@apollo/client';
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil';
import {__token, __myInfo, __price, __coinConfig} from '~/lib/recoil/atom';
import {useRef} from 'react';
import {
  checkGray,
  checkMint,
  icoLock,
  icoWordFinish,
  icoWordTest,
  listBackground,
  woman,
} from '~/images';
import AdContainer from '~/base/AdContainer';
import ListHeader from '~/components/ListHeader';
import {Dimensions} from 'react-native';
import {TWordLesson, TWordStackParams} from '~/lib/types';
import ChapterProgress from '~/components/ChapterProgress';
import {StackScreenProps} from '@react-navigation/stack';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import ModalLanguage from '~/components/Modals/ModalLanguage';
import {toFullInitCap, toShortUpper} from '~/lib/util';
import {useIsFocused} from '@react-navigation/native';
import BaseLayout from '~/base/BaseLayout';

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

const WordListScreen = ({
  navigation,
}: StackScreenProps<TWordStackParams, 'wordList'>) => {
  // Recoil
  const token = useRecoilValue(__token);
  const coinConfig = useRecoilValue(__coinConfig);
  const [me, r_setMe] = useRecoilState(__myInfo);

  const focused = useIsFocused();
  const refAdBase = useRef<AdContainer>(null);
  const refBase = useRef<BaseLayout>(null);
  const refSubtitle = useRef<ModalLanguage>(null);

  // layout 관련 state
  const [reachedTop, setReachedTop] = useState(false);
  const [innerScrollHeight, setInnerScrollHeight] = useState(0);

  // data 관련 state
  const [wordList, setWordList] = useState<any[]>([]);
  const [levelList, setLevelList] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [objEnd, setObjEnd] = useState<any>({});

  const myLanguage = useMemo(() => toShortUpper(me.language), [me.language]);

  const [loadChapters, {data: chapterData, error: chapterError}] =
    useBLazyQuery('wordChapters');

  const [loadLevels, {data: levelData, error: levelError}] =
    useBLazyQuery('wordLevels');

  const [mutSetFinish] = useBMutation('finishWord');
  const [mutSetLanguage] = useBMutation('language');
  const [mutAfterAd] = useMutation(gql`
      mutation($idx: Int!) {
        setBuy(session: "${token}", idx: $idx, boardType: WT withAD: true)
      }
    `);

  useEffect(() => {
    loadLevels({
      variables: {language: toShortUpper(me.language)},
    });
  }, [me.language]);

  useEffect(() => {
    if (levelData) {
      setLevelList(
        Array.from(
          {length: levelData.getConfig.getChapterCountForWT},
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
    console.log(`###`);
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
      console.log(
        `chapterData:: `,
        chapterData.getWordTraining.lesson[0].problem,
      );
      setWordList(chapterData.getWordTraining.lesson);
      refBase.current?.stopLoading();
    }
  }, [chapterData]);

  useEffect(() => {
    if (chapterError) refBase.current?.stopLoading();
    const msg = chapterError?.message;
    if (msg) toast.show(msg, 1);
    console.log(`Error:: `, JSON.stringify(chapterError));
  }, [chapterError]);

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
              selectedLevel === lv ? theme.colors.mint : theme.colors.gray,
            ...theme.center,
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
            color: '#fff',
            fontWeight: 'bold',
          }}>
          Lv.{lv}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChapter = ({item, index}: {item: TWordLesson; index: number}) => {
    // console.log(`@@index of chapter: `, index);

    const ended =
      objEnd[selectedLevel] && objEnd[selectedLevel].includes(item.idx);

    return (
      <View style={{width: '100%', paddingHorizontal: 15, marginTop: 5}}>
        <View
          style={{
            width: '100%',
            height: 70,
            ...theme.boxes.rowBetweenCenter,
            borderRadius: 70,
            backgroundColor: theme.colors.backgroundGray,
          }}>
          <View style={{...theme.boxes.rowStartCenter, flex: 1}}>
            <View
              style={{
                width: 70,
                height: 70,
                ...theme.center,
              }}>
              {item.problem.length === 0 ? (
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
            <Text style={{flex: 1}} numberOfLines={1}>
              {/* {item.subject[me.subtitle.toLowerCase()]} */}
              {item.subject.en}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // ##. 문제 수나 구매여부에 따라 "광고 표시", "코인 지불", "테스트 입장"으로 분기

              // #1. 사용가능한 컨텐츠: 테스트 입장
              if (item.problem?.length) {
                mutSetFinish({
                  variables: {
                    session: token,
                    idx: item.idx,
                    language: toShortUpper(me.language),
                  },
                })
                  .then(() => {
                    if (item.isTested) return;

                    setWordList(list => {
                      const idx = list.findIndex(l => l.idx === item.idx);
                      let copied = list.slice();
                      copied[idx] = {...copied[idx], isTested: true};
                      return copied;
                    });
                  })
                  .catch(e => {
                    console.log(
                      `Error: mutSetFinish@@@@@@\n`,
                      JSON.stringify(e),
                    );
                  });

                navigation.push('ad', {wordData: item});
                return;
              }

              setSelectedIdx(item.idx);
              // #2. 포인트가 부족할 시 -> 광고 시청 제안 -> AdContainer의 이벤트리스너에서 광고 시청 여부를 판단 후 리스트 다시 로드
              if (me.coin < coinConfig.getPointForWord) {
                refAdBase.current?.showAdModal();
                return;
              }

              // #3. 포인트가 충분할 시 -> 구매 제안 -> AdContainer의 이벤트리스너에서 구매완료 받기
              else {
                refAdBase.current?.showSpendModal(
                  coinConfig.getPointForWord,
                  'word',
                  item.idx,
                );
              }
            }}>
            <Image
              source={item.isTested ? icoWordFinish.src : icoWordTest.src}
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
          console.log(`coin:: `, coin);

          if (!type) {
            console.log(`selectedIdx: `, selectedIdx);
            mutAfterAd({variables: {idx: selectedIdx}})
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
                toast.show('Error occurred', 1.5);
              });
          }

          type === 'spend' &&
            loadChapters({
              variables: {token, language: myLanguage, level: selectedLevel},
            });
        }}>
        <View style={[{flex: 1}]}>
          {/* Header --> */}
          <ListHeader background="#666" refModal={refSubtitle} />
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
            <Image
              source={listBackground.src}
              style={{width: '100%', height: '100%', position: 'absolute'}}
              resizeMode="cover"
            />
            <Image
              source={woman.src}
              resizeMode="contain"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
              }}
            />

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
                  backgroundColor: '#000000cc',
                  flexDirection: 'row',
                }}>
                <ScrollView horizontal style={{backgroundColor: '#fff'}}>
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
                now={Number(chapterData?.getWordTraining.progress || 0)}
                total={Number(chapterData?.getWordTraining.allCount || 0)}
                // now={0}
                // total={0}
              />
              {/* Inner ScollView */}
              <FlatList
                scrollEnabled={reachedTop}
                data={wordList}
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
          ref={refSubtitle}
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

export default WordListScreen;
