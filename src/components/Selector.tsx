import React, {useState} from 'react';
import {useCallback} from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import theme from '~/lib/theme';
import langs from '~/lib/lang/languageList';
import {TLang} from '~/lib/types';
import {icoDictBlack, icoWorld} from '~/images';

interface Props {
  value: TLang;
  visible: boolean;
  onSelect: (selected: any) => void;
  onCancel: () => void;
  style?: ViewStyle | ViewStyle[];
  type?: 1 | 2;
}

const Selector = ({
  value,
  visible,
  onSelect,
  onCancel,
  style,
  type = 1,
}: Props) => {
  const [selectedItem, setSelectedItem] = useState(value);
  const renderLanguage = useCallback(
    ({item}: {item: TLang; index: number}) => {
      return (
        <TouchableOpacity
          style={{
            width: '100%',
            height: 45,
            ...theme.boxes.rowCenter,
            // paddingVertical: 10,
            backgroundColor: '#fff',
          }}
          onPress={() => {
            setSelectedItem(item);
          }}>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Image
              source={item.img}
              style={
                selectedItem.value === item.value
                  ? {width: 30, height: 30, marginRight: 0}
                  : {
                      width: 20,
                      height: 20,
                      marginRight: 5,
                    }
              }
            />
          </View>
          <Text
            style={[
              {
                flex: 1,
                textAlign: 'center',
              },
              selectedItem.value === item.value
                ? {
                    ...theme.fontSizes.large,
                    paddingVertical: 0,
                    color: theme.colors.mint,
                    fontWeight: 'bold',
                  }
                : {
                    ...theme.fontSizes.medium,
                    paddingVertical: 0,
                    color: theme.colors.blackSelector,
                  },
            ]}>
            {item.name}
          </Text>
          <View style={{flex: 1}} />
        </TouchableOpacity>
      );
    },
    [selectedItem],
  );
  return (
    <Modal transparent visible={visible}>
      <View
        style={{
          width: '100%',
          flex: 1,
          ...theme.center,
          backgroundColor: '#00000088',
        }}>
        <View
          style={{
            // height: '60%',
            width: '85%',
          }}>
          <View style={s.header}>
            <Image
              source={type === 1 ? icoDictBlack.src : icoWorld.src}
              style={s.headerImg}
              resizeMode="contain"
            />
          </View>

          <View
            style={
              {
                // // flex: 1,
                // borderWidth: 2,
                // borderColor: 'blue',
              }
            }>
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={{backgroundColor: '#fff'}}
              data={type === 1 ? langs : langs.slice(0, 6)}
              renderItem={renderLanguage}
              keyExtractor={item => item.value}
            />
          </View>
          <View style={s.btnContainer}>
            <Pressable style={s.btn} onPress={onCancel}>
              <Text style={[s.t, {color: theme.colors.gray}]}>cancel</Text>
            </Pressable>
            <Pressable
              style={s.btn}
              onPress={() => {
                onSelect(selectedItem);
              }}>
              <Text style={[s.t, {color: theme.colors.mint}]}>ok</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  header: {
    ...theme.center,
    height: '25%',
    backgroundColor: theme.colors.mint,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerImg: {
    width: 30,
    height: 30,
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderModal,
  },
  btn: {
    paddingVertical: 15,
    width: 100,
    ...theme.center,
  },
  t: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
  },
});

export default Selector;
