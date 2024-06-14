import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
  configureFonts,
} from 'react-native-paper';
import Route from './Src/Routes';
import {LocalStorage} from './Src/Utils/Resource/localStorage';
import {useAppDispatch} from './Src/Store/MainStore';
import {setAuthToken} from './Src/Store/Slices/AuthSlice';
import {
  getUser,
  getUserRooms,
  getRoomDetails,
  getUserRoomsTenants,
  addUserRoom,
  getUserRoomsTenantsDetails,
} from './Src/Services/Collections';
const App = () => {
  const dispatch = useAppDispatch();
  const fontConfig = {
    android: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: '500',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: '500',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: '500',
      },
    },
    ios: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: 'normal',
      },
    },
    web: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: 'normal',
      },
    },
  };
  const theme = {
    ...DefaultTheme,
    fonts: configureFonts({config: fontConfig}),
  };
  useEffect(() => {
    const init = async () => {
      // const LocalData = await LocalStorage.getUser();
      const LocalToken = await LocalStorage.getToken();
      if (LocalToken) {
        dispatch(setAuthToken(LocalToken));
        await getUser(LocalToken);
        await getUserRooms();
        // await getRoomDetails();
        // await getUserRoomsTenants();
        // // await addUserRoom()
        // await getUserRoomsTenantsDetails()
        // dispatch(setUserProfile(LocalData));
      }
    };
    init();
  }, [dispatch]);
  return (
    <PaperProvider theme={theme}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle={'dark-content'}
      />
      <NavigationContainer
        headerMode={false}
        animationEnabled={true}
        screenOptions={{
          headerShown: false,
        }}>
        <Route />
        <FlashMessage duration={8000} floating animated style={{top: 50}} />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
