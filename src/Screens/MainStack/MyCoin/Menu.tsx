import React from 'react';
import {SafeAreaView, View} from 'react-native';
import MenuItem from '~/components/MenuItem';
import StackHeader from '~/components/StackHeader';

interface Props {
  navigation: any;
}

const CoinMenuScreen = ({navigation}: Props) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StackHeader title="My Coin" navigation={navigation} />
      <View style={{flex: 1}}>
        <MenuItem
          title="Coin Store"
          onPress={() => {
            navigation.popToTop();
            navigation.navigate('Store');
          }}
        />
        <MenuItem
          title="Purchase History"
          onPress={() => {
            navigation.push('purchaseHistory');
          }}
        />
        <MenuItem
          title="View History"
          onPress={() => {
            navigation.push('viewHistory');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default CoinMenuScreen;
