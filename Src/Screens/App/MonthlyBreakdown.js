import moment from 'moment';
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Button,
  Chip,
  Icon,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import Container from '../../Components/Container';
import EmptyComponent from '../../Components/EmptyComponent';
import Header from '../../Components/Header/Header';
import Loader from '../../Components/Loader';
import AddTenetRecordModal from '../../Components/Modals/AddTenetRecordModal';
import MyDialog from '../../Components/Modals/Dialog';
import PartialPaymentModal from '../../Components/Modals/PartialPaymentModal';
import ShareBillModal from '../../Components/Modals/ShareBillModal';
import SuccessModal from '../../Components/Modals/SuccessModal';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {
  getUserRoomsTenantsRecord,
  markAsPaidRecord,
  updatePartialPayment,
} from '../../Services/Collections';
import {useTypedSelector} from '../../Store/MainStore';
import {
  selectRoomTenantRecords,
  selectSelectedRoom,
  selectSelectedTenant,
  selectUserProfile,
} from '../../Store/Slices/AuthSlice';
import {
  onOpenDialer,
  onSendSMSMessage,
  sendWhatsAppMessage,
} from '../../Utils/helperFunction';
import RoutesName from '../../Utils/Resource/RoutesName';

const MonthlyBreakdown = ({navigation}) => {
  const selectedRoomTenets = useTypedSelector(selectSelectedTenant);
  const user = useTypedSelector(selectUserProfile);
  const [userDialog, setUserDialog] = useState(false);
  const selectedRoom = useTypedSelector(selectSelectedRoom);
  const selectedRoomTenetRecords = useTypedSelector(selectRoomTenantRecords);
  const {colors} = useTheme();

  const [visible, setVisible] = useState(false);
  const [partialPaymentVisible, setPartialPaymentVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedShareRecord, setSelectedShareRecord] = useState(null);
  const [successModal, setSuccessModal] = useState({
    visible: false,
    title: '',
    subtitle: '',
  });

  const totalPendingAmount = useMemo(() => {
    return selectedRoomTenetRecords.reduce((total, record) => {
      if (!record.paidStatus) {
        return (
          total +
          (record.pendingAmount ||
            Number(record.totalAmount) + Number(selectedRoom?.rent))
        );
      }
      return total + (record.pendingAmount || 0);
    }, 0);
  }, [selectedRoomTenetRecords, selectedRoom]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUserRoomsTenantsRecord();
    setRefreshing(false);
  }, []);

  const getWhatsAppMessage = useCallback(
    ({
      date = '0',
      oldReading = '0',
      newReading = '0',
      units = '0',
      amount = '0',
      phone = '',
      upi = '',
      roomRent = '',
      eleBill = '',
      type = 'whatsapp',
      pendingAmount = '0',
    }) => {
      const previousPendingAmount =
        Number(totalPendingAmount || 0) - Number(amount || 0);

      const message = `Hi ${selectedRoomTenets?.name}
        
${
  type === 'whatsapp' ? '_Bill for the month of_ *' : 'Bill for the month of '
}${date}*

------------------------------------------------
| ${
        type === 'whatsapp'
          ? '_Old reading_          | *'
          : 'Old reading            |'
      }${oldReading}${type === 'whatsapp' ? '* |' : '|'}
| ${
        type === 'whatsapp'
          ? '_New reading_        | *'
          : 'New reading          |'
      }${newReading}${type === 'whatsapp' ? '* |' : '|'}
| ${
        type === 'whatsapp'
          ? '_Units used_            | *'
          : 'Units used              |'
      }${units}${type === 'whatsapp' ? '* |' : '|'}
| ${
        type === 'whatsapp'
          ? '_Electricity Bill_       | *'
          : 'Electricity Bill         |'
      }${eleBill}${type === 'whatsapp' ? '* |' : '|'}
------------------------------------------------
| ${
        type === 'whatsapp'
          ? '_Rent_                    | *'
          : 'Rent                      |'
      }${roomRent}${type === 'whatsapp' ? '* |' : '|'}
${
  pendingAmount > 0
    ? `| ${
        type === 'whatsapp'
          ? '_Pending Amount_       | *'
          : 'Pending Amount         |          '
      }${pendingAmount}${type === 'whatsapp' ? '* |' : '|'}`
    : ''
}
| ${
        type === 'whatsapp'
          ? '_This Month Total_     | *'
          : 'This Month Total       |'
      }${amount}${type === 'whatsapp' ? '* |' : '|'}
${
  previousPendingAmount > 0
    ? `| ${
        type === 'whatsapp'
          ? '_Previous Due_           | *'
          : 'Previous Due             |'
      }${previousPendingAmount}${type === 'whatsapp' ? '* |' : '|'}`
    : ''
}
${
  totalPendingAmount > 0
    ? `| ${
        type === 'whatsapp'
          ? '_Total Payable_          | *'
          : 'Total Payable            |'
      }${totalPendingAmount}${type === 'whatsapp' ? '* |' : '|'}`
    : ''
}
------------------------------------------------

Please pay your bill on time to mobile number ${
        type === 'whatsapp' ? '*' : ''
      }${phone}${type === 'whatsapp' ? '* or UPI *' : ' or UPI '}${upi}${
        type === 'whatsapp' ? '*.' : '.'
      }`;

      return message;
    },
    [selectedRoomTenets?.name, totalPendingAmount],
  );

  const handleMarkAsPaid = useCallback(
    async record => {
      try {
        setLoading(true);
        await markAsPaidRecord({
          recordId: record.recordId,
          createdAt: record.createdAt,
          totalAmount: Number(record?.totalAmount) + Number(selectedRoom?.rent),
        });
        setLoading(false);
        setSuccessModal({
          visible: true,
          title: 'Payment Received!',
          subtitle: 'The utility bill statement has been marked as fully paid.',
        });
      } catch (error) {
        setLoading(false);
        console.log('🚀 ~ MonthlyBreakdown ~ error:', error);
      }
    },
    [selectedRoom?.rent],
  );

  const handlePartialPayment = useCallback(
    async ({recordId, paidAmount, pendingAmount}) => {
      try {
        setLoading(true);
        await updatePartialPayment({
          recordId,
          paidAmount,
          pendingAmount,
          record: selectedRecord,
        });
        setLoading(false);
        setSuccessModal({
          visible: true,
          title: 'Partial Payment Saved!',
          subtitle: `Recorded partial payment of ₹${paidAmount}. Remaining due balance: ₹${pendingAmount}`,
        });
      } catch (error) {
        setLoading(false);
        console.log('🚀 ~ MonthlyBreakdown ~ error:', error);
      }
    },
    [selectedRecord],
  );

  const handleWhatsAppReminder = useCallback(
    item => {
      if (!user?.phone || !user?.upi) {
        setUserDialog(true);
        return;
      }
      sendWhatsAppMessage(
        getWhatsAppMessage({
          date: `${moment(item?.createdAt)
            .subtract(1, 'month')
            .format('MMMM')}-${moment(item?.createdAt).format('MMMM YYYY')}`,
          newReading: item?.currentReading,
          oldReading: item?.previousReading,
          amount: Number(item?.totalAmount) + Number(selectedRoom?.rent),
          units: item?.totalUnitBurned,
          roomRent: selectedRoom?.rent,
          eleBill: item.totalAmount,
          phone: user?.phone,
          upi: user?.upi,
          pendingAmount: item.pendingAmount || 0,
        }),
        selectedRoomTenets?.phone,
      );
    },
    [user, selectedRoom, selectedRoomTenets, getWhatsAppMessage],
  );

  const handleSMSReminder = useCallback(
    item => {
      if (!user?.phone || !user?.upi) {
        setUserDialog(true);
        return;
      }
      onSendSMSMessage(
        getWhatsAppMessage({
          date: `${moment(item?.createdAt)
            .subtract(1, 'month')
            .format('MMMM')}-${moment(item?.createdAt).format('MMMM YYYY')}`,
          newReading: item?.currentReading,
          oldReading: item?.previousReading,
          amount: Number(item?.totalAmount) + Number(selectedRoom?.rent),
          units: item?.totalUnitBurned,
          roomRent: selectedRoom?.rent,
          eleBill: item.totalAmount,
          phone: user?.phone,
          upi: user?.upi,
          type: 'sms',
          pendingAmount: item.pendingAmount || 0,
        }),
        selectedRoomTenets?.phone,
      );
    },
    [user, selectedRoom, selectedRoomTenets, getWhatsAppMessage],
  );

  const handleShareBill = useCallback(
    item => {
      if (!user?.phone || !user?.upi) {
        setUserDialog(true);
        return;
      }
      setSelectedShareRecord(item);
      setShareModalVisible(true);
    },
    [user],
  );

  const renderItem = useCallback(
    ({item}) => {
      const isPaid = item.paidStatus;
      const isPartial = !isPaid && item.pendingAmount > 0;

      const statusBg = isPaid ? '#DCFCE7' : isPartial ? '#FEF3C7' : '#FEE2E2';
      const statusText = isPaid ? '#15803D' : isPartial ? '#B45309' : '#B91C1C';
      const statusLabel = isPaid ? 'Paid' : isPartial ? 'Partial Paid' : 'Unpaid';

      const totalMonthlyBill = Number(item?.totalAmount || 0) + Number(selectedRoom?.rent || 0);

      return (
        <Surface style={styles.recordCard}>
          {/* Card Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.monthTitleGroup}>
              <Icon source="calendar-month" size={20} color={colors.primary} />
              <Text style={styles.monthTitleText}>
                {moment(item.createdAt).format('MMMM YYYY')}
              </Text>
            </View>

            <View style={[styles.statusBadgePill, {backgroundColor: statusBg}]}>
              <Text style={[styles.statusBadgeText, {color: statusText}]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Meter Readings Grid */}
          <View style={styles.readingsGridBox}>
            <View style={styles.readingStat}>
              <Text style={styles.readingLabel}>Previous Meter</Text>
              <Text style={styles.readingValue}>{item?.previousReading || 0}</Text>
            </View>
            <View style={styles.readingStat}>
              <Text style={styles.readingLabel}>Current Meter</Text>
              <Text style={styles.readingValue}>{item?.currentReading || 0}</Text>
            </View>
            <View style={styles.readingStat}>
              <Text style={styles.readingLabel}>Units Burned</Text>
              <Text style={[styles.readingValue, {color: '#4F46E5'}]}>
                {item?.totalUnitBurned || 0}
              </Text>
            </View>
          </View>

          {/* Utility Financial Breakdown */}
          <View style={styles.billDetailsContainer}>
            <View style={styles.billRow}>
              <Text style={styles.billRowLabel}>Electricity ({item?.totalUnitBurned || 0} units × ₹{item?.perUnit || 10})</Text>
              <Text style={styles.billRowValue}>₹ {item.totalAmount}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billRowLabel}>Monthly Room Rent</Text>
              <Text style={styles.billRowValue}>₹ {selectedRoom?.rent || 0}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>This Month Dues</Text>
              <Text style={styles.totalRowValue}>₹ {totalMonthlyBill}</Text>
            </View>

            {item.pendingAmount > 0 && (
              <View style={styles.partialRow}>
                <View style={styles.billRow}>
                  <Text style={styles.partialLabel}>Partial Paid</Text>
                  <Text style={styles.partialPaidValue}>
                    ₹ {totalMonthlyBill - item.pendingAmount}
                  </Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.partialLabel}>Remaining Due</Text>
                  <Text style={styles.partialDueValue}>
                    ₹ {item.pendingAmount}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Meter Image Thumbnail if exists */}
          {item?.image ? (
            <View style={styles.imageBox}>
              <Image source={{uri: item?.image}} style={styles.meterImage} />
              <View style={styles.imageBadge}>
                <Icon source="camera" size={12} color="#FFF" />
                <Text style={styles.imageBadgeText}>Meter Photo Captured</Text>
              </View>
            </View>
          ) : null}

          {/* Payment Actions Row (If Unpaid / Partial) */}
          {!isPaid ? (
            <View style={styles.paymentActionsRow}>
              <Button
                mode="contained"
                icon="check-circle"
                buttonColor="#10B981"
                textColor="#FFFFFF"
                style={styles.payBtn}
                labelStyle={{fontWeight: '700', fontSize: 12}}
                onPress={() => handleMarkAsPaid(item)}>
                Mark Full Paid
              </Button>

              <Button
                mode="outlined"
                icon="cash-plus"
                textColor="#D97706"
                style={[styles.payBtn, {borderColor: '#F59E0B'}]}
                labelStyle={{fontWeight: '700', fontSize: 12}}
                onPress={() => {
                  setSelectedRecord(item);
                  setPartialPaymentVisible(true);
                }}>
                Partial Pay
              </Button>
            </View>
          ) : null}

          {/* Reminders & Sharing Action Buttons Bar */}
          <View style={styles.shareActionsBar}>
            <IconButton
              icon="whatsapp"
              mode="contained-tonal"
              containerColor="#DCFCE7"
              iconColor="#15803D"
              size={20}
              onPress={() => handleWhatsAppReminder(item)}
            />
            <IconButton
              icon="message-processing-outline"
              mode="contained-tonal"
              containerColor="#EEF2FF"
              iconColor="#4F46E5"
              size={20}
              onPress={() => handleSMSReminder(item)}
            />
            <IconButton
              icon="phone-outline"
              mode="contained-tonal"
              containerColor="#F1F5F9"
              iconColor="#475569"
              size={20}
              onPress={() => onOpenDialer(selectedRoomTenets?.phone)}
            />
            <Button
              mode="tonal"
              icon="share-variant"
              style={{flex: 1, marginLeft: 4}}
              labelStyle={{fontWeight: '700', fontSize: 12}}
              onPress={() => handleShareBill(item)}>
              Share Bill
            </Button>
          </View>
        </Surface>
      );
    },
    [
      selectedRoom,
      colors,
      handleWhatsAppReminder,
      handleSMSReminder,
      handleShareBill,
      selectedRoomTenets,
      handleMarkAsPaid,
    ],
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await getUserRoomsTenantsRecord();
      setLoading(false);
    };
    init();
  }, []);

  return (
    <Container>
      <Header
        title={selectedRoomTenets?.name || 'Tenant Statement'}
        subtitle="Monthly meter readings & billing dues"
        right="counter"
        rightText="Log Reading"
        rightIconPress={() => setVisible(true)}
      />

      {loading && <Loader message="Updating payment status..." />}

      <VirtualizedScrollView
        contentContainerStyle={{padding: 16, paddingBottom: 150}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }>
        {/* Total Payable Dues Gradient Banner */}
        {totalPendingAmount > 0 && (
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            useAngle={true}
            angle={135}
            style={styles.pendingDuesBanner}>
            <View style={styles.bannerIconBox}>
              <Icon source="alert-circle-outline" size={24} color="#FFF" />
            </View>
            <View style={{marginLeft: 12, flex: 1}}>
              <Text style={styles.bannerTitle}>Total Outstanding Dues</Text>
              <Text style={styles.bannerAmount}>₹ {totalPendingAmount}</Text>
            </View>
          </LinearGradient>
        )}

        <FlatList
          data={selectedRoomTenetRecords}
          keyExtractor={(item, index) => item?.recordId || index.toString()}
          ItemSeparatorComponent={() => <View style={{height: 16}} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyComponent
              title="No Monthly Bills Logged Yet"
              subtitle="Log your first meter reading to compute units burned, generate the monthly bill, and send reminders."
              actionLabel="Add Monthly Reading"
              onActionPress={() => setVisible(true)}
            />
          }
        />
      </VirtualizedScrollView>

      <AddTenetRecordModal
        visible={visible}
        hideModal={() => setVisible(false)}
      />

      <PartialPaymentModal
        visible={partialPaymentVisible}
        hideModal={() => {
          setPartialPaymentVisible(false);
          setSelectedRecord(null);
        }}
        onSave={handlePartialPayment}
        totalAmount={
          selectedRecord
            ? Number(selectedRecord?.totalAmount) + Number(selectedRoom?.rent)
            : 0
        }
        recordId={selectedRecord?.recordId}
      />

      <SuccessModal
        visible={successModal.visible}
        hideModal={() => setSuccessModal({visible: false, title: '', subtitle: ''})}
        title={successModal.title}
        subtitle={successModal.subtitle}
      />

      <MyDialog
        title="Update Your Contact Details"
        body="Your Phone and UPI address are missing. Please update your profile so tenants receive payment instructions."
        visible={userDialog}
        setVisible={setUserDialog}
        doneTitle="Update Profile"
        donePress={() => {
          setUserDialog(false);
          navigation.navigate(RoutesName.BOTTOM_TABS, {
            screen: RoutesName.PROFILE,
          });
        }}
      />

      <ShareBillModal
        visible={shareModalVisible}
        hideModal={() => {
          setShareModalVisible(false);
          setSelectedShareRecord(null);
        }}
        billData={
          selectedShareRecord
            ? {
                date: `${moment(selectedShareRecord?.createdAt)
                  .subtract(1, 'month')
                  .format('MMMM')}-${moment(
                  selectedShareRecord?.createdAt,
                ).format('MMMM YYYY')}`,
                oldReading: selectedShareRecord?.previousReading,
                newReading: selectedShareRecord?.currentReading,
                units: selectedShareRecord?.totalUnitBurned,
                eleBill: selectedShareRecord?.totalAmount,
                roomRent: selectedRoom?.rent,
                pendingAmount: selectedShareRecord?.pendingAmount || 0,
                amount:
                  Number(selectedShareRecord?.totalAmount) +
                  Number(selectedRoom?.rent),
                previousPendingAmount:
                  Number(totalPendingAmount || 0) -
                  Number(
                    Number(selectedShareRecord?.totalAmount) +
                      Number(selectedRoom?.rent),
                  ),
                totalPendingAmount: totalPendingAmount,
                phone: user?.phone,
                upi: user?.upi,
                name: selectedRoomTenets?.name,
                message: getWhatsAppMessage({
                  date: `${moment(selectedShareRecord?.createdAt)
                    .subtract(1, 'month')
                    .format('MMMM')}-${moment(
                    selectedShareRecord?.createdAt,
                  ).format('MMMM YYYY')}`,
                  newReading: selectedShareRecord?.currentReading,
                  oldReading: selectedShareRecord?.previousReading,
                  amount:
                    Number(selectedShareRecord?.totalAmount) +
                    Number(selectedRoom?.rent),
                  units: selectedShareRecord?.totalUnitBurned,
                  roomRent: selectedRoom?.rent,
                  eleBill: selectedShareRecord?.totalAmount,
                  phone: user?.phone,
                  upi: user?.upi,
                  type: 'sms',
                  pendingAmount: selectedShareRecord?.pendingAmount || 0,
                }),
              }
            : {}
        }
        billImage={selectedShareRecord?.image}
      />
    </Container>
  );
};

export default MonthlyBreakdown;

const styles = StyleSheet.create({
  pendingDuesBanner: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FEE2E2',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 1,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  statusBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  readingsGridBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  readingStat: {
    flex: 1,
    alignItems: 'center',
  },
  readingLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  readingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  billDetailsContainer: {
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  billRowLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  billRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalRowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalRowValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F46E5',
  },
  partialRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  partialLabel: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  partialPaidValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  partialDueValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  imageBox: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  meterImage: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  paymentActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  payBtn: {
    flex: 1,
    borderRadius: 10,
  },
  shareActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
