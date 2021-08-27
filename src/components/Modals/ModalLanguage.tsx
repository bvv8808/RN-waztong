import React, {useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import BaseButton from '~/base/BaseButton';
import {
  icoExitWhite,
  icoFlowerMain,
  icoFlowerMint,
  icoX,
  icoXWhite,
} from '~/images';
import langs from '~/lib/lang/languageList';
import theme from '~/lib/theme';
import {TLang, TLangDomainShortUpper} from '~/lib/types';

interface Props {
  onSelect: (selected: TLang) => void;
  initialSelected?: TLangDomainShortUpper;
}
interface IState {
  visible: boolean;
  selected: TLang;
}

class ModalSubtitle extends React.Component<Props, IState> {
  // const [visible, setVisible] = useState(false)
  constructor(props: Props) {
    super(props);

    console.log(`initial: `, props.initialSelected);
    this.state = {
      visible: false,
      selected:
        langs.find(l => l.value === this.props.initialSelected) ?? langs[0],
    };
  }

  show() {
    this.setState({visible: true});
  }
  hide() {
    this.setState({visible: false});
  }

  renderLanguage(item: {item: TLang; index: number}) {
    if (!this.state) return null;
    return (
      <View style={{width: '90%', alignSelf: 'center', marginVertical: 10}}>
        <TouchableOpacity
          style={{
            ...theme.boxes.rowBetweenCenter,
            height: 70,
            borderRadius: 10,
            paddingHorizontal: 15,
            backgroundColor:
              this.state.selected.value === item.item.value ? '#555' : '#fff',
          }}
          disabled={this.state.selected === item.item}
          onPress={() => this.setState({selected: item.item})}>
          <View style={{height: '100%', ...theme.boxes.rowCenter}}>
            <Image
              source={item.item.img}
              style={{width: 40, height: 40, marginRight: 20}}
            />
            <Text
              style={{
                ...theme.fontSizes.large,
                paddingVertical: 0,
                color:
                  this.state.selected.value === item.item.value
                    ? '#fbfbfb'
                    : theme.colors.gray,
              }}>
              {item.item.name}
            </Text>
          </View>
          <Text
            style={{
              ...theme.fontSizes.medium,
              paddingVertical: 0,
              color:
                this.state.selected.value === item.item.value
                  ? theme.colors.mint
                  : '#aeaeae',
            }}>
            ●
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  render() {
    return (
      <Modal visible={this.state.visible} animationType="slide">
        <View
          style={[
            Platform.OS === 'ios' && theme.marginIOS,
            {flex: 1, backgroundColor: '#fbfbfb'},
          ]}>
          <View
            style={{
              height: 50,
              alignItems: 'flex-end',
              backgroundColor: theme.colors.mint,
            }}>
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                ...theme.center,
              }}
              onPress={() => {
                if (this.props.initialSelected)
                  this.setState({
                    selected:
                      langs.find(l => l.value === this.props.initialSelected) ??
                      langs[0],
                  });

                this.hide();
              }}>
              <Image source={icoXWhite.src} style={{width: 25, height: 25}} />
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            <View style={{height: 150, ...theme.center}}>
              <Image
                source={icoFlowerMain.src}
                style={{width: 40, height: 40 * icoFlowerMain.ratio}}
              />
              <Text
                style={{
                  ...theme.fontSizes.small,
                  paddingVertical: 0,
                  color: '#555',
                  marginTop: 5,
                  textAlign: 'center',
                }}>
                Do you want to learn more languages?
              </Text>
            </View>
            <FlatList
              data={langs}
              renderItem={item => this.renderLanguage(item)}
              keyExtractor={item => item.name}
            />
            <View
              style={[
                {width: '100%', alignItems: 'center'},
                Platform.OS === 'ios' &&
                  isIphoneX() && {marginBottom: theme.marginIOS.marginTop},
              ]}>
              <BaseButton
                size="small"
                style={{width: '90%', marginVertical: 30}}
                text="OK"
                onPress={() => {
                  this.hide();
                  this.props.onSelect(this.state.selected);
                }}
              />
              {/* <TouchableOpacity style={[{width: '70%', }]} onPress={() => this.hide()}>
              <Text>Hello</Text>
            </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export default ModalSubtitle;
