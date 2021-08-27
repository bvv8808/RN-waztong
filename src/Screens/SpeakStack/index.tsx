import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import AdLearnScreen from './AdLearn';
import AdSpeakScreen from './AdSpeak';
import SpeakGatewayScreen from './Gateway';
import LearnScreen from './Learn';
import SpeakListScreen from './List';
import SpeakStudyScreen from './Study';

const Stack = createStackNavigator();

interface Props {}

const MainStack = ({}: Props) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="speakList" component={SpeakListScreen} />
      <Stack.Screen name="adLearn" component={AdLearnScreen} />
      <Stack.Screen name="adSpeak" component={AdSpeakScreen} />
      <Stack.Screen name="learn" component={LearnScreen} />
      <Stack.Screen name="speakGateway" component={SpeakGatewayScreen} />
      <Stack.Screen name="speakStudy" component={SpeakStudyScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
