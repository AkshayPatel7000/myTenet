import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const Header = ({title = '', back = true, right, rightIconPress}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.main}>
      <View style={styles.container}>
        {back && (
          <IconButton icon={'arrow-left'} onPress={() => navigation.goBack()} />
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
          }}>
          <Text style={styles.title}>{title || ''}</Text>
          {right ? (
            <IconButton icon={right} onPress={rightIconPress} />
          ) : (
            <View />
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 50,
    elevation: 9,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  main: {overflow: 'hidden', paddingBottom: 10},
  title: {fontSize: 16, fontWeight: '600', textTransform: 'capitalize'},
});
