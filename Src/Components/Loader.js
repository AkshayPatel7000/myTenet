import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Surface, Text} from 'react-native-paper';

const Loader = ({message = 'Processing...'}) => {
  return (
    <View style={styles.overlayContainer}>
      <Surface style={styles.loaderCard}>
        <ActivityIndicator animating={true} size="large" color="#4F46E5" />
        <Text style={styles.loaderMessage}>{message}</Text>
      </Surface>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 22,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  loaderMessage: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
