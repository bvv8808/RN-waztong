import React, {useState} from 'react';
import {useRef} from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseLayout from '~/base/BaseLayout';
import Selector from '~/components/Selector';
import theme from '~/lib/theme';
import {TLang} from '~/lib/types';

const screenWidth = Dimensions.get('screen').width;
interface Props {
  navigation: any;
}

const __langs: TLang[] = [
  {
    name: '한국어',
    flag: '',
  },
  {
    name: '스페인어',
    flag: '',
  },
];

const SelectLangScreen = ({navigation}: Props) => {
  const [visibleLang1, setVisibleLang1] = useState(false);
  const [visibleLang2, setVisibleLang2] = useState(false);
  const [myLang, setMyLang] = useState<TLang>(__langs[0]);
  const [targetLang, setTargetLang] = useState<TLang>(__langs[1]);

  const refBase = useRef<any>(null);
  return (
    <BaseLayout
      ref={refBase}
      style={{alignItems: 'center', justifyContent: 'space-between'}}>
      <View
        style={{
          flex: 1,
          width: '100%',
          ...theme.center,
        }}>
        <View
          // Logo
          style={{
            width: screenWidth / 3.5,
            height: screenWidth / 3.5,
            borderWidth: 1,
            borderColor: 'green',
          }}
        />
      </View>

      {/* Language Section --> */}
      <View style={{flex: 1, width: '100%'}}>
        <View style={s.langContainer}>
          <Text style={s.langDesc}>MY LANGUAGE</Text>
          <TouchableOpacity
            style={s.langInput}
            onPress={() => {
              setVisibleLang1(true);
            }}>
            <Text style={s.langName}>{myLang.name}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.langContainer}>
          <Text style={s.langDesc}>LANGUAGE I WANT TO LEARN</Text>
          <TouchableOpacity
            style={s.langInput}
            onPress={() => {
              setVisibleLang2(true);
            }}>
            <Text style={s.langName}>{targetLang.name}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <-- Language Section */}

      {/* Part 3 --> */}
      <View
        style={{
          width: '100%',
          flex: 1,
          // alignItems: 'center',
          ...theme.center,
        }}>
        <TouchableOpacity style={s.startBtn}>
          <Text style={s.startText}>Free Start</Text>
        </TouchableOpacity>
        <View
          style={{
            ...theme.boxes.rowCenter,
            marginBottom: 10,
          }}>
          <TouchableOpacity
            style={s.btnSignIn}
            onPress={() => {
              navigation.push('SignInHome');
            }}>
            <Text style={s.tSignIn}>Log in</Text>
          </TouchableOpacity>
          <Text style={s.tSignIn}>/</Text>
          <TouchableOpacity
            style={s.btnSignIn}
            onPress={() => {
              navigation.push('SignUp');
            }}>
            <Text style={s.tSignIn}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
          {/* <Text style={{...theme.fontSizes.smallest, textAlign: 'center'}}> */}
          <Text style={s.tFooter}>By continuing, you agree to the</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text
              onPress={() => {
                // ## 이용약관 터치 시
              }}
              style={{
                ...s.tFooter,
                textDecorationLine: 'underline',
                fontWeight: 'bold',
              }}>
              Terms of Use
            </Text>
          </TouchableOpacity>
          <Text style={s.tFooter}>and</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text
              style={{
                ...s.tFooter,
                textDecorationLine: 'underline',
                fontWeight: 'bold',
              }}>
              Provacy Policy
            </Text>
          </TouchableOpacity>
        </View>
        {/* </Text> */}
      </View>
      {/* <-- Part 3 */}

      <Selector
        visible={visibleLang1}
        onCancel={() => {
          setVisibleLang1(false);
        }}
        onSelect={selected => {
          console.log(`selected1:: `, selected);
        }}
      />
      <Selector
        visible={visibleLang2}
        onCancel={() => {
          setVisibleLang2(false);
        }}
        onSelect={selected => {
          console.log(`selected2:: `, selected);
        }}
      />
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  startBtn: {
    ...theme.buttons.big,
    width: '50%',
    marginBottom: 30,
  },
  startText: {
    ...theme.buttons.bigText,
    fontWeight: 'normal',
  },
  btnSignIn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tSignIn: {
    ...theme.fontSizes.largest,
    paddingVertical: 0,
    color: '#888',
  },
  langContainer: {width: '100%', paddingHorizontal: 15, marginTop: 25},
  langDesc: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#333',
    paddingLeft: 5,
    paddingBottom: 5,
  },
  langInput: {
    ...theme.boxes.rowBetweenCenter,
    borderRadius: 20,
    backgroundColor: '#e3e3e3',
    paddingVertical: 12,
  },
  langName: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
  },

  tFooter: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    padding: 5,
    paddingBottom: 10,
  },
});

export default SelectLangScreen;
