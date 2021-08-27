import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import theme from '~/lib/theme';

interface Props {
  onPress: () => void;
}

const ButtonRe = ({onPress}: Props) => {
  return (
    <TouchableOpacity
      style={{paddingHorizontal: 10}}
      onPress={() => {
        onPress();
      }}>
      <View style={s.btnRe}>
        <Text style={s.textRe}>Re</Text>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  btnRe: {
    borderRadius: 10,
    width: 30,
    height: 14,
    backgroundColor: '#e5e6ea',
    ...theme.center,
  },
  textRe: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: theme.colors.black,
    fontWeight: 'bold',
  },
});

export default ButtonRe;
