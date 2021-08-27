import {useNavigation} from '@react-navigation/native';
import React, {RefObject} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {icoWorld, logoHeader} from '~/images';
import theme from '~/lib/theme';
import ModalSubtitle from './Modals/ModalLanguage';

const height = 60;
const logoHeight = height * 0.3;
const worldHeight = height * 0.4;

interface Props {
  background: string;
  refModal: RefObject<ModalSubtitle>;
}

const ListHeader = ({background, refModal}: Props) => {
  const navi = useNavigation();
  return (
    <View style={[s.wrapper, {backgroundColor: background}]}>
      <Pressable
        style={{height, ...theme.center, paddingLeft: 10}}
        onPress={() => navi.navigate('Main')}>
        <Image
          source={logoHeader.src}
          style={{height: logoHeight, width: logoHeight / logoHeader.ratio}}
        />
      </Pressable>
      <Pressable
        style={{width: height, height, ...theme.center}}
        onPress={() => {
          // @ts-ignore
          // navi.push('SelectSubtitle');
          refModal.current?.show();
        }}>
        <Image
          source={icoWorld.src}
          style={{width: worldHeight, height: worldHeight}}
        />
      </Pressable>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: {
    ...theme.boxes.rowBetweenCenter,
    height,
  },
});

export default ListHeader;
