import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Icon,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

const UnifiedQuickSetupModal = ({visible, hideModal}) => {

  const {colors} = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    roomName: '',
    roomNo: '',
    rent: '',
    advance: '0',
    perUnit: '10',
    startReading: '0',
    tenantName: '',
    tenantPhone: '',
    aadharNo: '',
  };

  const validationSchemaStep1 = Yup.object().shape({
    roomName: Yup.string().required('Room/Property name is required!'),
    roomNo: Yup.string().required('Room No. is required!'),
    rent: Yup.string().required('Monthly rent amount is required!'),
  });

  const validationSchemaStep2 = Yup.object().shape({
    tenantName: Yup.string().required('Tenant name is required!'),
    tenantPhone: Yup.string()
      .required('Phone number is required!')
      .matches(
        /^(?:(?:\+|0{0,2})|[0]?)?[6789]\d{9}$/,
        'Enter valid 10-digit phone number',
      ),
  });

  const validationSchemaStep3 = Yup.object().shape({
    startReading: Yup.string().required('Initial meter reading is required!'),
    perUnit: Yup.string().required('Per unit rate is required!'),
  });

  const handleClose = () => {
    setStep(1);
    hideModal();
  };

  const _onSubmitAll = async values => {
    try {
      setLoading(true);
      const success = await addUnifiedPropertyAndTenant(values);
      setLoading(false);
      if (success) {
        handleClose();
      }
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ UnifiedQuickSetupModal error:', error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.sheetContainer}>
        <View style={styles.sheetPill} />

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <Icon source="flash" size={24} color={colors.primary} />
              <View style={{marginLeft: 8}}>
                <Text style={styles.heading}>Quick Property Setup</Text>
                <Text style={styles.subHeading}>Step {step} of 3</Text>
              </View>
            </View>
            <IconButton icon="close" onPress={handleClose} size={22} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <Formik
            initialValues={initialValues}
            onSubmit={_onSubmitAll}
            validationSchema={
              step === 1
                ? validationSchemaStep1
                : step === 2
                ? validationSchemaStep2
                : validationSchemaStep3
            }>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              validateForm,
            }) => {
              const handleNext = async () => {
                const formErrors = await validateForm();
                if (step === 1) {
                  if (!formErrors.roomName && !formErrors.roomNo && !formErrors.rent) {
                    setStep(2);
                  }
                } else if (step === 2) {
                  if (!formErrors.tenantName && !formErrors.tenantPhone) {
                    setStep(3);
                  }
                }
              };

              return (
                <KeyboardAwareScrollView
                  contentContainerStyle={styles.scrollContent}>
                  {step === 1 && (
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Icon source="home-city" size={20} color={colors.primary} />
                        <Text style={styles.stepTitle}>Step 1: Room & Rent Details</Text>
                      </View>

                      <TextInput
                        label="Room Name (e.g. Room 101 / Flat A)"
                        mode="outlined"
                        onChangeText={handleChange('roomName')}
                        onBlur={handleBlur('roomName')}
                        value={values.roomName}
                        error={!!errors.roomName}
                        style={styles.input}
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
                            onChangeText={handleChange('roomNo')}
                            onBlur={handleBlur('roomNo')}
                            value={values.roomNo}
                            error={!!errors.roomNo}
                            style={styles.input}
                          />
                          <HelperText type="error" visible={!!errors.roomNo}>
                            {errors.roomNo}
                          </HelperText>
                        </View>
                        <View style={{flex: 1.5}}>
                          <TextInput
                            label="Monthly Rent (₹)"
                            mode="outlined"
                            keyboardType="number-pad"
                            onChangeText={handleChange('rent')}
                            onBlur={handleBlur('rent')}
                            value={values.rent}
                            error={!!errors.rent}
                            style={styles.input}
                          />
                          <HelperText type="error" visible={!!errors.rent}>
                            {errors.rent}
                          </HelperText>
                        </View>
                      </View>

                      <TextInput
                        label="Advance Deposit (₹) (Optional)"
                        mode="outlined"
                        keyboardType="number-pad"
                        onChangeText={handleChange('advance')}
                        onBlur={handleBlur('advance')}
                        value={values.advance}
                        style={styles.input}
                      />

                      <Button
                        mode="contained"
                        icon="arrow-right"
                        contentStyle={{flexDirection: 'row-reverse'}}
                        style={styles.actionBtn}
                        onPress={handleNext}>
                        Next: Add Tenant
                      </Button>
                    </View>
                  )}

                  {step === 2 && (
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Icon source="account-plus" size={20} color={colors.primary} />
                        <Text style={styles.stepTitle}>Step 2: Tenant Details</Text>
                      </View>

                      <TextInput
                        label="Tenant Full Name"
                        mode="outlined"
                        onChangeText={handleChange('tenantName')}
                        onBlur={handleBlur('tenantName')}
                        value={values.tenantName}
                        error={!!errors.tenantName}
                        style={styles.input}
                      />
                      <HelperText type="error" visible={!!errors.tenantName}>
                        {errors.tenantName}
                      </HelperText>

                      <TextInput
                        label="Tenant Mobile Number"
                        mode="outlined"
                        keyboardType="number-pad"
                        onChangeText={handleChange('tenantPhone')}
                        onBlur={handleBlur('tenantPhone')}
                        value={values.tenantPhone}
                        error={!!errors.tenantPhone}
                        style={styles.input}
                      />
                      <HelperText type="error" visible={!!errors.tenantPhone}>
                        {errors.tenantPhone}
                      </HelperText>

                      <TextInput
                        label="Aadhar Number (Optional)"
                        mode="outlined"
                        keyboardType="number-pad"
                        onChangeText={handleChange('aadharNo')}
                        onBlur={handleBlur('aadharNo')}
                        value={values.aadharNo}
                        style={styles.input}
                      />

                      <View style={styles.btnRow}>
                        <Button
                          mode="outlined"
                          icon="arrow-left"
                          style={{flex: 1, marginRight: 10}}
                          onPress={() => setStep(1)}>
                          Back
                        </Button>
                        <Button
                          mode="contained"
                          icon="arrow-right"
                          contentStyle={{flexDirection: 'row-reverse'}}
                          style={{flex: 1.5}}
                          onPress={handleNext}>
                          Next: Meter
                        </Button>
                      </View>
                    </View>
                  )}

                  {step === 3 && (
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Icon source="lightning-bolt" size={20} color={colors.primary} />
                        <Text style={styles.stepTitle}>Step 3: Initial Meter Reading</Text>
                      </View>

                      <TextInput
                        label="Current Meter Starting Reading"
                        mode="outlined"
                        keyboardType="number-pad"
                        onChangeText={handleChange('startReading')}
                        onBlur={handleBlur('startReading')}
                        value={values.startReading}
                        error={!!errors.startReading}
                        style={styles.input}
                      />
                      <HelperText type="error" visible={!!errors.startReading}>
                        {errors.startReading}
                      </HelperText>

                      <TextInput
                        label="Electricity Rate per Unit (₹)"
                        mode="outlined"
                        keyboardType="number-pad"
                        onChangeText={handleChange('perUnit')}
                        onBlur={handleBlur('perUnit')}
                        value={values.perUnit}
                        error={!!errors.perUnit}
                        style={styles.input}
                      />
                      <HelperText type="error" visible={!!errors.perUnit}>
                        {errors.perUnit}
                      </HelperText>

                      <View style={styles.btnRow}>
                        <Button
                          mode="outlined"
                          icon="arrow-left"
                          style={{flex: 1, marginRight: 10}}
                          onPress={() => setStep(2)}>
                          Back
                        </Button>
                        <Button
                          mode="contained"
                          icon="check-circle"
                          style={{flex: 1.5}}
                          loading={loading}
                          disabled={loading}
                          onPress={handleSubmit}>
                          Finish Setup
                        </Button>
                      </View>
                    </View>
                  )}
                </KeyboardAwareScrollView>

              );
            }}
          </Formik>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

export default UnifiedQuickSetupModal;

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
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  subHeading: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
  },
  stepContent: {
    paddingVertical: 5,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 10,
  },
  actionBtn: {
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 8,
    paddingVertical: 4,
  },
});
