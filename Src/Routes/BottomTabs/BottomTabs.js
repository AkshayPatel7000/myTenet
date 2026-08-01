import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon, Text, useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Home, MyTenant, Profile} from '../../Screens';
import RoutesName from '../../Utils/Resource/RoutesName';

const BottomTab = createBottomTabNavigator();

const TAB_CONFIG = {
  [RoutesName.HOME]: {
    label: 'Rooms',
    activeIcon: 'home-city',
    inactiveIcon: 'home-city-outline',
  },
  [RoutesName.TENANT]: {
    label: 'Tenants',
    activeIcon: 'account-group',
    inactiveIcon: 'account-group-outline',
  },
  [RoutesName.PROFILE]: {
    label: 'Profile',
    activeIcon: 'account-circle',
    inactiveIcon: 'account-circle-outline',
  },
};

function MyTabBar({state, descriptors, navigation}) {
  const {colors, dark} = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [showTab, setShowTab] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  const bottomMargin = Platform.OS === 'ios'
    ? Math.max(safeAreaInsets.bottom, 12)
    : 16;

  const tabWidth = containerWidth > 0 ? (containerWidth - 16) / state.routes.length : 0;

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(translateX, {
        toValue: state.index * tabWidth,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    }
  }, [state.index, tabWidth, translateX]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setShowTab(false),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setShowTab(true),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!showTab) return null;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: bottomMargin,
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant || (dark ? '#334155' : '#F1F5F9'),
        },
      ]}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      
      {/* Animated Sliding Background Pill */}
      {containerWidth > 0 ? (
        <Animated.View
          style={[
            styles.slidingPill,
            {
              width: tabWidth,
              backgroundColor: colors.primaryContainer || (dark ? '#312E81' : '#EEF2FF'),
              transform: [{translateX}],
            },
          ]}
        />
      ) : null}

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabMeta = TAB_CONFIG[route.name] || {
          label: route.name,
          activeIcon: 'checkbox-blank-circle',
          inactiveIcon: 'checkbox-blank-circle-outline',
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({name: route.name, merge: true});
          }
        };

        const inactiveColor = dark ? '#94A3B8' : '#64748B';

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.tabItem}>
            <View style={styles.tabContent}>
              <Icon
                source={isFocused ? tabMeta.activeIcon : tabMeta.inactiveIcon}
                size={22}
                color={isFocused ? colors.primary : inactiveColor}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: isFocused ? colors.primary : inactiveColor},
                  isFocused && styles.activeTabLabel,
                ]}>
                {tabMeta.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const BottomTabs = () => {
  return (
    <BottomTab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{headerShown: false, tabBarHideOnKeyboard: true}}>
      <BottomTab.Screen name={RoutesName.HOME} component={Home} />
      <BottomTab.Screen name={RoutesName.TENANT} component={MyTenant} />
      <BottomTab.Screen name={RoutesName.PROFILE} component={Profile} />
    </BottomTab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
  },
  slidingPill: {
    position: 'absolute',
    left: 8,
    height: 48,
    borderRadius: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabLabel: {
    fontWeight: '800',
  },
});
