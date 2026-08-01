import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {
  Button,
  HelperText,
  Icon,
  IconButton,
  Modal,
  Portal,
  TextInput,
  Text,
  useTheme,
} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {addUserRoom, updateUserRoom} from '../../Services/Collections';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

const AddRoomModal = ({visible, hideModal, editData}) => {
  const {colors} = useTheme();
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
    roomNo: Yup.string().required('Room No. is required!'),
    rent: Yup.string().required('Room rent is required!'),
    advance: Yup.string().required('Advance amount is required!'),
    perUnit: Yup.string().required('Per unit rate is required!'),
    startReading: Yup.string().required('Start reading is required!'),
  });

  const _onAddRoomPress = async values => {
    try {
      setLoading(true);
      await addUserRoom(values);
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
      await updateUserRoom(values);
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

  const isEditing = !!editData?.roomId;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.sheetContainer}>
        <View style={styles.sheetPill} />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <Icon source={isEditing ? 'home-edit' : 'home-plus'} size={24} color={colors.primary} />
              <Text style={styles.heading}>
                {isEditing ? 'Edit Room Settings' : 'Add New Room'}
              </Text>
            </View>
            <IconButton icon="close" onPress={hideModal} size={20} />
          </View>

          <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
            <Formik
              initialValues={initialValue}
              onSubmit={onSubmit}
              validationSchema={validationSchema}
              enableReinitialize>
              {({handleChange, handleBlur, handleSubmit, values, errors}) => {
                return (
                  <View style={{marginTop: 6}}>
                    <TextInput
                      label="Room Name (e.g. Room 101 / Flat A)"
                      mode="outlined"
                      left={<TextInput.Icon icon="home-city-outline" />}
                      onChangeText={handleChange('roomName')}
                      onBlur={handleBlur('roomName')}
                      value={values.roomName}
                      error={!!errors.roomName}
                    />
                    <HelperText type="error" visible={!!errors.roomName}>
                      {errors.roomName}
                    </HelperText>

                    <View style={styles.row}>
                      <View style={{flex: 1, marginRight: 8}}>
                        <TextInput
                          label="Room No."
                          mode="outlined"
                          keyboardType="number-pad"
                          left={<TextInput.Icon icon="pound" />}
                          onChangeText={handleChange('roomNo')}
                          onBlur={handleBlur('roomNo')}
                          value={values.roomNo}
                          error={!!errors.roomNo}
                        />
                        <HelperText type="error" visible={!!errors.roomNo}>
                          {errors.roomNo}
                        </HelperText>
                      </View>

                      <View style={{flex: 1.4}}>
                        <TextInput
                          label="Monthly Rent (₹)"
                          mode="outlined"
                          keyboardType="number-pad"
                          left={<TextInput.Icon icon="currency-inr" />}
                          onChangeText={handleChange('rent')}
                          onBlur={handleBlur('rent')}
                          value={values.rent}
                          error={!!errors.rent}
                        />
                        <HelperText type="error" visible={!!errors.rent}>
                          {errors.rent}
                        </HelperText>
                      </View>
                    </View>

                    <TextInput
                      label="Advance Deposit (₹)"
                      mode="outlined"
                      keyboardType="number-pad"
                      left={<TextInput.Icon icon="cash-multiple" />}
                      onChangeText={handleChange('advance')}
                      onBlur={handleBlur('advance')}
                      value={values.advance}
                      error={!!errors.advance}
                    />
                    <HelperText type="error" visible={!!errors.advance}>
                      {errors.advance}
                    </HelperText>

                    <View style={styles.row}>
                      <View style={{flex: 1, marginRight: 8}}>
                        <TextInput
                          label="Rate / Unit (₹)"
                          mode="outlined"
                          keyboardType="number-pad"
                          left={<TextInput.Icon icon="lightning-bolt-outline" />}
                          onChangeText={handleChange('perUnit')}
                          onBlur={handleBlur('perUnit')}
                          value={values.perUnit}
                          error={!!errors.perUnit}
                        />
                        <HelperText type="error" visible={!!errors.perUnit}>
                          {errors.perUnit}
                        </HelperText>
                      </View>

                      <View style={{flex: 1.4}}>
                        <TextInput
                          label="Start Meter Reading"
                          mode="outlined"
                          keyboardType="number-pad"
                          left={<TextInput.Icon icon="counter" />}
                          onChangeText={handleChange('startReading')}
                          onBlur={handleBlur('startReading')}
                          value={values.startReading}
                          error={!!errors.startReading}
                        />
                        <HelperText type="error" visible={!!errors.startReading}>
                          {errors.startReading}
                        </HelperText>
                      </View>
                    </View>

                    <Button
                      mode="contained"
                      icon="content-save-check"
                      onPress={handleSubmit}
                      style={styles.submitBtn}
                      labelStyle={{fontWeight: '700'}}
                      loading={loading}
                      disabled={loading}>
                      {isEditing ? 'Save Room Settings' : 'Create Room'}
                    </Button>
                  </View>
                );
              }}
            </Formik>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

export default AddRoomModal;

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
  },
  sheetPill: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: 14,
    marginBottom: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
