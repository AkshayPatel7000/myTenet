import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {
  Button,
  HelperText,
  IconButton,
  Modal,
  Portal,
  TextInput,
  Text,
} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {addUserRoom, updateUserRoom} from '../../Services/Collections';

const AddRoomModal = ({visible, hideModal, editData}) => {
  const [loading, setLoading] = useState(false);
  const initialValue = {
    roomName: editData?.roomName || '',
    roomNo: editData?.roomNo || '',
    rent: editData?.rent || '',
    advance: editData?.advance || '',
    perUnit: editData?.perUnit || '',
    startReading: editData?.startReading || '',
  };

  const validationSchema = Yup.object().shape({
    roomName: Yup.string().required('Room name is required!'),
    roomNo: Yup.string().required('Room No is required!'),
    rent: Yup.string().required('Room rent is required!'),
    advance: Yup.string().required('Advance amount is required!'),
    perUnit: Yup.string().required('Unit is required!'),
    startReading: Yup.string().required('Start reading is required!'),
  });

  const _onAddRoomPress = async values => {
    try {
      setLoading(true);
      const response = await addUserRoom(values);
      console.log('🚀 ~ AddRoomModal ~ response:', response);
      setLoading(false);

      hideModal();
    } catch (error) {
      setLoading(false);

      console.log('🚀 ~ const_onAddRoomPress=async ~ error:', error);
    }
  };
  const _onEditPress = async values => {
    try {
      setLoading(true);
      const response = await updateUserRoom(values);
      console.log('🚀 ~ AddRoomModal ~ response:', response);
      setLoading(false);

      hideModal();
    } catch (error) {
      setLoading(false);

      console.log('🚀 ~ const_onAddRoomPress=async ~ error:', error);
    }
  };
  const onSubmit = values => {
    if (editData?.roomId) {
      _onEditPress(values);
    } else {
      _onAddRoomPress(values);
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
            {editData?.roomId ? 'Edit room' : 'Add new room'}
          </Text>
          <IconButton icon="close" onPress={hideModal} size={20} />
        </View>

        <ScrollView>
          <Formik
            initialValues={initialValue}
            onSubmit={onSubmit}
            validationSchema={validationSchema}>
            {({handleChange, handleBlur, handleSubmit, values, errors}) => {
              return (
                <View>
                  <TextInput
                    label={'Room Name'}
                    onChangeText={handleChange('roomName')}
                    onBlur={handleBlur('roomName')}
                    value={values.roomName}
                    error={!!errors.roomName}
                    errorText={errors.roomName}
                    autoCapitalize="none"
                  />
                  <HelperText type="error" visible={!!errors.roomName}>
                    {errors.roomName}
                  </HelperText>
                  <TextInput
                    label={'Room No.'}
                    onChangeText={handleChange('roomNo')}
                    onBlur={handleBlur('roomNo')}
                    value={values.roomNo}
                    error={!!errors.roomNo}
                    errorText={errors.roomNo}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <HelperText type="error" visible={!!errors.roomNo}>
                    {errors.roomNo}
                  </HelperText>
                  <TextInput
                    label={'Rent'}
                    onChangeText={handleChange('rent')}
                    onBlur={handleBlur('rent')}
                    value={values.rent}
                    error={!!errors.rent}
                    errorText={errors.rent}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <HelperText type="error" visible={!!errors.rent}>
                    {errors.rent}
                  </HelperText>
                  <TextInput
                    label={'Advance Amount'}
                    onChangeText={handleChange('advance')}
                    onBlur={handleBlur('advance')}
                    value={values.advance}
                    error={!!errors.advance}
                    errorText={errors.advance}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <HelperText type="error" visible={!!errors.advance}>
                    {errors.advance}
                  </HelperText>
                  <TextInput
                    label={'Unit'}
                    onChangeText={handleChange('perUnit')}
                    onBlur={handleBlur('perUnit')}
                    value={values.perUnit}
                    error={!!errors.perUnit}
                    errorText={errors.perUnit}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <HelperText type="error" visible={!!errors.perUnit}>
                    {errors.perUnit}
                  </HelperText>
                  <TextInput
                    label={'Start Reading'}
                    onChangeText={handleChange('startReading')}
                    onBlur={handleBlur('startReading')}
                    value={values.startReading}
                    error={!!errors.startReading}
                    errorText={errors.startReading}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <HelperText type="error" visible={!!errors.startReading}>
                    {errors.startReading}
                  </HelperText>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}>
                    {editData?.roomId ? 'Save Room' : 'Add Room'}
                  </Button>
                </View>
              );
            }}
          </Formik>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default AddRoomModal;

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
    marginBottom: 10,
    alignItems: 'center',
  },
});
