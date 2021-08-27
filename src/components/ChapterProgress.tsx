import React, {useRef} from 'react';
import {StyleSheet, View, Text, Image, Dimensions} from 'react-native';
import {icoFlower3, seekbarCircle} from '~/images';
import theme from '~/lib/theme';
import CardView from '@hyeonwoo/react-native-cardview';
import GradientView from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('screen').width;
const barWidth = screenWidth * 0.6;

const flowerBlue = '#83b5f0';
const backgroundBlue = '#e8f0fc';
const gradientBold = '#688be7';
const gradientLight = '#b7cbf7';
const barEmpty = '#d8e3f6';

interface Props {
  now: number;
  total: number;
}

const ChapterProgress = ({now, total}: Props) => {
  return (
    <View style={s.wrapper}>
      <Image
        source={icoFlower3.src}
        style={{height: 20, width: 20}}
        resizeMode="contain"
      />
      <View
        style={{
          width: barWidth,
          height: 5,
          backgroundColor: barEmpty,
          borderRadius: 5,
          marginHorizontal: 20,
        }}>
        <GradientView
          style={[
            s.gradient,
            {width: !now || !total ? 0 : barWidth * (now / total)},
          ]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          colors={[gradientBold, gradientLight]}
        />
        <CardView
          cornerRadius={20}
          cardElevation={2}
          style={{
            width: 18,
            height: 18,
            borderRadius: 20,
            ...theme.center,
            position: 'absolute',
            left: !now || !total ? 0 : barWidth * (now / total) - 9,
            // left: barWidth,
            top: -6,
            //   right: 0,
            //   top: -6,
          }}>
          <Image
            source={seekbarCircle.src}
            style={{
              width: 18,
              height: 18,
            }}
          />
        </CardView>
      </View>
      <CardView
        cardElevation={1}
        style={{
          width: 22,
          height: 22,
          borderRadius: 20,
          backgroundColor: backgroundBlue,
          ...theme.center,
        }}>
        <Text style={s.tProgress}>
          {now}/{total}
        </Text>
      </CardView>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 40,
    ...theme.boxes.rowCenter,
    backgroundColor: backgroundBlue,
  },
  tProgress: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: flowerBlue,
    fontWeight: 'bold',
  },
  gradient: {
    width: '100%',
    height: 5,
    position: 'absolute',
    left: 0,
    borderRadius: 5,
  },
});

export default ChapterProgress;
