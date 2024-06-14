import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import {useTypedSelector} from '../../Store/MainStore';
import {
  selectRoomTenantRecords,
  selectSelectedTenant,
} from '../../Store/Slices/AuthSlice';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {Badge, FAB, IconButton, useTheme} from 'react-native-paper';
import AddTenetRecordModal from '../../Components/Modals/AddTenetRecordModal';
import {
  getUserRoomsTenantsRecord,
  markAsPaidRecord,
} from '../../Services/Collections';
import moment from 'moment';

const MonthlyBreakdown = () => {
  const selectedRoomTenets = useTypedSelector(selectSelectedTenant);
  const selectedRoomTenetRecords = useTypedSelector(selectRoomTenantRecords);
  const {colors} = useTheme();
  const styles = getStyles(colors);
  const [visible, setVisible] = useState(false);
  const [markAsPaid, setMarkAsPaid] = useState({});

  useEffect(() => {
    const init = async () => {
      await getUserRoomsTenantsRecord();
    };
    init();
  }, []);
  const _onPressMarkAsPaid = async () => {
    try {
      await markAsPaidRecord(markAsPaid);
      setMarkAsPaid({});
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
        contentContainerStyle={{padding: 20, paddingBottom: 100}}>
        <FlatList
          data={selectedRoomTenetRecords}
          ItemSeparatorComponent={<View style={{height: 15}} />}
          renderItem={({item, i}) => {
            console.log('🚀 ~ MonthlyBreakdown ~ item:', item);
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
              </Pressable>
            );
          }}
        />
      </VirtualizedScrollView>
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />
      <AddTenetRecordModal
        visible={visible}
        hideModal={() => setVisible(false)}
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
