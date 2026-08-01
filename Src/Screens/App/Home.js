import React, {useMemo, useState} from 'react';
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Button,
  Icon,
  ProgressBar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import Loader from '../../Components/Loader';
import QuickAddReadingModal from '../../Components/Modals/QuickAddReadingModal';
import UnifiedQuickSetupModal from '../../Components/Modals/UnifiedQuickSetupModal';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {getData, getUser} from '../../Services/Collections';
import {useTypedSelector} from '../../Store/MainStore';
import {selectHomeData} from '../../Store/Slices/AuthSlice';
import {sumArrayOfObjects} from '../../Utils/helperFunction';
import moment from 'moment';

const Home = props => {
  const {colors, dark} = useTheme();
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
    const paidAmount = homeData.map(room => {
      return {value: room.tenet?.lastPaidAmount || 0};
    });
    return sumArrayOfObjects(paidAmount, 'value');
  }, [homeData]);

  const occupancyStats = useMemo(() => {
    const total = homeData?.length || 0;
    const occupied = homeData?.filter(r => !!r.tenetName).length || 0;
    const vacant = total - occupied;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return {total, occupied, vacant, rate};
  }, [homeData]);

  const pendingDuesStats = useMemo(() => {
    let totalPending = 0;
    homeData?.forEach(room => {
      if (room?.tenet?.pendingAmount > 0) {
        totalPending += room.tenet.pendingAmount;
      }
    });
    return {totalPending};
  }, [homeData]);

  const avgRentPerRoom = useMemo(() => {
    if (!homeData || homeData.length === 0) return 0;
    return Math.round(totalRent / homeData.length);
  }, [homeData, totalRent]);

  const isNewUser = homeData.length === 0;

  const rawRatio = occupancyStats.total > 0 ? occupancyStats.occupied / occupancyStats.total : 0;
  const progressRatio = Math.min(1, Math.max(0, rawRatio));

  const cardThemes = {
    rooms: dark
      ? {bg: '#1E293B', border: '#312E81', text: '#EEF2FF'}
      : {bg: '#EEF2FF', border: '#C7D2FE', text: '#1E1B4B'},
    rent: dark
      ? {bg: '#1E293B', border: '#065F46', text: '#ECFDF5'}
      : {bg: '#ECFDF5', border: '#A7F3D0', text: '#064E3B'},
    elec: dark
      ? {bg: '#1E293B', border: '#B45309', text: '#FEF3C7'}
      : {bg: '#FFFBEB', border: '#FDE68A', text: '#78350F'},
    revenue: dark
      ? {bg: '#1E293B', border: '#6B21A8', text: '#F3E8FF'}
      : {bg: '#F3E8FF', border: '#E9D5FF', text: '#4C1D95'},
    lifetime: dark
      ? {bg: '#1E293B', border: '#9F1239', text: '#FFE4E6'}
      : {bg: '#FFF1F2', border: '#FECDD3', text: '#881337'},
  };

  return (
    <Container>
      <Header
        back={false}
        title="Dashboard Overview"
        subtitle="Property analytics, meter readings & rent collection"
        right="flash"
        rightText="Quick Setup"
        rightIconPress={() => setQuickSetupVisible(true)}
      />

      {loading ? (
        <Loader message="Fetching dashboard analytics..." />
      ) : (
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
              colors={dark ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
              useAngle={true}
              angle={135}
              style={styles.ftueBanner}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <Icon source="home-city" size={26} color={dark ? '#818CF8' : '#4F46E5'} />
                <Text style={[styles.ftueTitle, {color: dark ? '#FFFFFF' : '#0F172A'}]}>Welcome to myTenant!</Text>
              </View>
              <Text style={[styles.ftueSubtitle, {color: dark ? '#E0E7FF' : '#475569'}]}>
                Manage rooms, tenant records, and monthly electricity bills effortlessly.
              </Text>
              <Button
                mode="contained"
                buttonColor={colors.primary}
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
            <Text style={[styles.sectionHeader, {color: colors.onSurface}]}>Quick Actions</Text>
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: dark ? '#1E293B' : '#EFF6FF',
                    borderColor: dark ? '#312E81' : '#BFDBFE',
                  },
                ]}
                onPress={() => setQuickSetupVisible(true)}>
                <View style={[styles.actionIconCircle, {backgroundColor: dark ? '#312E81' : '#DBEAFE'}]}>
                  <Icon source="home-plus" color={colors.primary} size={22} />
                </View>
                <Text style={[styles.actionText, {color: dark ? '#93C5FD' : '#1E40AF'}]}>Add Property</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: dark ? '#1E293B' : '#ECFDF5',
                    borderColor: dark ? '#065F46' : '#A7F3D0',
                  },
                ]}
                onPress={() => setQuickReadingVisible(true)}>
                <View style={[styles.actionIconCircle, {backgroundColor: dark ? '#065F46' : '#D1FAE5'}]}>
                  <Icon source="lightning-bolt" color="#10B981" size={22} />
                </View>
                <Text style={[styles.actionText, {color: dark ? '#6EE7B7' : '#065F46'}]}>Add Reading</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analytics Dashboard Cards */}
          <Text style={[styles.sectionHeader, {color: colors.onSurface}]}>Overview & Revenue</Text>

          <View style={styles.rowContainer}>
            {/* Total Rooms Card */}
            <Surface style={[styles.lightCard, {backgroundColor: cardThemes.rooms.bg, borderColor: cardThemes.rooms.border}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#4F46E5'}]}>
                  <Icon source="home-city" size={20} color="#FFF" />
                </View>
                <Text style={[styles.cardLabel, {color: colors.onSurfaceVariant}]}>Total Rooms</Text>
              </View>
              <Text style={[styles.cardValue, {color: cardThemes.rooms.text}]}>{homeData?.length || 0}</Text>
            </Surface>

            {/* Expected Rent Card */}
            <Surface style={[styles.lightCard, {backgroundColor: cardThemes.rent.bg, borderColor: cardThemes.rent.border}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#059669'}]}>
                  <Icon source="account-group" size={20} color="#FFF" />
                </View>
                <Text style={[styles.cardLabel, {color: colors.onSurfaceVariant}]}>Expected Rent</Text>
              </View>
              <Text style={[styles.cardValue, {color: cardThemes.rent.text}]}>₹ {totalRent}</Text>
            </Surface>
          </View>

          <View style={styles.rowContainer}>
            {/* Monthly Electricity Collection Card */}
            <Surface style={[styles.lightCard, {backgroundColor: cardThemes.elec.bg, borderColor: cardThemes.elec.border}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#D97706'}]}>
                  <Icon source="lightning-bolt" size={20} color="#FFF" />
                </View>
                <Text style={[styles.cardLabel, {color: colors.onSurfaceVariant}]}>
                  {moment().format('MMM')} Elec Collection
                </Text>
              </View>
              <Text style={[styles.cardValue, {color: cardThemes.elec.text}]}>₹ {totalElectcityRent}</Text>
            </Surface>

            {/* Combined Revenue Card */}
            <Surface style={[styles.lightCard, {backgroundColor: cardThemes.revenue.bg, borderColor: cardThemes.revenue.border}]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBox, {backgroundColor: '#7C3AED'}]}>
                  <Icon source="cash-multiple" size={20} color="#FFF" />
                </View>
                <Text style={[styles.cardLabel, {color: colors.onSurfaceVariant}]}>Combined Revenue</Text>
              </View>
              <Text style={[styles.cardValue, {color: cardThemes.revenue.text}]}>
                ₹ {totalElectcityRent + totalRent}
              </Text>
            </Surface>
          </View>

          <View style={styles.fullRow}>
            {/* Total Lifetime Electricity Collected Card */}
            <Surface style={[styles.fullLightCard, {backgroundColor: cardThemes.lifetime.bg, borderColor: cardThemes.lifetime.border}]}>
              <View style={[styles.cardIconBox, {backgroundColor: '#E11D48'}]}>
                <Icon source="chart-line" size={22} color="#FFF" />
              </View>
              <View style={{marginLeft: 14, flex: 1}}>
                <Text style={[styles.cardLabel, {color: colors.onSurfaceVariant}]}>Lifetime Electricity Collected</Text>
                <Text style={[styles.cardValue, {color: cardThemes.lifetime.text}]}>₹ {totalElectcityRentTillToday}</Text>
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
    marginBottom: 12,
    marginTop: 8,
  },
  ftueBanner: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
  },
  ftueTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 10,
  },
  ftueSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 19,
  },
  ftueBtn: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  executiveCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    fontSize: 13,
    fontWeight: '800',
  },
  execMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  execMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  execMetricLabel: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  execMetricValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionsContainer: {
    marginBottom: 18,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  lightCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
  },
  fullRow: {
    marginBottom: 12,
  },
  fullLightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
  },
});
