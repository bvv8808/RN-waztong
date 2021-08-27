import React, {useMemo} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import {icoCoin} from '~/images';
import {transText} from '~/lib/lang/trans';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {toShortUpper} from '~/lib/util';

interface Props {
  coin: number;
  visible: boolean;
  hide: () => void;
  onPressOk: () => void;
}

const ModalSpendCoin = ({coin, visible, hide, onPressOk}: Props) => {
  const me = useRecoilValue(__myInfo);
  const mySubtitle = useMemo(() => toShortUpper(me.subtitle), [me.subtitle]);
  const spendText = useMemo(() => {
    switch (me.subtitle) {
      case 'English':
      case 'Korean':
        return `${coin} coins will be used`;
      case 'Espanol':
        return `${coin} monedas serán utilizadas`;
      case 'Chinese':
        return `${coin}金币将被使用`;
      case 'Japanese':
        return `${coin}枚のコインが使われます`;
      case 'Hindi':
        return `${coin} सिक्कों का उपयोग किया जाता है।`;
      case 'Vietnamese':
        return `Sử dụng ${coin} coins để xem nội dung này?`;
      case 'Thai':
        return `ใช้เหรียญ ${coin} เหรียญ`;
    }
  }, [me.subtitle, coin]);
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
          <View
            style={{
              width: 60,
              height: 60 * icoCoin.ratio,
              marginTop: 30,
              marginBottom: 20,
            }}>
            <Image
              source={icoCoin.src}
              style={{width: '100%', height: '100%'}}
            />
            <View style={s.plusCircle}>
              <Text style={s.tPlus}>+{coin}</Text>
            </View>
          </View>
          <Text
            style={{
              ...theme.fontSizes.small,
              color: theme.colors.grayLv2,
              textAlign: 'center',
              width: '90%',
              marginBottom: 25,
            }}>
            {spendText}
            {/* Your inquiry has been received.{'\n'}We will reply to your email
          asap! */}
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

export default ModalSpendCoin;
