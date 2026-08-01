import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

const Container = ({
  contentContainerStyle = {},
  containerStyle = {},
  statusContent,
  useSafeAreaTop = false,
  children,
}) => {
  const {colors, dark} = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const effectiveStatusContent =
    statusContent || (dark ? 'light-content' : 'dark-content');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: useSafeAreaTop ? safeAreaInsets.top : 0,
        },
        containerStyle,
      ]}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle={effectiveStatusContent}
        animated={true}
      />
      <View style={[styles.contentContainerStyle, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

export default Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {flex: 1},
});
