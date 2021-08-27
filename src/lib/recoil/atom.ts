import {atom} from 'recoil';
import {TLangDomain, TMe} from '../types';

export const __token = atom({
  key: 'token',
  default: '',
});

export const __price = atom({
  key: 'price',
  default: {
    speak: 0,
    word: 0,
  },
});

export const __coinConfig = atom({
  key: 'coinCnfig',
  default: {
    getPointForWord: 0,
    getPointForSpeak: 0,
    getADPoint: 0,
  },
});

export const __myInfo = atom<TMe>({
  key: 'myInfo',
  default: {
    email: '',
    name: '',
    img: '',
    myIndexCode: '',
    memberId: '',
    membership: [
      {
        boughtItem: '',
        startDatetime: '',
        endDatetime: '',
        language: '',
      },
    ],
    totalLearn: 0,
    totalSpoken: 0,
    totalTest: 0,
    language: 'English',
    subtitle: 'English',
    coin: 0,
  },
});
export const __loginType = atom<'NO' | 'GO' | 'AP' | 'FA' | 'KA' | ''>({
  key: 'loginType',
  default: '',
});

export const __refreshReviewList = atom({
  key: 'refreshReviewList',
  default: false,
});
export const __showTutorial = atom({
  key: 'showTutorial',
  default: false,
});

const accordians: boolean[] = [];
export const __accordians_faq = atom({
  key: 'accordians_faq',
  default: accordians,
});

const accordiansNotice: {open: boolean; newAndNotSee: boolean}[] = [];
export const __accordians_notice = atom({
  key: 'accordians_notice',
  default: accordiansNotice,
});

export const __preventReviewRefesh = atom({
  key: 'preventReviewRefresh',
  default: false,
});

export const __enterReviewDetail = atom({
  key: 'enterReviewDetail',
  default: false,
});
export const __postDeleted = atom({
  key: 'postDeleted',
  default: false,
});

export const __iapReceipt = atom<any>({
  key: 'iapReceipt',
  default: '',
});
