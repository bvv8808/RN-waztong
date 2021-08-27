// @ts-ignore
import EN from './resources/en.json';
// @ts-ignore
import ES from './resources/es.json';
// @ts-ignore
import ZH from './resources/ch.json';
// @ts-ignore
import VI from './resources/vi.json';
// @ts-ignore
import JA from './resources/ja.json';
// @ts-ignore
import HI from './resources/hi.json';
// @ts-ignore
import TH from './resources/hi.json';
// @ts-ignore
import KO from './resources/ko.json';

type tTransTitle =
  | 'SugestAd'
  | 'NoThanksAd'
  | 'OkAd'
  | 'MainEdu'
  | 'MainSoon'
  | 'MainPop'
  | 'MainFood'
  | 'MainNoAd'
  | 'MainCulture'
  | 'MainNoAd'
  | 'StoreTitle'
  | 'StoreDescription'
  | 'StoreBenefit1'
  | 'StoreBenefit2'
  | 'Month'
  | 'StoreCoinTitle'
  | 'StoreCoinDescription'
  | 'SuccessSend';

type tLangUpperDomain = 'EN' | 'KO' | 'ES' | 'ZH' | 'JA' | 'HI' | 'TH' | 'VI';

const trans = {
  EN,
  KO,
  ES,
  ZH,
  JA,
  HI,
  TH,
  VI,
};

export const transText = (text: tTransTitle, selectedLang?: string) => {
  return trans[(selectedLang as tLangUpperDomain) || 'EN'][text];
};

export default trans;
