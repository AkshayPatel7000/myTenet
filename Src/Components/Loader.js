import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ActivityIndicator} from 'react-native-paper';

const Loader = () => {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ActivityIndicator />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({});
