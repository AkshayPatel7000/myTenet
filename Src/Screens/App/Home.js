import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import Container from '../../Components/Container';
import VirtualizedScrollView from '../../Components/VirtualisedScroll';
import {LocalStorage} from '../../Utils/Resource/localStorage';
import {useAppDispatch, useTypedSelector} from '../../Store/MainStore';
import {selectHomeData, setAuthToken} from '../../Store/Slices/AuthSlice';
import Header from '../../Components/Header/Header';
import {getData} from '../../Services/Collections';
import {ActivityIndicator} from 'react-native-paper';
import {sumArrayOfObjects} from '../../Utils/helperFunction';
import moment from 'moment';

const Home = props => {
  const dispatch = useAppDispatch();
  const homeData = useTypedSelector(selectHomeData);
  const [loading, setLoading] = useState(true);
  console.log('🚀 ~ Home ~ homeData:', homeData);
  const Logout = () => {
    dispatch(setAuthToken(null));
    LocalStorage.clearLocalStorage();
  };

  useEffect(() => {
    setTimeout(async () => {
      await getData();
      setLoading(false);
    }, 3000);
  }, [props]);

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
      {loading && <ActivityIndicator />}
      {!loading && (
        <VirtualizedScrollView contentContainerStyle={{padding: 20}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>Total Rooms</Text>
            <Text>{homeData?.length}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>Total Rent</Text>
            <Text>{totalRent}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>Total Electricity Bill</Text>
            <Text>{totalElectcityRent}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>Total Amount</Text>
            <Text>{totalElectcityRent + totalRent}</Text>
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

const styles = StyleSheet.create({});
