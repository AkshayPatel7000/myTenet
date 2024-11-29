import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {FAB, IconButton, Text, useTheme} from 'react-native-paper';
import Container from '../../Components/Container';
import AddRoomModal from '../../Components/Modals/AddRoomModal';
import AddTenetModal from '../../Components/Modals/AddTenetModal';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {
  getUserRoomsTenants,
  getUserRoomsTenantsDetails,
  removeRoomTenet,
} from '../../Services/Collections';
import {useTypedSelector} from '../../Store/MainStore';
import {
  selectRoomTenants,
  selectSelectedRoom,
} from '../../Store/Slices/AuthSlice';
import RoutesName from '../../Utils/Resource/RoutesName';
import Header from '../../Components/Header/Header';
import {onOpenDialer} from '../../Utils/helperFunction';
import Loader from '../../Components/Loader';
import {RefreshControl} from 'react-native';
import EmptyComponent from '../../Components/EmptyComponent';
import AppleStyleSwipeableRow from '../../Components/Swipable/AppleStyleSwipeableRow';
import TenetDetailCard from '../../Components/Cards/TenetDetailCard';
import MyDialog from '../../Components/Modals/Dialog';

const RoomDetails = ({navigation}) => {
  const selectedRoom = useTypedSelector(selectSelectedRoom);
  const selectedRoomTenets = useTypedSelector(selectRoomTenants);
  const [showDialog, setShowDialog] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleTenet, setVisibleTenet] = useState({open: false, edit: {}});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const {colors} = useTheme();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await getUserRoomsTenants();
      setLoading(false);
    };
    init();
  }, [selectedRoom]);

  const onPress = async tenet => {
    setLoading(true);
    await getUserRoomsTenantsDetails(tenet.tenantId);
    setLoading(false);

    navigation.navigate(RoutesName.MONTHLY_BREAKDOWN);
  };

  const currentTenet = useMemo(() => {
    return selectedRoomTenets.find(
      e => e?.tenantId === selectedRoom?.currentTenantId,
    );
  }, [selectedRoom.currentTenantId, selectedRoomTenets]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getUserRoomsTenants();
    setRefreshing(false);
  }, []);
  const deleteRoomTenet = async item => {
    try {
      setLoading(true);
      await removeRoomTenet(item);
      setShowDialog(null);

      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ deleteRoomTenet ~ error:', error);
    }
    console.log('🚀 ~ deleteRoomTenet ~ item:', item);
  };

  return (
    <Container>
      <Header
        title={selectedRoom?.roomName}
        right={'pencil-outline'}
        rightIconPress={() => setVisible(true)}
      />

      <FlatList
        contentContainerStyle={{padding: 20, paddingBottom: 80}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {currentTenet && (
              <LinearGradient
                useAngle={true}
                angle={50}
                colors={['#A855F7', '#6366F1']}
                style={styles.roomDetailsCard}>
                <View style={styles.headingContainer}>
                  <Text style={styles.roomNameText}>Tenant Details</Text>
                  <IconButton
                    icon={'pencil-outline'}
                    iconColor={'#fff'}
                    onPress={() =>
                      setVisibleTenet({open: true, edit: currentTenet})
                    }
                  />
                </View>
                <View style={styles.roomDetailsCardItem}>
                  <Text style={styles.cardDetailItemText}>Room rent </Text>
                  <Text style={styles.cardDetailItemText}>
                    ₹ {selectedRoom?.rent || '0'}
                  </Text>
                </View>
                <View style={styles.roomDetailsCardItem}>
                  <Text style={styles.cardDetailItemText}>Start date </Text>
                  <Text style={styles.cardDetailItemText}>
                    {currentTenet?.startDate
                      ? moment(currentTenet?.startDate, 'DD-MMMM-YYYY').format(
                          'DD MMMM YYYY',
                        )
                      : '-'}
                  </Text>
                </View>
                <View style={styles.roomDetailsCardItem}>
                  <Text style={styles.cardDetailItemText}>Name </Text>
                  <Text style={styles.cardDetailItemText}>
                    {currentTenet?.name || '-'}
                  </Text>
                </View>
                <View style={styles.roomDetailsCardItem}>
                  <Text style={styles.cardDetailItemText}>Mobile </Text>
                  <TouchableOpacity
                    onPress={() =>
                      currentTenet?.phone && onOpenDialer(currentTenet?.phone)
                    }>
                    <Text style={styles.cardDetailItemText}>
                      {currentTenet?.phone || '-'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showMore && (
                  <View style={styles.roomDetailsCardItem}>
                    <Text style={styles.cardDetailItemText}>Aadhar No.</Text>
                    <View>
                      <Text style={styles.cardDetailItemText}>
                        {currentTenet.aadharNo}
                      </Text>
                    </View>
                  </View>
                )}
                {showMore &&
                  currentTenet?.otherMembers?.map((member, index) => {
                    return (
                      <>
                        <Text style={styles.cardDetailItemMemberText}>
                          Member {index + 1}
                        </Text>
                        <View style={styles.roomDetailsCardItem}>
                          <Text style={styles.cardDetailItemText}>Name</Text>
                          <View>
                            <Text style={styles.cardDetailItemText}>
                              {member.name}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.roomDetailsCardItem}>
                          <Text style={styles.cardDetailItemText}>Phone</Text>
                          <TouchableOpacity
                            onPress={() =>
                              currentTenet?.phone &&
                              onOpenDialer(currentTenet?.phone)
                            }>
                            <Text style={styles.cardDetailItemText}>
                              {member.phone}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.roomDetailsCardItem}>
                          <Text style={styles.cardDetailItemText}>
                            Aadhar No.
                          </Text>
                          <View>
                            <Text style={styles.cardDetailItemText}>
                              {member.aadharNo}
                            </Text>
                          </View>
                        </View>
                      </>
                    );
                  })}
                {currentTenet?.otherMembers?.length > 0 && (
                  <View style={styles.roomDetailsCardItem}>
                    <Text style={styles.cardDetailItemText}> </Text>
                    <TouchableOpacity onPress={() => setShowMore(pre => !pre)}>
                      <Text style={styles.cardDetailItemText}>
                        View {showMore ? 'Less' : 'More'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            )}

            {currentTenet && (
              <View style={{marginBottom: 20}}>
                <Text>Current Tenant</Text>
                <TouchableOpacity
                  style={[styles.currentTenantCard, {padding: 15}]}
                  onPress={() => onPress(currentTenet)}>
                  <Text style={styles.name}>{currentTenet?.name}</Text>
                  <View style={styles.roomDetailsCardItem}>
                    <Text style={styles.tenetDetailItemText}>
                      Last Bill Paid
                    </Text>
                    <Text style={styles.tenetDetailItemText}>
                      ₹ {currentTenet?.lastPaidAmount || '-'}
                    </Text>
                  </View>
                  <View style={styles.roomDetailsCardItem}>
                    <Text style={styles.tenetDetailItemText}>Month</Text>
                    <Text style={styles.tenetDetailItemText}>
                      {currentTenet?.lastPaidDate
                        ? moment(currentTenet?.lastPaidDate).format('MMMM YYYY')
                        : '-'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {selectedRoomTenets?.length > 1 && <Text>History</Text>}
          </>
        }
        data={selectedRoomTenets}
        renderItem={({item}) => {
          if (currentTenet?.tenantId === item?.tenantId) {
            return null;
          }
          return (
            <TenetDetailCard
              item={item}
              deleteRoomTenet={setShowDialog}
              onPress={onPress}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyComponent title="No Tenet Record Added Yet!" />
        }
      />

      {loading && <Loader />}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisibleTenet({open: true, edit: {}})}
      />
      <AddTenetModal
        visible={visibleTenet?.open}
        hideModal={() => setVisibleTenet({open: false, edit: {}})}
        editData={visibleTenet?.edit}
      />
      <AddRoomModal
        hideModal={() => setVisible(false)}
        visible={visible}
        editData={selectedRoom}
      />
      <MyDialog
        setVisible={() => setShowDialog(null)}
        visible={showDialog}
        title={'Delete Tenet'}
        body={'Are you sure you want to delete the tenet?'}
        donePress={() => deleteRoomTenet(showDialog)}
        doneTitle="Delete"
      />
    </Container>
  );
};

export default RoomDetails;

const styles = StyleSheet.create({
  roomDetailsCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  roomDetailsCard: {
    width: '100%',
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardDetailItemText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tenetDetailItemText: {
    fontWeight: '400',
    fontSize: 14,
  },
  roomNameText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  currentTenantCard: {
    backgroundColor: '#fff',
    elevation: 10,
    // padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
  },
  name: {
    fontSize: 16,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  cardDetailItemMemberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
  },
});
