import {
  TLangDomainFullInitcap,
  TLangDomainFullLower,
  TLangDomainFullUpper,
  TLangDomainShortLower,
  TLangDomainShortUpper,
} from './types';

export const getDiff = (time: string, now = new Date().getTime()): string => {
  let t = new Date(time.split(' ').join('T') + 'Z');
  //   t.setHours(t.getHours() - new Date().getTimezoneOffset() / 60);
  //   console.log(RNLocalize.getTimeZone());
  //   console.log(`@tz offset`, new Date().getTimezoneOffset() / 60);
  // -> "Europe/Paris"

  //   console.log(
  //     `@@ time @@ `,
  //     new Date().getTimezoneOffset() / 60,
  //     (now - t.getTime() - new Date().getTimezoneOffset() * 60000) / 1000 / 3600,
  //   );
  const diffSeconds: number = (now - t.getTime()) / 1000;
  const y: number = 31536000;
  const d = 86474;
  const h = 3600;
  const m = 60;

  let diffType: 'second' | 'minute' | 'hour' | 'day' | 'year' = 'second';
  let diffValue = diffSeconds;

  if (diffSeconds > y) {
    diffType = 'year';
    diffValue = diffSeconds / y;
  } else if (diffSeconds > d) {
    diffType = 'day';
    diffValue = diffSeconds / d;
  } else if (diffSeconds > h) {
    diffType = 'hour';
    diffValue = diffSeconds / h;
  } else if (diffSeconds > m) {
    diffType = 'minute';
    diffValue = diffSeconds / m;
  }

  return `${Math.floor(diffValue)} ${
    diffType + (diffValue > 1 ? 's' : '')
  } ago`;
};

export const convertToLocale = (
  time: string,
  options: {
    ampm?: boolean;
    dot?: boolean;
    exceptSeconds?: boolean;
  } = {
    ampm: false,
    dot: false,
    exceptSeconds: false,
  },
) => {
  const {ampm, dot, exceptSeconds} = options;
  let t = new Date(time.split(' ').join('T') + 'Z');
  const sepDate = dot ? '.' : '-';

  const date =
    t.getFullYear() +
    sepDate +
    (t.getMonth() + 1).toString().padStart(2, '0') +
    sepDate +
    t.getDate().toString().padStart(2, '0');

  const h = t.getHours();
  const m = t.getMinutes().toString().padStart(2, '0');
  const s = t.getSeconds().toString().padStart(2, '0');
  let t2 = '';
  if (ampm) {
    let am = true;
    if (h >= 12) am = false;
    t2 = `${h === 12 || am ? h : h - 12}:${m}${exceptSeconds ? '' : ':' + s}${
      h === 12 || !am ? 'pm' : 'am'
    }`;
  } else {
    t2 = h.toString().padStart(2, '0') + ':' + m;

    if (exceptSeconds) t2 += ':' + s;
  }
  return date + ' ' + t2;
};

export const insertComma = (money: number) => {
  const strMoney = money.toString();
  const firstPartLength = strMoney.length % 3;
  const firstPart = strMoney.slice(0, firstPartLength);
  const rest = strMoney.slice(firstPartLength);

  if (!rest) return firstPart;

  let restPart = '';
  let cnt = 0;
  for (let i = 0; i < rest.length; i++) {
    restPart += rest[i];
    if (++cnt === 3) {
      cnt = 0;
      restPart += ',';
    }
  }
  restPart = restPart.substring(0, restPart.length - 1);
  const result = firstPart ? firstPart + ',' + restPart : restPart;
  return result;
};

const dictToFull: Record<TLangDomainShortLower, TLangDomainFullLower> = {
  en: 'english',
  es: 'espanol',
  zh: 'chinese',
  ja: 'japanese',
  hi: 'hindi',
  vi: 'vietnamese',
  th: 'thai',
  ko: 'korean',
};
const dictToShort: Record<TLangDomainFullLower, TLangDomainShortLower> = {
  english: 'en',
  espanol: 'es',
  chinese: 'zh',
  japanese: 'ja',
  hindi: 'hi',
  thai: 'th',
  korean: 'ko',
  vietnamese: 'vi',
};
const getLowerOriginAndIsShort = (str: string) => {
  let result = str.toLowerCase();
  return [result, str.length === 2];
};

export const toFullInitCap = (origin: string): TLangDomainFullInitcap => {
  if (origin.length < 2) {
    console.error('Invalid language (util/toFullInitCap.ts): ', origin);
    throw 'Invalid Language (util/toFullInitCap.ts): ' + origin;
  }

  const [lowerOrigin, originIsShort] = getLowerOriginAndIsShort(origin);
  const lowerResult = originIsShort
    ? dictToFull[lowerOrigin as TLangDomainShortLower]
    : (lowerOrigin as TLangDomainFullLower);

  return (lowerResult[0].toUpperCase() +
    lowerResult.substring(1)) as TLangDomainFullInitcap;
};
export const toFullUpper = (origin: string): TLangDomainFullUpper => {
  if (origin.length < 2) {
    console.error('Invalid language (util/toFullUpper.ts): ', origin);
    throw 'Invalid Language (util/toFullUpper.ts): ' + origin;
  }

  const [lowerOrigin, originIsShort] = getLowerOriginAndIsShort(origin);
  const lowerResult = originIsShort
    ? dictToFull[lowerOrigin as TLangDomainShortLower]
    : (lowerOrigin as TLangDomainFullLower);

  return lowerResult.toUpperCase() as TLangDomainFullUpper;
};
export const toShortUpper = (origin: string): TLangDomainShortUpper => {
  if (origin.length < 2) {
    console.error('Invalid language (util/toShortUpper.ts): ', origin);
    throw 'Invalid Language (util/toShortUpper.ts): ' + origin;
  }

  const [lowerOrigin, originIsShort] = getLowerOriginAndIsShort(origin);
  const lowerResult = !originIsShort
    ? dictToShort[lowerOrigin as TLangDomainFullLower]
    : (lowerOrigin as TLangDomainShortLower);

  return lowerResult.toUpperCase() as TLangDomainShortUpper;
};
export const toShortLower = (origin: string): TLangDomainShortLower => {
  if (origin.length < 2) {
    console.error('Invalid language (util/toShortLower.ts): ', origin);
    throw 'Invalid Language (util/toShortLower.ts): ' + origin;
  }

  const [lowerOrigin, originIsShort] = getLowerOriginAndIsShort(origin);

  return !originIsShort
    ? dictToShort[lowerOrigin as TLangDomainFullLower]
    : (lowerOrigin as TLangDomainShortLower);
};

export const dictForSTTLang = (lang: string) => {
  switch (lang) {
    case 'English':
      return 'en-US';
    case 'Espanol':
      return 'es';
    case 'Korean':
      return 'ko';
    case 'Chinese':
      return 'zh-CN';
    case 'Japanese':
      return 'ja';
    case 'Hindi':
      return 'hi';
    case 'Thai':
      return 'yh';
    case 'Vietnamese':
      return 'vi';
  }
};
