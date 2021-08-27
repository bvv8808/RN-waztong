import React from 'react';
import {Image, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useRecoilValue} from 'recoil';
import {icoCoin} from '~/images';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';

interface Props {
  style?: ViewStyle;
}
const DisplayCoin = ({style}: Props) => {
  const me = useRecoilValue(__myInfo);
  const s = styles(icoCoin.ratio);
  return (
    <View style={[s.wrapper, style]}>
      <Image source={icoCoin.src} style={s.ico} />
      <Text style={s.tCoin}>
        {me.coin >= 1000 ? `${me.coin / 1000}K` : me.coin}
      </Text>
    </View>
  );
};

const styles = (ratio: number) =>
  StyleSheet.create({
    wrapper: {
      ...theme.boxes.rowBetweenCenter,
      width: 70,
      height: 25,
      borderRadius: 20,
      backgroundColor: '#000',
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    ico: {
      width: 16,
      height: 16 * ratio,
      //   marginLeft: 10,
    },
    tCoin: {
      ...theme.fontSizes.small,
      paddingVertical: 0,
      color: '#fff',
      textAlign: 'right',
      //   marginRight: 10,
      flex: 1,
    },
  });

export default DisplayCoin;
