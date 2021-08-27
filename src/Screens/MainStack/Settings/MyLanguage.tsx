import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import StackHeader from '~/components/StackHeader';
import {checkMint, icoWorldMint} from '~/images';
import {useBMutation} from '~/lib/gql/gqlBuilder';
import lang from '~/lib/lang/languageList';
import {__myInfo, __token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TLang, TLangDomainShortUpper, TMainStackParams} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {toFullInitCap, toShortUpper} from '~/lib/util';

const flagSize = 35;

const MyLanguageScreen = ({
  navigation,
}: StackScreenProps<TMainStackParams, 'myLanguage'>) => {
  const [me, r_setMe] = useRecoilState(__myInfo);
  const token = useRecoilValue(__token);

  const [selected, setSelected] = useState<TLangDomainShortUpper>(
    toShortUpper(me.subtitle),
  );

  const [mutSetSubtitle] = useBMutation('subtitle');

  const renderLangs = ({item, index}: {item: TLang; index: number}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          console.log(`item:: `, item.value);
          mutSetSubtitle({variables: {session: token, subtitle: item.value}})
            .then(() => {
              setSelected(item.value);
              r_setMe(m => ({
                ...m,
                subtitle: toFullInitCap(item.value),
              }));
            })
            .catch(e => {
              console.log(`Error in mutSetSubtitle@@@@ `, JSON.stringify(e));
              toast.show('Error occured', 1);
            });
        }}
        style={{
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          ...theme.boxes.rowBetweenCenter,
          marginBottom: 15,
          paddingBottom: 3,
        }}>
        <View style={{...theme.boxes.rowStartCenter}}>
          <Image
            source={item.img}
            style={{width: flagSize, height: flagSize, marginRight: 5}}
          />
          <Text
            style={{
              ...theme.fontSizes.medium,
              paddingVertical: 0,
              color: theme.colors.black3,
            }}>
            {item.name}
          </Text>
        </View>
        {selected === item.value && (
          <Image
            source={checkMint.src}
            style={{
              height: flagSize / 3,
              width: flagSize / 3 / checkMint.ratio,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader title="Subtitles" navigation={navigation} />
      <View style={{flex: 1, paddingHorizontal: 25}}>
        <View
          style={{
            height: flagSize,
            width: flagSize,
            ...theme.center,
            marginVertical: 15,
          }}>
          <Image source={icoWorldMint.src} style={{width: 20, height: 20}} />
        </View>

        <FlatList
          data={lang}
          renderItem={renderLangs}
          keyExtractor={item => item.value}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyLanguageScreen;
