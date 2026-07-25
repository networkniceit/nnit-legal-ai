import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import { Typography, Spacing, Radius } from '../utils/theme';

const { width } = Dimensions.get('window');

const SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { icon: '💬', label: 'AI Legal Chat',      route: 'Chat',           badge: null },
      { icon: '📎', label: 'Upload Documents',   route: 'Upload',         badge: null },
      { icon: '📷', label: 'Camera Scanner',     route: 'Camera',         badge: 'NEW' },
      { icon: '📄', label: 'Document Generator', route: 'Documents',      badge: null },
      { icon: '⚖️', label: 'Case Builder',       route: 'Cases',          badge: null },
      { icon: '✅', label: 'Compliance Scanner', route: 'Compliance',     badge: null },
    ],
  },
  {
    title: '🎥 MEETINGS',
    items: [
      { icon: '📹', label: 'Start Meeting',      route: 'Meetings',       badge: 'LIVE' },
      { icon: '📅', label: 'Schedule Meeting',   route: 'Meetings',       badge: 'NEW' },
      { icon: '📋', label: 'Meeting History',    route: 'Transcription',  badge: null },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { icon: '🔍', label: 'Contract Analyzer',  route: 'Contracts',      badge: null },
      { icon: '⚠️', label: 'Risk Assessment',    route: 'RiskAssessment', badge: null },
      { icon: '📅', label: 'Extract Deadlines',  route: 'Deadlines',      badge: null },
      { icon: '👥', label: 'Identify Parties',   route: 'Parties',        badge: null },
    ],
  },
  {
    title: 'TEMPLATES & VOICE',
    items: [
      { icon: '📋', label: '500+ Templates',     route: 'Templates',      badge: '500+' },
      { icon: '🎤', label: 'Voice Writer',        route: 'Voice',          badge: null },
      { icon: '🔊', label: 'Voice Reader',        route: 'VoiceReader',    badge: null },
    ],
  },
  {
    title: '💳 PAYMENTS & PORTAL',
    items: [
      { icon: '💳', label: 'Book Consultation',  route: 'Payments',       badge: null },
      { icon: '👤', label: 'Client Portal',      route: 'Portal',         badge: null },
    ],
  },
  {
    title: 'MY DOCS',
    items: [
      { icon: '💾', label: 'Saved Documents',    route: 'SavedDocs',      badge: null },
    ],
  },
];

