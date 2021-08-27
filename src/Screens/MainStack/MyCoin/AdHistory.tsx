import React, {useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import StackHeader from '~/components/StackHeader';
import theme from '~/lib/theme';

const dummyHistory = [
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
  {
    date: '2021.07.09',
    coin: '20',
  },
];

interface Props {
  navigation: any;
}

const AdHistoryScreen = ({navigation}: Props) => {
  const [endFetch, setEndFetch] = useState(false);
  const [from, setFrom] = useState(0);
  const [histories, setHistories] = useState(dummyHistory);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f7'}}>
      <StackHeader title="Ad History" navigation={navigation} />
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
          onEndReached={() => {}}
          onEndReachedThreshold={0.16}
          renderItem={item => (
            <View key={item.index} style={[s.row]}>
              <Text style={[s.tRow]}>{item.item.date}</Text>
              <Text style={[s.tRow]}>{item.item.coin}</Text>
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

export default AdHistoryScreen;
