import React from 'react';
import {
  TestIds,
  RewardedAd,
  FirebaseAdMobTypes,
  RewardedAdEventType,
} from '@react-native-firebase/admob';
import {ActivityIndicator, SafeAreaView, View} from 'react-native';
import ModalPlayAd from '~/components/Modals/ModalPlayAd';
import theme from '~/lib/theme';
import {mutAd, mutSpend, qMyCoin} from '~/lib/gql/forClass';
import ModalSpendCoin from '~/components/Modals/ModalSpendCoin';
import toast from 'react-native-simple-toast';
import {TSpend} from '~/lib/types';
import {RewardedKey} from '~/lib/admobKey';

const adUnitId = __DEV__ || !RewardedKey ? TestIds.REWARDED : RewardedKey;

interface IProps {
  children: any;
  onChangeCoin: (newCoin: number, type?: 'spend' | 'earn') => void;
  token: string;
  childrenHaveSafeArea?: boolean;
}
interface IState {
  watched: boolean;
  visibleAdModal: boolean;
  coinToSpend: number;
  spendContent: TSpend | '';
  spendIdx: number;
  visibleSuccessEarn: boolean;
  loading: boolean;
  adOpened: boolean;
}

export default class AdContainer extends React.Component<IProps, IState> {
  adManager: FirebaseAdMobTypes.RewardedAd | null;
  constructor(props: IProps) {
    super(props);

    this.state = {
      watched: false,
      adOpened: false,
      visibleAdModal: false,
      coinToSpend: 0,
      spendContent: '',
      spendIdx: -1,
      visibleSuccessEarn: false,
      loading: false,
    };

    this.adManager = null;
  }
  componentDidMount() {
    const initAd = async () => {
      const rewardedAd = await RewardedAd.createForAdRequest(adUnitId, {
        requestAgent: 'CoolAds',
      });
      rewardedAd.onAdEvent((type, error, data) => {
        console.log('New event: ', type, error);
        if (error) {
          toast.show('Error occured with AD', 1.5);
          this.setState({loading: false});
        }

        if (type === RewardedAdEventType.LOADED) {
          rewardedAd.show();
          this.setState({adOpened: true});
        } else if (type === 'closed') {
          this.setState({adOpened: false, loading: false});
        } else if (type === RewardedAdEventType.EARNED_REWARD) {
          // 광고 시청 직후: 아직 끄지는 않음
          console.log(`###################`);
          this.setState({watched: true});
        }
      });

      this.adManager = rewardedAd;
    };
    initAd();
  }
  componentDidUpdate(newProps: IProps, prevState: IState) {
    if (this.state.watched && !this.state.adOpened) {
      console.log(`지금!!!!`);
      this.setState({watched: false});
      this.onSuccessAd();
    }
  }
  onSuccessAd() {
    // # 서버에 요청 후 하위 스크린에서 심은 리스너 실행
    // mutAd(this.props.token)
    //   .then(() => qMyCoin(this.props.token))
    //   .then((coin: any) => {
    //     this.setState({loading: false, visibleSuccessEarn: true}, () => {
    //       setTimeout(() => {

    //       }, 2000);
    //     });
    //   })
    //   .catch(e => {
    //     console.log(`fail:: `, e);
    //     this.setState({loading: false});
    //   });

    this.setState({loading: false});
    this.props.onChangeCoin(-1);
  }

  showAdModal() {
    this.setState({visibleAdModal: true});
  }
  showSpendModal(coin: number, type: TSpend, idx: number) {
    this.setState({coinToSpend: coin, spendContent: type, spendIdx: idx});
  }
  startLoading() {
    this.setState({loading: true});
  }
  stopLoading() {
    this.setState({loading: false});
  }

  renderChildren() {
    return this.props.childrenHaveSafeArea ? (
      <View style={{flex: 1}}>{this.props.children}</View>
    ) : (
      <SafeAreaView style={{flex: 1}}>{this.props.children}</SafeAreaView>
    );
  }
  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderChildren()}

        <ModalPlayAd
          visible={this.state.visibleAdModal}
          hide={() => {
            this.setState({visibleAdModal: false});
          }}
          onPressOk={() => {
            this.setState({visibleAdModal: false, loading: true}, () => {
              this.adManager?.load();
            });
          }}
        />
        <ModalSpendCoin
          coin={this.state.coinToSpend}
          visible={this.state.coinToSpend > 0}
          hide={() => {
            this.setState({coinToSpend: 0, spendContent: '', spendIdx: -1});
          }}
          onPressOk={() => {
            this.setState({loading: true}, () => {
              // this.adManager?.load();
              if (!this.state.spendContent) return;

              mutSpend(
                this.props.token,
                this.state.spendContent,
                this.state.spendIdx,
              )
                .then(() => qMyCoin(this.props.token))
                .then((coin: any) => {
                  this.props.onChangeCoin(coin, 'spend');
                  this.setState({
                    coinToSpend: 0,
                    spendContent: '',
                    spendIdx: -1,
                    loading: false,
                  });
                })
                .catch(e => {
                  console.log(`e`, e);
                  toast.show(e, 1);
                  this.setState({
                    loading: false,
                    spendIdx: -1,
                    spendContent: '',
                    coinToSpend: 0,
                  });
                });
            });
          }}
        />

        {this.state.loading && (
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              ...theme.center,
              backgroundColor: '#00000088',
            }}>
            <ActivityIndicator size="large" color={theme.colors.mint} />
          </View>
        )}
      </View>
    );
  }
}
