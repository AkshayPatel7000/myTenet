import {StyleSheet, ScrollView, View} from 'react-native';
import React, {useState} from 'react';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import {useAppDispatch, useTypedSelector} from '../../Store/MainStore';
import {
  resetAuthSlice,
  selectUserProfile,
  setAuthToken,
} from '../../Store/Slices/AuthSlice';
import {LocalStorage} from '../../Utils/Resource/localStorage';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {updateUser} from '../../Services/Collections';
import MyDialog from '../../Components/Modals/Dialog';
const Profile = () => {
  const [visible, setVisible] = useState(false);
  const user = useTypedSelector(selectUserProfile);
  console.log('🚀 ~ Profile ~ user:', user);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required!'),
    phone: Yup.string()
      .required('Phone no. is required!')
      .matches(
        /^(?:(?:\+|0{0,2})|[0]?)?[6789]\d{9}$/,
        'Enter a valid phone no.',
      ),
    upi: Yup.string().required('UPI address is required!'),
  });
  const Logout = () => {
    // setVisible(true);
    dispatch(setAuthToken(null));
    dispatch(resetAuthSlice({}));

    LocalStorage.clearLocalStorage();
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

  return (
    <Container>
      <Header
        title="Profile"
        back={false}
        right={'logout-variant'}
        rightIconPress={() => setVisible(true)}
      />
      <MyDialog
        visible={visible}
        setVisible={setVisible}
        donePress={Logout}
        title={'Log Out'}
        body={'Are you sure, you want to log out?'}
        doneTitle="Yes"
      />
      <ScrollView contentContainerStyle={{padding: 18}}>
        <Text style={{marginVertical: 20, fontSize: 16, fontWeight: '500'}}>
          Update Profile
        </Text>
        <Formik
          onSubmit={v => _onPressSave(v)}
          initialValues={{
            name: user?.name || '',
            phone: user?.phone || '',
            upi: user?.upi || '',
          }}
          validationSchema={validationSchema}>
          {({handleChange, handleBlur, values, errors, handleSubmit}) => {
            return (
              <View>
                <TextInput
                  label={'Name'}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  error={!!errors.name}
                  errorText={errors.name}
                  autoCapitalize="words"
                />
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>
                <TextInput
                  label={'Phone no.'}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                  error={!!errors.phone}
                  errorText={errors.phone}
                  autoCapitalize="none"
                  keyboardType="number-pad"
                />
                <HelperText type="error" visible={!!errors.phone}>
                  {errors.phone}
                </HelperText>
                <TextInput
                  label={'UPI address'}
                  onChangeText={handleChange('upi')}
                  onBlur={handleBlur('upi')}
                  value={values.upi}
                  error={!!errors.upi}
                  errorText={errors.upi}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <HelperText type="error" visible={!!errors.upi}>
                  {errors.upi}
                </HelperText>
                <Button
                  onPress={handleSubmit}
                  mode="contained"
                  style={{marginVertical: 40}}
                  disabled={loading}
                  loading={loading}>
                  Save
                </Button>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </Container>
  );
};

export default Profile;

const styles = StyleSheet.create({});
