import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Button, Icon, Text, useTheme} from 'react-native-paper';
import LottieView from 'lottie-react-native';

const EmptyComponent = ({
  title = 'No Records Found',
  subtitle = 'Get started by creating your first record to track readings and payments effortlessly.',
  actionLabel = '',
  onActionPress,
  icon = 'home-city-outline',
  useLottie = true,
}) => {
  const {colors, dark} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant || (dark ? '#334155' : '#F1F5F9'),
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      {/* Visual Illustration */}
      <View style={styles.illustrationWrapper}>
        <View
          style={[
            styles.glowCircle,
            {backgroundColor: colors.primaryContainer || (dark ? '#312E81' : '#EEF2FF')},
          ]}
        />
        {useLottie ? (
          <LottieView
            autoPlay
            loop
            source={require('../Assets/notfound.json')}
            style={styles.lottie}
          />
        ) : (
          <View style={[styles.iconCircle, {backgroundColor: colors.primary}]}>
            <Icon source={icon} size={42} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Copywriting & Action */}
      <Text style={[styles.title, {color: colors.onSurface}]}>{title}</Text>
      <Text style={[styles.subtitle, {color: colors.onSurfaceVariant}]}>
        {subtitle}
      </Text>

      {actionLabel && onActionPress ? (
        <Button
          mode="contained"
          icon="plus"
          style={styles.actionBtn}
          labelStyle={styles.actionBtnLabel}
          onPress={onActionPress}>
          {actionLabel}
        </Button>
      ) : null}
    </Animated.View>
  );
};

export default EmptyComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 180,
    marginBottom: 16,
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.4,
  },
  lottie: {
    width: 200,
    height: 180,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    elevation: 2,
  },
  actionBtnLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
});
