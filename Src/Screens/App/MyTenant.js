import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FAB} from 'react-native-paper';
import Container from '../../Components/Container';
import AddRoomModal from '../../Components/Modals/AddRoomModal';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {getRoomDetails} from '../../Services/Collections';
import {useTypedSelector} from '../../Store/MainStore';
import {selectUserRooms} from '../../Store/Slices/AuthSlice';
import RoutesName from '../../Utils/Resource/RoutesName';
import Header from '../../Components/Header/Header';
import moment from 'moment';
import {Image} from 'react-native';
import SVG from '../../Assets/SVG';

const MyTenant = ({navigation}) => {
  const [visible, setVisible] = useState(false);
  const rooms = useTypedSelector(selectUserRooms);
  const onPress = async room => {
    await getRoomDetails(room.roomId);
    navigation.navigate(RoutesName.ROOM_DETAILS);
  };

  return (
    <Container>
      <Header back={false} title="My Rooms" />
      <VirtualizedScrollView contentContainerStyle={{padding: 20}}>
        <FlatList
          data={rooms}
          ItemSeparatorComponent={<View style={{height: 15}} />}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() => onPress(item)}
                style={styles.roomCard}>
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
            );
          }}
        />
      </VirtualizedScrollView>
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />
      <AddRoomModal visible={visible} hideModal={() => setVisible(false)} />
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
    borderRadius: 12,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
