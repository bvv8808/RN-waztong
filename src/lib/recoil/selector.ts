import {selector} from 'recoil';
import {atom1} from './atom';

export const atom1Selector = selector({
  key: 'atom1Selector',
  get: ({get}) => {
    const currentAtom1 = get(atom1);
    // const currentAtom2 = get(atom2)
    // 가지고 오고 싶은 atom들 전부 받아서 조물조물해서 return하면 그게 useRecoilValue(atom1Selector)가 뱉는 값

    return currentAtom1 + '!!!';
  },
});
