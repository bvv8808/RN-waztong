import {gql, useLazyQuery, useMutation} from '@apollo/client';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import CommentComponent from '~/components/Comment';
import {
  arrowLeftGrayThin,
  arrowLeftWhiteThin,
  icoExitBlack,
  icoPencil,
  icoTrash,
  profileEmpty,
} from '~/images';
import theme from '~/lib/theme';
import {TComment, TReviewStackParams} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {useRecoilValue} from 'recoil';
import {__myInfo, __token} from '~/lib/recoil/atom';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import {StackScreenProps} from '@react-navigation/stack';
import {useMemo} from 'react';

const arrowWidth = 10;
const profileMainSize = 45;

interface Props {
  reviewIdx: number;
  re?: number;
  me?: any;
  modifyIdx?: number;
}

const ReviewCommentScreen = ({
  navigation,
  route,
}: StackScreenProps<TReviewStackParams, 'reviewComment'>) => {
  const reviewIdx = useMemo(() => route.params.postId, []);
  const {re, modifyIdx} = route.params;

  const token = useRecoilValue(__token);
  const me = useRecoilValue(__myInfo);

  const now = new Date().getTime();
  const [selectedComment, setSelectedComment] = useState<TComment>();
  const [inputComment, setInputComment] = useState('');
  const [visibleMore, setVisibleMore] = useState(false);
  const [pressModify, setPressModify] = useState(false);
  const [moreComment, setMoreComment] = useState<TComment | null>(null);
  const [modifingComment, setModifingComment] = useState<TComment | null>(null);

  const refInput = useRef<any>();
  const refScrollView = useRef<any>();

  const [loadComment, {data, error}] = useBLazyQuery('comment');
  const [mutSetComment] = useBMutation('commentWrite');
  const [mutSetComment1, {data: mutResult}] = useMutation(
    gql`
mutation($idx: Int!, $content: String!, $commentIdx: Int) {
  setLiveComment (session: "${token}", idx: $idx, content: $content, comment_idx: $commentIdx)
}

`,
  );

  useEffect(() => {
    loadComment({variables: {idx: reviewIdx, addView: false}});
  }, []);
  useEffect(() => {
    refInput.current.blur();
    setSelectedComment(undefined);
    setInputComment('');
    loadComment({variables: {idx: reviewIdx, addView: false}});
    refInput?.current?.clear();
  }, [mutResult]);

  useEffect(() => {
    if (data && data.getLiveDetail) {
      // console.log(`@comments`, data.getLiveDetail.idx);
      if (re) {
        setSelectedComment(
          data.getLiveDetail.comment.filter(c => c.idx === re)[0],
        );
      }
      if (modifyIdx) {
        const c = data.getLiveDetail.comment.filter(
          c => c.idx === modifyIdx,
        )[0];
        setMoreComment(c);
        setModifingComment(c);
        setInputComment(c.content);
      }
    }
  }, [data]);
  useEffect(() => {
    if (error) onError(error.message);
  }, [error]);

  useEffect(() => {
    if (pressModify) {
      setVisibleMore(false);
    }
  }, [pressModify]);
  useEffect(() => {
    if (!visibleMore && pressModify) {
      setPressModify(false);
      refInput.current?.focus();
    }
  }, [visibleMore]);

  const onError = (msg: string) => {
    console.log(`Error::: `, msg);
    toast.show(msg.toString(), 1);
  };

  const onPressRe = (comment: TComment, y?: number) => {
    setSelectedComment(comment);
    refInput.current.focus();
  };

  const onPressModifyComment = () => {
    setPressModify(true);
    setModifingComment(moreComment);
    setInputComment(moreComment?.content || '');
  };
  const onPressDeleteComment = () => {
    setVisibleMore(false);
    mutSetComment({
      variables: {
        idx: reviewIdx,
        commentIdx: moreComment?.idx,
        content: '',
        session: token,
      },
    }).then(() => {
      console.log(`delete success`);
      setMoreComment(null);
      loadComment({variables: {idx: reviewIdx, addView: false}});
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.mainBackgroundColor,
      }}>
      <View style={s.headerWrapper}>
        <TouchableOpacity
          onPress={() => {
            // Actions.pop();
            navigation.pop();
          }}>
          <Image
            source={arrowLeftGrayThin.src}
            style={{
              width: arrowWidth,
              height: arrowWidth * arrowLeftGrayThin.ratio,
            }}
          />
        </TouchableOpacity>
        <Text style={s.title}>COMMENT</Text>
        <View style={{width: arrowWidth}} />
      </View>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={'padding'}
        enabled={Platform.OS === 'ios'}>
        <FlatList
          ref={refScrollView}
          data={data?.getLiveDetail?.comment || []}
          keyExtractor={item => item.idx.toString()}
          renderItem={item => (
            <View>
              <CommentComponent
                // key={item.item.idx}
                comment={item.item}
                onPressRe={() => {
                  onPressRe(item.item);
                }}
                onLoad={idx => {
                  re && onPressRe(item.item, item.index);
                }}
                onPressMore={() => {
                  setVisibleMore(true);
                  setMoreComment(item.item);
                }}
                now={now}
              />
            </View>
          )}
        />

        <View style={s.inputSection}>
          <Image
            source={me?.img ? {uri: me.img} : profileEmpty.src}
            style={s.profileMain}
          />
          <View style={s.inputContainer}>
            <TextInput
              ref={refInput}
              style={s.input}
              multiline
              placeholder={
                !!me && !!me.memberId ? 'Comment...' : 'Please Login...'
              }
              placeholderTextColor="#aeaeae"
              onChangeText={t => {
                if (selectedComment !== undefined) {
                  let tSplited: any = t.split(' ');
                  if (tSplited[0] !== selectedComment.writer.name) {
                    setSelectedComment(undefined);
                  }
                  tSplited.splice(0, 1);
                  setInputComment(tSplited.join(' '));
                } else {
                  setInputComment(t);
                }
              }}
              textAlignVertical="center"
              editable={!!me && !!me.memberId}
              // onFocus={() => {
              //   console.log(`Focus`);
              //   if (inTrial) {
              //     console.log(`Focus2`);
              //     setVisibleNotice(true);
              //   }
              // }}
              onBlur={() => {
                // if (modifingComment) {
                //   setModifingComment(null);
                //   setMoreComment(null);
                // }
              }}
              autoFocus>
              <>
                {selectedComment && (
                  <Text style={{color: 'blue'}}>
                    {selectedComment.writer.name + ' '}
                  </Text>
                )}
                {inputComment}
              </>
            </TextInput>
            <TouchableOpacity
              style={s.btnPost}
              onPress={() => {
                if (!inputComment.length) {
                  return;
                }
                if (modifingComment) {
                  mutSetComment({
                    variables: {
                      commentIdx: modifingComment.idx,
                      idx: reviewIdx,
                      content: inputComment,
                      session: token,
                    },
                  }).then(() => {
                    console.log(`modify success`);
                    setInputComment('');
                    loadComment({variables: {idx: reviewIdx, addView: false}});
                    setMoreComment(null);
                    setModifingComment(null);
                    refInput?.current.clear();
                  });
                  return;
                }

                mutSetComment({
                  variables: {
                    idx: selectedComment?.idx ?? reviewIdx,
                    content: inputComment,
                    session: token,
                  },
                })
                  .then(() => {
                    loadComment({variables: {idx: reviewIdx, addView: false}});
                    setInputComment('');
                  })
                  .catch(({message}) => {
                    onError(message);
                  });
              }}>
              <Text style={s.textPost}>posting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={visibleMore} transparent>
        <View style={{width: '100%', height: '100%'}}>
          <View
            onTouchEnd={() => {
              //   setVisibleMore(false);
              setVisibleMore(false);
            }}
            style={{
              width: '100%',
              flex: 1,
              backgroundColor: '#000000aa',
            }}
          />
          <View style={{backgroundColor: '#fff'}}>
            <View>
              <TouchableOpacity
                style={s.commentMoreBox}
                onPress={onPressModifyComment}>
                <View style={{width: 60, height: 60, ...theme.center}}>
                  <Image
                    source={icoPencil.src}
                    style={{height: 18, width: 18 / icoPencil.ratio}}
                  />
                </View>
                <Text style={s.commentMoreText}>Modify</Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={s.commentMoreBox}
                onPress={onPressDeleteComment}>
                <View style={{width: 60, height: 60, ...theme.center}}>
                  <Image
                    source={icoTrash.src}
                    style={{height: 18, width: 18 / icoTrash.ratio}}
                  />
                </View>
                <Text style={s.commentMoreText}>delete</Text>
              </TouchableOpacity>
            </View>

            <View style={{borderBottomWidth: 1, borderColor: '#fff'}}>
              <TouchableOpacity
                style={s.commentMoreBox}
                onPress={() => {
                  setMoreComment(null);
                }}>
                <View style={{width: 60, height: 60, ...theme.center}}>
                  <Image
                    source={icoExitBlack.src}
                    style={{height: 15, width: 15 / icoExitBlack.ratio}}
                  />
                </View>
                <Text style={s.commentMoreText}>cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  headerWrapper: {
    ...theme.boxes.rowBetweenCenter,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: theme.colors.grayInMainLight,
  },
  title: {
    ...theme.fontSizes.large,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  inputSection: {
    ...theme.boxes.rowBetweenCenter,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flex: 1,
    ...theme.boxes.rowBetweenCenter,
    height: profileMainSize + 5,
    backgroundColor: '#fff',
    borderRadius: profileMainSize,
    paddingRight: 10,
  },
  profileMain: {
    width: profileMainSize,
    height: profileMainSize,
    marginRight: 10,
    borderRadius: profileMainSize,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    ...theme.fontSizes.medium,
    textAlignVertical: 'center',
    ...theme.center,
    color: '#333',
  },
  btnPost: {},
  textPost: {
    color: theme.colors.blackMint,
    ...theme.fontSizes.small,
    fontWeight: 'bold',
  },

  commentMoreBox: {
    width: '100%',
    backgroundColor: '#fff',
    ...theme.boxes.rowStartCenter,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grayInMainLight,
  },
  commentMoreText: {},
});

export default ReviewCommentScreen;
