import React, {useEffect, useState} from 'react';
import {Platform, SafeAreaView, Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import MenuItem from '~/components/MenuItem';
import StackHeader from '~/components/StackHeader';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';

interface Props {
  navigation: any;
}

const SettingsScreen = ({navigation}: Props) => {
  const me = useRecoilValue(__myInfo);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader title="App settings" navigation={navigation} />
      <View style={{flex: 1}}>
        <MenuItem
          title="Subtitles"
          other={() => <Text style={theme.menuText}>{me.subtitle}</Text>}
          onPress={() => {
            navigation.push('myLanguage');
          }}
        />
        <MenuItem
          title="Terms of service"
          onPress={() => {
            navigation.push('Term', {type: 'term'});
          }}
        />
        <MenuItem
          title="Privacy policy"
          onPress={() => navigation.push('Term', {type: 'privacy'})}
        />
        <MenuItem
          title="Build version"
          other={() => (
            <Text style={theme.menuText}>
              {Platform.OS === 'ios' ? '1.3' : '1.0.2'}
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
