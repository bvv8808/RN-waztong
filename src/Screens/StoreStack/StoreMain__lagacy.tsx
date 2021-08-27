import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import DisplayCoin from '~/components/DisplayCoin';
import {
  icoCoins,
  icoMenu,
  imgUnlimited,
  item1,
  item2,
  item3,
  item4,
  logoWhite2,
  unlimitedBackground,
} from '~/images';
import {__myInfo, __token} from '~/lib/recoil/atom';
import theme from '~/lib/theme';
import {TMainStackParams, TRootStackParams} from '~/lib/types';
import RNIap, {
  acknowledgePurchaseAndroid,
  consumePurchaseAndroid,
  consumeAllItemsAndroid,
  finishTransaction,
  InAppPurchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  SubscriptionPurchase,
} from 'react-native-iap';
import BaseLayout from '~/base/BaseLayout';
import {useRef} from 'react';
import toast from 'react-native-simple-toast';
import {useBMutation} from '~/lib/gql/gqlBuilder';
import useUpdateMe from '~/lib/hooks/useUpdateMe';

const screenWidth = Dimensions.get('screen').width;

const itemSkus: any = Platform.select({
  ios: [
    'waztong_coin_1',
    'waztong_coin_2',
    'waztong_coin_3',
    'waztong_coin_4',
    'waztong_unlimited',
  ],
  android: [
    'waztong_coin_1',
    'waztong_coin_2',
    'waztong_coin_3',
    'waztong_coin_4',
    'waztong_unlimited',
  ],
});
let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;
let timer: any = null;

