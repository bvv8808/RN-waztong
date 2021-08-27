import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';
import {
  arrowLeftWhite,
  checkMint,
  icoBest1,
  icoCoins,
  //   icoCheckRed,
  icoCoins2,
  //   imgMainBackPart,
  imgUnlimited,
  item1,
  item2,
  item3,
  logoHeader,
  logoWhite,
  logoWhite2,
  rectSubs,
  //   item1000,
  //   item1month,
  //   item300,
  //   item3000,
  //   item50,
  //   logo2,
  //   logoAlphabet,
  //   logoMini,
  storeBackground,
  unlimitedBackground,
} from '~/images';
import {__iapReceipt, __token, __myInfo} from '~/lib/recoil/atom';
import RNIap, {
  acknowledgePurchaseAndroid,
  consumeAllItemsAndroid,
  consumePurchaseAndroid,
  finishTransaction,
  InAppPurchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  SubscriptionPurchase,
  requestSubscription,
} from 'react-native-iap';
import theme from '~/lib/theme';
import {useQuery, gql, useMutation, useLazyQuery} from '@apollo/client';
import toast from 'react-native-simple-toast';
import AdContainer from '~/Base/AdContainer';
import {useRef} from 'react';
import useUpdateMe from '~/lib/hooks/useUpdateMe';
import {StackScreenProps} from '@react-navigation/stack';
import {TMainStackParams} from '~/lib/types';
import {transText} from '~/lib/lang/trans';
import {toShortUpper} from '~/lib/util';
import BaseLayout from '~/base/BaseLayout';
import {useIsFocused} from '@react-navigation/native';

const screenWidth = Dimensions.get('screen').width;
const topLogoWidth = 90;

const itemSkus: any = Platform.select({
  ios: ['waztong_coin_1', 'waztong_coin_2', 'waztong_coin_3'],
  android: ['waztong_coin_1', 'waztong_coin_2', 'waztong_coin_3'],
});
const itemSubs: any = Platform.select({
  ios: ['waztong_subscription'],
  android: ['waztong_subscription'],
});

let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;
let timer: any = null;
let flag = false;

