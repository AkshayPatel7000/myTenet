import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {RefreshControl, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Button,
  Icon,
  IconButton,
  ProgressBar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {getData, getUser} from '../../Services/Collections';
import {useTypedSelector} from '../../Store/MainStore';
import {selectHomeData} from '../../Store/Slices/AuthSlice';
import {sumArrayOfObjects} from '../../Utils/helperFunction';
import {useFocusEffect} from '@react-navigation/native';
import Loader from '../../Components/Loader';
import UnifiedQuickSetupModal from '../../Components/Modals/UnifiedQuickSetupModal';
import QuickAddReadingModal from '../../Components/Modals/QuickAddReadingModal';

const Home = props => {
  const {colors} = useTheme();
  const homeData = useTypedSelector(selectHomeData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [quickSetupVisible, setQuickSetupVisible] = useState(false);
  const [quickReadingVisible, setQuickReadingVisible] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getData();
    await getUser();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const init = async () => {
        await getData();
        if (isMounted) setLoading(false);
      };
      init();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const totalRent = useMemo(() => {
    return sumArrayOfObjects(homeData, 'rent');
  }, [homeData]);

  const totalElectcityRent = useMemo(() => {
    const currentMonth = moment().format('MMYY');
    const paidAmount = homeData.map(room => {
      if (moment(room.tenet?.lastPaidDate).format('MMYY') === currentMonth) {
        return {value: room.tenet?.lastPaidAmount || 0};
      } else {
        return {value: 0};
      }
    });

    return sumArrayOfObjects(paidAmount, 'value');
  }, [homeData]);

  const totalElectcityRentTillToday = useMemo(() => {
    let paidAmount = [];
    homeData.map(room => {
      room?.tenet?.records?.map(e => {
        if (e.paidStatus) {
          paidAmount.push({value: e?.totalAmount || 0});
        }
      });
    });

    return sumArrayOfObjects(paidAmount, 'value');
  }, [homeData]);

  // Landlord Business Analytics Calculations
  const occupancyStats = useMemo(() => {
    if (!homeData || homeData.length === 0) {
      return {occupied: 0, vacant: 0, rate: 0, total: 0};
    }
    const total = homeData.length;
    const occupied = homeData.filter(r => r.currentTenantId || r.tenet?.tenantId).length;
    const vacant = total - occupied;
    const rate = Math.round((occupied / total) * 100);
    return {occupied, vacant, rate, total};
  }, [homeData]);

  const progressRatio = useMemo(() => {
    if (!occupancyStats.total) return 0;
    return Math.min(1, Math.max(0, occupancyStats.occupied / occupancyStats.total));
  }, [occupancyStats]);

  const pendingDuesStats = useMemo(() => {
    if (!homeData || homeData.length === 0) {
      return {totalPending: 0, unpaidCount: 0};
    }
    let totalPending = 0;
    let unpaidCount = 0;

    homeData.forEach(room => {
      if (room?.tenet?.records) {
        room.tenet.records.forEach(rec => {
          if (!rec.paidStatus) {
            unpaidCount += 1;
            const due = rec.pendingAmount !== undefined && rec.pendingAmount !== null
              ? rec.pendingAmount
              : Number(rec.totalAmount || 0) + Number(room.rent || 0);
            totalPending += due;
          }
        });
      }
    });

    return {totalPending, unpaidCount};
  }, [homeData]);

  const avgRentPerRoom = useMemo(() => {
    if (!homeData || homeData.length === 0) return 0;
    return Math.round(totalRent / homeData.length);
  }, [homeData, totalRent]);

  const isNewUser = !homeData || homeData.length === 0;

  return (
    <Container>
      <Header
        back={false}
        title="Dashboard Overview"
        subtitle="Property & Financial Summary"
      />

      {loading && <Loader message="Analyzing property metrics..." />}
      {!loading && (
        <VirtualizedScrollView
          contentContainerStyle={{padding: 16, paddingBottom: 150}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }>
          {/* First Time User Onboarding Banner */}
          {isNewUser && (
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF']}
              useAngle={true}
              angle={135}
              style={styles.ftueBanner}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <Icon source="home-city" size={26} color="#4F46E5" />
                <Text style={styles.ftueTitle}>Welcome to myTenant!</Text>
              </View>
              <Text style={styles.ftueSubtitle}>
                Manage rooms, tenant records, and monthly electricity bills effortlessly.
              </Text>
              <Button
                mode="contained"
                buttonColor="#4F46E5"
                textColor="#FFFFFF"
                icon="plus-circle"
                style={styles.ftueBtn}
                labelStyle={{fontWeight: '700'}}
                onPress={() => setQuickSetupVisible(true)}>
                Add First Property & Tenant (60s)
              </Button>
            </LinearGradient>
          )}

          {/* Landlord Business Executive Summary Card */}
          {!isNewUser && (
            <LinearGradient
              colors={['#4F46E5', '#3730A3']}
              useAngle={true}
              angle={135}
              style={styles.executiveCard}>
              <View style={styles.execHeaderRow}>
                <View style={styles.execBadge}>
                  <Icon source="shield-check" size={14} color="#34D399" />
                  <Text style={styles.execBadgeText}>Landlord Portfolio Health</Text>
                </View>
                <Text style={styles.execRateText}>{occupancyStats.rate}% Occupied</Text>
              </View>

              <View style={styles.execMetricsGrid}>
                <View style={styles.execMetricItem}>
                  <Text style={styles.execMetricLabel}>Occupancy</Text>
                  <Text style={styles.execMetricValue}>
                    {occupancyStats.occupied} / {occupancyStats.total} <Text style={{fontSize: 12, fontWeight: '500'}}>Rooms</Text>
                  </Text>
                </View>

                <View style={styles.execMetricDivider} />

                <View style={styles.execMetricItem}>
                  <Text style={styles.execMetricLabel}>Avg Room Rent</Text>
                  <Text style={styles.execMetricValue}>₹ {avgRentPerRoom}</Text>
                </View>

                <View style={styles.execMetricDivider} />

                <View style={styles.execMetricItem}>
                  <Text style={styles.execMetricLabel}>Unpaid Dues</Text>
                  <Text style={[styles.execMetricValue, {color: pendingDuesStats.totalPending > 0 ? '#FCA5A5' : '#34D399'}]}>
                    ₹ {pendingDuesStats.totalPending}
                  </Text>
                </View>
              </View>

              {/* Progress Indicator Bar */}
              <View style={styles.progressContainer}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                  <Text style={styles.progressLabel}>Occupancy Progress</Text>
                  <Text style={styles.progressValue}>
                    {occupancyStats.vacant > 0 ? `${occupancyStats.vacant} Vacant Room(s)` : '100% Full Occupancy'}
                  </Text>
                </View>
                <ProgressBar
                  progress={progressRatio}
                  color="#34D399"
                  style={styles.progressBar}
                />
              </View>
            </LinearGradient>
          )}

          {/* Quick Action Shortcuts Bar */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.quickActionBtn, styles.blueActionBtn]}
                onPress={() => setQuickSetupVisible(true)}>
                <View style={[styles.actionIconCircle, {backgroundColor: '#DBEAFE'}]}>
                  <Icon source="home-plus" color="#2563EB" size={22} />
                </View>
                <Text style={[styles.actionText, {color: '#1E40AF'}]}>Add Property</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.quickActionBtn, styles.greenActionBtn]}
                onPress={() => setQuickReadingVisible(true)}>
                <View style={[styles.actionIconCircle, {backgroundColor: '#D1FAE5'}]}>
                  <Icon source="lightning-bolt" color="#059669" size={22} />
                </View>
                <Text style={[styles.actionText, {color: '#065F46'}]}>Add Reading</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Light-Themed Analytics Dashboard Cards */}
          <Text style={styles.sectionHeader}>Overview & Revenue</Text>

          <View style={styles.rowContainer}>
            {/* Total Rooms Card */}
            <Surface style={[styles.lightCard, {backgroundColor: '#EEF2FF', borderColor: '#C7D2FE'}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#4F46E5'}]}>
                  <Icon source="home-city" size={20} color="#FFF" />
                </View>
                <Text style={styles.cardLabel}>Total Rooms</Text>
              </View>
              <Text style={[styles.cardValue, {color: '#1E1B4B'}]}>{homeData?.length || 0}</Text>
            </Surface>

            {/* Expected Rent Card */}
            <Surface style={[styles.lightCard, {backgroundColor: '#ECFDF5', borderColor: '#A7F3D0'}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#059669'}]}>
                  <Icon source="account-group" size={20} color="#FFF" />
                </View>
                <Text style={styles.cardLabel}>Expected Rent</Text>
              </View>
              <Text style={[styles.cardValue, {color: '#064E3B'}]}>₹ {totalRent}</Text>
            </Surface>
          </View>

          <View style={styles.rowContainer}>
            {/* Monthly Electricity Collection Card */}
            <Surface style={[styles.lightCard, {backgroundColor: '#FFFBEB', borderColor: '#FDE68A'}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#D97706'}]}>
                  <Icon source="lightning-bolt" size={20} color="#FFF" />
                </View>
                <Text style={styles.cardLabel}>
                  {moment().format('MMM')} Elec Collection
                </Text>
              </View>
              <Text style={[styles.cardValue, {color: '#78350F'}]}>₹ {totalElectcityRent}</Text>
            </Surface>

            {/* Combined Revenue Card */}
            <Surface style={[styles.lightCard, {backgroundColor: '#F3E8FF', borderColor: '#E9D5FF'}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#7C3AED'}]}>
                  <Icon source="cash-multiple" size={20} color="#FFF" />
                </View>
                <Text style={styles.cardLabel}>Combined Revenue</Text>
              </View>
              <Text style={[styles.cardValue, {color: '#4C1D95'}]}>
                ₹ {totalElectcityRent + totalRent}
              </Text>
            </Surface>
          </View>

          <View style={styles.fullRow}>
            {/* Total Lifetime Electricity Collected Card */}
            <Surface style={[styles.fullLightCard, {backgroundColor: '#FFF1F2', borderColor: '#FECDD3'}]}>
              <View style={[styles.cardIconBox, {backgroundColor: '#E11D48'}]}>
                <Icon source="chart-line" size={22} color="#FFF" />
              </View>
              <View style={{marginLeft: 14, flex: 1}}>
                <Text style={styles.cardLabel}>Lifetime Electricity Collected</Text>
                <Text style={[styles.cardValue, {color: '#881337'}]}>₹ {totalElectcityRentTillToday}</Text>
              </View>
            </Surface>
          </View>
        </VirtualizedScrollView>
      )}

      {/* Modals */}
      <UnifiedQuickSetupModal
        visible={quickSetupVisible}
        hideModal={() => setQuickSetupVisible(false)}
      />
      <QuickAddReadingModal
        visible={quickReadingVisible}
        hideModal={() => setQuickReadingVisible(false)}
      />
    </Container>
  );
};

export default Home;

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 10,
  },
  ftueBanner: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  ftueTitle: {
    color: '#1E1B4B',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  ftueSubtitle: {
    color: '#3730A3',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  ftueBtn: {
    borderRadius: 10,
  },
  executiveCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  execHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  execBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  execBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  execRateText: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '800',
  },
  execMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  execMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  execMetricLabel: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },
  execMetricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  execMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressContainer: {
    marginTop: 2,
  },
  progressLabel: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '600',
  },
  progressValue: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionsContainer: {
    marginBottom: 10,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  blueActionBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  greenActionBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 13,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  lightCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardLabel: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
    flex: 1,
  },
  cardValue: {
    fontWeight: '800',
    fontSize: 20,
  },
  fullRow: {
    marginVertical: 6,
  },
  fullLightCard: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
});
