import {gql} from '@apollo/client';
import * as builder from 'gql-query-builder';
import {Platform} from 'react-native';
import {TVariableOption, TVariableOptions} from '../types';

const fWriter = {writer: ['memberId', 'name', 'img']};
const fProblem = ['clickWord', 'problem', 'answer'];
const fProblemDatas = [
  {en: fProblem},
  {es: fProblem},
  {ko: fProblem},
  {zh: fProblem},
  {ja: fProblem},
  {hi: fProblem},
  {vi: fProblem},
  {th: fProblem},
];
const fSubject = ['en', 'es', 'ko', 'zh', 'ja', 'hi', 'vi', 'th'];

const fLearn = ['display', 'playURL', {subtitle: fSubject}];
const fSpeak = [
  {subject: fSubject},
  {description: fSubject},
  'pic',
  'duration',
  'playSample',
  // {playSample: fSubject},
  {introSubtitle: fSubject},
  {successSubtitle: fSubject},
  {failSubtitle: fSubject},
  'introURL',
  'readyURL',
  'successURL',
  'failURL',
  {problem: fSubject},
  {answerWithSub: fSubject},
  'answer',
];

// String 형태의 쿼리문을 만들어주는 모듈

const qConfig = (vars?: String) => {
  return `
    query {
      getConfig ${vars || ''} {
        getService
        getPrivacy
        getPointForWord
        getPointForSpeak
      }
    }
  `;
};

const lqConfig = () => {
  const vars: TVariableOption = {};
  return builder.query({
    operation: 'getConfig',
    variables: vars,
    fields: ['coinEarnFirstLogin'],
  }).query;
};

const lfLogin = () => {
  const vars: TVariableOptions = {
    id: {type: 'String', required: false},
    pw: {type: 'String', required: false},
    loginType: {type: 'LoginTypeEnum', required: true},
    loginKey: {type: 'String', required: false},
    loginData: {type: 'MutationSocialLoginData', required: false},
    country: {type: 'String', required: false},
  };
  return builder.query({
    operation: 'getLogin',
    variables: vars,
  }).query;
};

const lqCheckDup = () => {
  const vars: any = {
    token: {required: false, name: 'session', type: 'String'},
    email: {required: false, name: 'email', type: 'String'},
    name: {required: false, name: 'name', type: 'String'},
  };
  return builder.query({
    operation: 'checkDuplicate',
    variables: vars,
  }).query;
};

const lqLoginEmail = () => {
  const vars: any = {
    email: {required: false, name: 'id', type: 'String'},
    pw: {required: false, name: 'pw', type: 'String'},
    loginType: {required: true, name: 'loginType', type: 'LoginTypeEnum'},
  };
  return builder.query({
    operation: 'getLogin',
    variables: vars,
  }).query;
};
const lqLoginSocial = () => {
  const vars: any = {
    loginData: {
      required: false,
      name: 'loginData',
      type: 'MutationSocialLoginData',
    },
    loginType: {required: true, name: 'loginType', type: 'LoginTypeEnum'},
  };
  return builder.query({
    operation: 'getLogin',
    variables: vars,
  }).query;
};
const lqGetMe = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
  };
  return builder.query({
    operation: 'getMe',
    variables: vars,
    fields: [
      'email',
      'name',
      'img',
      'myIndexCode',
      'memberId',
      'totalLearn',
      'totalSpoken',
      'totalTest',
      'language',
      'subtitle',
      'coin',
      {membership: ['boughtItem', 'startDatetime', 'endDatetime', 'language']},
    ],
  }).query;
};
const lqReviews = () => {
  const vars: any = {
    token: {required: false, name: 'session', type: 'String'},
    from: {required: false, name: 'from', type: 'Int'},
    limit: {required: false, name: 'limit', type: 'Int'},
    id: {required: false, name: 'id', type: 'String'},
    notice: {required: false, name: 'notice', type: 'Boolean'},
  };

  const q = builder.query({
    operation: 'getLive',
    variables: vars,
    fields: [
      'idx',
      'subject',
      'content',
      'isNew',
      'pics',
      fWriter,
      'view',
      'recommend',
      'isLiked',
      'registDatetime',
      'commentCount',
    ],
  }).query;
  // console.log(`reviewListQuery::: `, q);
  return q;
};

