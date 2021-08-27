import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useCallback} from 'react';
import {useRef} from 'react';
import {
  BackHandler,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import BaseLayout from '~/base/BaseLayout';
import Voice from '@react-native-voice/voice';
import theme from '~/lib/theme';
import BaseButton from '~/base/BaseButton';
import GradiantView from 'react-native-linear-gradient';
import socialLogin from '~/lib/socialLogin';
import {Settings} from 'react-native-fbsdk-next';
import {__showTutorial} from '~/lib/recoil/atom';
import Swiper from 'react-native-swiper';
import {tutorial1, tutorial2, tutorial3} from '~/images';
import {isIphoneX} from 'react-native-iphone-x-helper';
import AsyncStorage from '@react-native-community/async-storage';

let timer: any = null;
interface Props {
  navigation: any;
  route: any;
}

const TestScreen = ({navigation, route}: Props) => {
  const refBase = useRef<any>();
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedText, setRecordedText] = useState('');

  useFocusEffect(() => {
    const onBack = () => {
      navigation.navigate('Main');
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  });
  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log(`record start`);
      setRecording(true);
    };
    Voice.onSpeechEnd = () => {
      console.log(`record stop`);
      setRecording(false);
    };
    Voice.onSpeechResults = ({value}) => {
      console.log(`Recorded:: `, value);
      setRecordedText(value ? value[0] : 'Unknown');
    };
    Voice.onSpeechError = e => {
      console.log(`Error :::: `, e);
      setRecording(false);
    };
    Voice.onSpeechVolumeChanged = () => {};
    Voice.isAvailable().then(av => {
      Platform.OS === 'android' && console.log(`V:: `, av);
    });

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <BaseLayout ref={refBase}>
      <Text>MainSpeakingList</Text>
      <TouchableOpacity
        onPress={() => {
          navigation.push('ad');
        }}>
        <Text>To AdLearn Screen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log(`Recording? `, recording);
          if (recording) {
            Voice.stop();
          } else Voice.start('en-US');
          setRecording(r => !r);
        }}
        style={{
          width: 60,
          height: 60,
          borderWidth: 2,
          borderColor: recording ? 'red' : '#333',
          ...theme.center,
        }}>
        <Text>{recording ? 'Stop ' : 'Start'}</Text>
      </TouchableOpacity>
      <Text>{recordedText}</Text>

      <View style={{height: 50}} />
      <TouchableOpacity
        onPress={() => {
          socialLogin('GOOGLE').then(res => {
            console.log(`###### result ##### `, res);
          });
        }}>
        <Text>GOOGLE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{marginTop: 40}}
        onPress={() => {
          // socialLogin('APPLE').then(res => {
          //   console.log(`###### result ##### `, res);
          // });
          navigation.push('SignIn');
        }}>
        <Text>APPLE</Text>
      </TouchableOpacity>
    </BaseLayout>
  );
};

export default TestScreen;
