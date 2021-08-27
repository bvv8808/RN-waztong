import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import {
  GQLResponse,
  TLazyQueryAlias,
  TMutationAlias,
  TQueryAlias,
} from '../types';
import {lazyQueries, mutations, queries} from './allQueries';

// 원하는 쿼리의 Alias만 입력 받아 매칭 되는 쿼리문대로 ApolloClient 훅을 사용할 수 있게 해주는 custom hooks를 제공하는 모듈

export const useBQuery = (type: TQueryAlias, vars?: String) => {
  const strQuery = queries[type](vars);

  console.log(`strQuery:: `, strQuery);
  const q = useQuery(
    gql`
      ${strQuery}
    `,
    {errorPolicy: 'all'},
  );

  return q;
};

export const useBLazyQuery = (type: TLazyQueryAlias) => {
  const strQuery = lazyQueries[type]();
  // console.log(`query:: `, strQuery);
  const q = useLazyQuery<GQLResponse>(
    gql`
      ${strQuery}
    `,
    {errorPolicy: 'all'},
  );
  return q;
};

export const useBMutation = (type: TMutationAlias) => {
  // console.log(`query:: `, mutations[type]());
  return useMutation(
    gql`
      ${
        // @ts-ignore
        mutations[type]()
      }
    `,
  );
};
