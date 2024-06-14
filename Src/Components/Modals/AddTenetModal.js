import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {
  Button,
  HelperText,
  IconButton,
  Modal,
  Portal,
  TextInput,
} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {
  addRoomTenet,
  addUserRoom,
  updateUserRoom,
} from '../../Services/Collections';
import DatePiker from './DatePiker';
import {DatePickerInput} from 'react-native-paper-dates';

const AddTenetModal = ({visible, hideModal, editData}) => {
  const [loading, setLoading] = useState(false);
  const initialValue = {
    name: editData?.name || '',
    phone: editData?.phone || '',
    startDate: editData?.startDate || '',
    aadharNo: editData?.aadharNo || '',
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Tenet name amount is required!'),
    phone: Yup.string().required('Tenet phone amount is required!'),
    startDate: Yup.string().required('Tenet start date is required!'),
    aadharNo: Yup.string(),
  });

  const _onAddPress = async values => {
    try {
      setLoading(true);
      const response = await addRoomTenet(values, null);
      setLoading(false);

      hideModal();
    } catch (error) {
      setLoading(false);

      console.log('🚀 ~ _onAddPress=async ~ error:', error);
    }
  };
  const _onEditPress = async values => {
    try {
      setLoading(true);
      const response = await updateUserRoom(values);
      console.log('🚀 ~ _onEditPress ~ response:', response);
      setLoading(false);

      hideModal();
    } catch (error) {
      setLoading(false);

      console.log('🚀 ~ _onEditPress=async ~ error:', error);
    }
  };
  const onSubmit = values => {
    if (editData?.roomId) {
      _onEditPress(values);
    } else {
      _onAddPress(values);
    }
  };
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.containerStyle}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>
            {editData?.roomId ? 'Edit Tenet' : 'Add new tenet'}
          </Text>
          <IconButton icon="close" onPress={hideModal} size={20} />
        </View>

        <View>
          <Formik
            initialValues={initialValue}
            onSubmit={onSubmit}
            validationSchema={validationSchema}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              setFieldValue,
            }) => {
              return (
                <View>
                  <View style={{marginTop: 10}}>
                    <DatePickerInput
                      hasError={!!errors.startDate}
                      label="Start Date"
                      value={values.startDate}
                      onChange={e => setFieldValue('startDate', e)}
                      inputMode="start"
                    />
                    <HelperText
                      type="error"
                      visible={!!errors.startDate}
                      style={{marginTop: 30}}>
                      {errors.startDate}
                    </HelperText>
                  </View>
                  <TextInput
                    label={'Tenet Name'}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                    error={!!errors.name}
                    errorText={errors.name}
                    autoCapitalize="none"
                  />
                  <HelperText type="error" visible={!!errors.name}>
                    {errors.name}
                  </HelperText>
                  <TextInput
                    label={'Tenet Phone'}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    value={values.phone}
                    error={!!errors.phone}
                    errorText={errors.phone}
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                  />
                  <HelperText type="error" visible={!!errors.phone}>
                    {errors.phone}
                  </HelperText>

                  <TextInput
                    label={'Aadhar No.'}
                    onChangeText={handleChange('aadharNo')}
                    onBlur={handleBlur('aadharNo')}
                    value={values.aadharNo}
                    error={!!errors.aadharNo}
                    errorText={errors.aadharNo}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <HelperText type="error" visible={!!errors.aadharNo}>
                    {errors.aadharNo}
                  </HelperText>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}>
                    {editData?.roomId ? 'Save Tenet' : 'Add Tenet'}
                  </Button>
                </View>
              );
            }}
          </Formik>
        </View>
      </Modal>
    </Portal>
  );
};

export default AddTenetModal;

const styles = StyleSheet.create({
  containerStyle: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderRadius: 8,
  },
  heading: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
});
