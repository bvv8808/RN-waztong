import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {useCallback} from 'react';
import {useRef} from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import BaseLayout from '~/base/BaseLayout';
import {
  arrowLeftWhite,
  icoGallery,
  icoPhoto1,
  icoReviewWrite,
  profileEmpty,
  profileEmptyGray1,
  profileEmptyGray2,
} from '~/images';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import {
  __enterReviewDetail,
  __myInfo,
  __preventReviewRefesh,
  __refreshReviewList,
  __token,
} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TReview, TReviewStackParams} from '~/lib/types';

const ReviewListScreen = ({
  navigation,
  route,
}: StackScreenProps<TReviewStackParams, 'reviewList'>) => {
  const {searchId} = route.params;
  const focused = useIsFocused();

  const [preventRefresh, r_setPreventRefresh] = useRecoilState(
    __preventReviewRefesh,
  );
  const [enterReviewDetail, r_setEnterReviewDetail] =
    useRecoilState(__enterReviewDetail);
  const token = useRecoilValue(__token);
  const me = useRecoilValue(__myInfo);

  const [list, setList] = useState<TReview[]>([]);
  const [endLoading, setEndLoading] = useState(false);
  const [from, setFrom] = useState(0);

  const refBase = useRef<BaseLayout>(null);

  const [loadReview, {data: reviewData, error: reviewError}] =
    useBLazyQuery('reviews');

  const onBack = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Main');
    return true;
  }, []);

  useEffect(() => {
    // 화면 포커스 시 리뷰 로딩
    if (focused) {
      console.log(`Focused`);

      if (!enterReviewDetail) {
        setFrom(0);
        setEndLoading(false);
        refBase.current?.startLoading();
        loadReview({
          variables: {
            token: token,
            id: searchId || '',
            limit: 20,
            from: 0,
          },
        });
      } else r_setPreventRefresh(true);

      BackHandler.addEventListener('hardwareBackPress', onBack);
    } else {
      console.log(`Blurred`);
      BackHandler.removeEventListener('hardwareBackPress', onBack);
      r_setPreventRefresh(false);
      r_setEnterReviewDetail(false);
    }
  }, [focused]);

  useEffect(() => {
    // console.log(`reviewDAta:::: `, reviewData);
    if (reviewData && reviewData.getLive) {
      if (preventRefresh) {
        console.log(`이어붙이기`);
        // 초기화 금지 = 기존 리스트에 이어붙이기

        // @ts-ignore
        setList(l => [...l, ...reviewData.getLive]);
      } else {
        console.log(`덮어쓰기`);
        // 초기화 = 리스트 덮어쓰기
        setList(reviewData.getLive);

        // 화면 진입 후 Fetch할 때마다 리스트를 덮어쓰면 안되니까, 한번 덮어쓴 후에는 초기화를 막음.
        // 화면 Blur 시 다시 false로 설정해줘서 다음에 다시 화면 진입했을 때 Fetch한 데이터로 다시 데이터를 덮어쓰도록.
        r_setPreventRefresh(true);
      }

      if (reviewData.getLive.length < 20) {
        setEndLoading(true);
      } else {
        setFrom(f => f + 20);
      }
      refBase.current?.stopLoading();
    }
  }, [reviewData]);
  useEffect(() => {
    console.log(`reviewError:: :`, JSON.stringify(reviewError));
    refBase.current?.stopLoading();
  }, [reviewError]);

  const renderList = ({item, index}: {item: TReview; index: number}) => {
    return (
      <Pressable
        style={{
          ...theme.boxes.rowBetweenCenter,
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
        }}
        onPress={() => {
          setList(l => {
            let copied = l.slice();
            const curIdx = copied.findIndex(r => r.idx === item.idx);
            copied[curIdx].view = copied[curIdx].view + 1;

            return copied;
          });
          // @ts-ignore
          navigation.push(
            route.key.startsWith('My') ? 'MyReviewDetail' : 'reviewDetail',
            {reviewIdx: item.idx},
          );
        }}>
        <Image
          source={
            item.writer.img.length ? {uri: item.writer.img} : profileEmpty.src
          }
          style={{
            width: 30,
            height: 30,
            borderRadius: 100,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        />
        <View style={{flex: 1, paddingVertical: 3}}>
          <Text style={[s.tWriterName, {color: '#fff'}]}>a</Text>
          <Text numberOfLines={1} style={s.tReviewTitle}>
            {item.subject}
          </Text>
          <Text style={s.tWriterName}>
            {item.writer.name} views{item.view} like{item.recommend}
          </Text>
        </View>
        <View style={{height: '100%', paddingHorizontal: 10}}>
          <View style={{flex: 1, ...theme.center}}>
            <Text style={[s.tWriterName, {color: '#fff'}]}>0</Text>

            {item.pics.length > 0 && (
              <Image
                source={icoGallery.src}
                style={{width: 12, height: 12}}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={s.tWriterName}>
            {item.registDatetime.substring(5, 10).replace('-', '.')}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <BaseLayout ref={refBase} style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={s.header}>
        {searchId ? (
          <TouchableOpacity
            style={{width: 60, height: 60, ...theme.center}}
            onPress={() => navigation.pop()}>
            <Image
              source={arrowLeftWhite.src}
              style={{width: 25, height: 25}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <View style={{width: 60}} />
        )}
        <Text style={s.headerTitle}>Real time review</Text>
        <View style={{width: 50}} />
      </View>
      {list.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          initialNumToRender={20}
          data={list}
          renderItem={renderList}
          keyExtractor={item => item.idx.toString()}
          onEndReached={() => {
            if (!endLoading) {
              refBase.current?.startLoading();
              loadReview({
                variables: {
                  token: token,
                  limit: 20,
                  from,
                  id: searchId || '',
                },
              });
            }
          }}
          onEndReachedThreshold={0.16}
        />
      ) : (
        <View
          style={{
            flex: 1,
            ...theme.center,
          }}>
          <Text style={s.tNoReview}>You have no review</Text>
        </View>
      )}
      {/* <FlatList /> */}
      <View style={s.btnWriteWrapper}>
        <TouchableOpacity
          onPress={() => {
            navigation.push('reviewWrite');
          }}>
          <Image source={icoReviewWrite.src} style={{width: 60, height: 60}} />
        </TouchableOpacity>
      </View>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  header: {
    height: 60,
    ...theme.boxes.rowBetweenCenter,
    backgroundColor: theme.colors.mint,
  },
  headerTitle: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: '#fff',
  },

  tNoReview: {
    ...theme.fontSizes.large,
    color: theme.colors.grayInactive,
  },
  btnWriteWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },

  tReviewTitle: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: theme.colors.black4,
  },
  tWriterName: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: theme.colors.gray,
  },
});

export default ReviewListScreen;
