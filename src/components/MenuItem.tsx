import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {arrowRightGrayThin} from '~/images';
import theme from '~/lib/theme';

interface Props {
  title: string;
  onPress?: () => void;
  other?: () => JSX.Element;
}

const MenuItem = ({title, onPress, other}: Props) => {
  const Wrapper = ({children, onPress}: any) =>
    onPress ? (
      <TouchableOpacity style={s.wrapper} onPress={onPress}>
        {children}
      </TouchableOpacity>
    ) : (
      <View style={s.wrapper}>{children}</View>
    );

  return (
    <Wrapper onPress={onPress}>
      <Text style={s.title}>{title}</Text>
      <View style={{...theme.boxes.rowCenter}}>
        {other && other()}
        {onPress && (
          <Image
            source={arrowRightGrayThin.src}
            style={{
              height: 15,
              width: 15 / arrowRightGrayThin.ratio,
              marginLeft: 10,
            }}
          />
        )}
      </View>
    </Wrapper>
  );
};

const s = StyleSheet.create({
  wrapper: {
    ...theme.boxes.rowBetweenCenter,
    paddingHorizontal: 20,
    height: 60,
    width: '100%',
  },
  title: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#888',
  },
});
export default MenuItem;
