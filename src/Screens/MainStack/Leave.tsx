import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import StackHeader from '~/components/StackHeader';
import {deleteAccountBackground, infoMint} from '~/images';
import theme from '~/lib/theme';

interface Props {
  navigation: any;
}

const LeaveScreen = ({navigation}: Props) => {
  const onPressDelete = () => {
    //
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StackHeader title="Delete account" navigation={navigation} />
      <View style={{flex: 1, ...theme.center}}>
        <Image
          source={deleteAccountBackground.src}
          style={{position: 'absolute', width: '100%', height: '100%'}}
          resizeMode="cover"
        />

        <Image
          source={infoMint.src}
          style={{width: 50, height: 50, marginBottom: 30}}
        />

        <Text style={s.tBig}>DO YOU REALLY WANT TO</Text>
        <Text style={s.tBig}>
          <Text style={{color: theme.colors.mint}}>DELETE</Text> YOUR{' '}
          <Text style={{color: theme.colors.mint}}>ACCOUNT?</Text>
        </Text>
        <Text style={s.tSmall}>
          When you press the button below,{'\n'}your account will be deleted.
        </Text>
        <TouchableOpacity style={s.btnDelete} onPress={onPressDelete}>
          <Text style={s.tDelete}>Delete account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  tBig: {
    ...theme.texts.largestTitle,
    paddingVertical: 0,
  },
  tSmall: {
    ...theme.fontSizes.small,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  btnDelete: {
    width: '50%',
    height: theme.buttons.medium.height,
    borderRadius: theme.buttons.medium.borderRadius,
    borderWidth: 1,
    borderColor: theme.colors.mint,
    ...theme.center,
  },
  tDelete: {
    ...theme.fontSizes.large,
    paddingVertical: 0,
    color: theme.colors.mint,
  },
});

export default LeaveScreen;
