import {Formik} from 'formik';
import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  HelperText,
  Icon,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
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
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '515928874687-irhbrofvs1bpgmrcd3hpuu510c3epr6f.apps.googleusercontent.com',
});

const Login = ({navigation}) => {
  const {colors} = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email address is required')
      .email('Enter a valid email address'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
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
    } catch (error) {
      setLoading(false);

      if (error.code === 'auth/email-already-in-use') {
        showError('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        showError('Invalid email address format.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        showError('Invalid email or password credentials.');
      } else {
        showError('Login failed. Please check your network and credentials.');
      }
    }
  };

  const _onGoogleLoginPress = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const result = await GoogleSignin.signIn();

      if (result.data?.idToken && result.type === 'success') {
        const googleCredential = auth.GoogleAuthProvider.credential(
          result.data.idToken,
        );

        const response = await auth().signInWithCredential(googleCredential);
        await addUser(response?.user);
        await getUser(response?.user?.uid);

        setLoading(false);
        LocalStorage.storeToken(response?.user.uid);
        dispatch(setAuthToken(response?.user.uid));
      }
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ Login ~ error:', error);
      setLoading(false);
    }
  };

  return (
    <Container
      statusColor="#6366F1"
      statusContent="light-content"
      containerStyle={{backgroundColor: '#6366F1'}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <VirtualizedScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Gradient Brand Card */}
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            useAngle={true}
            angle={135}
            style={styles.heroBanner}>
            <View style={styles.brandBadge}>
              <Icon source="home-city" size={32} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>myTenet</Text>
            <Text style={styles.brandSubtitle}>
              Smart Rental Property & Utility Manager
            </Text>
          </LinearGradient>

          {/* Form Surface Container */}
          <Surface style={styles.formSurface}>
            <View style={styles.welcomeHeaderRow}>
              <Icon source="hand-wave" size={24} color="#4F46E5" />
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
            </View>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage rooms, tenant records, and monthly billing.
            </Text>

            <Formik
              initialValues={{email: '', password: ''}}
              onSubmit={_onLoginPressed}
              validationSchema={validationSchema}>
              {({handleChange, handleBlur, handleSubmit, values, errors}) => {
                return (
                  <View style={styles.formGroup}>
                    <TextInput
                      mode="outlined"
                      label="Email Address"
                      left={<TextInput.Icon icon="email-outline" />}
                      returnKeyType="next"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={!!errors.email}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email ? toTitleCase(errors.email) : ''}
                    </HelperText>

                    <TextInput
                      mode="outlined"
                      label="Password"
                      left={<TextInput.Icon icon="lock-outline" />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(prev => !prev)}
                        />
                      }
                      returnKeyType="done"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={!!errors.password}
                      secureTextEntry={!showPassword}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password ? toTitleCase(errors.password) : ''}
                    </HelperText>

                    <TouchableOpacity
                      style={styles.forgotPasswordBox}
                      onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    <Button
                      mode="contained"
                      icon="login"
                      style={styles.loginBtn}
                      labelStyle={{fontWeight: '700', fontSize: 15}}
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading}>
                      Sign In to Account
                    </Button>

                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={loading}
                      onPress={_onGoogleLoginPress}
                      style={styles.googleBtn}>
                      {!loading ? (
                        <>
                          <GoogleLogo width={22} height={22} />
                          <Text style={styles.googleBtnText}>
                            Continue with Google
                          </Text>
                        </>
                      ) : (
                        <ActivityIndicator size="small" color="#4F46E5" />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            </Formik>
          </Surface>
        </VirtualizedScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Login;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  heroBanner: {
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brandBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    fontWeight: '600',
    marginTop: 2,
  },
  formSurface: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: -30,
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
  },
  formGroup: {
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  forgotPasswordBox: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginHorizontal: 10,
    letterSpacing: 0.8,
  },
  googleBtn: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
  },
});
