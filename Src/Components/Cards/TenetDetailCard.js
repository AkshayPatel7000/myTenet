import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import AppleStyleSwipeableRow from '../Swipable/AppleStyleSwipeableRow';
import moment from 'moment';
import {Icon, Surface, Text, useTheme} from 'react-native-paper';
import {onOpenDialer} from '../../Utils/helperFunction';

const TenetDetailCard = ({item, deleteRoomTenet, onPress}) => {
  const {colors, dark} = useTheme();

  const getInitials = (name = '') => {
    if (!name) return 'T';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AppleStyleSwipeableRow
      style={[styles.swipeableRow, {backgroundColor: colors.surface}]}
      onSwipe={() => deleteRoomTenet(item)}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}>
        <Surface style={[styles.cardSurface, {backgroundColor: colors.surface}]}>
          <View style={styles.cardHeader}>
            <View style={styles.tenantIdentity}>
              <View style={[styles.avatarCircle, {backgroundColor: dark ? '#334155' : '#F1F5F9'}]}>
                <Text style={[styles.avatarText, {color: colors.onSurface}]}>{getInitials(item?.name)}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={[styles.tenantName, {color: colors.onSurface}]}>
                  {item?.name || 'Previous Tenant'}
                </Text>
                <Text style={[styles.tenantMeta, {color: colors.onSurfaceVariant}]}>
                  {item?.startDate
                    ? `Occupied: ${moment(item?.startDate, 'DD-MMMM-YYYY').format('MMM YYYY')}`
                    : 'Historic Record'}
                </Text>
              </View>
            </View>

            <View style={[styles.historyBadge, {backgroundColor: dark ? '#334155' : '#F1F5F9'}]}>
              <Text style={[styles.historyBadgeText, {color: colors.onSurfaceVariant}]}>
                Past Tenant
              </Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: colors.outlineVariant || '#F1F5F9'}]} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, {color: colors.onSurfaceVariant}]}>Last Bill Paid</Text>
              <Text style={[styles.infoValue, {color: colors.onSurface}]}>
                ₹ {item?.lastPaidAmount || '0'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, {color: colors.onSurfaceVariant}]}>Paid Month</Text>
              <Text style={[styles.infoValue, {color: colors.onSurface}]}>
                {item?.lastPaidDate
                  ? moment(item?.lastPaidDate).format('MMM YYYY')
                  : '-'}
              </Text>
            </View>

            {item?.phone ? (
              <TouchableOpacity
                style={[styles.callBtn, {backgroundColor: dark ? '#312E81' : '#EEF2FF'}]}
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
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardSurface: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  tenantMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
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
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  callBtn: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
});
