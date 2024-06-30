import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
  configureFonts,
} from 'react-native-paper';
import SplashScreen from './Src/Components/SplashScreen';
import Route from './Src/Routes';
import {getUser, getUserRooms} from './Src/Services/Collections';
import {useAppDispatch} from './Src/Store/MainStore';
import {setAuthToken} from './Src/Store/Slices/AuthSlice';
import {LocalStorage} from './Src/Utils/Resource/localStorage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  DatePickerModal,
  en,
  registerTranslation,
} from 'react-native-paper-dates';
const App = () => {
  const [splash, setSplash] = React.useState(true);
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
    registerTranslation('en', en);
    const init = async () => {
      setSplash(true);
      // const LocalData = await LocalStorage.getUser();
      const LocalToken = await LocalStorage.getToken();
      if (LocalToken) {
        dispatch(setAuthToken(LocalToken));
        await getUser(LocalToken);
        await getUserRooms();
      }

      setTimeout(() => setSplash(false), 3000);
    };
    init();
  }, [dispatch]);

  if (splash) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
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
    </GestureHandlerRootView>
  );
};

export default App;
