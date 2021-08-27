import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {TRootStackParams} from '~/lib/types';

const SelectSubtitleScreen = ({
  navigation,
}: StackScreenProps<TRootStackParams, 'SelectSubtitle'>) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Text>Hi</Text>
    </SafeAreaView>
  );
};

export default SelectSubtitleScreen;
