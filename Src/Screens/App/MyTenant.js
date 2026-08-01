import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {FAB, Icon, IconButton, Surface, Text, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../../Components/Container';
import AddRoomModal from '../../Components/Modals/AddRoomModal';
import UnifiedQuickSetupModal from '../../Components/Modals/UnifiedQuickSetupModal';
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
import Loader from '../../Components/Loader';
import EmptyComponent from '../../Components/EmptyComponent';
import AppleStyleSwipeableRow from '../../Components/Swipable/AppleStyleSwipeableRow';
import MyDialog from '../../Components/Modals/Dialog';

const AnimatedRoomCard = ({item, index, onPress, onDeletePrompt}) => {
  const {colors, dark} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const hasTenant = !!item?.tenetName;
  const isOccupied = hasTenant;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateY: translateYAnim}, {scale: scaleAnim}],
      }}>
      <AppleStyleSwipeableRow
        style={[styles.swipeableContainer, {backgroundColor: colors.surface}]}
        onSwipe={() => onDeletePrompt(item)}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onPress(item)}>
          <Surface style={[styles.cardSurface, {backgroundColor: colors.surface, borderLeftColor: isOccupied ? colors.primary : '#F59E0B'}]}>
            <View style={styles.cardHeader}>
              <View style={styles.roomIdentity}>
                <View style={[styles.iconCircle, {backgroundColor: isOccupied ? (dark ? '#312E81' : '#EEF2FF') : (dark ? '#78350F' : '#FEF3C7')}]}>
                  <Icon
                    source="home-city"
                    size={24}
                    color={isOccupied ? colors.primary : '#D97706'}
                  />
                </View>
                <View>
                  <Text style={[styles.roomNameText, {color: colors.onSurface}]}>{item?.roomName}</Text>
                  <Text style={[styles.roomNoText, {color: colors.onSurfaceVariant}]}>Room No. {item?.roomNo}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: isOccupied ? (dark ? '#064E3B' : '#DCFCE7') : (dark ? '#78350F' : '#FEF3C7')},
                ]}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: isOccupied ? '#16A34A' : '#D97706'},
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {color: isOccupied ? (dark ? '#6EE7B7' : '#15803D') : (dark ? '#FDE68A' : '#B45309')},
                  ]}>
                  {isOccupied ? 'Occupied' : 'Vacant'}
                </Text>
              </View>
            </View>

            <View style={[styles.cardDivider, {backgroundColor: colors.outlineVariant || '#F1F5F9'}]} />

            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <Icon source="account" size={18} color={colors.onSurfaceVariant} />
                <Text style={[styles.detailLabel, {color: colors.onSurfaceVariant}]}>Tenant:</Text>
                <Text style={[styles.detailValue, {color: colors.onSurface}]}>
                  {hasTenant ? item?.tenetName : 'No active tenant assigned'}
                </Text>
              </View>

              <View style={[styles.statsGrid, {backgroundColor: dark ? '#334155' : '#F8FAFC'}]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, {color: colors.onSurfaceVariant}]}>Monthly Rent</Text>
                  <Text style={[styles.statValue, {color: colors.onSurface}]}>₹ {item?.rent || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, {color: colors.onSurfaceVariant}]}>Rate / Unit</Text>
                  <Text style={[styles.statValue, {color: colors.onSurface}]}>₹ {item?.perUnit || 10}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, {color: colors.onSurfaceVariant}]}>Baseline Reading</Text>
                  <Text style={[styles.statValue, {color: colors.onSurface}]}>{item?.startReading || 0}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={[styles.footerDate, {color: colors.onSurfaceVariant}]}>
                {item?.startDate
                  ? `Assigned: ${moment(item?.startDate, 'DD-MMMM-YYYY').format('DD MMM YYYY')}`
                  : 'Created recently'}
              </Text>
              <View style={styles.footerAction}>
                <Text style={[styles.actionLink, {color: colors.primary}]}>View Details</Text>
                <Icon source="chevron-right" size={18} color={colors.primary} />
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </AppleStyleSwipeableRow>
    </Animated.View>
  );
};

