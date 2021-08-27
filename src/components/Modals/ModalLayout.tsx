import React from 'react';
import {Dimensions, View} from 'react-native';
import theme from '~/lib/theme';

const screenHeight = Dimensions.get('screen').height;

interface Props {
  children: JSX.Element[] | JSX.Element;
}

const ModalLayout = ({children}: Props) => {
  return (
    <View
      style={{
        width: '100%',
        height: screenHeight,
        backgroundColor: '#000000aa',
        position: 'absolute',
        ...theme.center,
      }}>
      <View
        style={{
          width: '80%',
          backgroundColor: theme.colors.mainBackgroundColor,
          borderRadius: 20,
        }}>
        {children}
      </View>
    </View>
  );
};

export default ModalLayout;
