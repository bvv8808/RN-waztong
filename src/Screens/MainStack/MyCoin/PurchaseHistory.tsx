import {gql, useLazyQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import StackHeader from '~/components/StackHeader';
import {useBLazyQuery} from '~/lib/gql/gqlBuilder';
import {__token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {GQLResponse, THistory} from '~/lib/types';

const dummyHistory = [
  {
    registDatetime: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
  {
    date: '2021.07.09',
    point: '20',
  },
];

const historyLimit = 30;

interface Props {
  navigation: any;
}

const PurchaseHistoryScreen = ({navigation}: Props) => {
  const token = useRecoilValue(__token);

  const [endFetch, setEndFetch] = useState(false);
  const [from, setFrom] = useState(0);
  const [histories, setHistories] = useState<THistory[]>([]);

  const [loadHistory, {data, error}] = useLazyQuery<GQLResponse>(gql`
    query($from: Int, $limit: Int) {
      getCoinList(session: "${token}", from: $from, limit: $limit, pointType: "useFor") {
        point
        registDatetime
      }
    }
  `);

  useEffect(() => {
    loadHistory({variables: {from: 0, limit: historyLimit}});
  }, []);

  useEffect(() => {
    if (data && data.getCoinList) {
      setHistories(h => [...h, ...data.getCoinList]);

      if (data.getCoinList.length === historyLimit)
        setFrom(f => f + historyLimit);
      else setEndFetch(true);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.log(`Error: :`, JSON.stringify(error));
    }
  }, [error]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f7'}}>
      <StackHeader title="Purchase History" navigation={navigation} />
      <View style={{flex: 1, width: '90%', alignSelf: 'center'}}>
        <View
          style={[
            s.row,
            {
              backgroundColor: theme.colors.mint,
              marginTop: 50,
              marginBottom: 15,
            },
          ]}>
          <Text style={[s.tRow, {color: '#fff'}]}>Date</Text>
          <Text style={[s.tRow, {color: '#fff'}]}>Coin</Text>
        </View>
        <FlatList
          data={histories}
          style={{height: '100%'}}
          onEndReached={() => {
            !endFetch && loadHistory({variables: {from, limit: historyLimit}});
          }}
          onEndReachedThreshold={0.16}
          renderItem={item => (
            <View key={item.index} style={[s.row]}>
              <Text style={[s.tRow]}>
                {item.item.registDatetime.split(' ')[0]}
              </Text>
              <Text style={[s.tRow]}>{item.item.point}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  row: {
    width: '100%',
    // height: 30,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tRow: {
    flex: 1,
    textAlign: 'center',
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: '#666',
  },
});

export default PurchaseHistoryScreen;
