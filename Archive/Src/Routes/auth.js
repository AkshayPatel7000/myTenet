import * as React from 'react';
import RoutesName from '../Utils/Resource/RoutesName';
import {Login, SignUp} from '../Screens';

const AuthStack = Stack => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name={RoutesName.LOGIN} component={Login} />
      <Stack.Screen name={RoutesName.SIGNUP} component={SignUp} />
    </Stack.Navigator>
  );
};

export default AuthStack;
