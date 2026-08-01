import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import Container from '../../Components/Container';
import AddRoomModal from '../../Components/Modals/AddRoomModal';
import AddTenetModal from '../../Components/Modals/AddTenetModal';
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
import EmptyComponent from '../../Components/EmptyComponent';
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
  const [refreshing, setRefreshing] = useState(false);
  const {colors} = useTheme();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await getUserRoomsTenants();
      setLoading(false);
    };
    init();
  }, [selectedRoom]);

  const onPressTenant = async tenet => {
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
  };

  const getInitials = (name = '') => {
    if (!name) return 'T';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const historicTenants = useMemo(() => {
    return selectedRoomTenets.filter(
      item => item?.tenantId !== currentTenet?.tenantId,
    );
  }, [selectedRoomTenets, currentTenet]);

  return (
    <Container>
      <Header
        title={selectedRoom?.roomName || 'Room Details'}
        subtitle="Tenant info, phone & billing statement history"
        right="account-plus"
        rightText="Add Tenant"
        rightIconPress={() => setVisibleTenet({open: true, edit: {}})}
      />

      {loading && <Loader />}

      <FlatList
        data={historicTenants}
        keyExtractor={(item, index) => item?.tenantId || index.toString()}
        contentContainerStyle={{padding: 16, paddingBottom: 150}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Room Info Property Card */}
            <Surface style={styles.roomInfoSurface}>
              <View style={styles.roomInfoHeader}>
                <View style={styles.roomTitleGroup}>
                  <Icon source="home-city" size={22} color={colors.primary} />
                  <Text style={styles.roomTitleText}>
                    {selectedRoom?.roomName} (Room No. {selectedRoom?.roomNo})
                  </Text>
                </View>
                <IconButton
                  icon="pencil-outline"
                  size={20}
                  iconColor="#64748B"
                  onPress={() => setVisible(true)}
                />
              </View>

              <View style={styles.roomStatsRow}>
                <View style={styles.roomStatItem}>
                  <Text style={styles.roomStatLabel}>Monthly Rent</Text>
                  <Text style={styles.roomStatValue}>
                    ₹ {selectedRoom?.rent || 0}
                  </Text>
                </View>
                <View style={styles.roomStatItem}>
                  <Text style={styles.roomStatLabel}>Rate / Unit</Text>
                  <Text style={styles.roomStatValue}>
                    ₹ {selectedRoom?.perUnit || 10}
                  </Text>
                </View>
                <View style={styles.roomStatItem}>
                  <Text style={styles.roomStatLabel}>Start Reading</Text>
                  <Text style={styles.roomStatValue}>
                    {selectedRoom?.startReading || 0}
                  </Text>
                </View>
              </View>
            </Surface>

            {/* Active Tenant Gradient Card */}
            {currentTenet ? (
              <LinearGradient
                useAngle={true}
                angle={135}
                colors={['#6366F1', '#4F46E5']}
                style={styles.activeTenantGradientCard}>
                <View style={styles.tenantHeaderRow}>
                  <View style={styles.tenantIdentityRow}>
                    <Avatar.Text
                      size={50}
                      label={getInitials(currentTenet?.name)}
                      style={styles.tenantAvatar}
                      labelStyle={styles.tenantAvatarLabel}
                    />
                    <View style={{marginLeft: 12, flex: 1}}>
                      <Text style={styles.tenantNameText}>
                        {currentTenet?.name}
                      </Text>
                      <View style={styles.activeTag}>
                        <View style={styles.activeTagDot} />
                        <Text style={styles.activeTagText}>Active Tenant</Text>
                      </View>
                    </View>
                  </View>

                  <IconButton
                    icon="pencil"
                    mode="contained"
                    containerColor="rgba(255, 255, 255, 0.2)"
                    iconColor="#FFFFFF"
                    size={18}
                    onPress={() =>
                      setVisibleTenet({open: true, edit: currentTenet})
                    }
                  />
                </View>

                {/* Tenant Phone & Details Grid */}
                <View style={styles.tenantDetailsBox}>
                  {currentTenet?.phone ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.phoneActionRow}
                      onPress={() => onOpenDialer(currentTenet?.phone)}>
                      <Icon source="phone" size={18} color="#EEF2FF" />
                      <Text style={styles.phoneActionText}>
                        {currentTenet?.phone}
                      </Text>
                      <View style={styles.callNowPill}>
                        <Text style={styles.callNowText}>Call Now</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  <View style={styles.tenantMetaGrid}>
                    <View style={styles.tenantMetaItem}>
                      <Text style={styles.tenantMetaLabel}>Move-In Date</Text>
                      <Text style={styles.tenantMetaValue}>
                        {currentTenet?.startDate
                          ? moment(
                              currentTenet?.startDate,
                              'DD-MMMM-YYYY',
                            ).format('DD MMM YYYY')
                          : '-'}
                      </Text>
                    </View>
                    <View style={styles.tenantMetaItem}>
                      <Text style={styles.tenantMetaLabel}>Last Bill Paid</Text>
                      <Text style={styles.tenantMetaValue}>
                        ₹ {currentTenet?.lastPaidAmount || '0'}
                      </Text>
                    </View>
                    <View style={styles.tenantMetaItem}>
                      <Text style={styles.tenantMetaLabel}>Paid Month</Text>
                      <Text style={styles.tenantMetaValue}>
                        {currentTenet?.lastPaidDate
                          ? moment(currentTenet?.lastPaidDate).format(
                              'MMM YYYY',
                            )
                          : '-'}
                      </Text>
                    </View>
                  </View>

                  {/* Expandable Members & Aadhar info */}
                  {showMore ? (
                    <View style={styles.expandableBox}>
                      {currentTenet?.aadharNo ? (
                        <View style={styles.expandRow}>
                          <Text style={styles.expandLabel}>Aadhar No:</Text>
                          <Text style={styles.expandValue}>
                            {currentTenet.aadharNo}
                          </Text>
                        </View>
                      ) : null}

                      {currentTenet?.otherMembers?.map((member, idx) => (
                        <View key={idx} style={styles.memberBox}>
                          <Text style={styles.memberHeaderTitle}>
                            Family Member {idx + 1}
                          </Text>
                          <View style={styles.expandRow}>
                            <Text style={styles.expandLabel}>Name:</Text>
                            <Text style={styles.expandValue}>
                              {member.name}
                            </Text>
                          </View>
                          {member.phone ? (
                            <TouchableOpacity
                              style={styles.expandRow}
                              onPress={() => onOpenDialer(member.phone)}>
                              <Text style={styles.expandLabel}>Phone:</Text>
                              <Text
                                style={[
                                  styles.expandValue,
                                  {color: '#93C5FD'},
                                ]}>
                                {member.phone}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {(currentTenet?.otherMembers?.length > 0 ||
                    currentTenet?.aadharNo) && (
                    <TouchableOpacity
                      style={styles.showMoreToggle}
                      onPress={() => setShowMore(prev => !prev)}>
                      <Text style={styles.showMoreToggleText}>
                        {showMore
                          ? 'Hide Member Details'
                          : 'View Member & Aadhar Details'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Primary Action Button: Navigate to Statements */}
                <Button
                  mode="contained"
                  icon="lightning-bolt"
                  buttonColor="#FFFFFF"
                  textColor="#4F46E5"
                  style={styles.statementsBtn}
                  labelStyle={styles.statementsBtnLabel}
                  onPress={() => onPressTenant(currentTenet)}>
                  View Meter Readings & Bill Statements
                </Button>
              </LinearGradient>
            ) : (
              <Surface style={styles.vacantHeroSurface}>
                <Icon source="home-alert" size={32} color="#D97706" />
                <Text style={styles.vacantHeroTitle}>Room is Vacant</Text>
                <Text style={styles.vacantHeroSubtitle}>
                  No active tenant is currently assigned to this room. Tap "Add
                  Tenant" above to register a new tenant.
                </Text>
                <Button
                  mode="contained"
                  icon="account-plus"
                  style={{marginTop: 14}}
                  onPress={() => setVisibleTenet({open: true, edit: {}})}>
                  Assign New Tenant
                </Button>
              </Surface>
            )}

            {/* History Section Header */}
            {historicTenants.length > 0 ? (
              <View style={styles.historySectionHeader}>
                <Text style={styles.historySectionTitle}>
                  Tenancy History ({historicTenants.length})
                </Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({item}) => (
          <TenetDetailCard
            item={item}
            deleteRoomTenet={setShowDialog}
            onPress={onPressTenant}
          />
        )}
        ListEmptyComponent={
          historicTenants.length === 0 ? (
            <EmptyComponent
              title="No Past Tenant Records"
              subtitle="Historic tenant occupancy records will automatically appear here when tenants move out."
              useLottie={false}
              icon="history"
            />
          ) : null
        }
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
        title="Delete Tenant"
        body="Are you sure you want to delete this tenant record?"
        donePress={() => deleteRoomTenet(showDialog)}
        doneTitle="Delete"
      />
    </Container>
  );
};

export default RoomDetails;

const styles = StyleSheet.create({
  roomInfoSurface: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  roomInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roomTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  roomStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  roomStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  roomStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  roomStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeTenantGradientCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  tenantHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tenantIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantAvatar: {
    backgroundColor: '#EEF2FF',
  },
  tenantAvatarLabel: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 20,
  },
  tenantNameText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tenantDetailsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  phoneActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  phoneActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  callNowPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  callNowText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '800',
  },
  tenantMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tenantMetaItem: {
    flex: 1,
  },
  tenantMetaLabel: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '500',
  },
  tenantMetaValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  expandableBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  expandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  expandLabel: {
    color: '#E0E7FF',
    fontSize: 12,
  },
  expandValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  memberBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  memberHeaderTitle: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  showMoreToggle: {
    alignItems: 'center',
    marginTop: 10,
  },
  showMoreToggleText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '700',
  },
  statementsBtn: {
    borderRadius: 12,
    paddingVertical: 2,
  },
  statementsBtnLabel: {
    fontWeight: '800',
    fontSize: 13,
  },
  vacantHeroSurface: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  vacantHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 8,
  },
  vacantHeroSubtitle: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  historySectionHeader: {
    marginBottom: 12,
    marginTop: 6,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
