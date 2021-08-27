import React from 'react';
import {Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';
import {View} from 'react-native';
import theme from '~/lib/theme';

interface Props {
  onPress: () => void;
  size: 'small' | 'medium' | 'big';
  text: string;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  disabled?: boolean;
}

const BaseButton = ({
  onPress,
  size,
  text,
  style,
  textStyle,
  disabled = false,
}: Props) => {
  let textKey: 'smallText' | 'mediumText' | 'bigText' = 'smallText';
  if (size === 'medium') textKey = 'mediumText';
  else if (size === 'big') textKey = 'bigText';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        theme.buttons[size],
        style,
        disabled && {backgroundColor: theme.colors.grayInactive},
      ]}
      disabled={disabled}>
      <Text style={[theme.buttons[textKey], textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default BaseButton;
