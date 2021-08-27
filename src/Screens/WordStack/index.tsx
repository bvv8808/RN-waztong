import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import AdScreen from './Ad';
import WordListScreen from './List';
import StudyWordScreen from './Study';

const Stack = createStackNavigator();

interface Props {}

const MainStack = ({}: Props) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="wordList" component={WordListScreen} />
      <Stack.Screen name="ad" component={AdScreen} />
      <Stack.Screen name="wordStudy" component={StudyWordScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