const BADGE_COLORS: Record<string, string> = {
  LIVE: '#E53E3E',
  NEW: '#2ECC71',
  '500+': '#C9A84C',
};

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  const s = makeStyles(colors, width);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />

      {/* Top Header */}
      <View style={s.topBar}>
        <View style={s.logoRow}>
          <Text style={s.logoIcon}>⚖️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.logoTitle}>NNIT Legal AI</Text>
            <Text style={s.logoSub}>PROFESSIONAL LEGAL ASSISTANT</Text>
          </View>
        </View>
        <View style={s.topBadges}>
          <View style={[s.topBadge, { backgroundColor: isDark ? 'rgba(46,204,113,0.15)' : 'rgba(26,140,78,0.1)', borderColor: colors.success }]}>
            <Text style={[s.topBadgeText, { color: colors.success }]}>GPT-4</Text>
          </View>
          <View style={[s.topBadge, { backgroundColor: colors.goldMuted, borderColor: colors.gold }]}>
            <Text style={[s.topBadgeText, { color: colors.gold }]}>GDPR ✔</Text>
          </View>
          <TouchableOpacity
            style={[s.topBadge, { backgroundColor: 'rgba(229,62,62,0.12)', borderColor: '#E53E3E' }]}
            onPress={() => navigation.navigate('Meetings')}
          >
            <View style={s.liveDot} />
            <Text style={[s.topBadgeText, { color: '#E53E3E' }]}>🎥 Live</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={s.settingsBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Tagline scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.taglineBar} contentContainerStyle={s.taglineContent}>
        {['Solomon · NNIT', '500+ TEMPLATES', '12 LANGUAGES', 'GPT-4 AI MODEL', 'GDPR COMPLIANT', '🎥 LIVE MEETINGS'].map((t) => (
          <View key={t} style={s.taglineChip}>
            <Text style={s.taglineText}>{t}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* User card */}
        <View style={s.userCard}>
          <LinearGradient colors={colors.gradientCard as any} style={s.userCardInner}>
            <View style={s.userLeft}>
              <View style={s.userAvatar}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>Solomon Omomeje Ayodele</Text>
                <Text style={s.userEmail}>📧 networkniceit@gmail.com</Text>
              </View>
            </View>
            <TouchableOpacity style={s.bioBadge} onPress={() => navigation.navigate('Settings')}>
              <Text style={s.bioBadgeText}>⚙️ Bio Active</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionLine} />
              <Text style={s.sectionTitle}>{section.title}</Text>
              <View style={s.sectionLine} />
            </View>
            <View style={s.grid}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={s.featureCard}
                  activeOpacity={0.82}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <LinearGradient colors={colors.gradientCard as any} style={s.featureInner}>
                    {item.badge && (
                      <View style={[s.badge, { backgroundColor: `${BADGE_COLORS[item.badge]}22`, borderColor: BADGE_COLORS[item.badge] }]}>
                        {item.badge === 'LIVE' && <View style={s.badgeDot} />}
                        <Text style={[s.badgeText, { color: BADGE_COLORS[item.badge] }]}>{item.badge}</Text>
                      </View>
                    )}
                    <Text style={s.featureIcon}>{item.icon}</Text>
                    <Text style={s.featureLabel}>{item.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerIcon}>⚖️</Text>
          <Text style={s.disclaimerText}>
            AI legal advice is informational only. Consult a licensed attorney for official legal representation.
          </Text>
          <View style={s.disclaimerBadges}>
            <Text style={s.disclaimerBadge}>· GDPR Compliant ·</Text>
            <Text style={s.disclaimerBadge}>Confidential ·</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any, w: number) {
  const CARD_W = (w - Spacing.md * 2 - Spacing.sm) / 2;
  return StyleSheet.create({
    container: { flex: 1 },
    topBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: Spacing.md, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    logoIcon: { fontSize: 26 },
    logoTitle: { fontFamily: Typography.serif, fontSize: 16, color: colors.textPrimary },
    logoSub: { fontFamily: Typography.sans, fontSize: 8, color: colors.gold, letterSpacing: 1 },
    topBadges: { flexDirection: 'row', gap: 4, alignItems: 'center', flexShrink: 0 },
    topBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 3,
      paddingHorizontal: 6, paddingVertical: 3,
      borderRadius: Radius.full, borderWidth: 1,
    },
    topBadgeText: { fontFamily: Typography.sansBold, fontSize: 9, letterSpacing: 0.3 },
    liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#E53E3E' },
    settingsBtn: {
      width: 34, height: 34, borderRadius: 17,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.bgCard, flexShrink: 0,
    },
    taglineBar: { maxHeight: 36, borderBottomWidth: 1, borderBottomColor: colors.border },
    taglineContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 7, gap: 8 },
    taglineChip: {
      paddingHorizontal: 9, paddingVertical: 2,
      backgroundColor: colors.goldMuted,
      borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border,
    },
    taglineText: { fontFamily: Typography.sansBold, fontSize: 9, color: colors.gold, letterSpacing: 0.5 },
    userCard: { margin: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    userCardInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
    userLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    userAvatar: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.bgElevated,
      borderWidth: 1.5, borderColor: colors.gold,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    userName: { fontFamily: Typography.sansBold, fontSize: 12, color: colors.textPrimary },
    userEmail: { fontFamily: Typography.sans, fontSize: 10, color: colors.textSecondary, marginTop: 1 },
    bioBadge: {
      paddingHorizontal: 9, paddingVertical: 5,
      backgroundColor: colors.goldMuted,
      borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border, flexShrink: 0,
    },
    bioBadgeText: { fontFamily: Typography.sansBold, fontSize: 10, color: colors.gold },
    section: { paddingHorizontal: Spacing.md, marginBottom: 4 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 14 },
    sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },
    sectionTitle: { fontFamily: Typography.sansBold, fontSize: 10, color: colors.gold, letterSpacing: 1.5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    featureCard: {
      width: CARD_W, borderRadius: Radius.md,
      overflow: 'hidden', borderWidth: 1, borderColor: colors.borderSubtle,
    },
    featureInner: {
      padding: Spacing.md, minHeight: 88,
      alignItems: 'flex-start', justifyContent: 'flex-end',
      gap: 6, position: 'relative',
    },
    badge: {
      position: 'absolute', top: 8, right: 8,
      flexDirection: 'row', alignItems: 'center', gap: 3,
      paddingHorizontal: 6, paddingVertical: 2,
      borderRadius: Radius.full, borderWidth: 1,
    },
    badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#E53E3E' },
    badgeText: { fontFamily: Typography.sansBold, fontSize: 9, letterSpacing: 0.5 },
    featureIcon: { fontSize: 26 },
    featureLabel: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textPrimary, lineHeight: 17 },
    disclaimer: {
      margin: Spacing.md, padding: Spacing.md,
      backgroundColor: colors.bgCard, borderRadius: Radius.md,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', gap: 6,
    },
    disclaimerIcon: { fontSize: 20 },
    disclaimerText: {
      fontFamily: Typography.sans, fontSize: 12,
      color: colors.textSecondary, lineHeight: 18, textAlign: 'center',
    },
    disclaimerBadges: { flexDirection: 'row', gap: 6 },
    disclaimerBadge: { fontFamily: Typography.sansMedium, fontSize: 11, color: colors.gold },
  });
}
