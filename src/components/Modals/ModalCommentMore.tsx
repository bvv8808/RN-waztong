import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import {icoPencil, icoTrash, icoExitBlack} from '~/images';
import theme from '~/lib/theme';

interface Props {
  touchableType: number;
  visible: boolean;
  hide: () => void;
  onPressModify: () => void;
  onPressDelete: () => void;
  onCancel?: () => void;
}

const ModalCommentMore = ({
  touchableType,
  visible,
  hide,
  onPressModify,
  onPressDelete,
  onCancel,
}: Props) => {
  return (
    <Modal visible={visible} transparent>
      <View style={{width: '100%', height: '100%'}}>
        <View
          onTouchEnd={() => {
            //   setVisibleMore(false);
            hide();
          }}
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: '#000000aa',
          }}></View>
        <View style={{backgroundColor: '#fff'}}>
          <View>
            <TouchableOpacity
              style={s.commentMoreBox}
              onPress={() => {
                onPressModify();
              }}>
              <View style={{width: 60, height: 60, ...theme.center}}>
                {/* <Image
                  source={icoPencil.src}
                  style={{height: 18, width: 18 / icoPencil.ratio}}
                /> */}
              </View>
              <Text style={s.commentMoreText}>Modify</Text>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity
              style={s.commentMoreBox}
              onPress={() => {
                onPressDelete();
              }}>
              <View style={{width: 60, height: 60, ...theme.center}}>
                {/* <Image
                  source={icoTrash.src}
                  style={{height: 18, width: 18 / icoTrash.ratio}}
                /> */}
              </View>
              <Text style={s.commentMoreText}>delete</Text>
            </TouchableOpacity>
          </View>

          <View style={{borderBottomWidth: 1, borderColor: '#fff'}}>
            <TouchableOpacity
              style={s.commentMoreBox}
              onPress={() => {
                hide();
                onCancel && onCancel();
              }}>
              <View style={{width: 60, height: 60, ...theme.center}}>
                {/* <Image
                  source={icoExitBlack.src}
                  style={{height: 15, width: 15 / icoExitBlack.ratio}}
                /> */}
              </View>
              <Text style={s.commentMoreText}>cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  commentMoreBox: {
    width: '100%',
    backgroundColor: '#fff',
    ...theme.boxes.rowStartCenter,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grayInMainLight,
  },
  commentMoreText: {},
});

export default ModalCommentMore;
