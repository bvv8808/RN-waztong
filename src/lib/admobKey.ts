import {Platform} from 'react-native';

export const RewardedKey = Platform.select({
  android: 'ca-app-pub-1383856384063988/2309837792',
  ios: 'ca-app-pub-1383856384063988/6053286464',
});

export const BannerKey = Platform.select({
  android: 'ca-app-pub-1383856384063988/5530348769',
  ios: 'ca-app-pub-1383856384063988/3534934330',
});
