import React from 'react';
import {View} from 'react-native';
import theme from '~/lib/theme';

interface Props {}

const CustomDotActive = ({}: Props) => {
  return (
    <View
      style={{
        backgroundColor: theme.colors.mint,
        height: 15,
        width: 40,
        borderRadius: 10,
        margin: 3,
      }}
    />
  );
};

export const Dot = () => {
  return (
    <View
      style={{
        backgroundColor: 'rgba(0,0,0,.2)',
        height: 15,
        width: 15,
        borderRadius: 10,
        margin: 3,
      }}
    />
  );
};

export default CustomDotActive;