const MyTenant = ({navigation}) => {
  const [showDialog, setShowDialog] = useState(null);
  const [visible, setVisible] = useState(false);
  const [quickSetupVisible, setQuickSetupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const rooms = useTypedSelector(selectUserRooms);
  const {colors, dark} = useTheme();
  const [refreshing, setRefreshing] = useState(false);

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

  const deleteRoom = async roomId => {
    try {
      setLoading(true);
      await removeUserRoom(roomId);
      setShowDialog(null);
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ deleteRoom ~ error:', error);
    }
  };

  const occupiedCount = rooms?.filter(r => !!r.tenetName).length || 0;
  const vacantCount = (rooms?.length || 0) - occupiedCount;

  return (
    <Container>
      <Header
        back={false}
        title="My Properties & Rooms"
        subtitle="Manage rooms & tenant assignments"
        right="plus"
        rightText="Add Room"
        rightIconPress={() => setQuickSetupVisible(true)}
      />

      {loading && <Loader message="Loading properties..." />}

      <VirtualizedScrollView
        contentContainerStyle={{padding: 16, paddingBottom: 150}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }>
        {/* Properties Summary Pill Bar */}
        {rooms && rooms.length > 0 ? (
          <View style={styles.summaryBar}>
            <View style={[styles.summaryPill, {backgroundColor: dark ? '#312E81' : '#EEF2FF'}]}>
              <Icon source="home-city" size={16} color={colors.primary} />
              <Text style={[styles.summaryPillText, {color: colors.primary}]}>{rooms.length} Rooms</Text>
            </View>
            <View style={[styles.summaryPill, {backgroundColor: dark ? '#064E3B' : '#DCFCE7'}]}>
              <Icon source="check-circle" size={16} color="#16A34A" />
              <Text style={[styles.summaryPillText, {color: dark ? '#6EE7B7' : '#15803D'}]}>
                {occupiedCount} Occupied
              </Text>
            </View>
            <View style={[styles.summaryPill, {backgroundColor: dark ? '#78350F' : '#FEF3C7'}]}>
              <Icon source="clock-outline" size={16} color="#D97706" />
              <Text style={[styles.summaryPillText, {color: dark ? '#FDE68A' : '#B45309'}]}>
                {vacantCount} Vacant
              </Text>
            </View>
          </View>
        ) : null}

        <FlatList
          data={rooms}
          scrollEnabled={false}
          ItemSeparatorComponent={<View style={{height: 14}} />}
          renderItem={({item, index}) => (
            <AnimatedRoomCard
              item={item}
              index={index}
              onPress={onPress}
              onDeletePrompt={setShowDialog}
            />
          )}
          ListEmptyComponent={
            <EmptyComponent
              title="No Properties Added Yet"
              subtitle="Set up your first property room and tenant to start tracking meter readings, rent, and monthly statements."
              actionLabel="Add Property & Tenant"
              onActionPress={() => setQuickSetupVisible(true)}
            />
          }
        />
      </VirtualizedScrollView>

      <UnifiedQuickSetupModal
        visible={quickSetupVisible}
        hideModal={() => setQuickSetupVisible(false)}
      />

      <AddRoomModal visible={visible} hideModal={() => setVisible(false)} />

      <MyDialog
        setVisible={() => setShowDialog(null)}
        visible={showDialog}
        title="Delete Room"
        body="Are you sure you want to delete this room?"
        donePress={() => deleteRoom(showDialog?.roomId)}
        doneTitle="Delete"
      />
    </Container>
  );
};

export default MyTenant;

const styles = StyleSheet.create({
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  summaryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  swipeableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardSurface: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roomNameText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  roomNoText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardBody: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    marginLeft: 6,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  footerDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLink: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },
});
