import moment from 'moment';
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {FlatList, Image, Pressable, RefreshControl, View} from 'react-native';
import {FAB, Icon, IconButton, Text, useTheme} from 'react-native-paper';
import Container from '../../Components/Container';
import EmptyComponent from '../../Components/EmptyComponent';
import Header from '../../Components/Header/Header';
import Loader from '../../Components/Loader';
import AddTenetRecordModal from '../../Components/Modals/AddTenetRecordModal';
import MyDialog from '../../Components/Modals/Dialog';
import PartialPaymentModal from '../../Components/Modals/PartialPaymentModal';
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
import {getStyles} from '../../Utils/Styles/monthlyBreakdownStyles';

const MonthlyBreakdown = ({navigation}) => {
  const selectedRoomTenets = useTypedSelector(selectSelectedTenant);
  const user = useTypedSelector(selectUserProfile);
  const [userDialog, setUserDialog] = useState(false);
  const selectedRoom = useTypedSelector(selectSelectedRoom);
  const selectedRoomTenetRecords = useTypedSelector(selectRoomTenantRecords);
  const {colors} = useTheme();
  const styles = getStyles(colors);
  const [visible, setVisible] = useState(false);
  const [partialPaymentVisible, setPartialPaymentVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

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
      console.log(
        '🚀 ~ MonthlyBreakdown ~ previousPendingAmount:',
        previousPendingAmount,
      );
      const message = `Hi ${selectedRoomTenets?.name}
        
${
  type === 'whatsapp'
    ? '_Electricity bill for the month of_ *'
    : 'Electricity bill for the month of '
}${date}*

------------------------------------------------
| ${
        type === 'whatsapp'
          ? '_Last month reading_   |*'
          : 'Last month reading   |'
      }${oldReading}${type === 'whatsapp' ? '*|' : '|'}
| ${
        type === 'whatsapp'
          ? '_Current month reading_|      *'
          : 'Current month reading|      '
      }${newReading}${type === 'whatsapp' ? '*|' : '|'}
| ${
        type === 'whatsapp'
          ? '_Total units_          |           *'
          : 'Total units          |           '
      }${units}${type === 'whatsapp' ? '*|' : '|'}
| ${
        type === 'whatsapp'
          ? '_Total electricity bill_|         *'
          : 'Total electricity bill|         '
      }${eleBill}${type === 'whatsapp' ? '*|' : '|'}
------------------------------------------------
| ${
        type === 'whatsapp'
          ? '_Room Rent_            |        *'
          : 'Room Rent            |        '
      }${roomRent}${type === 'whatsapp' ? '*|' : '|'}

${
  pendingAmount > 0
    ? `| ${
        type === 'whatsapp'
          ? '_Pending Amount_         |          *'
          : 'Pending Amount         |          '
      }${pendingAmount}${type === 'whatsapp' ? '*|' : '|'}`
    : ''
}
| ${
        type === 'whatsapp'
          ? '_Total Amount_         |          *'
          : 'Total Amount         |          '
      }${amount}${type === 'whatsapp' ? '*|' : '|'}
${
  previousPendingAmount > 0
    ? `| ${
        type === 'whatsapp'
          ? '_Previous Pending Amount_         |          *'
          : 'Previous Pending Amount         |          '
      }${previousPendingAmount}${type === 'whatsapp' ? '*|' : '|'}`
    : ''
}
      ${
        totalPendingAmount > 0
          ? `| ${
              type === 'whatsapp'
                ? '_Total Pending Amount_         |          *'
                : 'Total Pending Amount         |          '
            }${totalPendingAmount}${type === 'whatsapp' ? '*|' : '|'}`
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
      } catch (error) {
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
      } catch (error) {
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

  const renderItem = useCallback(
    ({item}) => (
      <Pressable
        style={[
          styles.roomCard,
          {
            borderWidth: item.paidStatus ? 0 : 2,
            borderColor: item.paidStatus ? '#fff' : colors.error,
          },
        ]}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item?.image}} style={styles.image} />
          {!item?.paidStatus && (
            <View style={styles.paymentButtonsContainer}>
              <IconButton
                icon={'check'}
                mode="contained"
                onPress={() => handleMarkAsPaid(item)}>
                <Icon name="check" size={20} color="#fff" />
              </IconButton>
              <IconButton
                onPress={() => {
                  setSelectedRecord(item);
                  setPartialPaymentVisible(true);
                }}
                mode="contained"
                icon={'cash'}>
                Partial Pay
              </IconButton>
            </View>
          )}
          <View
            style={[
              styles.statusContainer,
              {
                backgroundColor: item.paidStatus
                  ? colors.primary
                  : colors.error,
              },
            ]}>
            <Text style={styles.statusText}>
              {item.paidStatus
                ? 'Paid'
                : item.pendingAmount > 0
                ? 'Partial Paid'
                : 'Unpaid'}
            </Text>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.monthText}>
            {moment(item.createdAt).format('MMMM YYYY')}
          </Text>
          <View style={styles.textInfoContainer}>
            <Text style={styles.title}>Current Reading</Text>
            <Text>{Number(item.currentReading)}</Text>
          </View>
          <View style={styles.textInfoContainer}>
            <Text style={styles.title}>Previous Reading</Text>
            <Text>{Number(item?.previousReading)}</Text>
          </View>
          <View style={styles.textInfoContainer}>
            <Text style={styles.title}>Total Unit Burned</Text>
            <Text>{Number(item?.totalUnitBurned)}</Text>
          </View>
          <View style={styles.textInfoContainer}>
            <Text style={styles.title}>Amount per Unit</Text>
            <Text>₹ {Number(item?.perUnit)}</Text>
          </View>
          <View style={styles.textInfoContainerTotal}>
            <Text style={styles.totalBillTitle}>Total Electricity bill</Text>
            <Text style={styles.totalBillAmount}>₹ {item.totalAmount}</Text>
          </View>
          <View style={styles.textInfoContainerTotal}>
            <Text style={styles.totalBillTitle}>Total Amount</Text>
            <Text style={styles.totalBillAmount}>
              ₹ {Number(item?.totalAmount) + Number(selectedRoom?.rent)}
            </Text>
          </View>
          {item.pendingAmount > 0 && (
            <View style={styles.textInfoContainerTotal}>
              <Text style={styles.totalBillTitle}>Pending Amount</Text>
              <Text style={[styles.totalBillAmount, {color: colors.error}]}>
                ₹ {item.pendingAmount}
              </Text>
            </View>
          )}
        </View>
        {!item?.paidStatus && (
          <View style={styles.actionButtonsContainer}>
            <IconButton
              icon={'whatsapp'}
              mode="contained"
              onPress={() => handleWhatsAppReminder(item)}>
              Send Reminder
            </IconButton>
            <IconButton
              icon={'message-processing'}
              mode="contained"
              onPress={() => handleSMSReminder(item)}>
              Send Reminder
            </IconButton>
            <IconButton
              icon={'phone'}
              mode="contained"
              onPress={() => onOpenDialer(selectedRoomTenets?.phone)}>
              Send Reminder
            </IconButton>
          </View>
        )}
      </Pressable>
    ),
    [
      selectedRoom,
      colors,
      handleWhatsAppReminder,
      handleSMSReminder,
      selectedRoomTenets,
      handleMarkAsPaid,
      styles.detailContainer,
      styles.image,
      styles.imageContainer,
      styles.monthText,
      styles.roomCard,
      styles.statusContainer,
      styles.statusText,
      styles.textInfoContainer,
      styles.textInfoContainerTotal,
      styles.title,
      styles.totalBillAmount,
      styles.totalBillTitle,
      styles.paymentButtonsContainer,
      styles.actionButtonsContainer,
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
      <Header title={selectedRoomTenets?.name} />
      <VirtualizedScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }>
        {totalPendingAmount > 0 && (
          <View style={styles.pendingSummaryContainer}>
            <Text style={styles.pendingSummaryText}>
              Total Pending Amount: ₹{totalPendingAmount}
            </Text>
          </View>
        )}
        <FlatList
          data={selectedRoomTenetRecords}
          ItemSeparatorComponent={<View style={styles.separator} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyComponent title="No Bill Record Added Yet!" />
          }
        />
      </VirtualizedScrollView>
      {loading && <Loader />}
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />
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
      <MyDialog
        title={'Update Your Details'}
        body={"User details not found, you need to update you'r details first!"}
        visible={userDialog}
        setVisible={setUserDialog}
        doneTitle="Update"
        donePress={() => navigation.navigate(RoutesName.PROFILE)}
      />
    </Container>
  );
};

export default MonthlyBreakdown;
