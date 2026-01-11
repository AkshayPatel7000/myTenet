import {StyleSheet, View} from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import {Text} from 'react-native-paper';

const EmptyComponent = ({title = 'Opps! data not found'}) => {
  return (
    <View style={{alignItems: 'center'}}>
      <LottieView
        autoPlay
        source={require('../Assets/notfound.json')}
        style={{width: '100%', height: 300}}
      />
      <Text style={{fontSize: 18}} variant="bodyLarge">
        {title}
      </Text>
    </View>
  );
};

export default EmptyComponent;

const styles = StyleSheet.create({});