const lqReviewDetail = () => {
  const vars: any = {
    token: {required: false, name: 'session', type: 'String'},
    idx: {required: false, name: 'idx', type: 'Int'},
    addView: {required: false, name: 'addView', type: 'Boolean'},
  };

  const q = builder.query({
    operation: 'getLiveDetail',
    variables: vars,
    fields: [
      'idx',
      'subject',
      'content',
      'pics',
      fWriter,
      {
        comment: [
          'idx',
          'content',
          'depth',
          'registDatetime',
          'isLiked',
          'recommend',
          fWriter,
        ],
      },
      'view',
      'recommend',
      'isLiked',
      'registDatetime',
    ],
  }).query;
  // console.log(`reviewListQuery::: `, q);
  return q;
};
const lqWordLevels = () => {
  const vars: any = {
    language: {required: false, name: 'language', type: 'StudyLanguageEnum'},
  };
  return builder.query({
    operation: 'getConfig',
    variables: vars,
    fields: ['getChapterCountForWT'],
  }).query;
};
const lqWordChapters = () => {
  const vars: any = {
    token: {required: true, name: 'session', type: 'String'},
    language: {required: true, name: 'language', type: 'StudyLanguageEnum'},
    level: {required: true, name: 'chapter', type: 'Int'},
  };

  return builder.query({
    operation: 'getWordTraining',
    variables: vars,
    fields: [
      'num',
      'progress',
      'allCount',
      {
        lesson: [
          'idx',
          'isTested',
          {subject: fSubject},
          {problem: ['playURL', {datas: fProblemDatas}]},
        ],
      },
    ],
  }).query;
};
const lqSpeakLevels = () => {
  const vars: any = {
    language: {required: false, name: 'language', type: 'StudyLanguageEnum'},
  };
  return builder.query({
    operation: 'getConfig',
    variables: vars,
    fields: ['getChapterCountForST'],
  }).query;
};
const lqSpeakChapters = () => {
  const vars: any = {
    token: {required: true, name: 'session', type: 'String'},
    language: {required: true, name: 'language', type: 'StudyLanguageEnum'},
    level: {required: true, name: 'chapter', type: 'Int'},
  };

  return builder.query({
    operation: 'getSpeakTraining',
    variables: vars,
    fields: [
      'num',
      'progress',
      'allCount',
      {
        lesson: [
          'idx',
          'isTested',
          'isLearn',
          {subject: fSubject},
          {learnDatas: fLearn},
          {speakDatas: fSpeak},
        ],
      },
    ],
  }).query;
};
const lqMain = () => {
  const vars: any = {
    language: {required: false, name: 'language', type: 'StudyLanguageEnum'},
    subtitle: {required: false, name: 'subtitle', type: 'SubtitleTypeEnum'},
  };
  return builder.query({
    operation: 'getMainData',
    variables: vars,
    fields: [
      'purchaseImage',
      {
        speakData: [
          'idx',
          {subject: fSubject},
          {learnDatas: fLearn},
          {speakDatas: fSpeak},
        ],
      },
      {
        wordData: [
          'idx',
          {subject: fSubject},
          {problem: ['playURL', {datas: fProblemDatas}]},
        ],
      },
    ],
  }).query;
};

const lqComment = () => {
  const vars: any = {
    token: {required: false, name: 'session', type: 'String'},
    idx: {required: false, name: 'idx', type: 'Int'},
    addView: {required: false, name: 'addView', type: 'Boolean'},
  };

  const q = builder.query({
    operation: 'getLiveDetail',
    variables: vars,
    fields: [
      {
        comment: [
          'idx',
          'content',
          'depth',
          'registDatetime',
          'isLiked',
          'recommend',
          fWriter,
        ],
      },
    ],
  }).query;
  // console.log(`reviewListQuery::: `, q);
  return q;
};

