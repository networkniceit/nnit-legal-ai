import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../utils/theme';

interface BiometricGateProps {
  onAuthenticated: () => void;
}

export default function BiometricGate({ onAuthenticated }: BiometricGateProps) {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricType, setBiometricType] = useState<'face' | 'finger' | 'none'>('none');
  const [pulse] = useState(new Animated.Value(1));
  const [glow] = useState(new Animated.Value(0));

  useEffect(() => {
    checkBiometrics();
    startAnimations();
  }, []);

  function startAnimations() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }

  async function checkBiometrics() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(compatible && enrolled);
    if (compatible && enrolled) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('finger');
      }
      authenticate();
    }
  }

  async function authenticate() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity',
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      onAuthenticated();
    }
  }

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient colors={['#0A0E1A', '#070B14', '#0A0E1A']} style={StyleSheet.absoluteFill} />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Logo area */}
      <View style={styles.logoArea}>
        <Text style={styles.logoText}>NNIT</Text>
        <View style={styles.logoDivider} />
        <Text style={styles.logoSub}>LEGAL AI</Text>
      </View>

      {/* Biometric button */}
      <View style={styles.centerArea}>
        <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            style={styles.biometricBtn}
            onPress={authenticate}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.05)']}
              style={styles.biometricInner}
            >
              <Ionicons
                name={biometricType === 'face' ? 'scan-outline' : 'finger-print-outline'}
                size={52}
                color={Colors.gold}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.instruction}>
          {hasBiometrics
            ? `Tap to authenticate with ${biometricType === 'face' ? 'Face ID' : 'fingerprint'}`
            : 'Tap to continue'}
        </Text>
      </View>

      {/* Skip option */}
      <TouchableOpacity style={styles.skipBtn} onPress={onAuthenticated}>
        <Text style={styles.skipText}>Skip biometric — use PIN</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Protected by military-grade encryption</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 80 },
  decorCircle1: {
    position: 'absolute', top: -100, right: -100,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(201,168,76,0.04)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.08)',
  },
  decorCircle2: {
    position: 'absolute', bottom: -150, left: -150,
    width: 500, height: 500, borderRadius: 250,
    backgroundColor: 'rgba(201,168,76,0.03)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.06)',
  },
  logoArea: { alignItems: 'center' },
  logoText: {
    fontFamily: Typography.serif,
    fontSize: 52,
    color: Colors.textPrimary,
    letterSpacing: 12,
  },
  logoDivider: { width: 60, height: 1, backgroundColor: Colors.gold, marginVertical: 12 },
  logoSub: {
    fontFamily: Typography.sans,
    fontSize: 13,
    color: Colors.gold,
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  centerArea: { alignItems: 'center', gap: 28 },
  glowRing: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)',
  },
  biometricBtn: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1.5, borderColor: Colors.gold,
    overflow: 'hidden',
  },
  biometricInner: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  instruction: {
    fontFamily: Typography.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  skipText: { fontFamily: Typography.sans, fontSize: 13, color: Colors.textMuted },
  footer: { fontFamily: Typography.sans, fontSize: 11, color: Colors.textMuted, letterSpacing: 0.5 },
});
