import {Platform, TextStyle, ViewStyle} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
const isX = isIphoneX();

const fontSizes = {
  tiny: {
    fontSize: Platform.OS === 'ios' ? 9 : 7,
    paddingVertical: 4,
    lineHeight: 12,
  } as TextStyle,
  smallest: {
    fontSize: Platform.OS === 'ios' ? 11 : 9,
    paddingVertical: 5,
    lineHeight: 13,
  } as TextStyle,
  small: {
    fontSize: Platform.OS === 'ios' ? 13 : 11,
    paddingVertical: 6,
    lineHeight: 14,
  } as TextStyle,
  medium: {
    fontSize: Platform.OS === 'ios' ? 15 : 13,
    paddingVertical: 7,
    lineHeight: 18,
  } as TextStyle,
  large: {
    fontSize: Platform.OS === 'ios' ? 17 : 15,
    paddingVertical: 9,
    lineHeight: 18,
  } as TextStyle,
  largest: {
    fontSize: Platform.OS === 'ios' ? 19 : 17,
    paddingVertical: 11,
    lineHeight: 22,
  } as TextStyle,
  ultra: {
    fontSize: Platform.OS === 'ios' ? 25 : 23,
    paddingVertical: 13,
    lineHeight: 26,
  },
};

const colors = {
  mainColor: '#7343b6',
  mainColorLight: '#f3eff7',
  mainTextColor: '#5a5a5a',
  mainBackgroundColor: '#f5f5f7',
  lightBorderColor: '#eee',
  boldBorderColor: '#858585',
  placeholderColor: '#c1c1c1',
  black: '#1c1c1c',
  orange: '#ff6e22',
  kakaoYellow: '#ffda00',
  grayInMainLight: '#dcd9e0',

  //
  tabBlack: '#141414',
  mainBlackLight: '#3e3f42',
  mainRedBtn: '#d82d3d',
  mainRedText: '#ce3344',
  mainRedHeart: '#eb4956',
  mainRed: '#b6182a',
  coralRed: '#cc1c2e',
  backgroundBlack: '#202020',
  textInBlack: '#c6bdbd',
  borderInBlack: '#383838',
  cherry: '#ae001c',
  textGray: '#9e9e9e',
  grayLv2: '#696969',

  //
  mint: '#32c0bb', // #1
  blackMint: '#046871',
  ocean: '#298dc0',
  emerald: '#2aadc3',
  darkMint: '#627977',
  black2: '#2b2a2a', // #2
  black3: '#393939', // #5
  black4: '#464646', // #7
  black5: '#565656', // #6
  blackLabel: '#353535', // #16
  blackSelector: '#525252', // #17
  modalTitle: '#343846', // #13
  modalContent: '#6c6666', // #14
  gray: '#9c9b9b', // #3
  backgroundGray: '#f2f2f2', // #4
  borderLight: '#f5f5f5', // #8
  borderModal: '#ececec', // #15
  border: '#e8e8e8', // #9
  grayInactive: '#d8d8d8', // #10
  placeholder1: '#cdcdcd', // #11
  redAlert: '#c3172b', // #12
};

const center = {
  alignItems: 'center',
  justifyContent: 'center',
} as ViewStyle;

const btnHeights = {
  small: 30,
  medium: 40,
  large: 50,
  largest: 60,
};
const btnCommonStyle = {
  width: '100%',
  backgroundColor: colors.mint,
  ...center,
  borderRadius: 60,
};
const btnTextCommonStyle = {
  paddingVertical: 0,
  fontWeight: 'bold',
  color: '#fff',
};

const theme = {
  colors,
  center,
  fontSizes,
  btnHeights,
  texts: {
    mediumWhite: {
      ...fontSizes.medium,
      paddingVertical: 0,
      color: '#fff',
    },
    largestTitle: {
      ...fontSizes.largest,
      color: colors.darkMint,
      fontWeight: 'bold',
    } as TextStyle,
    boldBigBlack: {
      ...fontSizes.large,
      paddingVertical: 0,
      // lineHeight: Platform.OS === 'ios' ? 18 : 14,
      color: colors.black,
      fontWeight: 'bold',
    } as TextStyle,
    tinyGray: {
      ...fontSizes.smallest,
      paddingVertical: 0,
      color: colors.gray,
    } as TextStyle,
  },
  buttons: {
    small: {
      ...btnCommonStyle,
      height: btnHeights.small,
    } as ViewStyle,
    smallText: {
      ...fontSizes.small,
      ...btnTextCommonStyle,
    } as TextStyle,
    medium: {
      ...btnCommonStyle,
      height: btnHeights.medium,
    } as ViewStyle,
    mediumText: {
      ...fontSizes.medium,
      ...btnTextCommonStyle,
    } as TextStyle,
    big: {
      ...btnCommonStyle,
      height: btnHeights.large,
    } as ViewStyle,
    bigText: {
      ...fontSizes.large,
      ...btnTextCommonStyle,
    } as TextStyle,
  },

  boxes: {
    rowBetweenBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    } as ViewStyle,
    rowBetweenCenter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,
    colBetweenCenter: {
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,
    rowEvenlyCenter: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    } as ViewStyle,
    colEvenlyCenter: {
      justifyContent: 'space-evenly',
      alignItems: 'center',
    } as ViewStyle,
    rowStartCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
  },
  menuBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    width: '100%',
  },
  menuText: {
    ...fontSizes.small,
    paddingVertical: 0,
    color: '#888',
  },

  marginIOS:
    Platform.OS === 'ios'
      ? ({
          marginTop: isX ? 48 : 20,
        } as ViewStyle)
      : ({} as ViewStyle),
  paddingIOS:
    Platform.OS === 'ios'
      ? ({
          paddingTop: isX ? 48 : 20,
        } as ViewStyle)
      : ({} as ViewStyle),
};

export default theme;
