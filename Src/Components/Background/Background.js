import React, {memo} from 'react';
import {ImageBackground, StyleSheet, KeyboardAvoidingView} from 'react-native';
import Images from '../../Assets/Images';
const Background = ({children}) => (
  <ImageBackground
    source={Images.BackgroundDots}
    resizeMode="repeat"
    style={styles.background}>
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {children}
    </KeyboardAvoidingView>
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(Background);