const lqFAQ = () => {
  const vars: any = {
    subtitleLanguage: {
      required: false,
      name: 'subtitleLanguage',
      type: 'SubtitleTypeEnum',
    },
    from: {required: false, name: 'from', type: 'Int'},
    limit: {required: false, name: 'limit', type: 'Int'},
  };

  const q = builder.query({
    operation: 'getFAQ',
    variables: vars,
    fields: ['subject', 'content'],
  }).query;
  // console.log(`reviewListQuery::: `, q);
  return q;
};
const lqNotice = () => {
  const vars: any = {
    subtitleLanguage: {
      required: true,
      name: 'subtitleLanguage',
      type: 'SubtitleTypeEnum',
    },
    from: {required: false, name: 'from', type: 'Int'},
    limit: {required: false, name: 'limit', type: 'Int'},
  };

  const q = builder.query({
    operation: 'getNotice',
    variables: vars,
    fields: ['subject', 'content', 'isNew'],
  }).query;
  // console.log(`reviewListQuery::: `, q);
  return q;
};
const lqViewHistory = () => {
  const vars: any = {
    token: {required: true, name: 'session', type: 'String'},
  };

  const q = builder.query({
    operation: 'getPurchased',
    variables: vars,
    fields: [
      'kind',
      'time',
      {
        speakData: [
          'idx',
          'chapter',
          {subject: fSubject},
          {learnDatas: fLearn},
          {speakDatas: fSpeak},
        ],
      },
      {
        wordData: [
          'idx',
          'chapter',
          {subject: fSubject},
          {problem: ['playURL', {datas: fProblemDatas}]},
        ],
      },
    ],
  }).query;
  // console.log(`reviewListQuery::: `, q);
  return q;
};

const mSignUp = () => {
  const vars: any = {
    email: {required: true, name: 'email', type: 'String'},
    password: {required: true, name: 'pw', type: 'String'},
    country: {required: true, name: 'country', type: 'String'},
    name: {required: true, name: 'name', type: 'String'},
    birth: {required: false, name: 'birth', type: 'String'},
    ad: {required: true, name: 'ad', type: 'Boolean'},
    subtitle: {required: true, name: 'subtitle', type: 'SubtitleTypeEnum'},
    language: {required: true, name: 'language', type: 'StudyLanguageEnum'},
  };
  return builder.mutation({
    operation: 'joinMember',
    variables: vars,
  }).query;
};

const mWriteReview = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    subject: {required: true, name: 'subject', type: 'String'},
    content: {required: true, name: 'content', type: 'String'},
    img: {required: true, name: 'img', type: '[String]'},
    idx: {required: false, name: 'idx', type: 'Int'},
    deleteImg: {required: false, name: 'deleteImg', type: '[Int]'},
  };
  return builder.mutation({
    operation: 'setLive',
    variables: vars,
  }).query;
};

const mQna = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    subject: {required: true, name: 'subject', type: 'String'},
    content: {required: true, name: 'content', type: 'String'},
    email: {required: true, name: 'content', type: 'String'},
  };
  return builder.mutation({
    operation: 'setQA',
    variables: vars,
  }).query;
};

