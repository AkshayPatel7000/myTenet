import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import Container from '../../Components/Container';
import Header from '../../Components/Header/Header';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {getData, getUser} from '../../Services/Collections';
import {useAppDispatch, useTypedSelector} from '../../Store/MainStore';
import {selectHomeData, setAuthToken} from '../../Store/Slices/AuthSlice';
import {LocalStorage} from '../../Utils/Resource/localStorage';
import {sumArrayOfObjects} from '../../Utils/helperFunction';
import {useFocusEffect} from '@react-navigation/native';
import Loader from '../../Components/Loader';

const Home = props => {
  const {colors} = useTheme();
  const homeData = useTypedSelector(selectHomeData);
  const [loading, setLoading] = useState(true);
  const styles = getStyles(colors);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getData();
    await getUser();
    setRefreshing(false);
  }, []);
  useFocusEffect(() => {
    const timer = setTimeout(async () => {
      await getData();
      setLoading(false);
    }, 3000);
    // return clearTimeout(timer);
  });
  const totalRent = useMemo(() => {
    return sumArrayOfObjects(homeData, 'rent');
  }, [homeData]);
  const totalElectcityRent = useMemo(() => {
    const currentMonth = moment().format('MMYY');
    const paidAmount = homeData.map(room => {
      if (moment(room.tenet.lastPaidDate).format('MMYY') === currentMonth) {
        return {value: room.tenet.lastPaidAmount || 0};
      } else {
        return {value: 0};
      }
    });
    console.log('🚀 ~ paidAmount ~ paidAmount:', paidAmount);

    return sumArrayOfObjects(paidAmount, 'value');
  }, [homeData]);
  return (
    <Container>
      <Header back={false} title="Home" />
      {loading && <Loader />}
      {!loading && (
        <VirtualizedScrollView
          contentContainerStyle={{padding: 20}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }>
          <View style={styles.rowContainer}>
            <Surface style={styles.card}>
              <IconButton
                icon="home-lightning-bolt"
                size={50}
                iconColor="#FFF"
              />
              <Text style={styles.title}>Total Rooms</Text>
              <Text style={styles.title}>{homeData?.length}</Text>
            </Surface>
            <Surface style={styles.card}>
              <IconButton
                icon="account-child-circle"
                size={50}
                iconColor="#FFF"
              />
              <Text style={styles.title}>Total Rent</Text>
              <Text style={styles.title}>₹ {totalRent}</Text>
            </Surface>
          </View>
          <View style={styles.rowContainer}>
            <Surface style={styles.card}>
              <IconButton icon="lightning-bolt" size={50} iconColor="#FFF" />
              <Text style={styles.title}>Total Electricity Bill</Text>
              <Text style={styles.title}>₹ {totalElectcityRent}</Text>
            </Surface>
            <Surface style={styles.card}>
              <IconButton icon="account-cash" size={50} iconColor="#FFF" />
              <Text style={styles.title}>Total Amount</Text>
              <Text style={styles.title}>
                ₹ {totalElectcityRent + totalRent}
              </Text>
            </Surface>
          </View>

          {/* <FlatList
            data={homeData}
            renderItem={({item}) => {
              console.log('🚀 ~ Home ~ room:', item);
              return (
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: '30%'}}>
                    <Text>{item?.tenetName}</Text>
                  </View>
                  <View style={{width: '30%'}}>
                    <Text>{item?.tenet?.lastPaidAmount}</Text>
                  </View>
                  <View style={{width: '30%'}}>
                    <Text>
                      {moment(item?.tenet?.lastPaidDate).format('MMM YYYY')}
                    </Text>
                  </View>
                </View>
              );
            }}
          /> */}
        </VirtualizedScrollView>
      )}
    </Container>
  );
};

export default Home;

const getStyles = colors => {
  return StyleSheet.create({
    card: {
      width: '48%',
      height: 160,
      backgroundColor: colors.primary,
      borderRadius: 8,
      // elevation: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {color: '#fff', fontWeight: '600', fontSize: 16},
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
  });
};
