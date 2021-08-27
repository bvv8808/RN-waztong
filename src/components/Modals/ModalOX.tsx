import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';

import {
  answerCircle,
  answerText,
  icoCheckCircleGreen,
  icoOut,
  textComplete,
  wrongText,
  wrongX,
} from '~/images';
import theme from '~/lib/theme';

const circleHeight = 180;
const textHeight = 35;

interface Props {
  correct: string;
  onPressAgain: () => void;
  onPressNext: () => void;
  onFinish: () => void;
  onPressReset: () => void;
  isLast?: boolean;
  navi: any;
}

const ModalOX = ({
  correct,
  onPressAgain,
  onPressNext,
  onFinish,
  onPressReset,
  isLast,
  navi,
}: Props) => {
  return (
    <Modal visible={!!correct.length} transparent>
      <View style={{flex: 1, backgroundColor: '#000000cc'}}>
        <View style={{height: '20%'}} />
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{alignItems: 'center'}}>
            {correct === 'oe' ? (
              <>
                <Image
                  source={icoCheckCircleGreen.src}
                  style={{
                    height: circleHeight * 0.5,
                    width: (circleHeight * 0.5) / icoCheckCircleGreen.ratio,
                  }}
                />
                <Image
                  source={textComplete.src}
                  style={{
                    height: textHeight,
                    width: textHeight / textComplete.ratio,
                    // marginVertical: 10,
                    marginTop: 30,
                    marginBottom: 10,
                  }}
                />
                <Text
                  style={{
                    color: '#fff',
                    ...theme.fontSizes.small,
                    paddingVertical: 0,
                  }}>
                  GOOD JOB!!
                </Text>
              </>
            ) : (
              <>
                <Image
                  source={correct === 'o' ? answerCircle.src : wrongX.src}
                  style={{
                    height: circleHeight,
                    width:
                      circleHeight /
                      (correct === 'o' ? answerCircle.ratio : wrongX.ratio),
                  }}
                />
                <Image
                  source={correct === 'o' ? answerText.src : wrongText.src}
                  style={{
                    height: textHeight,
                    width:
                      textHeight /
                      (correct === 'o' ? answerText.ratio : wrongText.ratio),
                    // marginVertical: 10,
                    marginTop: 30,
                    marginBottom: 10,
                  }}
                />
                <Text
                  style={{
                    color: '#fff',
                    ...theme.fontSizes.small,
                    paddingVertical: 0,
                  }}>
                  {correct === 'o' ? 'Good job!' : 'Try again step by step'}
                </Text>
              </>
            )}
          </View>
          <View
            style={{
              justifyContent: 'center',
            }}>
            <View style={{...theme.boxes.rowCenter}}>
              {correct == 'oe' ? (
                <>
                  <TouchableOpacity
                    onPress={onFinish}
                    style={[
                      s.btn,
                      {
                        backgroundColor: theme.colors.blackMint,
                        marginRight: 15,
                      },
                    ]}>
                    <Text style={{...s.btnText, color: '#fff'}}>EXIT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onPressReset}
                    style={[s.btn, {backgroundColor: theme.colors.mint}]}>
                    <Text style={[s.btnText, {color: '#fff'}]}>AGAIN</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={onPressAgain}
                    style={[s.btn, {backgroundColor: '#fff', marginRight: 15}]}>
                    <Text style={{...s.btnText, color: theme.colors.blackMint}}>
                      TRY AGAIN
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onPressNext}
                    style={[s.btn, {backgroundColor: theme.colors.blackMint}]}>
                    <Text style={[s.btnText, {color: '#fff'}]}>NEXT</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={{height: '20%'}} />
        {!isLast && (
          <TouchableOpacity
            onPress={() => {
              onPressAgain();
              //   Actions.pop();
              //   Actions.pop();
              navi.pop();
            }}
            style={[
              {
                // backgroundColor: '#fe6e87',
                // marginTop: 15,
                // alignSelf: 'center',
                position: 'absolute',
                right: 15,
                top: 15 + (Platform.OS === 'ios' && isIphoneX() ? 40 : 0),
              },
            ]}>
            {/* <Text style={{...s.btnText, color: '#fff'}}>FINISH</Text>
             */}
            <Image source={icoOut.src} style={{width: 50, height: 50}} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  btn: {
    width: 150,
    height: 40,
    borderRadius: 40,
    ...theme.center,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    ...theme.fontSizes.large,
    paddingVertical: 0,
  },
});

export default ModalOX;
