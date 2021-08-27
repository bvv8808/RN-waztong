import AsyncStorage from '@react-native-community/async-storage';
import {useResetRecoilState} from 'recoil';
import {__loginType, __myInfo, __showTutorial, __token} from '../recoil/atom';

export const useResetData = () => {
  const r_resetToken = useResetRecoilState(__token);
  const r_resetMe = useResetRecoilState(__myInfo);
  const r_resetLoginType = useResetRecoilState(__loginType);
  const r_resetTutorial = useResetRecoilState(__showTutorial);

  return () => {
    r_resetLoginType();
    r_resetMe();
    r_resetToken();
    r_resetTutorial();

    AsyncStorage.setItem('didTutorial', 'false');
    AsyncStorage.setItem('token', '');
    AsyncStorage.setItem('loginMethod', '');
  };
};
