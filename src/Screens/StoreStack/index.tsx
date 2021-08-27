import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import StoreMainScreen from './StoreMain';

// import {View} from 'react-native';
// import FAQScreen from '../MainStack/FAQ';
// import LeaveScreen from '../MainStack/Leave';
// import MenuScreen from '../MainStack/Menu';
// import AdHistoryScreen from '../MainStack/MyCoin/AdHistory';
// import CoinMenuScreen from '../MainStack/MyCoin/Menu';
// import PurchaseHistoryScreen from '../MainStack/MyCoin/PurchaseHistory';
// import ViewHistoryScreen from '../MainStack/MyCoin/ViewHistory';
// import MyInfoScreen from '../MainStack/MyInfo';
// import NoticeScreen from '../MainStack/Notice';
// import QnAScreen from '../MainStack/QnA';
// import SettingsScreen from '~/Screens/MainStack/Settings/Menu';
// import MyLanguageScreen from '../MainStack/Settings/MyLanguage';
// import TermScreen from '~/Screens/Term';

const Stack = createStackNavigator();

interface Props {}

const StoreStack = ({}: Props) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="storeMain" component={StoreMainScreen} />
      {/* <Stack.Screen name="myMenu" component={MenuScreen} />
      <Stack.Screen name="qna" component={QnAScreen} />
      <Stack.Screen name="faq" component={FAQScreen} />
      <Stack.Screen name="notice" component={NoticeScreen} />
      <Stack.Screen name="information" component={MyInfoScreen} />
      <Stack.Screen name="coinMenu" component={CoinMenuScreen} />
      <Stack.Screen name="adHistory" component={AdHistoryScreen} />
      <Stack.Screen name="purchaseHistory" component={PurchaseHistoryScreen} />
      <Stack.Screen name="viewHistory" component={ViewHistoryScreen} />
      <Stack.Screen name="leave" component={LeaveScreen} />
      <Stack.Screen name="myLanguage" component={MyLanguageScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="term" component={TermScreen} /> */}
    </Stack.Navigator>
  );
};

export default StoreStack;
