import React from 'react';
import {StyleSheet} from 'react-native';

import BottomTabs from './BottomTabs/BottomTabs';
import RoutesName from '../Utils/Resource/RoutesName';
import {MonthlyBreakdown, RoomDetails} from '../Screens';

const AppRoute = Stack => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name={RoutesName.BOTTOM_TABS} component={BottomTabs} />
      <Stack.Screen name={RoutesName.ROOM_DETAILS} component={RoomDetails} />
      <Stack.Screen
        name={RoutesName.MONTHLY_BREAKDOWN}
        component={MonthlyBreakdown}
      />
    </Stack.Navigator>
  );
};

export default AppRoute;

const styles = StyleSheet.create({});
