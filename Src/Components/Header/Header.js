import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, IconButton, Text, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Header = ({
  title = '',
  subtitle = '',
  back = true,
  right,
  rightText = '',
  rightIconPress,
}) => {
  const navigation = useNavigation();
  const {colors} = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const paddingTop = safeAreaInsets.top > 0 ? safeAreaInsets.top + 4 : 12;

  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant || '#E2E8F0',
          paddingTop: paddingTop,
        },
      ]}>
      <View style={styles.headerRow}>
        {back && (
          <IconButton
            icon="arrow-left"
            size={20}
            iconColor={colors.onSurface}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          />
        )}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, {color: colors.onSurface}]}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.headerProminentBtn, {backgroundColor: colors.primary}]}
            onPress={rightIconPress}>
            <Icon source={right} size={16} color="#FFFFFF" />
            <Text style={styles.headerProminentBtnText}>
              {rightText || 'Add'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  mainContainer: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backBtn: {
    marginRight: 4,
    marginLeft: -6,
    marginVertical: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -1,
  },
  headerProminentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerProminentBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