const mSetPassword = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    current: {required: true, name: 'current', type: 'String'},
    change: {required: true, name: 'change', type: 'String'},
  };
  return builder.mutation({
    operation: 'changePassword',
    variables: vars,
  }).query;
};
const mSetImage = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    img: {required: false, name: 'img', type: 'String'},
  };
  const q = builder.mutation({
    operation: 'setMe',
    variables: vars,
  }).query;
  // console.log(`q: `, q);
  return q;
};
const mSetLanguage = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    language: {required: false, name: 'language', type: 'StudyLanguageEnum'},
  };
  return builder.mutation({
    operation: 'setMe',
    variables: vars,
  }).query;
};
const mSetSubtitle = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    subtitle: {required: false, name: 'subtitle', type: 'SubtitleTypeEnum'},
  };
  return builder.mutation({
    operation: 'setMe',
    variables: vars,
  }).query;
};
const mLike = () => {
  const vars: any = {
    session: {required: true, name: 'session', type: 'String'},
    idx: {required: true, name: 'idx', type: 'Int'},
    isLike: {required: false, name: 'isLike', type: 'Boolean'},
  };
  const q = builder.mutation({
    operation: 'setLiveEstimate',
    variables: vars,
  }).query;
  // console.log(`q: `, q);
  return q;
};
const mDeleteReview = () => {
  return `
  mutation ($idx: Int, $session: String!) {
    setLive (session: $session, content: "", idx: $idx, subject: "")
  }
  `;
};
const mHideReview = () => {
  return `
  mutation ($idx: Int!, $hide: Boolean, $session: String!) {
    setLiveHide(session: $session, idx: $idx, isHide: $hide)
  }
  `;
};
const mBlockReview = () => {
  return `
  mutation ($email: String!, $session: String!) {
    setBlock(session: $session, email: $email)
  }
  `;
};
const mReportReview = () => {
  return `
  mutation($idx: Int!, $session: String!) {
    sendReport(session: $session, idx: $idx, board: "live")
  }
  `;
};
const mWriteComment = () => {
  return `
  mutation($idx: Int!, $content: String!, $commentIdx: Int, $session: String!) {
    setLiveComment (session: $session, idx: $idx, content: $content, comment_idx: $commentIdx)
  }
  `;
};
const mFinishWord = () => {
  return `
  mutation($idx: Int!, $language: StudyLanguageEnum!, $session: String!) {
    setWordTraining (session: $session, idx: $idx, language: $language)
  }
  `;
};
const mFinishSpeak = () => {
  return `
  mutation($idx: Int!, $language: StudyLanguageEnum!, $session: String!) {
    setSpeakTraining (session: $session, idx: $idx, language: $language)
  }
  `;
};
const mFinishLearn = () => {
  return `
  mutation($idx: Int!, $language: StudyLanguageEnum!, $session: String!) {
    setLearn (session: $session, idx: $idx, language: $language)
  }
  `;
};

const mPurchase = () => {
  return `mutation ($productId: String!, $purchaseCode: String!, $session: String!) {
    setPurchase(session: $session, productId: $productId, device: "${Platform.OS.substring(
      0,
      1,
    ).toUpperCase()}", purchaseCode: $purchaseCode)
  }`;
};

export const queries = {
  config: qConfig,
  login: () => '',
};

export const lazyQueries = {
  config: lqConfig,
  check: lqCheckDup,
  loginEmail: lqLoginEmail,
  loginSocial: lqLoginSocial,
  me: lqGetMe,
  reviews: lqReviews,
  review: lqReviewDetail,
  wordLevels: lqWordLevels,
  speakLevels: lqSpeakLevels,
  wordChapters: lqWordChapters,
  speakChapters: lqSpeakChapters,
  main: lqMain,
  comment: lqComment,
  faq: lqFAQ,
  notice: lqNotice,
  viewHistory: lqViewHistory,
};

export const mutations = {
  signup: mSignUp,
  writeReview: mWriteReview,
  qna: mQna,
  password: mSetPassword,
  image: mSetImage,
  like: mLike,
  subtitle: mSetSubtitle,
  language: mSetLanguage,
  reviewDelete: mDeleteReview,
  reviewHide: mHideReview,
  reviewBlock: mBlockReview,
  reviewReport: mReportReview,
  commentWrite: mWriteComment,
  finishWord: mFinishWord,
  finishSpeak: mFinishSpeak,
  finishLearn: mFinishLearn,
  purchase: mPurchase,
};
