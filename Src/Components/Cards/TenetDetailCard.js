import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import AppleStyleSwipeableRow from '../Swipable/AppleStyleSwipeableRow';
import moment from 'moment';
import {Icon, Surface, Text, useTheme} from 'react-native-paper';
import {onOpenDialer} from '../../Utils/helperFunction';

const TenetDetailCard = ({item, deleteRoomTenet, onPress}) => {
  const {colors} = useTheme();

  const getInitials = (name = '') => {
    if (!name) return 'T';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AppleStyleSwipeableRow
      style={styles.swipeableRow}
      onSwipe={() => deleteRoomTenet(item)}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}>
        <Surface style={styles.cardSurface}>
          <View style={styles.cardHeader}>
            <View style={styles.tenantIdentity}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(item?.name)}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.tenantName}>{item?.name || 'Previous Tenant'}</Text>
                <Text style={styles.tenantMeta}>
                  {item?.startDate
                    ? `Occupied: ${moment(item?.startDate, 'DD-MMMM-YYYY').format('MMM YYYY')}`
                    : 'Historic Record'}
                </Text>
              </View>
            </View>

            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>Past Tenant</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Bill Paid</Text>
              <Text style={styles.infoValue}>
                ₹ {item?.lastPaidAmount || '0'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Paid Month</Text>
              <Text style={styles.infoValue}>
                {item?.lastPaidDate
                  ? moment(item?.lastPaidDate).format('MMM YYYY')
                  : '-'}
              </Text>
            </View>

            {item?.phone ? (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => onOpenDialer(item?.phone)}>
                <Icon source="phone" size={16} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </Surface>
      </TouchableOpacity>
    </AppleStyleSwipeableRow>
  );
};

export default TenetDetailCard;

const styles = StyleSheet.create({
  swipeableRow: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#94A3B8',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  tenantMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  historyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  callBtn: {
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
});
