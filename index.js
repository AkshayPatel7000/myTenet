/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {store} from './Src/Store/MainStore';
import {enGB, registerTranslation} from 'react-native-paper-dates';
registerTranslation('en-GB', enGB);
const StoreApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => StoreApp);
