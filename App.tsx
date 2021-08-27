/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';

import React, {useEffect} from 'react';
import {
  BackHandler,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './src//Screens/Splash';
import SelectLangScreen from '~/Screens/SelectLang';
import SignInScreen from '~/Screens/Sign/SignIn';
import SignUpScreen from '~/Screens/Sign/SignUp';
import ForgotScreen from '~/Screens/Sign/Forgot';
import SpeakStack from '~/Screens/SpeakStack';
import MainStack from '~/Screens/MainStack';
import Orientation from 'react-native-orientation-locker';
import {RecoilRoot, useSetRecoilState} from 'recoil';
import TestScreen from '~/Screens/__test__';
import SignInHomeScreen from '~/Screens/Sign/SignInHome';
// import ReviewStack from '~/Screens/ReviewStack';
import CoinStoreScreen from '~/Screens/CoinStore';
import {
  tabHomeActive,
  tabHomeInactive,
  tabMoreActive,
  tabMoreInactive,
  tabReviewActive,
  tabReviewInactive,
  tabSpeakActive,
  tabSpeakInactive,
  tabWordActive,
  tabWordInactive,
} from '~/images';
import SignUpAgreementScreen from '~/Screens/Sign/SignUpAgreement';
import AsyncStorage from '@react-native-community/async-storage';
import MainScreen from '~/Screens/MainStack/MainScreen';
import WordStack from '~/Screens/WordStack';
import TermScreen from '~/Screens/Term';
import SelectSubtitleScreen from '~/Screens/SelectSubtitle';
import ReviewListScreen from '~/Screens/Review/List';
import ReviewDetailScreen from '~/Screens/Review/Detail';
import ReviewWriteScreen from '~/Screens/Review/Write';
import StoreStack from '~/Screens/StoreStack';
import ReviewModifyScreen from '~/Screens/Review/Modify';
import ReviewCommentScreen from '~/Screens/Review/Comment';

const tabVisibleScreens = [
  'speakList',
  'reviewList',
  'Main',
  'wordList',
  'storeMain',
];
const toggleTabVisible = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  // console.log(`route:::: `, route.name);
  // console.log(`route: `, routeName);
  if (!routeName) return true;
  return tabVisibleScreens.includes(routeName);
};

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const ReviewStack = createStackNavigator();

const ReviewStackInTab = () => {
  return (
    <ReviewStack.Navigator screenOptions={{headerShown: false}}>
      <ReviewStack.Screen
        name="reviewList"
        component={ReviewListScreen}
        initialParams={{isMe: false}}
      />
      <ReviewStack.Screen name="reviewDetail" component={ReviewDetailScreen} />
      <ReviewStack.Screen name="reviewWrite" component={ReviewWriteScreen} />
      <ReviewStack.Screen name="reviewModify" component={ReviewModifyScreen} />
      <ReviewStack.Screen
        name="reviewComment"
        component={ReviewCommentScreen}
      />
    </ReviewStack.Navigator>
  );
};

const MainTab = () => (
  <Tab.Navigator
    initialRouteName="Main"
    tabBarOptions={{showLabel: false}}
    screenOptions={({route}) => ({
      tabBarVisible: toggleTabVisible(route),
    })}>
    <Tab.Screen
      name="Main"
      component={MainStack}
      options={{
        tabBarIcon: ({focused, size}) => (
          <Image
            source={focused ? tabHomeActive.src : tabHomeInactive.src}
            style={{width: size, height: size * tabHomeActive.ratio}}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Speak"
      component={SpeakStack}
      options={{
        tabBarIcon: ({focused, size}) => (
          <Image
            source={focused ? tabSpeakActive.src : tabSpeakInactive.src}
            style={{width: size / tabSpeakActive.ratio, height: size}}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Word"
      component={WordStack}
      options={{
        tabBarIcon: ({focused, size}) => (
          <Image
            source={focused ? tabWordActive.src : tabWordInactive.src}
            style={{width: size, height: size * tabWordInactive.ratio}}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Review"
      component={ReviewStackInTab}
      options={{
        tabBarIcon: ({focused, size}) => (
          <Image
            source={focused ? tabReviewActive.src : tabReviewInactive.src}
            style={{width: size, height: size * tabReviewActive.ratio}}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Store"
      component={StoreStack}
      options={{
        tabBarIcon: ({focused, size}) => (
          <Image
            source={focused ? tabMoreActive.src : tabMoreInactive.src}
            style={{width: size, height: size * tabMoreActive.ratio}}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  return (
    <RecoilRoot>
      <NavigationContainer
        onStateChange={s => {
          // console.log(`state@@@@@ `, s);
        }}>
        <RootStack.Navigator screenOptions={{headerShown: false}}>
          {/* <RootStack.Screen name="Test" component={TestScreen} /> */}
          <RootStack.Screen name="Splash" component={SplashScreen} />
          <RootStack.Screen name="SelectLang" component={SelectLangScreen} />
          <RootStack.Screen name="SignIn" component={SignInScreen} />
          <RootStack.Screen name="SignInHome" component={SignInHomeScreen} />
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen
            name="SignUpAgreement"
            component={SignUpAgreementScreen}
          />
          <RootStack.Screen name="Forgot" component={ForgotScreen} />
          <RootStack.Screen name="CoinStore" component={CoinStoreScreen} />
          <RootStack.Screen name="MainTab" component={MainTab} />
          <RootStack.Screen name="Term" component={TermScreen} />
          <RootStack.Screen
            name="SelectSubtitle"
            component={SelectSubtitleScreen}
          />

          <RootStack.Screen
            name="MyReviewList"
            component={ReviewListScreen}
            initialParams={{isMe: true}}
          />
          <RootStack.Screen
            name="MyReviewDetail"
            component={ReviewDetailScreen}
          />
          <RootStack.Screen
            name="MyReviewWrite"
            component={ReviewWriteScreen}
          />
          <RootStack.Screen
            name="MyReviewModify"
            component={ReviewModifyScreen}
          />
          <RootStack.Screen
            name="MyReviewComment"
            component={ReviewCommentScreen}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
};

export default App;
