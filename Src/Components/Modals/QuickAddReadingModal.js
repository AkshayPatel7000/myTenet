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
  Chip,
  useTheme,
} from 'react-native-paper';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useTypedSelector} from '../../Store/MainStore';
import {selectUserRooms} from '../../Store/Slices/AuthSlice';
import {addUserRoomsTenantsRecord, getRoomDetails, getUserRoomsTenantsDetails} from '../../Services/Collections';
import {showError} from '../../Utils/helperFunction';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

const QuickAddReadingModal = ({visible, hideModal}) => {
  const {colors} = useTheme();
  const rooms = useTypedSelector(selectUserRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedRoomObj = rooms.find(r => r.roomId === selectedRoomId);

  const validationSchema = Yup.object().shape({
    newReading: Yup.string().required('New reading is required!'),
  });

  const _onSubmit = async values => {
    if (!selectedRoomId || !selectedRoomObj) {
      showError('Please select a room first');
      return;
    }
    if (!selectedRoomObj.currentTenantId) {
      showError('No active tenant assigned to this room');
      return;
    }

    try {
      setLoading(true);
      await getRoomDetails(selectedRoomId);
      await getUserRoomsTenantsDetails(selectedRoomObj.currentTenantId);

      await addUserRoomsTenantsRecord({
        newReading: values.newReading,
        note: values.note || '',
        url: '',
      });

      setLoading(false);
      hideModal();
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ QuickAddReadingModal ~ error:', error);
    }
  };

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
              <Icon source="counter" size={24} color={colors.primary} />
              <Text style={styles.heading}>Quick Meter Reading</Text>
            </View>
            <IconButton icon="close" onPress={hideModal} size={20} />
          </View>

          <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>Select Property Room:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {rooms?.map(room => {
                const isSelected = room.roomId === selectedRoomId;
                return (
                  <Chip
                    key={room.roomId}
                    selected={isSelected}
                    onPress={() => setSelectedRoomId(room.roomId)}
                    style={[
                      styles.chip,
                      isSelected && {backgroundColor: colors.primaryContainer},
                    ]}
                    selectedColor={colors.primary}>
                    {room.roomName} (No. {room.roomNo})
                  </Chip>
                );
              })}
            </ScrollView>

            {selectedRoomObj && (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon source="account" size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    Tenant: <Text style={{fontWeight: '700'}}>{selectedRoomObj.tenetName || 'None'}</Text>
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon source="speedometer" size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    Previous Reading: <Text style={{fontWeight: '700'}}>{selectedRoomObj.startReading || '0'}</Text>
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon source="currency-inr" size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    Electricity Rate: <Text style={{fontWeight: '700'}}>₹ {selectedRoomObj.perUnit || '10'} / unit</Text>
                  </Text>
                </View>
              </View>
            )}

            <Formik
              initialValues={{newReading: '', note: ''}}
              validationSchema={validationSchema}
              onSubmit={_onSubmit}>
              {({handleChange, handleBlur, handleSubmit, values, errors}) => {
                const unitsBurned = selectedRoomObj
                  ? Math.max(0, Number(values.newReading || 0) - Number(selectedRoomObj.startReading || 0))
                  : 0;
                const estimatedElecBill = selectedRoomObj
                  ? unitsBurned * Number(selectedRoomObj.perUnit || 0)
                  : 0;

                return (
                  <View>
                    <TextInput
                      label="New Meter Reading"
                      mode="outlined"
                      keyboardType="number-pad"
                      onChangeText={handleChange('newReading')}
                      onBlur={handleBlur('newReading')}
                      value={values.newReading}
                      error={!!errors.newReading}
                    />
                    <HelperText type="error" visible={!!errors.newReading}>
                      {errors.newReading}
                    </HelperText>

                    {values.newReading && selectedRoomObj ? (
                      <View style={styles.calcPreview}>
                        <View style={styles.infoRow}>
                          <Icon source="lightning-bolt" size={16} color="#3730A3" />
                          <Text style={styles.calcText}>
                            Units Burned: <Text style={{fontWeight: '700'}}>{unitsBurned}</Text>
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Icon source="cash-multiple" size={16} color="#3730A3" />
                          <Text style={styles.calcText}>
                            Electricity Bill: <Text style={{fontWeight: '700'}}>₹ {estimatedElecBill}</Text>
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    <TextInput
                      label="Notes (Optional)"
                      mode="outlined"
                      onChangeText={handleChange('note')}
                      onBlur={handleBlur('note')}
                      value={values.note}
                      style={{marginTop: 8}}
                    />

                    <Button
                      mode="contained"
                      icon="check-circle"
                      style={styles.submitBtn}
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading || !selectedRoomId}>
                      Save Reading & Generate Bill
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

export default QuickAddReadingModal;

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
    marginBottom: 10,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  chip: {
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 6,
  },
  calcPreview: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  calcText: {
    fontSize: 14,
    color: '#3730A3',
    marginLeft: 6,
  },
  submitBtn: {
    marginTop: 18,
    marginBottom: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