const StoreMainScreen = ({
  navigation,
}: StackScreenProps<TMainStackParams, 'store'>) => {
  const token = useRecoilValue(__token);
  const [productList, setProductList] = useState<any>([]);
  const [receipt, setReceipt] = useState<any>();
  const [me, r_setMe] = useRecoilState(__myInfo);
  const [visibleSuccess, setVisibleSuccess] = useState('');

  const refBase = useRef<BaseLayout>(null);
  const updateMe = useUpdateMe();

  const [mutPurchase] = useBMutation('purchase');

  const onError = (msg: string) => {
    toast.show(msg, 1);
  };

  useEffect(() => {
    if (productList) {
      console.log(
        `productList @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ `,
        productList,
      );
      refBase.current?.stopLoading();
    }
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
        console.warn(err.code, err.message);
      }
    };

    _init_().then(async () => {
      // #0. 인앱결제 init 후 Product List 받아와서 setState
      try {
        const products = await RNIap.getProducts(itemSkus);
        // console.log('# Products\n', products);
        // @ts-ignore
        setProductList(products.sort((a, b) => a.productId - b.productId));
      } catch (err) {
        console.warn(err.code, err.message);
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
            }
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }

          RNIap.clearTransactionIOS().then(() => {
            console.log(`IAP Transaction cleared@`);
          });
          // #2. 결제 성공 시 결제 정보 setState. 이 state가 변경될 경우 실행되는 코드는 useEffect에 정의(#3)
          setReceipt(purchase);
        }
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', JSON.stringify(error));
        refBase?.current?.stopLoading();
        // Alert.alert('purchase error', JSON.stringify(error));
      },
    );

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
        purchaseUpdateSubscription = null;
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
        purchaseErrorSubscription = null;
      }
      RNIap.endConnection();
    };
  }, []);

  useEffect(() => {
    if (receipt) {
      // #4. 서버에 mutation. productId, purchaseCode 필드는 여기서 값을 넣고, session과 device 필드는 쿼리 작성 단계에서 이미 삽입된 상태.

      RNIap.finishTransaction(receipt, true).catch(e => {
        console.log(`Error in finishTransaction@@@@@@@@@@@ `, e);
      });

      console.log(`@@@@@@@@@@@@@@@ `, {
        token: token,
        device: Platform.OS.substring(0, 1).toUpperCase(),
        productId: receipt.productId,
        purchaseCode: receipt.transactionId,
      });

      const body = {
        session: token,
        productId: receipt.productId,
        purchaseCode:
          Platform.OS === 'ios' ? receipt.transactionId : receipt.purchaseToken,
      };

      mutPurchase({variables: body})
        .then(() => {
          // #5. 멤버십 가입 성공. 서버에 반영된 멤버십 정보를 가져오는 query 실행.
          timer = false;
          console.log('@@@ 서버 요청 완료 @@@\n', receipt.productId);
          updateMe();
          setVisibleSuccess(
            receipt.productId.startsWith('kooltong_coin')
              ? 'Your coins have been charged'
              : 'You are now a Kooltong member',
          );
          // if (receipt.productId.startsWith('kooltong_coin')) {
          //   setVisibleSuccess('Your coins have been charged');
          // } else {
          //   loadMyMembership();

          // }

          refBase.current?.stopLoading();
        })
        .catch(e => {
          console.log(`@@ Error in mutPuchase\n`, JSON.stringify(e));
          onError(e);
          refBase.current?.stopLoading();
        });
      refBase.current?.stopLoading();
    }
  }, [receipt]);

  const onPressCoins = (coin: number) => {
    // #1. 상품 버튼을 눌렀을 때. productList에서 알맞은 상품을 찾아 requestPurchase.
    if (!token) {
      toast.show('Please sign in', 0.7);
      return;
    } else if (me.membership.length) {
      toast.show('You are already KOOLTONG member!', 1);
      return;
    }

    refBase.current?.startLoading();

    let selectedProduct = '';
    switch (coin) {
      case -1:
        selectedProduct = productList.find(
          (p: any) => p.productId === 'waztong_unlimited',
        );
        break;
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
      case 3000:
        selectedProduct = productList.find(
          (p: any) => p.productId === 'waztong_coin_4',
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
      await RNIap.requestPurchase(sku);
    } catch (err) {
      console.log(`@@@ Error in requestPurchase: `, err);
    }
  };

  return (
    <BaseLayout ref={refBase} style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Header --> */}
      <View
        style={{
          height: 60,
          ...theme.boxes.rowBetweenCenter,
          backgroundColor: theme.colors.mint,
        }}>
        <Pressable
          style={{
            width: 60,
            marginRight: 20,
            height: 60,
            ...theme.center,
          }}
          onPress={() => {
            navigation.push('myMenu');
          }}>
          <Image
            source={icoMenu.src}
            style={{width: 25, height: 25}}
            resizeMode="contain"
          />
        </Pressable>
        <Image
          source={logoWhite2.src}
          style={{height: 30, width: 30 / logoWhite2.ratio}}
        />
        <DisplayCoin style={{marginRight: 10}} />
      </View>
      {/* <-- Header */}
      <ScrollView>
        {/* Unlimited Section ==> */}
        <View style={{alignItems: 'center', backgroundColor: '#fff'}}>
          <View style={{marginTop: 40, marginBottom: 10}}>
            <Text style={s.tBold}>UNLIMITED ACCESS!</Text>
            <Text style={s.tSmall}>
              You can view all our contents for 5 MONTH
            </Text>
          </View>
          {/* Unlimited --> */}
          <View
            style={{
              width: screenWidth,
              height: screenWidth * unlimitedBackground.ratio,
            }}>
            <Image
              source={unlimitedBackground.src}
              style={{
                width: '100%',
                height: '100%',
              }}
            />

            <TouchableOpacity
              style={{
                width: screenWidth - 30,
                height: (screenWidth - 30) * imgUnlimited.ratio,
                position: 'absolute',
                bottom: 10,
                alignSelf: 'center',
                flexDirection: 'row',
              }}
              onPress={() => {
                onPressCoins(-1);
              }}>
              <Image
                source={imgUnlimited.src}
                style={{width: '100%', height: '100%'}}
              />
              <View
                style={{
                  position: 'absolute',
                  width: '17%',
                  height: '20%',
                  left: '5%',
                  top: '30%',
                  ...theme.center,
                }}>
                <Text
                  style={{
                    ...theme.fontSizes.tiny,
                    paddingVertical: 0,
                    color: '#fff',
                  }}>
                  5 month
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  width: '33%',
                  height: '40%',
                  right: '5%',
                  top: '40%',
                  ...theme.center,
                }}>
                <Text style={s.tPrice}>
                  {productList[4]?.description.split('months ')[1]}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* <-- Unlimited */}
        </View>
        {/* <== Unlimited Section */}

        {/* Coins Section ==> */}
        <View
          style={{
            paddingHorizontal: 15,
            backgroundColor: '#fff',
          }}>
          {/* Coin Description --> */}
          <View style={s.textWrapper}>
            <Text style={s.tBold}>GET MORE COINS</Text>
            <View style={{...theme.boxes.rowCenter}}>
              <Image
                source={icoCoins.src}
                style={{
                  height: 10,
                  width: 10 / icoCoins.ratio,
                  marginRight: 5,
                }}
              />
              <Text style={s.tSmall}>
                Coins are one time purchase, not auto-renewed
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
                <Text style={{textDecorationLine: 'line-through'}}>$14.99</Text>
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
                <Text style={{textDecorationLine: 'line-through'}}>$29.99</Text>
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
          <TouchableOpacity
            style={s.btnCoinItem}
            onPress={() => {
              onPressCoins(3000);
            }}>
            <Image
              source={item4.src}
              style={{
                width: screenWidth - 30,
                height: (screenWidth - 30) * item4.ratio,
              }}
            />
            <View style={s.btnPrice}>
              <Text style={[s.tPrice]}>
                {productList[3]?.description.split(' ')[3]}
              </Text>
            </View>
            <View style={[s.boxNormalPrice, {bottom: '23%'}]}>
              <Text style={[s.tNormalPrice]}>
                Normal Price{' '}
                <Text style={{textDecorationLine: 'line-through'}}>$89.99</Text>
              </Text>
            </View>
            <View style={[s.coinAmountBox, {transform: [{translateY: 10}]}]}>
              <Text style={s.tCoinAmount}>
                {productList[3]?.description.split(' ')[1]}{' '}
              </Text>
              <Text style={s.tCoin}>COINS</Text>
            </View>
            {/* <Text style={[s.tCoinAmount, {transform: [{translateY: 10}]}]}>
              {productList[3]?.description.split(' ')[1]}{' '}
              <Text style={s.tCoin}>COINS</Text>
            </Text> */}
          </TouchableOpacity>
        </View>
        {/* <== Coins Section */}
      </ScrollView>
    </BaseLayout>
  );
};

const s = StyleSheet.create({
  textWrapper: {
    paddingVertical: 40,
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

  btnCoinItem: {
    marginBottom: 5,
    flexDirection: 'row',
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
});

export default StoreMainScreen;
