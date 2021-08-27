import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {icoMoreGray, profileEmpty} from '~/images';
import {__myInfo} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TComment} from '~/lib/types';
import {getDiff} from '~/lib/util';
import ButtonRe from './ButtonRe';

const profileMainSize = 45;
interface Props {
  comment: TComment;
  onPressRe?: () => void;
  onLoad?: (idx: number, y: number) => void;
  onPressMore?: () => void;
  now: number;
}

const CommentComponent2 = ({
  comment: c,
  onPressRe,
  now,
  onLoad,
  onPressMore,
}: Props) => {
  const me = useRecoilValue(__myInfo);
  const timeDiff = getDiff(c.registDatetime, now);
  return (
    <View
      style={s.wrapper}
      onLayout={({nativeEvent}) => {
        onLoad && onLoad(c.idx, nativeEvent.layout.y);
      }}>
      <View style={{height: profileMainSize}}>
        <TouchableOpacity
          onPress={() => {
            // Actions.push('myPost', {otherId: c.writer.memberId});
          }}>
          <Image
            source={c.writer.img ? {uri: c.writer.img} : profileEmpty.src}
            style={[
              c.depth === 0 ? s.profileMain : s.profileDepth,
              {marginLeft: c.depth * 20, borderRadius: 100},
            ]}
          />
        </TouchableOpacity>
      </View>
      <View style={{justifyContent: 'space-between', flex: 1}}>
        <View style={{...theme.boxes.rowBetweenCenter}}>
          <Text style={s.writer}>{c.writer.name}</Text>
          {c.writer.memberId === me.memberId && (
            <TouchableOpacity
              onPress={onPressMore}
              style={{
                paddingLeft: 10,
              }}>
              <Image
                source={icoMoreGray.src}
                style={{height: 13, width: 13 / icoMoreGray.ratio}}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={s.content}>{c.content}</Text>
        <View style={{...theme.boxes.rowStartCenter, marginTop: 5}}>
          <Text style={s.time}>{timeDiff}</Text>
          {onPressRe && <ButtonRe onPress={onPressRe} />}
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayInMainLight,
    flexDirection: 'row',
  },
  profileMain: {
    width: profileMainSize,
    height: profileMainSize,
    marginRight: 10,
  },
  profileDepth: {
    width: profileMainSize * 0.6,
    height: profileMainSize * 0.6,
    marginRight: 8,
  },
  content: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
  },
  writer: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    fontWeight: 'bold',
  },
  time: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: theme.colors.gray,
  },
});

export default CommentComponent2;
