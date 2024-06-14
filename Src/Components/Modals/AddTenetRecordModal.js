import {Formik} from 'formik';
import React, {useState} from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Icon,
  IconButton,
  Modal,
  Portal,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import * as Yup from 'yup';
import {
  addRoomTenet,
  addUserRoomsTenantsRecord,
} from '../../Services/Collections';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import {generateUniqueId} from '../../Utils/helperFunction';
import {useTypedSelector} from '../../Store/MainStore';
import {selectSelectedRoom} from '../../Store/Slices/AuthSlice';
const AddTenetRecordModal = ({visible, hideModal, editData}) => {
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const styles = getStyles(colors);
  const room = useTypedSelector(selectSelectedRoom);

  const initialValue = {
    image: '',
    newReading: '',
    isPaid: false,
    note: '',
  };

  const validationSchema = Yup.object().shape({
    newReading: Yup.string().required('New Reading is required!'),
    image: Yup.string(),
    note: Yup.string(),
    isPaid: Yup.bool(),
  });

  const _onAddPress = async values => {
    try {
      setLoading(true);
      let url = '';
      if (values.image === '') {
        url =
          'https://firebasestorage.googleapis.com/v0/b/mytenant-a6711.appspot.com/o/images%2Fplaceholder.jpeg?alt=media&token=94fbca22-ea33-4189-a831-0e37c294c15a';
      } else {
        url = await uploadAndReturnFirestoreLink(values.image);
      }

      const response = await addUserRoomsTenantsRecord({...values, url});
      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ _onAddPress=async ~ error:', error);
    }
  };
  const openCamera = setFieldValue => {
    ImagePicker.openCamera({
      width: 300,
      height: 200,
      cropping: true,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setFieldValue('image', image?.path);
        // uploadAndReturnFirestoreLink(image);
        console.log(image.path);
      })
      .catch(err => {
        console.log('🚀 ~ openCamera ~ err:', err);
      });
  };

  const requestCameraPermission = async setFieldValue => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        openCamera(setFieldValue);
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  const uploadAndReturnFirestoreLink = async imageData => {
    console.log(imageData);

    try {
      const folderPath = `images/${generateUniqueId()}.jpg`;
      const imageRef = storage().ref(folderPath);
      await imageRef.putFile(imageData, {contentType: 'image/jpg'});
      const url = await imageRef.getDownloadURL();
      console.log(url);
      return url;
    } catch (e) {
      console.log(e);
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
            {editData?.roomId ? 'Edit Tenet' : 'Add new record'}
          </Text>
          <IconButton icon="close" onPress={hideModal} size={20} />
        </View>

        <View>
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
              return (
                <View>
                  <View
                    style={[
                      styles.imageCOntainer,
                      {
                        borderBottomColor: errors.image
                          ? colors.error
                          : colors.outlineVariant,
                      },
                    ]}>
                    {values?.image ? (
                      <TouchableRipple
                        style={styles.imageBox}
                        onPress={() => requestCameraPermission(setFieldValue)}>
                        <>
                          <Image
                            source={{uri: values?.image}}
                            style={styles.image}
                          />
                          <IconButton
                            onPress={() => setFieldValue('image', '')}
                            icon={'close'}
                            mode="contained-tonal"
                            style={{position: 'absolute', right: 0}}
                          />
                        </>
                      </TouchableRipple>
                    ) : (
                      <TouchableRipple
                        onPress={() => requestCameraPermission(setFieldValue)}
                        style={styles.pressContainer}>
                        <>
                          <Icon
                            source={'camera'}
                            size={50}
                            color={colors.primary}
                          />
                          <Text style={styles.addImageText}>Add image</Text>
                        </>
                      </TouchableRipple>
                    )}
                  </View>
                  <HelperText type="error" visible={!!errors.image}>
                    {errors.image}
                  </HelperText>

                  <TextInput
                    label={'New Reading'}
                    onChangeText={handleChange('newReading')}
                    onBlur={handleBlur('newReading')}
                    value={values.newReading}
                    error={!!errors.newReading}
                    errorText={errors.newReading}
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                  />
                  <HelperText type="error" visible={!!errors.newReading}>
                    {errors.newReading}
                  </HelperText>

                  <View style={styles.textInfoContainer}>
                    <Text style={styles.title}>Previous Reading</Text>
                    <Text>{Number(room.startReading)}</Text>
                  </View>
                  <View style={styles.textInfoContainer}>
                    <Text style={styles.title}>Current Reading</Text>
                    <Text>{Number(values?.newReading)}</Text>
                  </View>
                  <View style={styles.textInfoContainer}>
                    <Text style={styles.title}>Total Unit Burned</Text>
                    <Text>
                      {values?.newReading
                        ? Number(values?.newReading) - Number(room.startReading)
                        : '0'}
                    </Text>
                  </View>
                  <View style={styles.textInfoContainer}>
                    <Text style={styles.title}>Amount per Unit</Text>
                    <Text>₹ {Number(room?.perUnit)}</Text>
                  </View>
                  <View style={styles.textInfoContainerTotal}>
                    <Text style={styles.totalBillTitle}>
                      Total Electricity bill
                    </Text>
                    <Text style={styles.totalBillAmount}>
                      ₹{' '}
                      {values?.newReading
                        ? (Number(values?.newReading) -
                            Number(room.startReading)) *
                          Number(room?.perUnit)
                        : '0'}
                    </Text>
                  </View>
                  <TextInput
                    multiline
                    numberOfLines={3}
                    label={'Note'}
                    onChangeText={handleChange('note')}
                    onBlur={handleBlur('note')}
                    value={values.note}
                    error={!!errors.note}
                    errorText={errors.note}
                    autoCapitalize="none"
                    keyboardType="default"
                  />
                  <HelperText type="error" visible={!!errors.note}>
                    {errors.note}
                  </HelperText>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}>
                    {'Save'}
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

export default AddTenetRecordModal;
const getStyles = (colors, errors) => {
  return StyleSheet.create({
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
      textTransform: 'capitalize',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      alignItems: 'center',
    },
    imageCOntainer: {
      height: 200,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      backgroundColor: colors.surfaceVariant,
      borderBottomWidth: 1,
    },
    pressContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    addImageText: {color: colors.primary, fontWeight: '400'},
    textInfoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
    },
    title: {
      fontSize: 14,
      fontWeight: '500',
    },
    totalBillTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    textInfoContainerTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
      borderTopColor: colors.primary,
      borderTopWidth: 1,
      paddingVertical: 10,
    },
    totalBillAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
    },
    image: {
      flex: 1,
      resizeMode: 'stretch',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    imageBox: {
      flex: 1,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
  });
};
