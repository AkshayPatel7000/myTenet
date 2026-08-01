import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  configureFonts,
} from 'react-native-paper';
import SplashScreen from './Src/Components/SplashScreen';
import Route from './Src/Routes';
import {getUser, getUserRooms} from './Src/Services/Collections';
import {useAppDispatch, useTypedSelector} from './Src/Store/MainStore';
import {
  selectIsDarkMode,
  setAuthToken,
  setDarkMode,
} from './Src/Store/Slices/AuthSlice';
import {LocalStorage} from './Src/Utils/Resource/localStorage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {en, registerTranslation} from 'react-native-paper-dates';

const fontConfig = {
  android: {
    regular: {fontFamily: 'Poppins-Regular', fontWeight: '500'},
    medium: {fontFamily: 'Poppins-Medium', fontWeight: '500'},
    light: {fontFamily: 'Poppins-Light', fontWeight: '500'},
    thin: {fontFamily: 'Poppins-Thin', fontWeight: '500'},
  },
  ios: {
    regular: {fontFamily: 'Poppins-Regular', fontWeight: 'normal'},
    medium: {fontFamily: 'Poppins-Medium', fontWeight: 'normal'},
    light: {fontFamily: 'Poppins-Light', fontWeight: 'normal'},
    thin: {fontFamily: 'Poppins-Thin', fontWeight: 'normal'},
  },
};

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EEF2FF',
    onPrimaryContainer: '#3730A3',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
  },
  fonts: configureFonts({config: fontConfig}),
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    onPrimary: '#1E1B4B',
    primaryContainer: '#312E81',
    onPrimaryContainer: '#E0E7FF',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    onSurface: '#F8FAFC',
    onSurfaceVariant: '#94A3B8',
  },
  fonts: configureFonts({config: fontConfig}),
};

const AppContent = () => {
  const [splash, setSplash] = React.useState(true);
  const dispatch = useAppDispatch();
  const isDarkMode = useTypedSelector(selectIsDarkMode);

  useEffect(() => {
    registerTranslation('en', en);
    const init = async () => {
      setSplash(true);

      const savedTheme = await LocalStorage.getIsDarkTheme();
      dispatch(setDarkMode(!!savedTheme));

      const LocalToken = await LocalStorage.getToken();
      if (LocalToken) {
        dispatch(setAuthToken(LocalToken));
        await getUser(LocalToken);
        await getUserRooms();
      }

      setTimeout(() => setSplash(false), 2000);
    };
    init();
  }, [dispatch]);

  if (splash) {
    return <SplashScreen />;
  }

  const activeTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider theme={activeTheme}>
        <StatusBar
          backgroundColor="transparent"
          translucent={true}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <NavigationContainer
          headerMode={false}
          animationEnabled={true}
          screenOptions={{
            headerShown: false,
          }}>
          <Route />
          <FlashMessage duration={6000} floating animated style={{top: 50}} />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
