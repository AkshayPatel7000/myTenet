import React, {useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {FAB, Text, useTheme} from 'react-native-paper';
import Container from '../../Components/Container';
import AddRoomModal from '../../Components/Modals/AddRoomModal';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {
  getRoomDetails,
  getUserRooms,
  removeUserRoom,
} from '../../Services/Collections';
import {useTypedSelector} from '../../Store/MainStore';
import {selectUserRooms} from '../../Store/Slices/AuthSlice';
import RoutesName from '../../Utils/Resource/RoutesName';
import Header from '../../Components/Header/Header';
import moment from 'moment';
import {Image} from 'react-native';
import SVG from '../../Assets/SVG';
import Loader from '../../Components/Loader';
import {RefreshControl} from 'react-native';
import LottieView from 'lottie-react-native';
import EmptyComponent from '../../Components/EmptyComponent';
import AppleStyleSwipeableRow from '../../Components/Swipable/AppleStyleSwipeableRow';
import MyDialog from '../../Components/Modals/Dialog';

const MyTenant = ({navigation}) => {
  const [showDialog, setShowDialog] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const rooms = useTypedSelector(selectUserRooms);
  const {colors} = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const onPress = async room => {
    setLoading(true);
    await getRoomDetails(room.roomId);
    setLoading(false);
    navigation.navigate(RoutesName.ROOM_DETAILS);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getUserRooms();
    setRefreshing(false);
  }, []);

  const deleteRoom = async room => {
    try {
      setLoading(true);
      await removeUserRoom(room);
      setShowDialog(null);
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ deleteRoom ~ error:', error);
    }
  };

  return (
    <Container>
      <Header back={false} title="My Rooms" />
      {loading && <Loader />}
      <VirtualizedScrollView
        contentContainerStyle={{padding: 20}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }>
        <FlatList
          data={rooms}
          ItemSeparatorComponent={<View style={{height: 15}} />}
          renderItem={({item}) => {
            return (
              <AppleStyleSwipeableRow
                style={styles.roomCardMain}
                onSwipe={() => setShowDialog(item)}>
                <TouchableOpacity
                  style={styles.roomCard}
                  onPress={() => onPress(item)}>
                  <View
                    style={{
                      width: 80,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <SVG.ROOM />
                  </View>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flex: 1,
                        marginBottom: 5,
                      }}>
                      <Text style={styles.roomName}>{item?.roomName}</Text>
                      <Text style={styles.room}>No. {item?.roomNo}</Text>
                    </View>
                    <Text style={styles.roomTenetName}>{item?.tenetName}</Text>
                    <Text style={styles.roomStartDate}>
                      {item?.startDate &&
                        moment(item?.startDate, 'DD-MMMM-YYYY').format(
                          'DD MMMM YYYY',
                        )}
                    </Text>
                  </View>
                </TouchableOpacity>
              </AppleStyleSwipeableRow>
            );
          }}
          ListEmptyComponent={<EmptyComponent title="No Room Added Yet!" />}
        />
      </VirtualizedScrollView>
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />
      <AddRoomModal visible={visible} hideModal={() => setVisible(false)} />
      <MyDialog
        setVisible={() => setShowDialog(null)}
        visible={showDialog}
        title={'Delete Room'}
        body={'Are you sure you want to delete the room?'}
        donePress={() => deleteRoom(showDialog?.roomId)}
        doneTitle="Delete"
      />
    </Container>
  );
};

export default MyTenant;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  roomCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 10,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomCardMain: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    elevation: 10,
  },
  roomName: {
    fontSize: 18,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  roomTenetName: {
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '400',
    lineHeight: 20,
  },
  roomStartDate: {
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '400',
  },
});
