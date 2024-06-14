import {createNativeStackNavigator} from '@react-navigation/native-stack';

import React from 'react';
import {useTypedSelector} from '../Store/MainStore';
import {selectAuthToken} from '../Store/Slices/AuthSlice';
import AppStack from './appRoute';
import AuthStack from './auth';

const Stack = createNativeStackNavigator();

const Route = () => {
  const auth = useTypedSelector(selectAuthToken);
  return <>{auth ? AppStack(Stack) : AuthStack(Stack)}</>;
};

export default Route;
