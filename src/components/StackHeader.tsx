import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {arrowLeftWhiteThin} from '~/images';
import theme from '~/lib/theme';

interface Props {
  navigation: any;
  title: string;
}

const StackHeader = ({navigation, title}: Props) => {
  return (
    <View style={s.wrapper}>
      <TouchableOpacity
        style={{width: 60, height: 60, ...theme.center}}
        onPress={() => {
          navigation.pop();
        }}>
        <Image
          source={arrowLeftWhiteThin.src}
          style={{width: 25, height: 25}}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={s.title}>{title}</Text>
      <View style={{width: 60}} />
    </View>
  );
};
const s = StyleSheet.create({
  wrapper: {
    ...theme.boxes.rowBetweenCenter,
    height: 60,
    backgroundColor: theme.colors.mint,
  },
  title: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: '#fff',
  },
});

export default StackHeader;
