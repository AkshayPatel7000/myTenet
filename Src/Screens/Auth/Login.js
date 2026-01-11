import {Formik} from 'formik';
import React, {useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import * as Yup from 'yup';
import Container from '../../Components/Container';
import {useAppDispatch} from '../../Store/MainStore';
import {setAuthToken} from '../../Store/Slices/AuthSlice';
import {LocalStorage} from '../../Utils/Resource/localStorage';
import {showError, toTitleCase} from '../../Utils/helperFunction';
import auth from '@react-native-firebase/auth';
import {addUser, getUser} from '../../Services/Collections';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import RoutesName from '../../Utils/Resource/RoutesName';
import GoogleLogo from '../../Assets/SVG/google-icon.svg';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
GoogleSignin.configure({
  webClientId:
    '515928874687-irhbrofvs1bpgmrcd3hpuu510c3epr6f.apps.googleusercontent.com',
});

const Login = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const validationSchema = Yup.object().shape({
    email: Yup.string().required().email("Well that's not an email"),
    password: Yup.string().required().min(2, 'Pretty sure this will be hacked'),
  });

  const dispatch = useAppDispatch();
  const _onLoginPressed = async values => {
    try {
      setLoading(true);
      const response = await auth().signInWithEmailAndPassword(
        values.email,
        values.password,
      );
      setLoading(false);
      await getUser(response.user.uid);
      LocalStorage.storeToken(response.user.uid);
      dispatch(setAuthToken(response.user.uid));
      console.log('🚀 ~ Login ~ response:', response.user.uid);
    } catch (error) {
      setLoading(false);

      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
        showError('That email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
        showError('That email address is invalid!');
      }
      if (error.code === 'auth/invalid-credential') {
        console.log('Invalid user credential');
        showError('Invalid user credential');
      }
    }
  };
  const _onGoogleLoginPress = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const response = await auth().signInWithCredential(googleCredential);

      await addUser(response?.user);

      await getUser(response?.user?.uid);

      setLoading(false);
      LocalStorage.storeToken(response?.user.uid);
      dispatch(setAuthToken(response?.user.uid));
      console.log('🚀 ~ const_onGoogleLoginPress= ~ response:', response);
    } catch (error) {
      console.log('🚀 ~ Login ~ error:', error);
    }
  };
  return (
    <Container contentContainerStyle={{margin: 20, flex: 1}}>
      <VirtualizedScrollView>
        <View>
          <View>
            <Image
              source={require('../../Assets/Images/undraw_Calculator_re_alsc.png')}
              style={{width: '100%', height: 300, resizeMode: 'contain'}}
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 20,
            }}>
            <Text variant="headlineMedium">Login</Text>
          </View>
          <Formik
            initialValues={{email: '', password: ''}}
            onSubmit={_onLoginPressed}
            validationSchema={validationSchema}>
            {({handleChange, handleBlur, handleSubmit, values, errors}) => {
              return (
                <View style={{flex: 1}}>
                  <TextInput
                    mode="outlined"
                    label="Email"
                    returnKeyType="next"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={!!errors.email}
                    errorText={errors.email}
                    autoCapitalize="none"
                    autoCompleteType="email"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    style={{width: '100%'}}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {toTitleCase(errors.email)}
                  </HelperText>
                  <TextInput
                    mode="outlined"
                    label="Password"
                    returnKeyType="done"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={!!errors.password}
                    errorText={errors.password}
                    secureTextEntry
                  />
                  <HelperText type="error" visible={!!errors.password}>
                    {toTitleCase(errors.password)}
                  </HelperText>
                  <View style={styles.forgotPassword}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ForgotPasswordScreen')
                      }>
                      <Text style={styles.label}>Forgot your password?</Text>
                    </TouchableOpacity>
                  </View>
                  <Button
                    style={{marginHorizontal: 10}}
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}>
                    Login
                  </Button>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: 'center',
                      marginVertical: 10,
                    }}>
                    OR
                  </Text>
                  <TouchableOpacity
                    disabled={loading}
                    onPress={_onGoogleLoginPress}
                    style={styles.google}>
                    {!loading ? (
                      <>
                        <GoogleLogo />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            marginLeft: 20,
                          }}>
                          Continue with Google
                        </Text>
                      </>
                    ) : (
                      <ActivityIndicator size={30} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
          </Formik>
        </View>
      </VirtualizedScrollView>
    </Container>
  );
};

export default Login;
const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  google: {
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 60,
    elevation: 8,
    marginBottom: 30,
    marginHorizontal: 10,
  },
});
