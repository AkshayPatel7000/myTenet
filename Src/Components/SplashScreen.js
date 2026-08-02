import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions, StatusBar, StyleSheet, View} from 'react-native';
import Lottie from 'lottie-react-native';
import {Icon, Text} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous Subtle Pulse for Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim, opacityAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#312E81']}
        useAngle={true}
        angle={145}
        style={styles.gradientBg}>
        {/* Ambient Glow Backdrop Circles */}
        <Animated.View
          style={[styles.ambientGlowTop, {transform: [{scale: pulseAnim}]}]}
        />
        <View style={styles.ambientGlowBottom} />

        {/* Center Animated Lottie & Branding */}
        <Animated.View
          style={[
            styles.brandWrapper,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Lottie Animation in place of top icon */}
          <View style={styles.topLottieContainer}>
            <Lottie
              source={require('../Assets/splash.json')}
              loop
              autoPlay
              style={styles.topLottieAnim}
            />
          </View>

          <Text style={styles.appTitle}>My Rooms</Text>
          <Text style={styles.appSubtitle}>
            Smart Rental Property & Utility Manager
          </Text>
        </Animated.View>

        {/* Footer Brand Info */}
        <View style={styles.footerContainer}>
          <View style={styles.footerBadge}>
            <Icon source="shield-check" size={14} color="#34D399" />
            <Text style={styles.footerBadgeText}>
              Secure Cloud Property Sync
            </Text>
          </View>
          <Text style={styles.versionText}>v1.2.0</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  brandWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLottieContainer: {
    width: width * 0.65,
    height: width * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  topLottieAnim: {
    width: '100%',
    height: '100%',
  },
  appTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 6,
  },
  footerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  versionText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});
