import {useEffect} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {useBLazyQuery} from '../gql/gqlBuilder';
import {__myInfo, __token} from '../recoil/atom';
import toast from 'react-native-simple-toast';

export default () => {
  const token = useRecoilValue(__token);
  const r_setMe = useSetRecoilState(__myInfo);

  const [loadMe, {data, error}] = useBLazyQuery('me');

  useEffect(() => {
    if (data && data.getMe) {
      console.log(`updateMe::: `, data.getMe);
      r_setMe(data.getMe);
    }
  }, [data]);
  useEffect(() => {
    if (error) {
      console.log(`##### ERROR in useUpdateMe`, JSON.stringify(error));
      toast.show(error.message, 1);
    }
  }, [error]);

  return () => {
    console.log(`<useUpdateMe>`);
    loadMe({variables: {session: token}});
  };
};
