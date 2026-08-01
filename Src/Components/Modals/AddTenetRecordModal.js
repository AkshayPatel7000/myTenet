import {Formik} from 'formik';
import React, {useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
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
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-crop-picker';
import {
  addUserRoomsTenantsRecord,
} from '../../Services/Collections';
import {
  uploadImageToCloudinary,
  PLACEHOLDER_IMAGE_URL,
} from '../../Utils/cloudinaryHelper';
import {useTypedSelector} from '../../Store/MainStore';
import {selectSelectedRoom} from '../../Store/Slices/AuthSlice';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

const AddTenetRecordModal = ({visible, hideModal, editData}) => {
  const [loading, setLoading] = useState(false);
  const {colors, dark} = useTheme();
  const room = useTypedSelector(selectSelectedRoom);

  const initialValue = {
    image: '',
    newReading: '',
    isPaid: false,
    note: '',
  };

  const validationSchema = Yup.object().shape({
    newReading: Yup.number()
      .min(
        Number(room?.startReading || 0),
        `New reading must be greater than starting reading (${room?.startReading || 0})`,
      )
      .required('New meter reading is required!'),
    image: Yup.string(),
    note: Yup.string(),
    isPaid: Yup.bool(),
  });

  const _onAddPress = async values => {
    try {
      setLoading(true);
      let url = '';
      if (!values.image) {
        url = PLACEHOLDER_IMAGE_URL;
      } else {
        url = await uploadAndReturnCloudinaryLink(values.image);
      }

      await addUserRoomsTenantsRecord({...values, url});
      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ _onAddPress=async ~ error:', error);
    }
  };

  const openCamera = setFieldValue => {
    ImagePicker.openCamera({
      width: 600,
      height: 400,
      cropping: true,
      compressImageQuality: 0.5,
    })
      .then(image => {
        setFieldValue('image', image?.path);
      })
      .catch(err => {
        console.log('🚀 ~ openCamera ~ err:', err);
      });
  };

  const requestCameraPermission = async setFieldValue => {
    if (Platform.OS === 'ios') {
      openCamera(setFieldValue);
      return;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'App needs access to camera to snap meter reading photos.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        openCamera(setFieldValue);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const uploadAndReturnCloudinaryLink = async imageData => {
    try {
      const url = await uploadImageToCloudinary(imageData);
      return url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

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

        <View style={{flex: 1}}>
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <Icon source="counter" size={24} color={colors.primary} />
              <Text style={[styles.heading, {color: colors.onSurface}]}>
                {editData?.recordId ? 'Edit Meter Reading' : 'Log Meter Reading'}
              </Text>
            </View>
            <IconButton icon="close" onPress={hideModal} size={20} />
          </View>

          <Formik
            initialValues={initialValue}
            onSubmit={_onAddPress}
            validationSchema={validationSchema}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              setFieldValue,
            }) => {
              const previousReading = Number(room?.startReading || 0);
              const newReadingVal = Number(values.newReading || 0);
              const unitsBurned = Math.max(0, newReadingVal - previousReading);
              const ratePerUnit = Number(room?.perUnit || 10);
              const electricityBill = unitsBurned * ratePerUnit;
              const totalMonthDues = electricityBill + Number(room?.rent || 0);

              return (
                <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
                  {/* Camera Photo Picker */}
                  <View
                    style={[
                      styles.imagePickerWrapper,
                      {
                        backgroundColor: dark ? '#334155' : '#F8FAFC',
                        borderColor: colors.outlineVariant || '#E2E8F0',
                      },
                    ]}>
                    {values?.image ? (
                      <View style={styles.imageBox}>
                        <Image
                          source={{uri: values?.image}}
                          style={styles.image}
                        />
                        <IconButton
                          icon="close-circle"
                          iconColor="#FFF"
                          mode="contained"
                          containerColor="rgba(0,0,0,0.6)"
                          style={styles.removeImgBtn}
                          onPress={() => setFieldValue('image', '')}
                        />
                      </View>
                    ) : (
                      <TouchableRipple
                        style={styles.pressContainer}
                        onPress={() => requestCameraPermission(setFieldValue)}>
                        <View style={styles.photoPromptContainer}>
                          <Icon
                            source="camera-plus-outline"
                            size={36}
                            color={colors.primary}
                          />
                          <Text style={[styles.addImageText, {color: colors.onSurfaceVariant}]}>
                            Snap Meter Reading Photo (Optional)
                          </Text>
                        </View>
                      </TouchableRipple>
                    )}
                  </View>

                  <TextInput
                    label="Current Meter Reading"
                    mode="outlined"
                    keyboardType="number-pad"
                    left={<TextInput.Icon icon="counter" />}
                    onChangeText={handleChange('newReading')}
                    onBlur={handleBlur('newReading')}
                    value={values.newReading}
                    error={!!errors.newReading}
                  />
                  <HelperText type="error" visible={!!errors.newReading}>
                    {errors.newReading}
                  </HelperText>

                  {/* Live Calculation Preview Box */}
                  <Surface
                    style={[
                      styles.calcPreviewBox,
                      {
                        backgroundColor: dark ? '#334155' : '#F8FAFC',
                        borderColor: colors.outlineVariant || '#E2E8F0',
                      },
                    ]}>
                    <Text style={[styles.calcBoxTitle, {color: colors.onSurface}]}>
                      Bill Computation Preview
                    </Text>
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, {color: colors.onSurfaceVariant}]}>Previous Reading</Text>
                      <Text style={[styles.calcValue, {color: colors.onSurface}]}>{previousReading}</Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, {color: colors.onSurfaceVariant}]}>New Reading</Text>
                      <Text style={[styles.calcValue, {color: colors.onSurface}]}>{newReadingVal || '-'}</Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, {color: colors.onSurfaceVariant}]}>Units Consumed</Text>
                      <Text style={[styles.calcValue, {color: colors.primary}]}>
                        {unitsBurned} units
                      </Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, {color: colors.onSurfaceVariant}]}>Electricity Dues (₹{ratePerUnit}/unit)</Text>
                      <Text style={[styles.calcValue, {color: colors.onSurface}]}>₹ {electricityBill}</Text>
                    </View>
                    <View style={[styles.calcDivider, {backgroundColor: colors.outlineVariant || '#CBD5E1'}]} />
                    <View style={styles.totalDuesRow}>
                      <Text style={[styles.totalDuesLabel, {color: colors.onSurface}]}>Total Dues (+ Rent ₹{room?.rent || 0})</Text>
                      <Text style={[styles.totalDuesValue, {color: colors.primary}]}>₹ {totalMonthDues}</Text>
                    </View>
                  </Surface>

                  <TextInput
                    label="Notes / Remarks (Optional)"
                    mode="outlined"
                    multiline
                    numberOfLines={2}
                    left={<TextInput.Icon icon="text-box-outline" />}
                    onChangeText={handleChange('note')}
                    onBlur={handleBlur('note')}
                    value={values.note}
                    style={{marginTop: 10}}
                  />

                  <Button
                    mode="contained"
                    icon="check-circle"
                    style={styles.submitBtn}
                    labelStyle={{fontWeight: '700'}}
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}>
                    Save Reading & Generate Bill
                  </Button>
                </KeyboardAwareScrollView>
              );
            }}
          </Formik>
        </View>
      </Modal>
    </Portal>
  );
};

export default AddTenetRecordModal;

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
  imagePickerWrapper: {
    height: 130,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 14,
  },
  pressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPromptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  imageBox: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  calcPreviewBox: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
  },
  calcBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  calcLabel: {
    fontSize: 12,
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcDivider: {
    height: 1,
    marginVertical: 8,
  },
  totalDuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalDuesLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalDuesValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  submitBtn: {
    marginTop: 16,
    marginBottom: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
