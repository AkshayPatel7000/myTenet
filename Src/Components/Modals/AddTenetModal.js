import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Icon,
  IconButton,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {DatePickerInput} from 'react-native-paper-dates';
import {Formik, FieldArray} from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import {
  addRoomTenet,
  updateRoomTenet,
} from '../../Services/Collections';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

const AddTenetModal = ({visible, hideModal, editData}) => {
  const {colors, dark} = useTheme();
  const [loading, setLoading] = useState(false);

  const dateNew = () => {
    if (!editData?.startDate) return new Date();
    try {
      const parsed = moment(editData?.startDate, 'DD-MMMM-YYYY');
      return parsed.isValid() ? parsed.toDate() : new Date();
    } catch (e) {
      return new Date();
    }
  };

  const initialValue = {
    name: editData?.name || '',
    phone: editData?.phone || '',
    startDate: dateNew(),
    aadharNo: editData?.aadharNo || '',
    otherMembers: editData?.otherMembers || [],
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Tenant full name is required!'),
    phone: Yup.string()
      .required('Phone number is required!')
      .matches(
        /^(?:(?:\+|0{0,2})|[0]?)?[6789]\d{9}$/,
        'Enter valid 10-digit phone number',
      ),
    startDate: Yup.date().required('Move-in start date is required!'),
    aadharNo: Yup.string().matches(/^\d{12}$/, 'Aadhar must be exactly 12 digits'),
  });

  const _onAddPress = async values => {
    try {
      setLoading(true);
      await addRoomTenet(values, null);
      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ _onAddPress ~ error:', error);
    }
  };

  const _onEditPress = async values => {
    try {
      setLoading(true);
      await updateRoomTenet(values, editData);
      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ _onEditPress ~ error:', error);
    }
  };

  const onSubmit = values => {
    if (editData?.tenantId) {
      _onEditPress(values);
    } else {
      _onAddPress(values);
    }
  };

  const isEditing = !!editData?.tenantId;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.sheetContainer,
          {backgroundColor: colors.surface},
        ]}>
        <View
          style={[
            styles.sheetPill,
            {backgroundColor: colors.outlineVariant || '#CBD5E1'},
          ]}
        />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <Icon
                source={isEditing ? 'account-edit' : 'account-plus'}
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.heading, {color: colors.onSurface}]}>
                {isEditing ? 'Edit Tenant Details' : 'Add New Tenant'}
              </Text>
            </View>
            <IconButton icon="close" onPress={hideModal} size={20} />
          </View>

          <Formik
            initialValues={initialValue}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            enableReinitialize>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              setFieldValue,
            }) => {
              return (
                <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
                  <View style={styles.datePickerContainer}>
                    <DatePickerInput
                      locale="en"
                      hasError={!!errors.startDate}
                      label="Move-In Start Date"
                      value={values.startDate}
                      onChange={d => setFieldValue('startDate', d)}
                      inputMode="start"
                      mode="outlined"
                    />
                    <HelperText type="error" visible={!!errors.startDate}>
                      {errors.startDate}
                    </HelperText>
                  </View>

                  <TextInput
                    label="Tenant Full Name"
                    mode="outlined"
                    left={<TextInput.Icon icon="account-outline" />}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                    error={!!errors.name}
                  />
                  <HelperText type="error" visible={!!errors.name}>
                    {errors.name}
                  </HelperText>

                  <TextInput
                    label="Tenant Phone Number"
                    mode="outlined"
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone-outline" />}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    value={values.phone}
                    error={!!errors.phone}
                  />
                  <HelperText type="error" visible={!!errors.phone}>
                    {errors.phone}
                  </HelperText>

                  <TextInput
                    label="Aadhar Number (12 Digits)"
                    mode="outlined"
                    keyboardType="number-pad"
                    left={<TextInput.Icon icon="card-account-details-outline" />}
                    onChangeText={handleChange('aadharNo')}
                    onBlur={handleBlur('aadharNo')}
                    value={values.aadharNo}
                    error={!!errors.aadharNo}
                  />
                  <HelperText type="error" visible={!!errors.aadharNo}>
                    {errors.aadharNo}
                  </HelperText>

                  {/* Family / Additional Members Section */}
                  <FieldArray
                    name="otherMembers"
                    render={arrayHelpers => (
                      <View style={styles.membersSection}>
                        <View style={styles.membersSectionHeader}>
                          <Text
                            style={[
                              styles.membersSectionTitle,
                              {color: colors.onSurface},
                            ]}>
                            Family / Room Members ({values.otherMembers.length})
                          </Text>
                          <Button
                            mode="tonal"
                            compact
                            icon="plus"
                            onPress={() =>
                              arrayHelpers.push({
                                name: '',
                                phone: '',
                                aadharNo: '',
                              })
                            }>
                            Add Member
                          </Button>
                        </View>

                        {values?.otherMembers.map((member, index) => (
                          <Surface
                            key={index}
                            style={[
                              styles.memberCard,
                              {
                                backgroundColor: dark ? '#334155' : '#F8FAFC',
                                borderColor: colors.outlineVariant || '#E2E8F0',
                              },
                            ]}>
                            <View style={styles.memberHeader}>
                              <Text
                                style={[
                                  styles.memberTitle,
                                  {color: colors.onSurface},
                                ]}>
                                Member #{index + 1}
                              </Text>
                              <IconButton
                                icon="close-circle-outline"
                                iconColor={colors.error}
                                size={20}
                                onPress={() => arrayHelpers.remove(index)}
                              />
                            </View>

                            <TextInput
                              label="Member Full Name"
                              mode="outlined"
                              dense
                              onChangeText={handleChange(
                                `otherMembers[${index}].name`,
                              )}
                              onBlur={handleBlur(
                                `otherMembers[${index}].name`,
                              )}
                              value={member.name}
                              style={styles.memberInput}
                            />

                            <TextInput
                              label="Member Phone Number"
                              mode="outlined"
                              dense
                              keyboardType="phone-pad"
                              onChangeText={handleChange(
                                `otherMembers[${index}].phone`,
                              )}
                              onBlur={handleBlur(
                                `otherMembers[${index}].phone`,
                              )}
                              value={member.phone}
                              style={styles.memberInput}
                            />

                            <TextInput
                              label="Member Aadhar No."
                              mode="outlined"
                              dense
                              keyboardType="number-pad"
                              onChangeText={handleChange(
                                `otherMembers[${index}].aadharNo`,
                              )}
                              onBlur={handleBlur(
                                `otherMembers[${index}].aadharNo`,
                              )}
                              value={member.aadharNo}
                              style={styles.memberInput}
                            />
                          </Surface>
                        ))}
                      </View>
                    )}
                  />

                  <Button
                    mode="contained"
                    icon="content-save-check"
                    style={styles.submitBtn}
                    labelStyle={{fontWeight: '700'}}
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}>
                    {isEditing ? 'Save Tenant Changes' : 'Add Tenant Record'}
                  </Button>
                </KeyboardAwareScrollView>
              );
            }}
          </Formik>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

export default AddTenetModal;

const styles = StyleSheet.create({
  sheetContainer: {
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
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
  },
  datePickerContainer: {
    marginBottom: 6,
  },
  membersSection: {
    marginTop: 12,
    marginBottom: 10,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  membersSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberInput: {
    marginBottom: 8,
  },
  submitBtn: {
    marginTop: 14,
    marginBottom: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
