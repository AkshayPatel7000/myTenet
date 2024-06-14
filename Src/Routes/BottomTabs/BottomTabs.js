import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RoutesName from '../../Utils/Resource/RoutesName';
import {Home, MyTenant} from '../../Screens';
import {Icon, MD3Colors, withTheme} from 'react-native-paper';

const BottomTab = createBottomTabNavigator();
function MyTabBar({state, descriptors, navigation}) {
  const {colors, dark} = useTheme();
  const styles = getStyles(colors, dark);
  const scrollY = new Animated.Value(0);
  const translateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -60],
  });
  const safeAreaInsets = useSafeAreaInsets();
  let fromBottom =
    Platform.OS == 'ios' ? safeAreaInsets.bottom : safeAreaInsets.bottom + 20;
  const [showTab, setShowTab] = React.useState(true);
  useEffect(() => {
    const Subs = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    return () => {
      Subs.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAnimation = () => {
    Animated.spring(scrollY, {
      toValue: 450,
      duration: 2000,
      friction: 1,
      tension: 20,
      useNativeDriver: true,
    }).start();
  };
  const _keyboardDidShow = () => {
    setShowTab(false);
    scrollY.setValue(-100);
  };
  const _keyboardDidHide = () => {
    setShowTab(true);
    scrollY.setValue(0);
  };
  return (
    <>
      {showTab && (
        <Animated.View
          style={[
            styles.main,
            {marginBottom: fromBottom, transform: [{translateY: scrollY}]},
          ]}>
          <>
            {state.routes.map((route, index) => {
              const {options} = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;
              const isFocused = state.index === index;
              const onPress = () => {
                startAnimation();
                navigation.navigate({name: route.name, merge: true});
              };

              return (
                <View key={label} style={styles.singleItem}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={isFocused ? {selected: true} : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onPress={() => onPress()}>
                    <View
                      style={{
                        paddingHorizontal: 30,
                        paddingVertical: 5,
                        borderRadius: 100,
                        backgroundColor: isFocused
                          ? options.iconColor
                          : '#FFFFFFE6',
                      }}>
                      {!isFocused ? (
                        <Icon
                          source={options.icon}
                          color={options.iconColor}
                          size={25}
                        />
                      ) : (
                        <Icon
                          source={options.iconInActive}
                          color={options.iconInActiveColor}
                          size={25}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        </Animated.View>
      )}
    </>
  );
}

const BottomTabs = ({theme}) => {
  return (
    <BottomTab.Navigator
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={tabsProps => <MyTabBar {...tabsProps} />}
      screenOptions={{headerShown: false, tabBarHideOnKeyboard: true}}
      options={{tabBarHideOnKeyboard: true}}
      initialRouteName="Dashboard">
      <BottomTab.Screen
        name={RoutesName.HOME}
        options={{
          tabBarHideOnKeyboard: true,
          icon: 'home',
          iconInActive: 'home',
          iconColor: theme.colors.primary,
          iconInActiveColor: theme.colors.onPrimary,
        }}
        component={Home}
      />
      <BottomTab.Screen
        name={RoutesName.TENANT}
        options={{
          icon: 'account-cash',
          iconInActive: 'account-cash',
          iconColor: theme.colors.primary,
          iconInActiveColor: theme.colors.onPrimary,
        }}
        component={MyTenant}
      />
    </BottomTab.Navigator>
  );
};
export default withTheme(BottomTabs);
const getStyles = (colors, dark) => {
  return StyleSheet.create({
    main: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      backgroundColor: dark ? '#19191980' : '#FFFFFFE6',
      marginHorizontal: 18,
      borderRadius: 20,
      height: 60,
      left: 0,
      right: 0,
      elevation: 22,
    },
    singleItem: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
    },
  });
};
