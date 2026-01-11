import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import AppleStyleSwipeableRow from '../Swipable/AppleStyleSwipeableRow';
import moment from 'moment';
import {Text, useTheme} from 'react-native-paper';

const TenetDetailCard = ({item, deleteRoomTenet, onPress}) => {
  const {colors} = useTheme();
  return (
    <AppleStyleSwipeableRow
      style={styles.currentTenantCard}
      onSwipe={() => deleteRoomTenet(item)}>
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={{backgroundColor: colors.background, padding: 15}}>
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
    </AppleStyleSwipeableRow>
  );
};

export default TenetDetailCard;

const styles = StyleSheet.create({
  roomDetailsCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },

  tenetDetailItemText: {
    fontWeight: '400',
    fontSize: 14,
  },

  currentTenantCard: {
    backgroundColor: '#fff',
    elevation: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  name: {
    fontSize: 16,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
});
