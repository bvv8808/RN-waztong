import React from 'react';
import {useMemo} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import {icoCoin, icoFree} from '~/images';
import {transText} from '~/lib/lang/trans';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {toShortUpper} from '~/lib/util';

interface Props {
  visible: boolean;
  hide: () => void;
  onPressOk: () => void;
}

const ModalPlayAd = ({visible, hide, onPressOk}: Props) => {
  const me = useRecoilValue(__myInfo);
  const mySubtitle = useMemo(() => toShortUpper(me.subtitle), [me.subtitle]);
  return (
    <Modal visible={visible} transparent>
      <View style={{flex: 1, backgroundColor: '#000000aa', ...theme.center}}>
        <View
          style={{
            width: '80%',
            borderRadius: 30,
            backgroundColor: '#fff',

            alignItems: 'center',
          }}>
          {/* <View style={{flex: 1, ...theme.center}}> */}

          {/* <Image
              source={icoCoin.src}
              style={{width: '100%', height: '100%'}}
            />
            <View style={s.plusCircle}>
              <Text style={s.tPlus}>+{}</Text>
            </View> */}
          <Image
            source={icoFree.src}
            style={{
              width: 60,
              height: 60,
              marginTop: 30,
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              ...theme.fontSizes.small,
              color: theme.colors.grayLv2,
              textAlign: 'center',
              width: '90%',
              marginBottom: 25,
            }}>
            {transText('SugestAd', mySubtitle)}
          </Text>

          <View
            style={{
              borderTopWidth: 0.5,
              borderColor: theme.colors.grayInMainLight,
              width: '100%',
              ...theme.boxes.rowBetweenCenter,
            }}>
            <TouchableOpacity
              style={{
                ...theme.center,
                // width: '100%',
                flex: 1,
                height: 60,
              }}
              onPress={() => {
                hide();
              }}>
              <Text
                style={{
                  ...theme.fontSizes.medium,
                  fontWeight: 'bold',
                  color: theme.colors.grayLv2,
                }}>
                {transText('NoThanksAd', mySubtitle)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...theme.center,
                // width: '100%',
                flex: 1,
                height: 60,
              }}
              onPress={() => {
                // hide();
                // Actions.push('membershipPrice');
                onPressOk();
              }}>
              <Text
                style={{
                  ...theme.fontSizes.medium,
                  fontWeight: 'bold',
                  color: theme.colors.mainRed,
                }}>
                {transText('OkAd', mySubtitle)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  plusCircle: {
    ...theme.center,
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: theme.colors.cherry,
    position: 'absolute',
    right: -10,
    top: 5,
  },
  tPlus: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: '#fff',
  },
});

export default ModalPlayAd;
