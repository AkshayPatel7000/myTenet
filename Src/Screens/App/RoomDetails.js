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

const RoomDetails = ({navigation}) => {
  const selectedRoom = useTypedSelector(selectSelectedRoom);
  const selectedRoomTenets = useTypedSelector(selectRoomTenants);
  const [visible, setVisible] = useState(false);
  const [visibleTenet, setVisibleTenet] = useState(false);
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
  return (
    <Container>
      <Header title={selectedRoom?.roomName} />

      <VirtualizedScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{paddingHorizontal: 20, flex: 1}}>
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
              onPress={() => setVisible(true)}
            />
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
        </LinearGradient>

        {currentTenet && (
          <View style={{marginBottom: 20}}>
            <Text>Current Tenant</Text>
            <TouchableOpacity
              style={styles.currentTenantCard}
              onPress={() => onPress(currentTenet)}>
              <Text style={styles.name}>{currentTenet?.name}</Text>
              <View style={styles.roomDetailsCardItem}>
                <Text style={styles.tenetDetailItemText}>Last Bill Paid</Text>
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

        {selectedRoomTenets?.length > 0 && <Text>History</Text>}
        <FlatList
          contentContainerStyle={{flexGrow: 1}}
          data={selectedRoomTenets}
          renderItem={({item}) => {
            if (currentTenet?.tenantId === item?.tenantId) {
              return null;
            }
            return (
              <TouchableOpacity
                style={styles.currentTenantCard}
                onPress={() => onPress(item)}>
                <Text style={styles.name}>{item?.name}</Text>
                <View style={styles.roomDetailsCardItem}>
                  <Text style={styles.tenetDetailItemText}>Last Bill Paid</Text>
                  <Text style={styles.tenetDetailItemText}>
                    ₹ {item?.lastPaidAmount || '-'}
                  </Text>
                </View>
                <View style={styles.roomDetailsCardItem}>
                  <Text style={styles.tenetDetailItemText}>Month</Text>
                  <Text style={styles.tenetDetailItemText}>
                    {item?.lastPaidDate
                      ? moment(item?.lastPaidDate).format('MMMM YYYY')
                      : '-'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </VirtualizedScrollView>
      {loading && <Loader />}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisibleTenet(true)}
      />
      <AddTenetModal
        visible={visibleTenet}
        hideModal={() => setVisibleTenet(false)}
      />
      <AddRoomModal
        hideModal={() => setVisible(false)}
        visible={visible}
        editData={selectedRoom}
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
    padding: 15,
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
});