const CoinStoreScreen = ({
  navigation,
}: StackScreenProps<TMainStackParams, 'store'>) => {
  const me = useRecoilValue(__myInfo);
  const token = useRecoilValue(__token);
  const [receipt, r_setReceipt] = useRecoilState(__iapReceipt);

  const focused = useIsFocused();

  const refBase = useRef<BaseLayout>(null);
  const refreshMe = useUpdateMe();
  const mySubtitle = useMemo(() => toShortUpper(me.subtitle), [me.subtitle]);

  const [visibleSuccess, setVisibleSuccess] = useState('');
  const [productList, setProductList] = useState<any>([]);
  const [subList, setSubList] = useState<any>([]);
  // const [receipt, setReceipt] = useState<any>();

  const [mutPurchase] = useMutation(gql`
    mutation ($productId: String!, $purchaseCode: String!) {
      setPurchase(session: "${token}", productId: $productId, device: "${Platform.OS.substring(
    0,
    1,
  ).toUpperCase()}", purchaseCode: $purchaseCode)
    }
  `);

  const onBack = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Main');
    return true;
  }, []);

  useEffect(() => {
    if (!focused) {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
      return;
    }

    BackHandler.addEventListener('hardwareBackPress', onBack);
  }, [focused]);

  useEffect(() => {
    if (visibleSuccess) {
      setTimeout(() => {
        setVisibleSuccess('');
      }, 1500);
    }
  }, [visibleSuccess]);

  // useEffect(() => {
  //   if (subList) {
  //     console.log(`subList:: `, subList);
  //   }
  // }, [subList]);

  // #3. 결제 성공해서 결제정보가 바뀌었을 때 실행되는 코드
  useEffect(() => {
    console.log(`#3`);
    if (receipt && !flag) {
      console.log(`#############`);
      flag = true;
      RNIap.clearTransactionIOS();
      RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      r_setReceipt('');
      refBase.current?.stopLoading();
      return;
    }
    if (receipt) {
      RNIap.finishTransaction(receipt, true).catch(e => {
        console.log(`Error in finishTransaction@@@@@@@@@@@ `, e);
      });
      // #4. 서버에 mutation. productId, purchaseCode 필드는 여기서 값을 넣고, session과 device 필드는 쿼리 작성 단계에서 이미 삽입된 상태.

      const body = {
        productId: receipt.productId,
        purchaseCode:
          Platform.OS === 'ios' ? receipt.transactionId : receipt.purchaseToken,
      };

      console.log(`body:::::::: `, body);

      mutPurchase({
        variables: body,
      })
        .then(() => {
          // #5. 멤버십 가입 성공. 서버에 반영된 멤버십 정보를 가져오는 query 실행.
          timer = false;
          console.log(
            '@@@ 서버 요청 완료 @@@\n',
            receipt.productId,
            receipt.productId.startsWith('waztong_coint'),
          );

          refreshMe();
          setVisibleSuccess(
            receipt.productId.startsWith('waztong_coin')
              ? 'Your coins have been charged'
              : 'You are now a Waztong member',
          );

          refBase.current?.stopLoading();
        })
        .catch(e => {
          console.log(`@@ Error in mutPuchase\n`, JSON.stringify(e));
          onError(e);
          refBase.current?.stopLoading();
        });
      RNIap.clearTransactionIOS().then(() => {
        console.log(`IAP Transaction cleared@`);
      });
      r_setReceipt('');
    }
  }, [receipt]);

  useEffect(() => {
    if (productList) console.log(`productList:: `, productList);
    if (productList) refBase.current?.stopLoading();
  }, [productList]);

  useEffect(() => {
    refBase.current?.startLoading();
    const _init_ = async () => {
      try {
        await RNIap.initConnection();
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        await RNIap.clearTransactionIOS();
        consumeAllItemsAndroid().catch(e => {
          console.log(`Error in consumeAllItemsAndroid@@@ `, e);
        });
      } catch (err) {
        console.warn(err.code, err.message, ' / _init_');
        toast.show('Error occurred', 1);
        refBase.current?.stopLoading();
        navigation.reset({
          index: 1,
          routes: [{name: 'Main'}],
        });
      }
    };

    _init_().then(async () => {
      // #0. 인앱결제 init 후 Product List 받아와서 setState
      try {
        const products = await RNIap.getProducts(itemSkus);
        const subs = await RNIap.getSubscriptions(itemSubs);
        // console.log('# Products\n', products);
        setProductList(products);
        setSubList(subs);
      } catch (err) {
        console.warn(err.code, err.message, '/ getProducts');
        toast.show('Error occured', 1);
        refBase.current?.stopLoading();
        navigation.reset({
          index: 1,
          routes: [{name: 'Main'}],
        });
      }
    });

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: InAppPurchase | SubscriptionPurchase) => {
        if (timer) return;
        if (!timer) timer = true;
        console.info('purchase', purchase);
        //@ts-ignore
        const receipt2 = purchase.transactionReceipt || purchase.originalJson;
        // console.info(receipt2);

        if (receipt2) {
          console.log(`#1`);
          try {
            if (Platform.OS === 'android' && purchase.purchaseToken) {
              acknowledgePurchaseAndroid(purchase.purchaseToken)
                .then(() => finishTransaction(purchase, true))
                .then(() => consumePurchaseAndroid(purchase.productId))
                .catch(e => {});
              // console.log(`##1`, purchase.purchaseToken);
              // await acknowledgePurchaseAndroid(purchase.purchaseToken);
              // const ackResult = await finishTransaction(purchase);
              // console.info('ackResult', ackResult);
            } else finishTransaction(purchase, true);
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }

          // #2. 결제 성공 시 결제 정보 setState. 이 state가 변경될 경우 실행되는 코드는 useEffect에 정의(#3)
          // setReceipt(purchase);
          r_setReceipt(purchase);
        }
        console.log(`#2`);
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', JSON.stringify(error));
        refBase.current?.stopLoading();
        // Alert.alert('purchase error', JSON.stringify(error));
      },
    );

    return () => {
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
        purchaseErrorSubscription = null;
      }
      RNIap.endConnection();
    };
  }, []);

  const onError = (msg: string) => {
    msg && toast.show(msg.toString(), 1);
  };

  const onPressCoins = (coin: number) => {
    // #1. 상품 버튼을 눌렀을 때. productList에서 알맞은 상품을 찾아 requestPurchase.
    if (!token) {
      toast.show('Please sign in', 0.7);
      return;
    } else if (me.membership.length) {
      toast.show('You are already WAZTONG member!', 1);
      return;
    }

    refBase.current?.startLoading();

    if (coin === -1) {
      if (!subList.length) {
        toast.show('The item does not exist', 1);
        return;
      }
      flag = true;

      if (subList && subList[0]) requestSubscription(subList[0].productId);
      return;
    }

    let selectedProduct = '';
    switch (coin) {
      case 50:
        selectedProduct = productList.find(
          (p: any) => p.productId === 'waztong_coin_1',
        );
        break;
      case 300:
        selectedProduct = productList.find(
          (p: any) => p.productId === 'waztong_coin_2',
        );
        break;
      case 1000:
        selectedProduct = productList.find(
          (p: any) => p.productId === 'waztong_coin_3',
        );
        break;
    }
    // console.log(`selectedProduct:: `, selectedProduct);

    if (selectedProduct)
      // @ts-ignore
      requestPurchase(selectedProduct.productId);
    else toast.show('The item does not exist', 0.7);
  };

  const requestPurchase = async (sku: any) => {
    try {
      flag = true;
      await RNIap.requestPurchase(sku);
    } catch (err) {
      console.log(`@@@ Error in requestPurchase: `, err);
    }
  };
  return (
    <BaseLayout ref={refBase}>
      <View style={{flex: 1}}>
        <View
          style={{
            height: 60,
            ...theme.center,
            backgroundColor: theme.colors.mint,
          }}>
          <Image
            source={logoWhite2.src}
            style={{height: 30, width: 30 / logoWhite2.ratio}}
          />
        </View>
        <ScrollView>
          <Image
            source={storeBackground.src}
            style={{
              width: screenWidth,
              height: screenWidth * storeBackground.ratio,
              position: 'absolute',
            }}
            resizeMode="cover"
          />
          <View style={{alignItems: 'center', marginTop: 50}}>
            {/* Top Texts --> */}
            <View
              style={{
                alignItems: 'center',
                width: '100%',
              }}>
              <Text style={[s.tTitle, {marginTop: 30}]}>
                WAZTONG MEMBERSHIP
              </Text>
              <Text style={s.tDescription}>
                {transText('StoreDescription', mySubtitle)}
              </Text>
              <View style={[s.boxBenefit, {backgroundColor: '#476ea5'}]}>
                <Image
                  source={checkMint.src}
                  style={s.check}
                  resizeMode="contain"
                />
                <Text style={s.tBenefit} numberOfLines={1}>
                  {transText('StoreBenefit1', mySubtitle)}
                </Text>
                <View style={{width: 18}} />
              </View>
              <View
                style={[s.boxBenefit, {backgroundColor: theme.colors.emerald}]}>
                <Image
                  source={checkMint.src}
                  style={s.check}
                  resizeMode="contain"
                />
                <Text style={s.tBenefit} numberOfLines={1}>
                  {transText('StoreBenefit2', mySubtitle)}
                </Text>
                <View style={{width: 18}} />
              </View>
            </View>
            {/* <-- Top texts */}

            <View style={{marginTop: 30, marginBottom: 50}}>
              <Image
                source={rectSubs.src}
                style={{
                  width: screenWidth / 2.2,
                  height: (screenWidth / 2.2) * rectSubs.ratio,
                }}
              />

              <Image source={icoBest1.src} style={s.best} />
              <Text style={s.tOne}>1</Text>
              <Text style={s.tMonth}>{transText('Month', mySubtitle)}</Text>
              <View style={s.priceMonthWrapper}>
                <Text style={s.tPriceMonth}>$3.99</Text>
              </View>

              <TouchableOpacity
                style={s.btn1month}
                onPress={() => {
                  onPressCoins(-1);
                }}
              />
            </View>
          </View>

          {/* Coins Section ==> */}
          <View
            style={{
              paddingHorizontal: 15,
            }}>
            {/* Coin Description --> */}
            <View style={s.textWrapper}>
              <Image
                source={icoCoins.src}
                style={{
                  height: 15,
                  width: 15 / icoCoins.ratio,
                  marginBottom: 10,
                }}
              />
              <Text style={[s.tTitle, {color: '#38a290'}]}>
                {transText('StoreCoinTitle', mySubtitle)}
              </Text>
              <View style={{...theme.boxes.rowCenter}}>
                <Text style={s.tDescription}>
                  {transText('StoreCoinDescription', mySubtitle)}
                </Text>
              </View>
            </View>
            {/* <-- Coin Description */}

            <TouchableOpacity
              style={{marginBottom: 5, flexDirection: 'row'}}
              onPress={() => {
                onPressCoins(50);
              }}>
              <Image
                source={item1.src}
                style={{
                  width: screenWidth - 30,
                  height: (screenWidth - 30) * item1.ratio,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  right: '8%',
                  width: '28%',
                  height: '50%',
                  ...theme.center,
                }}>
                <Text style={[s.tPrice]}>
                  {productList[0]?.description.split(' ')[3]}
                </Text>
              </View>
              <View style={s.coinAmountBox}>
                <Text style={s.tCoinAmount}>
                  {productList[0]?.description.split(' ')[1]}{' '}
                </Text>
                <Text style={s.tCoin}>COINS</Text>
              </View>
              {/* <Text style={s.tCoinAmmount}>
              {productList[0]?.description.split(' ')[1]}{' '}
              <Text style={s.tCoin}>COINS</Text>
            </Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnCoinItem]}
              onPress={() => {
                onPressCoins(300);
              }}>
              <Image
                source={item2.src}
                style={{
                  width: screenWidth - 30,
                  height: (screenWidth - 30) * item2.ratio,
                }}
              />
              <View style={s.btnPrice}>
                <Text style={[s.tPrice]}>
                  {productList[1]?.description.split(' ')[3]}
                </Text>
              </View>
              <View style={[s.boxNormalPrice, {bottom: '23%'}]}>
                <Text style={[s.tNormalPrice]}>
                  Normal Price{' '}
                  <Text style={{textDecorationLine: 'line-through'}}>
                    $14.99
                  </Text>
                </Text>
              </View>
              <View style={[s.coinAmountBox, {transform: [{translateY: 10}]}]}>
                <Text style={s.tCoinAmount}>
                  {productList[1]?.description.split(' ')[1]}{' '}
                </Text>
                <Text style={s.tCoin}>COINS</Text>
              </View>
              {/* <Text style={[s.tCoinAmount, {transform: [{translateY: 10}]}]}>
              {productList[1]?.description.split(' ')[1]}{' '}
              <Text style={s.tCoin}>COINS</Text>
            </Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnCoinItem}
              onPress={() => {
                onPressCoins(1000);
              }}>
              <Image
                source={item3.src}
                style={{
                  width: screenWidth - 30,
                  height: (screenWidth - 30) * item3.ratio,
                }}
              />
              <View style={s.btnPrice}>
                <Text style={[s.tPrice]}>
                  {productList[2]?.description.split(' ')[3]}
                </Text>
              </View>
              <View style={[s.boxNormalPrice, {bottom: '23%'}]}>
                <Text style={[s.tNormalPrice]}>
                  Normal Price{' '}
                  <Text style={{textDecorationLine: 'line-through'}}>
                    $29.99
                  </Text>
                </Text>
              </View>
              <View style={[s.coinAmountBox, {transform: [{translateY: 10}]}]}>
                <Text style={s.tCoinAmount}>
                  {productList[2]?.description.split(' ')[1]}{' '}
                </Text>
                <Text style={s.tCoin}>COINS</Text>
              </View>
              {/* <Text style={[s.tCoinAmount, {transform: [{translateY: 10}]}]}>
              {productList[2]?.description.split(' ')[1]}{' '}
              <Text style={s.tCoin}>COINS</Text>
            </Text> */}
            </TouchableOpacity>
          </View>
          {/* <== Coins Section */}
        </ScrollView>

        <Modal visible={visibleSuccess !== ''} transparent>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#00000088',
              ...theme.center,
            }}>
            <View
              style={{
                // width: '50%',
                height: 80,
                backgroundColor: '#fff',
                borderRadius: 20,
                paddingHorizontal: 25,
                ...theme.boxes.rowCenter,
              }}>
              <Text
                style={{
                  ...theme.fontSizes.small,
                  color: '#333',
                }}>
                {visibleSuccess}
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  textWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  tBold: {
    ...theme.fontSizes.large,
    paddingVertical: 0,
    color: theme.colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tSmall: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: theme.colors.grayLv2,
    textAlign: 'center',
  },

  tTitle: {
    ...theme.fontSizes.ultra,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tDescription: {
    ...theme.fontSizes.small,
    paddingVertical: 0,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.8,
  },
  boxBenefit: {
    ...theme.boxes.rowBetweenCenter,
    marginTop: 25,
    paddingVertical: 5,
    borderRadius: 40,
    width: '80%',
    // minWidth: screenWidth * 0.65,

    paddingHorizontal: 10,
  },
  check: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  tBenefit: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: '#fff',
    textAlign: 'center',
  },

  btn1month: {
    position: 'absolute',
    alignSelf: 'center',
    width: '50%',
    height: '100%',
  },

  best: {
    width: 30,
    height: 30 * icoBest1.ratio,
    position: 'absolute',
    right: '10%',
    top: '10%',
  },
  tOne: {
    // ...theme.fontSizes.ultra,
    fontSize: 43,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: '#fff',

    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
  },
  tMonth: {
    ...theme.fontSizes.ultra,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: '#fff',

    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
  },
  priceMonthWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    top: '70%',
    ...theme.center,
    backgroundColor: '#fff',
    width: '30%',
    borderRadius: 30,
    paddingVertical: 5,
  },
  tPriceMonth: {
    ...theme.fontSizes.largest,
    paddingVertical: 0,
    fontWeight: 'bold',
    color: theme.colors.mint,
  },

  tPrice: {
    ...theme.fontSizes.largest,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
  },
  tNormalPrice: {
    ...theme.fontSizes.smallest,
    paddingVertical: 0,
    color: '#fff',
    opacity: 0.8,
  },
  coinAmountBox: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'flex-end',
    position: 'absolute',
    left: '25%',
  },
  tCoinAmount: {
    ...theme.fontSizes.ultra,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
    // position: 'absolute',
    // left: '25%',
    alignSelf: 'center',
  },
  tCoin: {
    ...theme.fontSizes.medium,
    paddingVertical: 0,
    color: '#fff',
    fontWeight: 'bold',
  },

  boxNormalPrice: {
    position: 'absolute',
    right: '7%',
    width: '34%',
    height: '18%',
    ...theme.center,
  },
  btnPrice: {
    position: 'absolute',
    right: '8%',
    width: '28%',
    height: '50%',
    bottom: '30%',
    ...theme.center,
  },

  btnCoinItem: {
    marginBottom: 5,
    flexDirection: 'row',
  },
});

export default CoinStoreScreen;
