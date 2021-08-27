/**
  BaseLayout
  - 모달 표시
  - 에러 처리
*/

import React from 'react';
import {createRef} from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import theme from '../lib/theme';

interface Props {
  children: any;
  style?: ViewStyle;
}
interface State {
  modalInfoContent: string;
  onPressModalInfo: (() => void) | null;
  loading: boolean;
  blockInteraction: boolean;
}

class BaseLayout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      modalInfoContent: '',
      onPressModalInfo: null,
      loading: false,
      blockInteraction: false,
    };
  }

  showModalInfo(content: string, onPressModalInfo?: () => void) {
    this.setState({
      modalInfoContent: content,
      onPressModalInfo: onPressModalInfo ?? null,
    });
  }

  startLoading(_blockInteraction: boolean = true) {
    this.setState({
      loading: true,
      blockInteraction: _blockInteraction,
    });
  }
  stopLoading() {
    this.setState({
      loading: false,
      blockInteraction: false,
    });
  }

  renderBlockView() {
    if (!this.state.blockInteraction) return null;
    return (
      <View style={{width: '100%', height: '100%', position: 'absolute'}} />
    );
  }
  render() {
    return (
      <View style={{flex: 1}}>
        <SafeAreaView style={[{flex: 1}, this.props.style]}>
          {this.props.children}
        </SafeAreaView>
        <Modal transparent visible={this.state.modalInfoContent.length > 0}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000000aa',
              ...theme.center,
            }}>
            <View
              style={{
                width: '70%',
                borderRadius: 30,
                backgroundColor: '#fff',
                paddingTop: 30,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  ...theme.fontSizes.largest,
                  fontWeight: 'bold',
                  color: theme.colors.modalTitle,
                }}>
                Notification
              </Text>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  color: theme.colors.modalContent,
                  textAlign: 'center',
                  width: '90%',
                  marginBottom: 15,
                }}>
                {this.state.modalInfoContent}
              </Text>
              <TouchableOpacity
                style={{
                  borderTopWidth: 0.5,
                  borderColor: theme.colors.grayInMainLight,
                  width: '100%',
                  height: 60,
                  ...theme.center,
                }}
                onPress={() => {
                  this.setState({modalInfoContent: ''});
                  this.state.onPressModalInfo && this.state.onPressModalInfo();
                }}>
                <Text
                  style={{
                    ...theme.fontSizes.medium,
                    fontWeight: 'bold',
                    // color: theme.colors.mainRed,
                    color: theme.colors.mint,
                  }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal transparent visible={this.state.loading}>
          <View style={{width: '100%', height: '100%', ...theme.center}}>
            {this.renderBlockView()}
            <ActivityIndicator
              animating
              size="large"
              color={theme.colors.mint}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

export default BaseLayout;
