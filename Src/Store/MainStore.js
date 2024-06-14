import {configureStore} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';
import AuthSlice from './Slices/AuthSlice';
import LoaderSlice from './Slices/LoaderSlice';

export const createStore = options =>
  configureStore({
    reducer: {
      AuthSlice: AuthSlice,
      Loader: LoaderSlice,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    ...options,
  });

export const store = createStore();

export const useAppDispatch = useDispatch;

export const useTypedSelector = useSelector;
