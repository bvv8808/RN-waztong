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
import StackHeader from '~/components/StackHeader';
import {
  arrowDownGrayThin,
  arrowUpGrayThin,
  icoFlower1,
  icoFlower2,
  icoFlower3,
} from '~/images';
import theme from '~/lib/theme';
import {useRecoilState, useRecoilValue} from 'recoil';
import {__accordians_faq, __myInfo} from '~/lib/recoil/atom';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import {TFAQ} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {toShortUpper} from '~/lib/util';

const arrowWidth = 15;

const dummyFAQ = [
  {
    subject: '쿠폰 등록이 안돼요',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
  {
    subject: '수강 목록이 보이지 않아요',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
  {
    subject: '수강신청은 어떻게 하나요?',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
  {
    subject: '회원가입은 어떻게 하는 건가요?ㅋㅋㅋㅋㅋㅋㅋ',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
  {
    subject: '수강권은 환불이 가능한가요?ㅋㅋㅋ',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
  {
    subject: '동영상이 안 나와요ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
  {
    subject:
      '회원가입은 어떻게 하는ㄱ ㅓㄴ가요ㅋㅋㅋㅋㅋㅋㅋㅋㅋ?ㅋㅋ?ㅋㅋㅋㅋ?ㅋㅋ?ㅋㅋ?ㅋ?',
    content:
      '더리ㅏ먿리ㅏ;멎ㄷ리ㅏ젇랴ㅐㅁ젛ㄷ매ㅑㅈㄷ허ㅑㅐㅁ적해ㅑㅁ적해ㅑ메저힉ㅈ머햄저래ㅑㅁ ㅈ더래첮대러ㅐ쟈더래ㅑㅈ ㅓㄷ래ㅓ 잳러 재먿랮머 래',
  },
];

const flowers = [icoFlower1.src, icoFlower2.src, icoFlower3.src];
const faqLimit = 30;

interface Props {
  navigation: any;
}

const FAQScreen = ({navigation}: Props) => {
  const [accordians, r_setAccordians] = useRecoilState(__accordians_faq);
  const me = useRecoilValue(__myInfo);

  const [from, setFrom] = useState(0);
  const [endFetching, setEndFetching] = useState(false);
  const [list, setList] = useState<TFAQ[]>([]);

  const [loadFAQ, {data: faqData, error: faqError}] = useBLazyQuery('faq');
  // const opened = accordians.find((i) => i.idx === idx)

  useEffect(() => {
    if (faqData) {
      setList(l => [...l, ...faqData.getFAQ]);
      if (faqData.getFAQ.length < faqLimit) setEndFetching(true);
      else setFrom(f => f + faqLimit);
    }
  }, [faqData]);
  useEffect(() => {
    if (faqError) {
      toast.show(faqError.message);
      console.log(`Notice Error :::: `, JSON.stringify(faqError));
    }
  }, [faqError]);

  useEffect(() => {
    loadFAQ({
      variables: {
        from: 0,
        limit: faqLimit,
        subtitleLanguage: toShortUpper(me.subtitle),
      },
    });
    return () => {
      r_setAccordians([]);
    };
  }, []);
  useEffect(() => {
    r_setAccordians(a => [...a, ...list.slice(a.length).map(() => false)]);
  }, [list]);
  const CollapseContent = ({title, content, flowerType, idx}: any) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            const isExpanded = !accordians[idx];
            if (isExpanded)
              r_setAccordians(a => {
                let copied = a.slice();
                for (let i = 0; i < a.length; i++) {
                  copied[i] = i === idx;
                }
                return copied;
              });
            else r_setAccordians(a => a.map(() => false));
          }}>
          <View style={s.menuBox}>
            <Image
              source={flowers[flowerType]}
              style={{width: arrowWidth, height: arrowWidth * icoFlower1.ratio}}
            />
            <Text numberOfLines={1} style={s.menuText}>
              {title}
            </Text>
            <Image
              source={
                accordians[idx] ? arrowUpGrayThin.src : arrowDownGrayThin.src
              }
              style={{
                width: arrowWidth,
                height: arrowWidth * arrowUpGrayThin.ratio,
              }}
            />
          </View>
        </TouchableOpacity>
        {accordians.length > 0 && accordians[idx] && (
          <View style={s.contentContainer}>
            <Text style={s.content}>{content}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader title="FAQ" navigation={navigation} />
      {/* <FlatList  */}
      <View style={{flex: 1}}>
        <FlatList
          onEndReached={() => {
            !endFetching &&
              loadFAQ({
                variables: {
                  from,
                  limit: faqLimit,
                  subtitleLanguage: toShortUpper(me.subtitle),
                },
              });
          }}
          data={list}
          renderItem={item => {
            return (
              <CollapseContent
                title={item.item.subject}
                content={item.item.content}
                flowerType={item.index % 3}
                idx={item.index}
              />
            );
          }}
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
    flex: 1,
    marginHorizontal: 10,
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

export default FAQScreen;
