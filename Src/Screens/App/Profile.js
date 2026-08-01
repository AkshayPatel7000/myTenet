import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import {
  Avatar,
  Button,
  Card,
  HelperText,
  Icon,
  IconButton,
  Surface,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useAppDispatch, useTypedSelector} from '../../Store/MainStore';
import {
  resetAuthSlice,
  selectIsDarkMode,
  selectUserProfile,
  setAuthToken,
  setDarkMode,
} from '../../Store/Slices/AuthSlice';
import {LocalStorage} from '../../Utils/Resource/localStorage';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {updateUser} from '../../Services/Collections';
import MyDialog from '../../Components/Modals/Dialog';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const Profile = () => {
  const {colors} = useTheme();
  const [visible, setVisible] = useState(false);
  const user = useTypedSelector(selectUserProfile);
  const isDarkMode = useTypedSelector(selectIsDarkMode);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required!'),
    phone: Yup.string()
      .required('Phone no. is required!')
      .matches(
        /^(?:(?:\+|0{0,2})|[0]?)?[6789]\d{9}$/,
        'Enter a valid 10-digit phone number',
      ),
    upi: Yup.string().required('UPI address is required!'),
  });

  const Logout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.revokeAccess();
      dispatch(setAuthToken(null));
      dispatch(resetAuthSlice({}));
      LocalStorage.clearLocalStorage();
    } catch (error) {
      dispatch(setAuthToken(null));
      dispatch(resetAuthSlice({}));
      LocalStorage.clearLocalStorage();
    }
  };

  const _onPressSave = async values => {
    try {
      setLoading(true);
      await updateUser(values);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ Profile ~ error:', error);
    }
  };

  const handleToggleTheme = async val => {
    dispatch(setDarkMode(val));
    await LocalStorage.setIsDarkTheme(val);
  };

  const getInitials = (name = '') => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Container>
      <Header
        back={false}
        title="Landlord Profile"
        subtitle="Payment details & account preferences"
      />

      <MyDialog
        visible={visible}
        setVisible={setVisible}
        donePress={Logout}
        title="Log Out"
        body="Are you sure you want to log out of your account?"
        doneTitle="Log Out"
      />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 16, paddingBottom: 150}}>

          {/* User Profile Gradient Header Banner */}
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            useAngle={true}
            angle={135}
            style={styles.profileHeaderCard}>
            <Avatar.Text
              size={64}
              label={getInitials(user?.name)}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.name || 'Landlord User'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || 'No email registered'}
              </Text>
              <View style={styles.badgeTag}>
                <Icon source="shield-check" size={14} color="#10B981" />
                <Text style={styles.badgeText}>Landlord Account</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Explanation Info Banner */}
          <Surface style={styles.infoNoteCard}>
            <Icon source="information-outline" size={22} color="#3B82F6" />
            <Text style={styles.infoNoteText}>
              Your Phone Number and UPI ID are automatically included in tenant bill statements and WhatsApp reminders.
            </Text>
          </Surface>

          {/* Profile Form Card */}
          <Surface style={styles.formCard}>
            <Text style={styles.sectionTitle}>Landlord Details</Text>

            <Formik
              onSubmit={_onPressSave}
              initialValues={{
                name: user?.name || '',
                phone: user?.phone || '',
                upi: user?.upi || '',
              }}
              validationSchema={validationSchema}
              enableReinitialize>
              {({handleChange, handleBlur, values, errors, handleSubmit}) => {
                return (
                  <View style={{marginTop: 10}}>
                    <TextInput
                      label="Full Name"
                      mode="outlined"
                      left={<TextInput.Icon icon="account-outline" />}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      value={values.name}
                      error={!!errors.name}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.name}>
                      {errors.name}
                    </HelperText>

                    <TextInput
                      label="Contact Phone Number"
                      mode="outlined"
                      keyboardType="number-pad"
                      left={<TextInput.Icon icon="phone-outline" />}
                      onChangeText={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                      value={values.phone}
                      error={!!errors.phone}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.phone}>
                      {errors.phone}
                    </HelperText>

                    <TextInput
                      label="UPI ID / Payment Address"
                      mode="outlined"
                      keyboardType="email-address"
                      left={<TextInput.Icon icon="qrcode-scan" />}
                      placeholder="e.g. mobile@paytm or landlord@upi"
                      onChangeText={handleChange('upi')}
                      onBlur={handleBlur('upi')}
                      value={values.upi}
                      error={!!errors.upi}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!errors.upi}>
                      {errors.upi}
                    </HelperText>

                    <Button
                      onPress={handleSubmit}
                      mode="contained"
                      icon="content-save-check"
                      style={styles.saveBtn}
                      labelStyle={{fontWeight: '700'}}
                      disabled={loading}
                      loading={loading}>
                      Save Changes
                    </Button>
                  </View>
                );
              }}
            </Formik>
          </Surface>

          {/* App Appearance & Theme Switcher */}
          <Surface style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>App Appearance</Text>
            <View style={styles.settingRow}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon
                  source={isDarkMode ? 'weather-night' : 'white-balance-sunny'}
                  size={22}
                  color={colors.primary}
                />
                <Text style={styles.settingText}>
                  {isDarkMode ? 'Dark Theme Mode' : 'Light Theme Mode'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                color={colors.primary}
              />
            </View>
          </Surface>

          {/* Account Settings & App Info */}
          <Surface style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>App Details</Text>
            <View style={styles.settingRow}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon source="cellphone-cog" size={20} color="#64748B" />
                <Text style={styles.settingText}>Application Version</Text>
              </View>
              <Text style={styles.settingValue}>v1.0.0</Text>
            </View>
            <View style={styles.settingRow}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon source="cloud-check-outline" size={20} color="#64748B" />
                <Text style={styles.settingText}>Cloud Backup</Text>
              </View>
              <Text style={styles.settingValueActive}>Connected</Text>
            </View>
          </Surface>

          {/* Log Out Button */}
          <Button
            mode="outlined"
            icon="logout"
            textColor={colors.error}
            style={[styles.logoutBtn, {borderColor: colors.error}]}
            onPress={() => setVisible(true)}>
            Log Out Account
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Profile;

const styles = StyleSheet.create({
  profileHeaderCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  avatar: {
    backgroundColor: '#EEF2FF',
  },
  avatarLabel: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 24,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    color: '#E0E7FF',
    fontSize: 13,
    marginTop: 2,
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  infoNoteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoNoteText: {
    color: '#1E40AF',
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  formCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 4,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  settingValueActive: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
  logoutBtn: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
});
