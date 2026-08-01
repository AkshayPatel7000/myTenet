import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Container = ({
  contentContainerStyle = {},
  containerStyle = {},
  statusColor = '#FFFFFF',
  statusContent = 'dark-content',
  children,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const styles = getStyles(safeAreaInsets);
  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar
        backgroundColor={statusColor}
        barStyle={statusContent}
        animated={true}
      />
      <SafeAreaView
        style={[styles.contentContainerStyle, contentContainerStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default Container;

const getStyles = safeAreaInsets => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: safeAreaInsets.top,
      backgroundColor: '#fff',
    },
    contentContainerStyle: {flex: 1},
  });
};
