import {Formik} from 'formik';
import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import * as Yup from 'yup';
import Container from '../../Components/Container';
import {useAppDispatch} from '../../Store/MainStore';
import {setAuthToken} from '../../Store/Slices/AuthSlice';
import {LocalStorage} from '../../Utils/Resource/localStorage';
import {showError, toTitleCase} from '../../Utils/helperFunction';
import auth from '@react-native-firebase/auth';
import {addUser, getUser} from '../../Services/Collections';
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
  const _onSignupPressed = async values => {
    try {
      setLoading(true);
      const response = await auth().createUserWithEmailAndPassword(
        values.email,
        values.password,
      );
      setLoading(false);
      await addUser(response.user);
      console.log('🚀 ~ Login ~ response:', response);
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
    // LocalStorage.storeToken('dddddd');
    // dispatch(setAuthToken('dddddddd'));
  };

  return (
    <Container contentContainerStyle={{padding: 20, flex: 1}}>
      {/* <View style={{backgroundColor: 'red'}}></View> */}
      <Formik
        initialValues={{email: '', password: ''}}
        onSubmit={_onLoginPressed}
        validationSchema={validationSchema}>
        {({handleChange, handleBlur, handleSubmit, values, errors}) => {
          return (
            <View style={{flex: 1, justifyContent: 'center'}}>
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
              <View style={{height: 20}}></View>
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
                  onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                  <Text style={styles.label}>Forgot your password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}>
                Login
              </Button>
            </View>
          );
        }}
      </Formik>
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
});
