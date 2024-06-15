import {Dimensions, StatusBar, StyleSheet, View} from 'react-native';
import React from 'react';
import Lottie from 'lottie-react-native';
import {Text} from 'react-native-paper';

const SplashScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle={'dark-content'}
      />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Lottie
          source={require('../Assets/splash.json')}
          loop
          autoPlay
          style={{
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').width,
            borderWidth: 1,
          }}
        />
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
