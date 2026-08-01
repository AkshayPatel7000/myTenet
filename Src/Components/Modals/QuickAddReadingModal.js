import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useTypedSelector} from '../../Store/MainStore';
import {selectUserRooms} from '../../Store/Slices/AuthSlice';
import {
  addUserRoomsTenantsRecord,
  getRoomDetails,
  getUserRoomsTenantsDetails,
} from '../../Services/Collections';
import {showError} from '../../Utils/helperFunction';
import KeyboardAwareScrollView from '../KeyboardAwareScrollView';

const QuickAddReadingModal = ({visible, hideModal}) => {
  const {colors, dark} = useTheme();
  const rooms = useTypedSelector(selectUserRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-select first room when modal opens if none selected
  useEffect(() => {
    if (visible && rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].roomId);
    }
  }, [visible, rooms, selectedRoomId]);

  const selectedRoomObj = rooms.find(r => r.roomId === selectedRoomId);
  const previousReading = Number(selectedRoomObj?.startReading || 0);

  const validationSchema = Yup.object().shape({
    newReading: Yup.number()
      .typeError('Enter a valid reading number')
      .required('New reading is required!')
      .min(
        previousReading,
        `Reading must be at least ${previousReading} (Previous Reading)`,
      ),
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
              <Icon source="flash" size={24} color={colors.primary} />
              <View style={{marginLeft: 8}}>
                <Text style={[styles.heading, {color: colors.onSurface}]}>
                  Quick Meter Reading
                </Text>
                <Text style={[styles.subHeading, {color: colors.onSurfaceVariant}]}>
                  Log new reading & compute monthly bill
                </Text>
              </View>
            </View>
            <IconButton icon="close" onPress={hideModal} size={20} />
          </View>

          <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
            {/* Step 1: Room Selector Grid */}
            <Text style={[styles.sectionLabel, {color: colors.onSurface}]}>
              1. Select Property Room
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContainer}>
              {rooms?.map(room => {
                const isSelected = room.roomId === selectedRoomId;
                const isOccupied = !!room.tenetName;

                return (
                  <TouchableOpacity
                    key={room.roomId}
                    activeOpacity={0.85}
                    onPress={() => setSelectedRoomId(room.roomId)}
                    style={[
                      styles.roomSelectCard,
                      {
                        backgroundColor: isSelected
                          ? (dark ? '#312E81' : '#EEF2FF')
                          : (dark ? '#1E293B' : '#F8FAFC'),
                        borderColor: isSelected
                          ? colors.primary
                          : (dark ? '#334155' : '#E2E8F0'),
                      },
                    ]}>
                    <View style={styles.roomSelectHeader}>
                      <Icon
                        source="home-city"
                        size={18}
                        color={isSelected ? colors.primary : colors.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.roomSelectName,
                          {
                            color: isSelected ? colors.primary : colors.onSurface,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}>
                        {room.roomName}
                      </Text>
                    </View>

                    <Text style={[styles.roomSelectMeta, {color: colors.onSurfaceVariant}]}>
                      Room #{room.roomNo} • {isOccupied ? room.tenetName : 'Vacant'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Room Details Overview Card */}
            {selectedRoomObj ? (
              <Surface
                style={[
                  styles.roomDetailSurface,
                  {
                    backgroundColor: dark ? '#334155' : '#F8FAFC',
                    borderColor: colors.outlineVariant || '#E2E8F0',
                  },
                ]}>
                <View style={styles.roomDetailHeader}>
                  <View style={styles.detailIdentity}>
                    <Text style={[styles.detailRoomTitle, {color: colors.onSurface}]}>
                      {selectedRoomObj.roomName} (Room No. {selectedRoomObj.roomNo})
                    </Text>
                    <Text style={[styles.detailTenantName, {color: colors.primary}]}>
                      Tenant: {selectedRoomObj.tenetName || 'No Active Tenant'}
                    </Text>
                  </View>
                </View>

                {!selectedRoomObj.tenetName && (
                  <View style={styles.warningBanner}>
                    <Icon source="alert-circle-outline" size={16} color="#D97706" />
                    <Text style={styles.warningBannerText}>
                      No active tenant assigned to this room.
                    </Text>
                  </View>
                )}

                <View style={[styles.statsGridRow, {backgroundColor: dark ? '#1E293B' : '#FFFFFF'}]}>
                  <View style={styles.statGridItem}>
                    <Text style={[styles.statGridLabel, {color: colors.onSurfaceVariant}]}>
                      Previous Reading
                    </Text>
                    <Text style={[styles.statGridValue, {color: colors.onSurface}]}>
                      {selectedRoomObj.startReading || '0'}
                    </Text>
                  </View>
                  <View style={styles.statGridItem}>
                    <Text style={[styles.statGridLabel, {color: colors.onSurfaceVariant}]}>
                      Rate / Unit
                    </Text>
                    <Text style={[styles.statGridValue, {color: colors.onSurface}]}>
                      ₹ {selectedRoomObj.perUnit || '10'}
                    </Text>
                  </View>
                  <View style={styles.statGridItem}>
                    <Text style={[styles.statGridLabel, {color: colors.onSurfaceVariant}]}>
                      Room Rent
                    </Text>
                    <Text style={[styles.statGridValue, {color: colors.onSurface}]}>
                      ₹ {selectedRoomObj.rent || '0'}
                    </Text>
                  </View>
                </View>
              </Surface>
            ) : null}

            {/* Step 2: Form Controls */}
            <Text style={[styles.sectionLabel, {color: colors.onSurface, marginTop: 14}]}>
              2. Enter New Reading & Notes
            </Text>

            <Formik
              initialValues={{newReading: '', note: ''}}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={_onSubmit}>
              {({handleChange, handleBlur, handleSubmit, values, errors}) => {
                const newReadingNum = Number(values.newReading || 0);
                const unitsBurned = selectedRoomObj
                  ? Math.max(0, newReadingNum - previousReading)
                  : 0;
                const perUnitRate = Number(selectedRoomObj?.perUnit || 10);
                const estimatedElecBill = unitsBurned * perUnitRate;
                const roomRent = Number(selectedRoomObj?.rent || 0);
                const totalEstimatedDues = estimatedElecBill + roomRent;

                return (
                  <View>
                    <TextInput
                      label={`Current Meter Reading (Min: ${previousReading})`}
                      mode="outlined"
                      keyboardType="number-pad"
                      left={<TextInput.Icon icon="speedometer" />}
                      onChangeText={handleChange('newReading')}
                      onBlur={handleBlur('newReading')}
                      value={values.newReading}
                      error={!!errors.newReading}
                    />
                    <HelperText type="error" visible={!!errors.newReading}>
                      {errors.newReading}
                    </HelperText>

                    {/* Live Financial Computation Preview Box */}
                    {values.newReading && selectedRoomObj ? (
                      <Surface
                        style={[
                          styles.liveCalcSurface,
                          {
                            backgroundColor: dark ? '#312E81' : '#EEF2FF',
                            borderColor: dark ? '#4338CA' : '#C7D2FE',
                          },
                        ]}>
                        <Text style={[styles.liveCalcTitle, {color: colors.primary}]}>
                          Live Bill Computation Summary
                        </Text>

                        <View style={styles.calcLineRow}>
                          <Text style={[styles.calcLineLabel, {color: colors.onSurfaceVariant}]}>
                            Units Burned ({values.newReading} - {previousReading})
                          </Text>
                          <Text style={[styles.calcLineValue, {color: colors.onSurface}]}>
                            {unitsBurned} units
                          </Text>
                        </View>

                        <View style={styles.calcLineRow}>
                          <Text style={[styles.calcLineLabel, {color: colors.onSurfaceVariant}]}>
                            Electricity Dues ({unitsBurned} x ₹{perUnitRate})
                          </Text>
                          <Text style={[styles.calcLineValue, {color: colors.onSurface}]}>
                            ₹ {estimatedElecBill}
                          </Text>
                        </View>

                        <View style={styles.calcLineRow}>
                          <Text style={[styles.calcLineLabel, {color: colors.onSurfaceVariant}]}>
                            Monthly Room Rent
                          </Text>
                          <Text style={[styles.calcLineValue, {color: colors.onSurface}]}>
                            ₹ {roomRent}
                          </Text>
                        </View>

                        <View style={[styles.calcDividerLine, {backgroundColor: colors.primary}]} />

                        <View style={styles.totalRow}>
                          <Text style={[styles.totalLabel, {color: colors.onSurface}]}>
                            Total Amount Payable
                          </Text>
                          <Text style={[styles.totalValue, {color: colors.primary}]}>
                            ₹ {totalEstimatedDues}
                          </Text>
                        </View>
                      </Surface>
                    ) : null}

                    <TextInput
                      label="Notes / Remarks (Optional)"
                      mode="outlined"
                      left={<TextInput.Icon icon="text-box-outline" />}
                      onChangeText={handleChange('note')}
                      onBlur={handleBlur('note')}
                      value={values.note}
                      style={{marginTop: 6}}
                    />

                    <Button
                      mode="contained"
                      icon="check-circle"
                      style={styles.submitBtn}
                      labelStyle={{fontWeight: '800', fontSize: 14}}
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading || !selectedRoomId || !selectedRoomObj?.currentTenantId}>
                      Save Reading & Issue Statement
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
    height: '88%',
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
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
  },
  subHeading: {
    fontSize: 12,
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipScrollContainer: {
    paddingBottom: 4,
  },
  roomSelectCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1.5,
    minWidth: 150,
  },
  roomSelectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomSelectName: {
    fontSize: 14,
    marginLeft: 6,
  },
  roomSelectMeta: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  roomDetailSurface: {
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    elevation: 1,
  },
  roomDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailIdentity: {
    flex: 1,
  },
  detailRoomTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailTenantName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  warningBannerText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  statGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  statGridLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statGridValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  liveCalcSurface: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
  },
  liveCalcTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  calcLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  calcLineLabel: {
    fontSize: 12,
  },
  calcLineValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcDividerLine: {
    height: 1,
    marginVertical: 8,
    opacity: 0.3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  submitBtn: {
    marginTop: 14,
    marginBottom: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
