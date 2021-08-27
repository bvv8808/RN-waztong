import {gql, useQuery} from '@apollo/client';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import StackHeader from '~/components/StackHeader';
import theme from '~/lib/theme';
import {GQLResponse, TRootStackParams} from '~/lib/types';

const TermScreen = ({
  navigation,
  route,
}: StackScreenProps<TRootStackParams, 'Term'>) => {
  const {type} = route.params;

  const {data, error} = useQuery<GQLResponse>(
    gql`
    query {
      getConfig {
        ${type === 'term' ? 'getService' : 'getPrivacy'}
      }
    }
  `,
    {errorPolicy: 'all'},
  );

  useEffect(() => {
    console.log(`data: `, data);
  }, [data]);

  useEffect(() => {
    if (error) {
      console.log(`config error:: `, JSON.stringify(error));
    }
  }, [error]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader
        title={type === 'term' ? 'Terms of service' : 'Privacy policy'}
        navigation={navigation}
      />
      <ScrollView style={{padding: 20}}>
        <Text
          style={{
            ...theme.fontSizes.medium,
            paddingVertical: 0,
            color: '#333',
          }}>
          {data?.getConfig[type === 'term' ? 'getService' : 'getPrivacy']}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermScreen;
