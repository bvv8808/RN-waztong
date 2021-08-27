import {createStore} from 'redux';

const initialState = {
  lang: 'en',
  fullscreenAndroid: false,
  fullscreenIOS: false,
  token: '',
  signinMethod: '',
  me: {
    memberId: '',
    email: '',
    name: '',
    code: '',
    isCodeUsed: false,
    img: '',
  },
};
const reducer = (store = initialState, action: any) => {
  switch (action.type) {
    case 'SET':
      return {...store, ...action.payload};
    case 'RESET':
      console.log(`!!!!`);
      return {...initialState};
    default:
      return store;
  }
};

export default createStore(reducer);
