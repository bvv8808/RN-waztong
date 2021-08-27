import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import StackHeader from '~/components/StackHeader';
import {
  arrowDownGrayThin,
  arrowUpGrayThin,
  icoFlower1,
  icoFlowerMint,
} from '~/images';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import {
  __accordians_faq,
  __accordians_notice,
  __myInfo,
} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TNotice} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {toShortUpper} from '~/lib/util';

const arrowWidth = 15;

interface Props {
  navigation: any;
}

const dummyNotice = [
  {
    subject: '쿠폰 등록이 안돼요',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: true,
  },
  {
    subject: '수강 목록이 보이지 않아요',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: true,
  },
  {
    subject: '수강신청은 어떻게 하나요?',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: true,
  },
  {
    subject: '회원가입은 어떻게 하는 건가요?ㅋㅋㅋㅋㅋㅋㅋ',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: true,
  },
  {
    subject: '수강권은 환불이 가능한가요?ㅋㅋㅋ',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: false,
  },
  {
    subject: '동영상이 안 나와요ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: false,
  },
  {
    subject:
      '회원가입은 어떻게 하는ㄱ ㅓㄴ가요ㅋㅋㅋㅋㅋㅋㅋㅋㅋ?ㅋㅋ?ㅋㅋㅋㅋ?ㅋㅋ?ㅋㅋ?ㅋ?',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
    isNew: false,
  },
];
const noticeLimit = 30;

const NoticeScreen = ({navigation}: Props) => {
  const r_setAccordians = useSetRecoilState(__accordians_notice);
  const me = useRecoilValue(__myInfo);

  const [from, setFrom] = useState(0);
  const [endFetching, setEndFetching] = useState(false);
  const [list, setList] = useState<TNotice[]>([]);

  const [loadNotice, {data: noticeData, error: noticeError}] =
    useBLazyQuery('notice');

  useEffect(() => {
    if (noticeData) {
      setList(l => [...l, ...noticeData.getNotice]);
      if (noticeData.getNotice.length < noticeLimit) setEndFetching(true);
      else setFrom(f => f + noticeLimit);
    }
  }, [noticeData]);
  useEffect(() => {
    if (noticeError) {
      toast.show(noticeError.message);
      console.log(`Notice Error :::: `, JSON.stringify(noticeError));
    }
  }, [noticeError]);

  useEffect(() => {
    loadNotice({
      variables: {
        from: 0,
        limit: noticeLimit,
        subtitleLanguage: toShortUpper(me.subtitle),
      },
    });
    return () => {
      r_setAccordians([]);
    };
  }, []);

  useEffect(() => {
    r_setAccordians(a => [
      ...a,
      ...list.slice(a.length).map(d => ({open: false, newAndNotSee: d.isNew})),
    ]);
  }, [list]);
  const CollapseContent = ({title, content, isNew, idx}: any) => {
    const accordians = useRecoilValue(__accordians_notice);
    return (
      <View key={idx}>
        <TouchableOpacity
          onPress={() => {
            const isExpanded = accordians.length
              ? !accordians[idx].open
              : false;
            if (isExpanded) {
              console.log(`#1`);
              if (accordians[idx]?.newAndNotSee) {
                console.log(`#2`);
                // AsyncStorage 갱신
                r_setAccordians(a => {
                  let copied = a.slice();
                  copied[idx] = {open: copied[idx].open, newAndNotSee: false};
                  return copied;
                });
              }

              r_setAccordians(a => {
                return a.map((item, i) => ({...item, open: i === idx}));
              });
            } else
              r_setAccordians(a => a.map(item => ({...item, open: false})));
          }}>
          <View style={s.menuBox}>
            <View
              style={{height: '100%', flex: 1, ...theme.boxes.rowStartCenter}}>
              <Text numberOfLines={1} style={[s.menuText, {maxWidth: '90%'}]}>
                {title}
              </Text>

              {accordians.length > 0 && accordians[idx]?.newAndNotSee && (
                <Text
                  style={{
                    ...theme.fontSizes.ultra,
                    paddingVertical: 0,
                    color: theme.colors.mint,
                  }}>
                  {' '}
                  •{' '}
                </Text>
              )}
            </View>
            <Image
              source={
                accordians.length > 0 && accordians[idx]?.open
                  ? arrowUpGrayThin.src
                  : arrowDownGrayThin.src
              }
              style={{
                width: arrowWidth,
                height: arrowWidth * arrowUpGrayThin.ratio,
              }}
            />
          </View>
        </TouchableOpacity>
        {accordians.length > 0 && accordians[idx]?.open && (
          <View style={s.contentContainer}>
            <Text style={s.content}>{content}</Text>
          </View>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader title="Notice" navigation={navigation} />
      <View style={{flex: 1}}>
        <View
          style={{
            ...theme.boxes.rowStartCenter,
            flexWrap: 'wrap',
            paddingHorizontal: 20,
            marginTop: 30,
            marginBottom: 10,
          }}>
          <Image
            source={icoFlowerMint.src}
            style={{width: 20, height: 20, marginRight: 10}}
            resizeMode="contain"
          />
          <Text style={theme.texts.largestTitle}>
            Important Notice for our Members!
          </Text>
        </View>

        <FlatList
          data={list}
          onEndReached={() => {
            !endFetching &&
              loadNotice({
                variables: {
                  from,
                  limit: noticeLimit,
                  subtitleLanguage: toShortUpper(me.subtitle),
                },
              });
          }}
          renderItem={item => {
            return (
              <CollapseContent
                title={item.item.subject}
                content={item.item.content}
                isNew={item.item.isNew}
                idx={item.index}
              />
            );
          }}
          keyExtractor={item => item.subject}
        />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  menuBox: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    ...theme.boxes.rowBetweenCenter,
    paddingHorizontal: 20,
  },
  menuText: {
    // marginHorizontal: 10,
    color: '#333',
    ...theme.fontSizes.small,
    paddingVertical: 0,
  },

  contentContainer: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },
  content: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: '#555',
    textAlign: 'auto',
  },
});

export default NoticeScreen;
