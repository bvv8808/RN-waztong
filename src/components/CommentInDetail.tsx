import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useRecoilValue} from 'recoil';
import {profileEmpty} from '~/images';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TComment} from '~/lib/types';
import {convertToLocale} from '~/lib/util';
import ButtonRe from './ButtonRe';

const profileSize = 40;

interface Props {
  comment: TComment;
  onPressRe?: () => void;
  onPressMore?: () => void;
}

const CommentInDetail = ({comment: c, onPressRe, onPressMore}: Props) => {
  const me = useRecoilValue(__myInfo);
  return (
    <View
      style={{
        width: '100%',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grayInMainLight,
        flexDirection: 'row',
        backgroundColor: '#fff',
      }}>
      <Image
        source={c.writer.img ? {uri: c.writer.img} : profileEmpty.src}
        style={{
          width: profileSize,
          height: profileSize,
          marginLeft: 25 * c.depth,
          marginRight: 5,
          borderRadius: 20,
        }}
      />
      <View style={{flex: 1}}>
        <View style={{...theme.boxes.rowBetweenCenter}}>
          <Text style={s.writerName}>{c.writer.name}</Text>
          {c.writer.memberId === me.memberId && (
            <TouchableOpacity
              onPress={onPressMore}
              style={{
                paddingLeft: 10,
              }}>
              {/* <Image
                source={icoMoreGray.src}
                style={{height: 13, width: 13 / icoMoreGray.ratio}}
              /> */}
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.content}>{c.content}</Text>
        <View style={{...theme.boxes.rowStartCenter}}>
          <Text style={s.time}>
            {convertToLocale(c.registDatetime, {exceptSeconds: true})}
          </Text>
          {onPressRe && <ButtonRe onPress={onPressRe} />}
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  writerName: {
    ...theme.fontSizes.small,
    fontWeight: 'bold',
    color: theme.colors.black,
    paddingVertical: 0,
    paddingBottom: 20,
  },
  content: {
    ...theme.fontSizes.small,
    fontWeight: '500',
    color: theme.colors.black,
  },
  time: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    fontWeight: '500',
    color: theme.colors.gray,
  },

  textRe: {
    ...theme.fontSizes.tiny,
    paddingVertical: 0,
    color: theme.colors.black,
    fontWeight: 'bold',
  },
});

export default CommentInDetail;
