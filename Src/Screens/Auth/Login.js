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
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import GoogleLogo from '../../Assets/SVG/google-icon.svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '515928874687-irhbrofvs1bpgmrcd3hpuu510c3epr6f.apps.googleusercontent.com',
});

const Login = ({navigation}) => {
  const {colors, dark} = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const safeAreaInsets = useSafeAreaInsets();

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
      } else if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
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

  const topPadding = safeAreaInsets.top > 0 ? safeAreaInsets.top + 20 : 40;

  return (
    <Container statusContent="light-content">
      <LinearGradient
        colors={
          dark
            ? ['#0F172A', '#1E1B4B', '#0F172A']
            : ['#3730A3', '#4F46E5', '#6366F1']
        }
        useAngle={true}
        angle={145}
        style={styles.fullGradientBackground}>
        {/* Ambient Glow Circles */}
        <View style={styles.ambientGlowTop} />
        <View style={styles.ambientGlowBottom} />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <KeyboardAwareScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {paddingTop: topPadding},
            ]}>
            {/* Brand Header */}
            <View style={styles.brandContainer}>
              <View style={styles.brandBadgeCircle}>
                <Icon source="home-city" size={34} color="#818CF8" />
              </View>
              <Text style={styles.brandTitle}>My Rooms</Text>
              <Text style={styles.brandSubtitle}>
                Smart Rental Property & Utility Manager
              </Text>
            </View>

            {/* Main Form Card Surface */}
            <Surface
              style={[
                styles.formCardSurface,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    colors.outlineVariant || (dark ? '#334155' : '#E2E8F0'),
                },
              ]}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconBox}>
                  <Icon
                    source="lock-open-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={{marginLeft: 10}}>
                  <Text style={[styles.cardTitle, {color: colors.onSurface}]}>
                    Welcome Back
                  </Text>
                  <Text
                    style={[
                      styles.cardSubTitle,
                      {color: colors.onSurfaceVariant},
                    ]}>
                    Sign in to access your property dashboard
                  </Text>
                </View>
              </View>

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
                        style={styles.forgotPasswordBtn}
                        onPress={() =>
                          navigation.navigate('ForgotPasswordScreen')
                        }>
                        <Text
                          style={[
                            styles.forgotPasswordText,
                            {color: colors.primary},
                          ]}>
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>

                      <Button
                        mode="contained"
                        icon="arrow-right"
                        contentStyle={{flexDirection: 'row-reverse'}}
                        style={styles.loginBtn}
                        labelStyle={styles.loginBtnLabel}
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}>
                        Sign In to Account
                      </Button>

                      <View style={styles.dividerRow}>
                        <View
                          style={[
                            styles.dividerLine,
                            {
                              backgroundColor:
                                colors.outlineVariant || '#E2E8F0',
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.dividerText,
                            {color: colors.onSurfaceVariant},
                          ]}>
                          OR CONTINUE WITH
                        </Text>
                        <View
                          style={[
                            styles.dividerLine,
                            {
                              backgroundColor:
                                colors.outlineVariant || '#E2E8F0',
                            },
                          ]}
                        />
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={loading}
                        onPress={_onGoogleLoginPress}
                        style={[
                          styles.googleBtn,
                          {
                            backgroundColor: dark ? '#334155' : '#F8FAFC',
                            borderColor: colors.outlineVariant || '#E2E8F0',
                          },
                        ]}>
                        {!loading ? (
                          <>
                            <GoogleLogo width={22} height={22} />
                            <Text
                              style={[
                                styles.googleBtnText,
                                {color: colors.onSurface},
                              ]}>
                              Sign in with Google
                            </Text>
                          </>
                        ) : (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                }}
              </Formik>
            </Surface>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Container>
  );
};

export default Login;

const styles = StyleSheet.create({
  fullGradientBackground: {
    flex: 1,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandBadgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  formCardSurface: {
    borderRadius: 24,
    padding: 22,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  formGroup: {
    marginTop: 4,
  },
  input: {
    backgroundColor: 'transparent',
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    borderRadius: 14,
    paddingVertical: 4,
    marginBottom: 16,
    elevation: 3,
  },
  loginBtnLabel: {
    fontWeight: '800',
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 10,
    letterSpacing: 0.8,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
});
