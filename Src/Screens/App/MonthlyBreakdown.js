import {Image, Pressable, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import {useTypedSelector} from '../../Store/MainStore';
import {
  selectRoomTenantRecords,
  selectSelectedRoom,
  selectSelectedTenant,
  selectUserProfile,
} from '../../Store/Slices/AuthSlice';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {
  Badge,
  FAB,
  IconButton,
  useTheme,
  Text,
  Button,
} from 'react-native-paper';
import AddTenetRecordModal from '../../Components/Modals/AddTenetRecordModal';
import {
  getUserRoomsTenantsRecord,
  markAsPaidRecord,
} from '../../Services/Collections';
import moment from 'moment';
import {
  onOpenDialer,
  onSendSMSMessage,
  sendWhatsAppMessage,
} from '../../Utils/helperFunction';
import {RefreshControl} from 'react-native';
import MyDialog from '../../Components/Modals/Dialog';
import RoutesName from '../../Utils/Resource/RoutesName';
import Loader from '../../Components/Loader';

const MonthlyBreakdown = ({navigation}) => {
  const selectedRoomTenets = useTypedSelector(selectSelectedTenant);
  const user = useTypedSelector(selectUserProfile);
  console.log('🚀 ~ MonthlyBreakdown ~ user:', user);
  const [userDialog, setUserDialog] = useState(false);
  const selectedRoom = useTypedSelector(selectSelectedRoom);
  const selectedRoomTenetRecords = useTypedSelector(selectRoomTenantRecords);
  const {colors} = useTheme();
  const styles = getStyles(colors);
  const [visible, setVisible] = useState(false);
  const [markAsPaid, setMarkAsPaid] = useState({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getUserRoomsTenantsRecord();
    setRefreshing(false);
  }, []);
  const whatsAppMessage = ({
    date = '0',
    oldReading = '0',
    newReading = '0',
    units = '0',
    amount = '0',
    phone = '',
    upi = '',
    roomRent = '',
    eleBill = '',
  }) =>
    `Hi ${selectedRoomTenets?.name}\n\n_Electricity bill of month_ *${date}*\n_Last month reading_ *${oldReading}*\n_Current month reading_ *${newReading}*\n_Total unit_ *${units}*\n_Total electricity bill_ *${eleBill}* \n_Room Rent_ *${roomRent}*\n_Total Amount_ *${amount}*\n\nPlease pay you bill on time on mobile no. *${phone}* or _${upi}_`;
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await getUserRoomsTenantsRecord();
      setLoading(false);
    };
    init();
  }, []);
  const _onPressMarkAsPaid = async () => {
    try {
      setLoading(true);

      await markAsPaidRecord(markAsPaid);
      setMarkAsPaid({});
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ MonthlyBreakdown ~ error:', error);
    }
  };
  return (
    <Container>
      <Header
        title={selectedRoomTenets?.name}
        right={!!markAsPaid?.recordId && 'basket-check-outline'}
        rightIconPress={_onPressMarkAsPaid}
      />
      <VirtualizedScrollView
        contentContainerStyle={{padding: 20, paddingBottom: 100}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }>
        <FlatList
          data={selectedRoomTenetRecords}
          ItemSeparatorComponent={<View style={{height: 15}} />}
          renderItem={({item, i}) => {
            return (
              <Pressable
                onLongPress={() => {
                  if (!item.paidStatus) {
                    setMarkAsPaid(item);
                  }
                }}
                style={[
                  styles.roomCard,
                  {
                    borderWidth: item.paidStatus ? 0 : 2,
                    borderColor: item.paidStatus ? '#fff' : colors.error,
                  },
                ]}>
                <View style={{height: 200}}>
                  <Image
                    source={{uri: item?.image}}
                    style={{
                      flex: 1,
                      borderTopRightRadius: 8,
                      borderTopLeftRadius: 8,
                    }}
                  />
                </View>
                <View style={styles.detailContainer}>
                  <Text style={styles.monthText}>
                    {moment(item.createdAt).format('MMMM YYYY')}
                  </Text>
                  <View style={styles.textInfoContainer}>
                    <Text style={styles.title}>Previous Reading</Text>
                    <Text>{Number(item.currentReading)}</Text>
                  </View>
                  <View style={styles.textInfoContainer}>
                    <Text style={styles.title}>Current Reading</Text>
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
                    <Text style={styles.totalBillTitle}>
                      Total Electricity bill
                    </Text>
                    <Text style={styles.totalBillAmount}>
                      ₹ {item.totalAmount}
                    </Text>
                  </View>
                </View>
                {markAsPaid?.recordId === item?.recordId && (
                  <IconButton
                    onPress={() => setMarkAsPaid({})}
                    icon={'check'}
                    style={{position: 'absolute'}}
                    mode="contained-tonal"
                  />
                )}
                <View
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    backgroundColor: item.paidStatus
                      ? colors.primary
                      : colors.error,
                    borderRadius: 50,
                  }}>
                  <Text
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      color: '#fff',
                      fontWeight: '500',
                    }}>
                    {item.paidStatus ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>
                {!item?.paidStatus && (
                  <View style={{flexDirection: 'row'}}>
                    <IconButton
                      icon={'whatsapp'}
                      mode="contained"
                      onPress={() => {
                        if (!user?.phone || !user?.upi) {
                          setUserDialog(true);
                          return;
                        }
                        sendWhatsAppMessage(
                          whatsAppMessage({
                            date: moment(item?.createdAt).format('MMMM YYYY'),
                            newReading: item?.currentReading,
                            oldReading: item?.previousReading,
                            amount:
                              Number(item?.totalAmount) +
                              Number(selectedRoom?.rent),
                            units: item?.totalUnitBurned,
                            roomRent: selectedRoom?.rent,
                            eleBill: item.totalAmount,
                            phone: user?.phone,
                            upi: user?.upi,
                          }),
                          selectedRoomTenets?.phone,
                        );
                      }}>
                      Send Reminder
                    </IconButton>
                    <IconButton
                      icon={'message-processing'}
                      mode="contained"
                      onPress={() => {
                        if (!user?.phone || !user?.upi) {
                          setUserDialog(true);
                          return;
                        }
                        onSendSMSMessage(
                          whatsAppMessage({
                            date: moment(item?.createdAt).format('MMMM YYYY'),
                            newReading: item?.currentReading,
                            oldReading: item?.previousReading,
                            amount:
                              Number(item?.totalAmount) +
                              Number(selectedRoom?.rent),
                            units: item?.totalUnitBurned,
                            roomRent: selectedRoom?.rent,
                            eleBill: item.totalAmount,
                            phone: user?.phone,
                            upi: user?.upi,
                          }),
                          selectedRoomTenets?.phone,
                        );
                      }}>
                      Send Reminder
                    </IconButton>
                    <IconButton
                      icon={'phone'}
                      mode="contained"
                      onPress={() => {
                        onOpenDialer(selectedRoomTenets?.phone);
                      }}>
                      Send Reminder
                    </IconButton>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </VirtualizedScrollView>
      {loading && <Loader />}
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />
      <AddTenetRecordModal
        visible={visible}
        hideModal={() => setVisible(false)}
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
const getStyles = colors => {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 50,
    },
    roomCard: {
      backgroundColor: '#fff',
      width: '100%',
      padding: 10,
      borderRadius: 12,
      elevation: 10,
    },
    monthText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    detailContainer: {
      paddingVertical: 10,
      paddingHorizontal: 5,
    },
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
      paddingTop: 10,
      borderTopWidth: 1,
    },
    totalBillAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
    },
  });
};
