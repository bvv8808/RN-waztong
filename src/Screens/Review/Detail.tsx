import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  arrowLeftWhite,
  icoCopyLink,
  icoMore,
  // icoCopyLink,
  // icoHeartActive,
  // icoHeartInactive,
  // icoMore,
  icoShare,
  icoShareEmail,
  icoShareFacebook,
  icoShareLine,
  // icoShareEmail,
  // icoShareFacebook,
  // icoShareLine,
  icoThumbEmpty,
  icoThumbFill,
  profileEmptyGray1,
} from '~/images';
import theme from '~/lib/theme';
import GradientView from 'react-native-linear-gradient';
import ActionSheet from 'react-native-actions-sheet';
import gql from 'graphql-tag';
import CommentInDetail from '~/components/CommentInDetail';
import {TComment, TReviewStackParams} from '~/lib/types';
import toast from 'react-native-simple-toast';
import {openComposer} from 'react-native-email-link';
import Clipboard from '@react-native-community/clipboard';
import {MessageDialog} from 'react-native-fbsdk-next';
import ModalCommentMore from '~/components/Modals/ModalCommentMore';
import {convertToLocale, insertComma} from '~/lib/util';
import {useRecoilState, useRecoilValue} from 'recoil';

import {StackScreenProps} from '@react-navigation/stack';
import {
  __enterReviewDetail,
  __myInfo,
  __postDeleted,
  __token,
} from '~/lib/recoil/atom';
import {useBLazyQuery, useBMutation} from '~/lib/gql/gqlBuilder';
import ModalLayout from '~/components/Modals/ModalLayout';
import {useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';

const screenWidth = Dimensions.get('screen').width;
const heartHeight = 25;

let timer: any;
const ReviewDetailScreen = ({
  navigation,
  route,
}: StackScreenProps<TReviewStackParams, 'reviewDetail'>) => {
  const {reviewIdx} = route.params;

  const [enterReviewDetail, r_setEnterReviewDetail] =
    useRecoilState(__enterReviewDetail);
  const [postDeleted, r_setPostDeleted] = useRecoilState(__postDeleted);
  const token = useRecoilValue(__token);
  const me = useRecoilValue(__myInfo);

  const focused = useIsFocused();

  const [visibleSearch, setVisibleSearch] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [like, setLike] = useState(false);
  const [cntLike, setCntLike] = useState(0);

  const [contentWrapperWidth, setContentWrapperWidth] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [completeDelete, setCompleteDelete] = useState(false);

  const [visibleNotice, setVisibleNotice] = useState(false);
  const [visibleMore, setVisibleMore] = useState(false);
  const [pressModify, setPressModify] = useState(false);
  const [moreComment, setMoreComment] = useState<TComment | null>(null);

  const [deleted, setDeleted] = useState(false);

  const [bannerUri, setBannerUri] = useState('');
  const [bannerSize, setBannerSize] = useState({
    width: screenWidth,
    height: screenWidth * (9 / 16),
  });

  const refSheet1 = useRef<ActionSheet>(null);
  const refSheet2 = useRef<ActionSheet>(null);

  const [loadPost, {data: postData, error: postError}] =
    useBLazyQuery('review');

  // const {data: configResult, error: configError} = useQuery<ResponseGQL>(
  //   gql`
  //   query {
  //     getConfig {
  //       getBanner
  //     }
  //     getMe(session: "${token}") {
  //       name
  //       email
  //       img
  //     }
  //   }
  // `,
  //   {errorPolicy: 'all'},
  // );

  // # Mutations
  const [mutHeart] = useBMutation('like');
  const [mutDeletePost] = useBMutation('reviewDelete');
  const [mutHide] = useBMutation('reviewHide');
  const [mutBlock] = useBMutation('reviewBlock');
  const [mutReport] = useBMutation('reviewReport');
  const [mutSetComment] = useBMutation('commentWrite');

  useEffect(() => {
    if (focused) {
      if (postDeleted) {
        toast.show('Deleted post', 1.5);
        // Actions.replace('live', {refresh: new Date().getTime()});
        navigation.pop();
      } else {
        console.log(`reviewidx::  `, reviewIdx);
        loadPost({
          variables: {addView: !enterReviewDetail, idx: reviewIdx, token},
        });
      }

      if (!enterReviewDetail) r_setEnterReviewDetail(true);
      r_setPostDeleted(false);
    }
  }, [focused]);

  useEffect(() => {
    if (postData && postData.getLiveDetail) {
      console.log(`post::::: `, postData.getLiveDetail);
      const data = postData.getLiveDetail;
      setLike(data.isLiked);
      setCntLike(data.recommend);
      // if (data.isHide !== null) {
      //   setIsHide(data.isHide);
      // }
    }
  }, [postData]);

  useEffect(() => {
    if (pressModify) {
      setVisibleMore(false);
    }
  }, [pressModify]);
  useEffect(() => {
    if (!visibleMore && pressModify) {
      setPressModify(false);
      if (postData)
        navigation.push(
          route.key.startsWith('My') ? 'MyReviewModify' : 'reviewModify',
          {reviewData: postData.getLiveDetail},
        );
      // Actions.push('liveComment', {
      //   postId: data?.getLiveDetail.idx,
      //   me: me,
      //   modifyIdx: moreComment?.idx,
      // });
    }
  }, [visibleMore]);

  // useEffect(() => {
  //   if (
  //     configResult &&
  //     configResult.getConfig &&
  //     configResult.getConfig.getBanner &&
  //     configResult.getConfig.getBanner.length
  //   ) {
  //     setBannerUri(configResult.getConfig.getBanner);
  //   }
  // }, [configResult]);

  useEffect(() => {
    if (postError)
      console.log(`POST ERROR `, JSON.stringify(postError), reviewIdx);
    const msg = postError?.message || '';
    msg && onError(msg);
  }, [postError]);

  const onError = (msg: string) => {
    if (msg.startsWith('Can')) return;
    // const translatedMsg = trans(msg, lang);
    if (msg) toast.show(msg.toString(), 1);
  };

  const onPressBlock = () => {
    //
    if (postData && postData.getLiveDetail) {
      mutBlock({
        variables: {id: postData.getLiveDetail.writer.memberId, session: token},
      })
        .then(() => {
          toast.show('Blocked!', 1);
          r_setEnterReviewDetail(false);
          navigation.pop();
        })
        .catch(({message}) => {
          console.log(`@@@ Error in block`, message);
          onError(message);
        });
    }
  };
  const onPressReport = () => {
    //
    mutReport({variables: {idx: reviewIdx, session: token}})
      .then(() => {
        toast.show('Report sended successly', 1);
      })
      .catch(({message}) => {
        console.log(`@@@ Error in report`, message);
        onError(message);
      });
  };
  const onPressHide = (curHide: boolean) => {
    mutHide({variables: {idx: reviewIdx, session: token, hide: !curHide}})
      .then(() => {
        setIsHide(h => !h);
      })
      .catch(({message}) => {
        console.log(`@@@ Error in hide`, message);
        onError(message);
      });
  };
  const onPressModify = () => {
    if (!postData) return;
    navigation.push(
      route.key.startsWith('My') ? 'MyReviewModify' : 'reviewModify',
      {reviewData: postData.getLiveDetail},
    );
    //
    // Actions.push('modifyPost', {modifyPost: data?.getLiveDetail});
  };
  const onPressDelete = () => {
    setConfirmDelete(true);
  };

  const onPressModifyComment = () => {
    setPressModify(true);
    // setInputComment(moreComment?.content || '');
  };
  const onPressDeleteComment = () => {
    setVisibleMore(false);
    // mutSetComment({
    //   variables: {
    //     idx,
    //     commentIdx: moreComment?.idx,
    //     content: '',
    //   },
    // }).then(() => {
    //   console.log(`delete success`);
    //   setMoreComment(null);
    //   // loadComment();
    //   loadPost({variables: {addView: false}});
    // });
  };

  const onPressShare = (type: 'link' | 'line' | 'email' | 'facebook') => {
    // @ts-ignore
    // refSheet2.current.setModalVisible(false);

    console.log(`share by : `, type);
    // const sharedLink = `kooltong://live?id=${data?.getLiveDetail.idx}`;
    const titleToShare = postData?.getLiveDetail?.subject || 'Untitled';
    const sharedLink =
      'http://waztong.iozenweb.co.kr/share/kooltong.html?id=' + reviewIdx;
    console.log(`sharedLink::: `, sharedLink);

    // ###### 1: Call a Native Share Modal
    // Share.share({
    //   url: sharedLink,
    //   message: 'This is share message.',
    //   title: 'ShareTitle',
    // }).then(v => {
    //   console.log(`v:: `, v);
    // });

    // ##### 2: Execute each other behaviors
    switch (type) {
      case 'link':
        Clipboard.setString(sharedLink);
        toast.show('Copied');
        break;
      case 'line':
        Linking.openURL(
          `https://line.me/R/share?text=${titleToShare}%20${sharedLink}`,
        );
        break;
      case 'email':
        openComposer({
          // message: 'Hello',
          body: `${titleToShare}\n${sharedLink}`,
          cancelLabel: 'Back',
        });
        break;
      case 'facebook':
        const shareLinkContent = {
          contentType: 'link',
          contentUrl: sharedLink,
          contentDescription: titleToShare,
        };

        // @ts-ignore
        MessageDialog.canShow(shareLinkContent)
          .then(can => {
            console.log(`canShow: `, can);
            if (can) {
              // @ts-ignore
              return MessageDialog.show(shareLinkContent);
            } else {
              toast.show('Messenger is not insalled', 1);
            }
          })
          .then(
            result => {
              console.log(`result: `, result);
            },
            err => {
              console.log(`Error! `, err);
            },
          )
          .catch(e => {
            console.log(`ERR@@@@@ `, e);
          });
        break;
    }
  };

  useEffect(() => {
    if (completeDelete)
      setTimeout(() => {
        setCompleteDelete(false);
      }, 1000);
  }, [completeDelete]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={'padding'}
        enabled={Platform.OS === 'ios'}>
        <ScrollView>
          {/* Header */}
          <View
            style={{
              ...theme.boxes.rowBetweenCenter,
              backgroundColor: theme.colors.mint,
            }}>
            <Pressable
              onPress={() => {
                navigation.pop();
              }}
              style={{width: 60, height: 60, ...theme.center}}>
              <Image
                source={arrowLeftWhite.src}
                style={{width: 25, height: 25}}
                resizeMode="contain"
              />
            </Pressable>
            <Text style={theme.texts.mediumWhite}>POST</Text>
            <Pressable
              onPress={() => {
                refSheet1.current?.setModalVisible(true);
              }}
              style={{width: 60, height: 60, ...theme.center}}>
              <Image
                source={icoMore.src}
                style={{width: 15, height: 15}}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          {/* Title Box */}
          {/* <View
          style={{
            backgroundColor: '#f3f3f3',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 3,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: 40,
          }}>
          <View style={{...theme.boxes.rowBetweenCenter}}>
            <Text style={{...theme.texts.boldBigBlack}}>
              {configResult?.getConfig.liveTitle}
            </Text>
          </View>
          <Text style={{...theme.texts.tinyGray}}>
            {configResult?.getConfig.liveContent}
          </Text>
        </View> */}

          {/* Banner -->  */}

          {/* <TouchableOpacity
            activeOpacity={1}
            style={{
              ...bannerSize,
              marginTop: 20,
              borderWidth: 2,
              borderColor: 'blue',
            }}
            onPress={() => {
              // Actions.push('membershipPrice');
            }}>
            {bannerUri.length > 0 && (
              <Image
                onLoad={({nativeEvent: e}) => {
                  console.log(`loaded:: `, e);
                  const {width, height} = e.source;
                  const bannerHeight = screenWidth * (height / width);
                  setBannerSize({width: screenWidth, height: bannerHeight});
                }}
                source={{uri: bannerUri}}
                style={{width: '100%', height: '100%'}}
              />
            )}
          </TouchableOpacity> */}

          {/* <-- Banner */}

          {/* Post Title Box --> */}
          <View
            style={{
              padding: 20,
              backgroundColor: '#fff',
              borderBottomColor: theme.colors.grayInMainLight,
              borderBottomWidth: 1,
            }}>
            <View style={{...theme.boxes.rowBetweenCenter}}>
              <Text style={{...theme.texts.boldBigBlack}}>
                {postData?.getLiveDetail?.subject || ''}
              </Text>
              {/* <Image /> */}
              <TouchableOpacity
                style={{paddingLeft: 10, paddingVertical: 2}}
                onPress={() => {
                  // @ts-ignore
                  refSheet?.current?.setModalVisible();
                }}>
                {/* <Image source={icoMore.src} style={{width: 15, height: 15}} /> */}
              </TouchableOpacity>
            </View>
            <View
              style={{
                ...theme.boxes.rowBetweenCenter,
                height: 35,
                marginTop: 5,
              }}>
              <TouchableOpacity
                onPress={() => {
                  // Actions.push('myPost', {
                  //   otherId: data?.getLiveDetail.writer.memberId,
                  //   onDelete: () => {
                  //     r_setPostDeleted(true);
                  //   },
                  // });
                }}>
                <Image
                  source={
                    postData &&
                    postData.getLiveDetail &&
                    !!postData.getLiveDetail.writer.img
                      ? {uri: postData.getLiveDetail.writer.img}
                      : profileEmptyGray1.src
                  }
                  style={{
                    width: 35,
                    height: 35 * profileEmptyGray1.ratio,
                    marginRight: 10,
                    borderRadius: 20,
                  }}
                />
              </TouchableOpacity>
              <View
                style={{
                  height: '100%',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    ...theme.fontSizes.medium,
                    paddingVertical: 0,
                    color: theme.colors.black,
                  }}>
                  {postData?.getLiveDetail?.writer?.name ?? ''}
                </Text>
                <Text style={{...theme.texts.tinyGray}}>
                  {`views ${insertComma(
                    Number(postData?.getLiveDetail?.view ?? 0),
                  )} | like ${cntLike ?? 0} | comment ${
                    postData?.getLiveDetail?.comment?.length ?? 0
                  }`}
                </Text>
              </View>

              <View
                style={{
                  height: '100%',
                  flex: 1,
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={{
                    ...theme.texts.tinyGray,
                    textAlign: 'right',
                  }}>
                  {postData &&
                    postData.getLiveDetail &&
                    convertToLocale(postData.getLiveDetail?.registDatetime, {
                      exceptSeconds: true,
                    })}
                </Text>
              </View>
            </View>
          </View>
          {/* <-- Post Title Box */}

          {/* Post --> */}
          <View
            style={{
              paddingHorizontal: 20,
              backgroundColor: '#fff',
              paddingTop: 30,
              borderBottomWidth: 1,
              borderColor: theme.colors.grayInMainLight,
            }}
            onLayout={({nativeEvent}) => {
              setContentWrapperWidth(nativeEvent.layout.width - 40);
            }}>
            {postData &&
              postData.getLiveDetail &&
              postData.getLiveDetail?.pics.map((p: string) => {
                return (
                  <Image
                    key={p}
                    source={{uri: p}}
                    style={{
                      width: contentWrapperWidth * 0.8,
                      height: contentWrapperWidth * 0.8 * (9 / 16),
                      marginBottom: 20,
                      alignSelf: 'center',
                    }}
                    onLoad={e => {
                      const {width, height} = e.nativeEvent.source;
                      // @ts-ignore
                      e.target.setNativeProps({
                        height: contentWrapperWidth * 0.8 * (height / width),
                      });
                    }}
                  />
                );
              })}

            <Text
              style={{
                marginVertical: 30,

                ...theme.fontSizes.small,
                lineHeight: 20,
                fontWeight: 'bold',
                color: theme.colors.black,
              }}>
              {postData?.getLiveDetail?.content ?? ''}
            </Text>
          </View>
          {/* <-- Post */}

          {/* Recommend --> */}
          <View
            style={{
              ...theme.boxes.rowBetweenCenter,
              paddingVertical: 30,
              paddingHorizontal: 20,
              backgroundColor: '#fff',
            }}>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  console.log(`@@`, postData?.getLiveDetail?.idx, token, like);
                  if (!token) {
                    toast.show('Plase sign in', 1);
                    return;
                  }
                  mutHeart({
                    variables: {
                      idx: postData?.getLiveDetail?.idx,
                      isLike: !like,
                      session: token,
                    },
                  })
                    .then(() => {
                      console.log(`success`);
                      setCntLike(c => (like ? c - 1 : c + 1));
                      setLike(l => !l);
                    })
                    .catch(e => {
                      console.log(
                        `@@@ Error in change heart:::::: `,
                        JSON.stringify(e),
                      );
                      onError(e.message);
                    });
                }}
                style={{
                  height: heartHeight,
                  width: heartHeight / icoThumbEmpty.ratio,
                  marginBottom: 5,
                }}>
                <Image
                  source={like ? icoThumbFill.src : icoThumbEmpty.src}
                  style={{
                    height: heartHeight,
                    width: heartHeight / icoThumbEmpty.ratio,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  paddingVertical: 0,
                  color: theme.colors.black,
                  // fontWeight: 'bold',
                }}>
                {cntLike}
              </Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  refSheet2?.current?.setModalVisible();
                }}
                style={{
                  width: heartHeight,
                  height: heartHeight,
                  marginBottom: 5,
                }}>
                <Image
                  source={icoShare.src}
                  style={{
                    height: heartHeight,
                    width: heartHeight / icoShare.ratio,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  ...theme.fontSizes.tiny,
                  paddingVertical: 0,
                  color: theme.colors.black,
                  fontWeight: 'bold',
                }}>
                SHARE
              </Text>
            </View>
          </View>
          {/* <-- Recommend */}

          {/* Comment --> */}
          <View
            style={{
              paddingVertical: 10,
              backgroundColor: theme.colors.mainBackgroundColor,
              paddingHorizontal: 20,
            }}>
            <Text style={{...s.text}}>
              Comments {postData?.getLiveDetail?.comment?.length ?? '0'}
            </Text>
          </View>

          {postData && postData.getLiveDetail && (
            <FlatList
              data={postData.getLiveDetail?.comment}
              renderItem={({item: c, index: i}) => (
                <CommentInDetail
                  key={new Date().getTime().toString() + i}
                  comment={c}
                  onPressRe={() => {
                    // Actions.push('liveComment', {
                    //   postId: data.getLiveDetail.idx,
                    //   re: c.idx,
                    //   me: me,
                    // });
                  }}
                  onPressMore={() => {
                    setMoreComment(c);
                    setVisibleMore(true);
                  }}
                />
              )}
              keyExtractor={item => item.idx + item.registDatetime}
            />
          )}
          {/* {data &&
          data.getLiveDetail.comment.map((c: TComment, i: number) => (
            <Comment1
              key={new Date().getTime().toString() + i}
              comment={c}
              onPressRe={() => {
                Actions.push('liveComment', {
                  postId: data.getLiveDetail.idx,
                  re: c.idx,
                  me: me,
                });
              }}
              onPressMore={() => {
                setMoreComment(c);
                setVisibleMore(true);
              }}
            />
          ))} */}

          <TouchableOpacity
            onPress={() => {
              // ## press comment
              // Actions.push('liveComment', {
              //   postId: data?.getLiveDetail.idx,
              //   me: me,
              // });
              navigation.push(
                route.key.startsWith('My')
                  ? 'MyReviewComment'
                  : 'reviewComment',
                {postId: reviewIdx},
              );
            }}
            style={{
              // ...theme.boxes.rowBetweenCenter,
              flexDirection: 'row',
              justifyContent: 'space-between',
              // paddingVertical: 30,
              height: 65,
              backgroundColor: '#fff',
              paddingHorizontal: 20,
              ...theme.boxes.rowBetweenCenter,
            }}>
            <Text
              style={{
                color: '#d8d8d8',
                ...theme.fontSizes.large,
                fontWeight: 'bold',
              }}>
              Enter a comment
            </Text>
            <View
              style={{
                ...theme.center,
                backgroundColor: theme.colors.mint,
                width: 70,
                height: 40,
                borderRadius: 20,
              }}>
              <Text
                style={{
                  ...theme.fontSizes.large,
                  color: '#fff',
                  paddingVertical: 0,
                }}>
                OK
              </Text>
            </View>
          </TouchableOpacity>
          {/* <-- Comment */}
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet
        // @ts-ignore
        ref={refSheet1}>
        <View>
          {me.memberId !== postData?.getLiveDetail?.writer?.memberId ? (
            <>
              {!!me.memberId.length && (
                <TouchableOpacity
                  onPress={() => {
                    // @ts-ignore
                    refSheet1.current.setModalVisible(false);
                    onPressBlock();
                  }}
                  style={s.btnBlock}>
                  <Text
                    style={{...s.textBlock, color: theme.colors.mainRedText}}>
                    Block
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  refSheet1.current.setModalVisible(false);
                  onPressReport();
                }}
                style={s.btnBlock}>
                <Text style={s.textBlock}>Report</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  refSheet1.current.setModalVisible(false);
                  onPressHide(isHide);
                }}
                style={s.btnBlock}>
                <Text style={s.textBlock}>{isHide ? 'Show' : 'Hide'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  refSheet1.current.setModalVisible(false);
                  onPressModify();
                }}
                style={s.btnBlock}>
                <Text style={s.textBlock}>Modify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  refSheet1.current.setModalVisible(false);
                  onPressDelete();
                }}
                style={{...s.btnBlock, borderBottomWidth: 0}}>
                <Text style={{...s.textBlock, color: theme.colors.mainRedText}}>
                  delete
                </Text>
              </TouchableOpacity>
            </>
          )}
          {/* </View> */}
        </View>
      </ActionSheet>

      <ActionSheet
        // @ts-ignore
        ref={refSheet2}>
        <View style={{backgroundColor: '#000'}}>
          <View
            style={{
              paddingHorizontal: 20,
            }}>
            <Text
              style={{
                ...theme.fontSizes.small,
                color: '#fff',
                fontWeight: 'bold',
                marginTop: 10,
              }}>
              share
            </Text>
            <View
              style={{...theme.boxes.rowBetweenCenter, paddingVertical: 20}}>
              <TouchableOpacity
                onPress={() => {
                  onPressShare('link');
                }}
                style={{
                  alignItems: 'center',
                }}>
                <Image
                  source={icoCopyLink.src}
                  style={{
                    width: screenWidth * 0.15,
                    height: screenWidth * 0.15,
                  }}
                />
                <Text style={s.shareText}>link copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onPressShare('line');
                }}
                style={{
                  alignItems: 'center',
                }}>
                <Image
                  source={icoShareLine.src}
                  style={{
                    width: screenWidth * 0.15,
                    height: screenWidth * 0.15,
                  }}
                />
                <Text style={s.shareText}>Line</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onPressShare('email');
                }}
                style={{
                  alignItems: 'center',
                }}>
                <Image
                  source={icoShareEmail.src}
                  style={{
                    width: screenWidth * 0.15,
                    height: screenWidth * 0.15,
                  }}
                />
                <Text style={s.shareText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onPressShare('facebook');
                }}
                style={{
                  alignItems: 'center',
                }}>
                <Image
                  source={icoShareFacebook.src}
                  style={{
                    width: screenWidth * 0.15,
                    height: screenWidth * 0.15,
                  }}
                />
                <Text style={s.shareText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              refSheet2.current.setModalVisible(false);
            }}
            style={{
              width: '100%',
              height: 60,
              borderTopWidth: 0.5,
              borderTopColor: '#aeaeaeaa',
              ...theme.center,
            }}>
            <Text
              style={{
                ...theme.fontSizes.small,
                color: '#fff',
                fontWeight: 'bold',
              }}>
              cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {confirmDelete && (
        <ModalLayout>
          <Text
            style={{
              textAlign: 'center',
              ...theme.fontSizes.large,
              color: theme.colors.borderInBlack,
              paddingVertical: 30,
            }}>
            Are you sure you want{'\n'}to delete the post?
          </Text>
          <View
            style={{
              ...theme.boxes.rowBetweenCenter,
              height: 50,
              borderTopWidth: 1,
              borderTopColor: theme.colors.grayInMainLight,
            }}>
            <TouchableOpacity
              onPress={() => {
                setConfirmDelete(false);
              }}
              style={{
                flex: 1,
                height: '100%',
                ...theme.center,
                borderRightWidth: 1,
                borderRightColor: theme.colors.grayInMainLight,
              }}>
              <Text style={s.modalBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setConfirmDelete(false);
                if (postData && postData.getLiveDetail) {
                  mutDeletePost({
                    variables: {
                      idx: postData.getLiveDetail.idx,
                      session: token,
                    },
                  })
                    .then(deleteResult => {
                      setCompleteDelete(true);
                      r_setEnterReviewDetail(false);
                      setTimeout(() => {
                        navigation.pop();
                        // Actions.replace('live', {
                        //   refresh: new Date().getTime(),
                        // });
                      }, 1000);
                    })
                    .catch(e => {
                      console.log(`@@@ Error in delete`, JSON.stringify(e));
                      onError(e.message);
                    });
                }
                // setCompleteDelete(true);
              }}
              style={{flex: 1, height: '100%', ...theme.center}}>
              <Text style={{...s.modalBtnText, color: theme.colors.mint}}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </ModalLayout>
      )}

      {completeDelete && (
        <ModalLayout>
          <Text
            style={{
              ...theme.fontSizes.large,
              paddingVertical: 40,
              textAlign: 'center',
              fontWeight: '300',
              color: theme.colors.black,
            }}>
            The post has been deelted
          </Text>
        </ModalLayout>
      )}

      <ModalCommentMore
        touchableType={1}
        visible={visibleMore}
        hide={() => {
          setVisibleMore(false);
        }}
        onCancel={() => {
          setMoreComment(null);
        }}
        onPressModify={() => {
          onPressModifyComment();
        }}
        onPressDelete={() => {
          onPressDeleteComment();
        }}
      />
    </SafeAreaView>
  );
};
// LiveDetailScreen.onEnter = () => {

// }

const s = StyleSheet.create({
  btnRecommend: {
    ...theme.boxes.rowCenter,
    width: '38%',
    paddingVertical: 10,
    // paddingHorizontal: 20,
    borderRadius: 20,
  },
  textRecommend: {
    color: '#fff',
    ...theme.fontSizes.medium,
    paddingVertical: 0,
  },
  text: {
    ...theme.fontSizes.small,
    paddingVertical: 10,
    lineHeight: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },

  btnBlock: {
    height: 66,
    ...theme.center,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayInMainLight,
  },
  textBlock: {
    ...theme.fontSizes.largest,
    paddingVertical: 0,
    color: theme.colors.black,
    fontWeight: '200',
  },

  modalBtnText: {
    ...theme.fontSizes.largest,
    paddingVertical: 0,
    color: theme.colors.gray,
    fontWeight: 'bold',
  },

  shareText: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#fff',
  },
});

export default ReviewDetailScreen;
