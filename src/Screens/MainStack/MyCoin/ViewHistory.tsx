import {gql, useLazyQuery} from '@apollo/client';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import StackHeader from '~/components/StackHeader';
import {__myInfo, __token} from '~/lib/recoil/atom';
import {GQLResponse, TMainStackParams, TViewHistory} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import BaseLayout from '~/base/BaseLayout';
import {useRef} from 'react';
import theme from '~/lib/theme';
import {toShortLower} from '~/lib/util';
import {icoSpeakLearn, icoSpeakSpeak, icoWordTest, woman} from '~/images';
import {useCallback} from 'react';

const screenWidth = Dimensions.get('screen').width;
const historyWidth = screenWidth - 30;

const ViewHistoryScreen = ({
  navigation,
  route,
}: StackScreenProps<TMainStackParams, 'viewHistory'>) => {
  const token = useRecoilValue(__token);
  const me = useRecoilValue(__myInfo);

  const refBase = useRef<BaseLayout>(null);

  const [histories, setHistories] = useState<TViewHistory[]>([]);
  const [loadHistory, {data, error: e, loading}] = useBLazyQuery('viewHistory');
  useEffect(() => {
    console.log(`!!!`, token);
    loadHistory({variables: {token}});
  }, []);

  useEffect(() => {
    if (data && data.getPurchased) {
      // console.log(`data: `, data.getPurchased[0].speakData);
      //
      setHistories(h => [...h, ...data.getPurchased]);
    }
  }, [data]);

  useEffect(() => {
    console.log(`loading:: `, loading);
    loading ? refBase.current?.startLoading() : refBase.current?.stopLoading();
  }, [loading]);

  useEffect(() => {
    if (e) {
      console.log(`Error: getPurchased:: `, JSON.stringify(e));
      toast.show('Error occurred', 1);
    }
  }, [e]);

  const onPressWord = useCallback(() => {
    navigation.popToTop();

    // @ts-ignore
    navigation.navigate('Word');
  }, []);
  const onPressSpeak = useCallback(() => {
    navigation.popToTop();

    // @ts-ignore
    navigation.navigate('Speak');
  }, []);

  const renderHistory = ({
    item,
    index,
  }: {
    item: TViewHistory;
    index: number;
  }) => {
    return item.speakData ? (
      <View style={{width: '100%', marginBottom: 10}}>
        <View style={s.historyContainer}>
          <Image
            source={{uri: item.speakData.speakDatas[0].pic}}
            style={{
              width: historyWidth * 0.4,
              height: historyWidth * 0.4 * (9 / 16),
            }}
            resizeMode="cover"
          />

          <View
            style={{
              flex: 1,
              height: historyWidth * 0.4 * (9 / 16),
              marginLeft: 20,
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={s.tCategory}>LV. {item.speakData.chapter}</Text>
              <Text style={s.tSubject} numberOfLines={1}>
                {item.speakData.subject[toShortLower(me.subtitle)]}
              </Text>
            </View>
            <View style={s.linkContainer}>
              <TouchableOpacity style={{marginRight: 5}} onPress={onPressSpeak}>
                <Image
                  source={icoSpeakLearn.src}
                  style={{width: 35, height: 35}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressSpeak}>
                <Image
                  source={icoSpeakSpeak.src}
                  style={{width: 35, height: 35}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {item.time === 'expiry' && <View style={s.expireWrap} />}

        <View
          style={[
            s.hourBox,
            item.time === 'expired' && {backgroundColor: '#333'},
          ]}>
          <Text style={s.tHour}>{item.time}</Text>
        </View>
      </View>
    ) : (
      <View style={{width: '100%', marginBottom: 10}}>
        <View style={s.historyContainer}>
          <Image
            // source={{uri: item.wordData?.speakDatas[0].pic}}
            source={woman.src}
            style={{
              width: historyWidth * 0.4,
              height: historyWidth * 0.4 * (9 / 16),
            }}
            resizeMode="contain"
          />

          <View
            style={{
              flex: 1,
              height: historyWidth * 0.4 * (9 / 16),
              marginLeft: 20,
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={s.tCategory}>LV. {item.wordData?.chapter}</Text>
              <Text style={s.tSubject} numberOfLines={1}>
                {item.wordData?.subject[toShortLower(me.subtitle)]}
              </Text>
            </View>
            <View style={s.linkContainer}>
              <TouchableOpacity style={{marginRight: 5}} onPress={onPressWord}>
                <Image
                  source={icoWordTest.src}
                  style={{width: 35, height: 35}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {item.time === 'expiry' && <View style={s.expireWrap} />}

        <View
          style={[
            s.hourBox,
            item.time === 'expired' && {backgroundColor: '#333'},
          ]}>
          <Text style={s.tHour}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <BaseLayout ref={refBase} style={{flex: 1, backgroundColor: '#f2f2f2'}}>
      <StackHeader title="View History" navigation={navigation} />
      <View style={{flex: 1, width: '100%'}}>
        {histories.length === 0 ? (
          <View style={{width: '100%', height: '100%', ...theme.center}}>
            <Text style={s.tNoHistory}>No History</Text>
          </View>
        ) : (
          <>
            <View
              style={{
                ...theme.center,
                backgroundColor: '#333',
                height: 50,
              }}>
              <Text style={{...theme.fontSizes.smallest, color: '#fff'}}>
                Unlimited view last for 24 hours
              </Text>
            </View>
            <FlatList
              data={histories}
              renderItem={renderHistory}
              keyExtractor={item => JSON.stringify(item)}
              style={{
                padding: 15,
              }}
              contentContainerStyle={{paddingBottom: 40, paddingTop: 20}}
            />
          </>
        )}
      </View>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  historyContainer: {
    ...theme.boxes.rowBetweenCenter,
    padding: 5,
    backgroundColor: '#fff',
  },

  hourBox: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: theme.colors.mint,
    borderRadius: 30,
    padding: 5,
  },
  tHour: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
  },

  expireWrap: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#00000088',
  },

  tCategory: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: theme.colors.black,
    fontWeight: 'bold',
  },
  tSubject: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    fontWeight: Platform.OS === 'android' ? 'bold' : '800',
    color: theme.colors.black,
  },
  tViews: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: '#000',
  },

  durationBox: {
    position: 'absolute',
    width: 30,
    right: 2,
    bottom: 2,
    backgroundColor: '#000000cc',
    ...theme.center,
  },
  tDuration: {
    color: '#fff',
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
  },
  linkContainer: {
    flexDirection: 'row',
  },

  tNoHistory: {
    ...theme.fontSizes.large,
    color: '#666',
    opacity: 0.7,
  },
});

export default ViewHistoryScreen;
