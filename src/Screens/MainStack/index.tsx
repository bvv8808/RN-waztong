import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import FAQScreen from './FAQ';
import LeaveScreen from './Leave';
import MenuScreen from './Menu';
import CoinMenuScreen from './MyCoin/Menu';
import PurchaseHistoryScreen from './MyCoin/PurchaseHistory';
import ViewHistoryScreen from './MyCoin/ViewHistory';
import MyInfoScreen from './MyInfo';
import MyLanguageScreen from './Settings/MyLanguage';
import NoticeScreen from './Notice';
import QnAScreen from './QnA';
import SettingsScreen from './Settings/Menu';
import TermScreen from '~/Screens/Term';
import MainScreen from './MainScreen';

const Stack = createStackNavigator();

interface Props {}

const MoreStack = ({}: Props) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="myMenu" component={MenuScreen} />
      <Stack.Screen name="qna" component={QnAScreen} />
      <Stack.Screen name="faq" component={FAQScreen} />
      <Stack.Screen name="notice" component={NoticeScreen} />
      <Stack.Screen name="information" component={MyInfoScreen} />
      <Stack.Screen name="coinMenu" component={CoinMenuScreen} />
      <Stack.Screen name="purchaseHistory" component={PurchaseHistoryScreen} />
      <Stack.Screen name="viewHistory" component={ViewHistoryScreen} />
      <Stack.Screen name="leave" component={LeaveScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="myLanguage" component={MyLanguageScreen} />
      <Stack.Screen name="term" component={TermScreen} />
    </Stack.Navigator>
  );
};

export default MoreStack;
