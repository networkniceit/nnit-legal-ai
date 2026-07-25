import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { scanCompliance, generateDocument } from '../services/api';
import { AuthStore } from '../services/storage';
import { Card, GoldButton, GhostButton, GoldDivider, Badge, EmptyState } from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

function ScreenShell({ title, navigation, children }: { title: string; navigation: any; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, paddingTop: insets.top }}>
      <LinearGradient colors={['#0A0E1A', '#070B14']} style={StyleSheet.absoluteFill} />
      <View style={shell.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={shell.title}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}>
        {children}
      </ScrollView>
    </View>
  );
}

// ── COMPLIANCE SCREEN ────────────────────────────────────────
export function ComplianceScreen({ navigation }: any) {
  const [text, setText] = useState('');
  const [area, setArea] = useState('GDPR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const areas = ['GDPR', 'Employment Law', 'Corporate Law', 'Tax Law', 'Data Protection', 'AML'];

  async function scan() {
    if (!text.trim()) return;
    setLoading(true);
    const report = await scanCompliance(text, area);
    setResult(report);
    setLoading(false);
  }

  return (
    <ScreenShell title="Compliance Scanner" navigation={navigation}>
      <Text style={s.label}>Compliance Area</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {areas.map((a) => (
            <TouchableOpacity key={a} style={[s.chip, area === a && s.chipActive]} onPress={() => setArea(a)}>
              <Text style={[s.chipText, area === a && s.chipTextActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={s.label}>Document or Policy Text</Text>
      <TextInput style={[s.textarea, { minHeight: 180 }]} placeholder="Paste text to scan..."
        placeholderTextColor={Colors.textMuted} value={text} onChangeText={setText}
        multiline textAlignVertical="top" />

      <GoldButton label={loading ? 'Scanning...' : `Scan for ${area} Compliance`}
        onPress={scan} loading={loading} disabled={!text.trim()} style={{ marginTop: Spacing.md }} />

      {!!result && (
        <>
          <GoldDivider />
          <Text style={s.sectionTitle}>📊 Compliance Report</Text>
          <Card>
            <Text style={s.resultText}>{result}</Text>
          </Card>
        </>
      )}
    </ScreenShell>
  );
}

// ── CASE BUILDER SCREEN ──────────────────────────────────────
export function CasesScreen({ navigation }: any) {
  const [cases, setCases] = useState([
    { id: '1', title: 'Smith v. Johnson Corp', type: 'Civil', status: 'Active', priority: 'High' },
    { id: '2', title: 'GDPR Violation — DataCo', type: 'Regulatory', status: 'Review', priority: 'Critical' },
    { id: '3', title: 'Employment Dispute #2024', type: 'Employment', status: 'Closed', priority: 'Low' },
  ]);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Civil');

  const statusColor: Record<string, string> = {
    Active: Colors.success, Review: Colors.warning, Closed: Colors.textMuted,
  };
  const priorityColor: Record<string, string> = {
    High: Colors.warning, Critical: Colors.danger, Low: Colors.textMuted, Medium: Colors.info,
  };

  function addCase() {
    if (!newTitle.trim()) return;
    setCases([...cases, { id: Date.now().toString(), title: newTitle, type: newType, status: 'Active', priority: 'Medium' }]);
    setNewTitle(''); setShowNew(false);
  }

  return (
    <ScreenShell title="Case Builder" navigation={navigation}>
      <GoldButton label="+ New Case" onPress={() => setShowNew(!showNew)} style={{ marginBottom: Spacing.md }} />

      {showNew && (
        <Card style={{ marginBottom: Spacing.md, gap: 12 }}>
          <TextInput style={s.input} placeholder="Case title..." placeholderTextColor={Colors.textMuted}
            value={newTitle} onChangeText={setNewTitle} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['Civil', 'Criminal', 'Corporate', 'Employment', 'Regulatory', 'IP'].map((t) => (
              <TouchableOpacity key={t} style={[s.chip, newType === t && s.chipActive]} onPress={() => setNewType(t)}>
                <Text style={[s.chipText, newType === t && s.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <GoldButton label="Create Case" onPress={addCase} disabled={!newTitle.trim()} />
        </Card>
      )}

      {cases.map((c) => (
        <Card key={c.id} style={{ marginBottom: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={s.caseTitle}>{c.title}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Badge label={c.type} color={Colors.gold} />
                <Badge label={c.status} color={statusColor[c.status] ?? Colors.textMuted} />
                <Badge label={c.priority} color={priorityColor[c.priority] ?? Colors.textMuted} />
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </ScreenShell>
  );
}

// ── PAYMENTS SCREEN ──────────────────────────────────────────
export function PaymentsScreen({ navigation }: any) {
  const plans = [
    { id: 'basic', name: 'Basic', price: '€50/mo', features: ['AI Chat', 'Document Generator', 'Email Support'], url: 'https://buy.stripe.com/your_basic_link' },
    { id: 'pro', name: 'Professional', price: '€99/mo', features: ['All Basic +', 'Compliance Scanner', 'Case Builder', '500+ Templates', 'Priority Support'], url: 'https://buy.stripe.com/your_pro_link', popular: true },
    { id: 'enterprise', name: 'Enterprise', price: '€249/mo', features: ['All Pro +', 'Video Meetings', 'White-label', 'Dedicated Support', 'Custom Integrations'], url: 'https://buy.stripe.com/your_enterprise_link' },
  ];

  return (
    <ScreenShell title="Subscription Plans" navigation={navigation}>
      <Text style={[s.label, { marginBottom: Spacing.md }]}>Choose your plan</Text>

      {plans.map((p) => (
        <Card key={p.id} style={{ marginBottom: Spacing.md, borderColor: p.popular ? Colors.gold : Colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={s.planName}>{p.name}</Text>
              <Text style={s.planPrice}>{p.price}</Text>
            </View>
            {p.popular && <Badge label="Most Popular" color={Colors.gold} />}
          </View>
          <GoldDivider />
          {p.features.map((f) => (
            <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={[s.planBtn, { borderColor: p.popular ? Colors.gold : Colors.border, backgroundColor: p.popular ? Colors.goldMuted : 'transparent' }]}
            onPress={() => Linking.openURL(p.url)}
          >
            <Text style={[s.planBtnText, { color: p.popular ? Colors.gold : Colors.textSecondary }]}>
              Subscribe — {p.price}
            </Text>
          </TouchableOpacity>
        </Card>
      ))}

      <Text style={s.disclaimer}>Payments processed securely by Stripe. Cancel anytime.</Text>
    </ScreenShell>
  );
}

// ── VOICE SCREEN ─────────────────────────────────────────────
export function VoiceScreen({ navigation }: any) {
  const [text, setText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [rate, setRate] = useState(0.9);

  const langs = [
    { code: 'en-US', label: 'EN' }, { code: 'de-DE', label: 'DE' },
    { code: 'fr-FR', label: 'FR' }, { code: 'es-ES', label: 'ES' },
    { code: 'it-IT', label: 'IT' }, { code: 'nl-NL', label: 'NL' },
  ];

  async function speak() {
    if (!text.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSpeaking(true);
    Speech.speak(text, {
      language: lang, rate, pitch: 1,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  function stop() { Speech.stop(); setSpeaking(false); }

  return (
    <ScreenShell title="Voice Reader" navigation={navigation}>
      <Text style={s.label}>Language</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.md, flexWrap: 'wrap' }}>
        {langs.map((l) => (
          <TouchableOpacity key={l.code} style={[s.chip, lang === l.code && s.chipActive]} onPress={() => setLang(l.code)}>
            <Text style={[s.chipText, lang === l.code && s.chipTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Text to Read</Text>
      <TextInput
        style={[s.textarea, { minHeight: 200 }]}
        placeholder="Paste legal text to read aloud..."
        placeholderTextColor={Colors.textMuted}
        value={text} onChangeText={setText}
        multiline textAlignVertical="top"
      />

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
        {speaking
          ? <GoldButton label="⏹ Stop" onPress={stop} style={{ flex: 1 }} />
          : <GoldButton label="🔊 Read Aloud" onPress={speak} disabled={!text.trim()} style={{ flex: 1 }} />
        }
        <GhostButton label="Clear" onPress={() => setText('')} style={{ flex: 0.4 }} />
      </View>
    </ScreenShell>
  );
}

// ── PORTAL SCREEN ────────────────────────────────────────────
export function PortalScreen({ navigation }: any) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'login' | 'register'>('login');

  function login() {
    if (!email.trim() || !password.trim()) return;
    AuthStore.saveToken('demo_token_' + Date.now());
    setLoggedIn(true);
  }

  function logout() {
    AuthStore.clearToken();
    setLoggedIn(false);
    setEmail(''); setPassword('');
  }

  if (loggedIn) {
    return (
      <ScreenShell title="Client Portal" navigation={navigation}>
        <Card style={{ alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.md }}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={s.portalName}>{email || 'Client'}</Text>
          <Badge label="Active Client" color={Colors.success} style={{ marginTop: 8 }} />
        </Card>

        {[
          { icon: '📄', label: 'My Documents', count: '12' },
          { icon: '⚖️', label: 'Active Cases', count: '3' },
          { icon: '📹', label: 'Upcoming Meetings', count: '2' },
          { icon: '💳', label: 'Billing & Invoices', count: '—' },
        ].map((item) => (
          <Card key={item.label} style={{ marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              <Text style={s.portalItem}>{item.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.portalCount}>{item.count}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </Card>
        ))}

        <GhostButton label="Sign Out" onPress={logout} style={{ marginTop: Spacing.md }} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Client Portal" navigation={navigation}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.lg }}>
        {(['login', 'register'] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.chip, tab === t && s.chipActive, { flex: 1, justifyContent: 'center' }]} onPress={() => setTab(t)}>
            <Text style={[s.chipText, tab === t && s.chipTextActive]}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Email</Text>
      <TextInput style={[s.input, { marginBottom: Spacing.md }]}
        placeholder="your@email.com" placeholderTextColor={Colors.textMuted}
        value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <Text style={s.label}>Password</Text>
      <TextInput style={[s.input, { marginBottom: Spacing.lg }]}
        placeholder="••••••••" placeholderTextColor={Colors.textMuted}
        value={password} onChangeText={setPassword} secureTextEntry />

      <GoldButton label={tab === 'login' ? 'Sign In' : 'Create Account'} onPress={login} />

      <TouchableOpacity style={{ marginTop: Spacing.md, alignItems: 'center' }}>
        <Text style={s.forgot}>Forgot password?</Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

// ── SETTINGS SCREEN ──────────────────────────────────────────
export function SettingsScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState(true);
  const [biometric, setBiometric] = useState(true);

  const SETTINGS = [
    { key: 'notifs', label: 'Push Notifications', icon: '🔔', value: notifs, set: setNotifs },
    { key: 'biometric', label: 'Biometric Login', icon: '🔐', value: biometric, set: setBiometric },
    { key: 'theme', label: isDark ? 'Dark Mode (on)' : 'Light Mode (on)', icon: isDark ? '🌙' : '☀️', value: isDark, set: toggleTheme },
  ];

  const LINKS = [
    { label: 'Privacy Policy', url: 'https://nnit.com/privacy', icon: '🔒' },
    { label: 'Terms of Service', url: 'https://nnit.com/terms', icon: '📋' },
    { label: 'Contact Support', url: 'mailto:support@nnit.com', icon: '✉️' },
    { label: 'Rate the App', url: '#', icon: '⭐' },
  ];

  return (
    <ScreenShell title="Settings" navigation={navigation}>
      <Text style={s.settingsSection}>Preferences</Text>
      {SETTINGS.map((item) => (
        <Card key={item.key} style={{ marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text style={s.settingLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.set}
            trackColor={{ false: Colors.borderSubtle, true: Colors.goldMuted }}
            thumbColor={item.value ? Colors.gold : Colors.textMuted}
          />
        </Card>
      ))}

      <GoldDivider />
      <Text style={s.settingsSection}>About</Text>

      {LINKS.map((link) => (
        <TouchableOpacity key={link.label} onPress={() => Linking.openURL(link.url)}>
          <Card style={{ marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 18 }}>{link.icon}</Text>
              <Text style={s.settingLabel}>{link.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Card>
        </TouchableOpacity>
      ))}

      <Text style={s.version}>NNIT Legal AI v2.0.0 · Built with ❤️</Text>
    </ScreenShell>
  );
}

// ── TEMPLATES SCREEN ─────────────────────────────────────────
export function TemplatesScreen({ navigation }: any) {
  const categories = [
    { name: 'Corporate', count: 80, icon: '🏢' },
    { name: 'Employment', count: 65, icon: '👔' },
    { name: 'Real Estate', count: 55, icon: '🏠' },
    { name: 'Intellectual Property', count: 45, icon: '💡' },
    { name: 'Financial', count: 70, icon: '💰' },
    { name: 'Litigation', count: 60, icon: '⚖️' },
    { name: 'Privacy & Data', count: 50, icon: '🔒' },
    { name: 'International', count: 40, icon: '🌍' },
    { name: 'Compliance', count: 55, icon: '✅' },
    { name: 'Miscellaneous', count: 80, icon: '📋' },
  ];

  return (
    <ScreenShell title="500+ Templates" navigation={navigation}>
      <Text style={[s.label, { marginBottom: Spacing.md }]}>Browse by category</Text>
      {categories.map((c) => (
        <TouchableOpacity key={c.name} onPress={() => Alert.alert(c.name, `${c.count} templates available`)}>
          <Card style={{ marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 24 }}>{c.icon}</Text>
              <View>
                <Text style={s.templateName}>{c.name}</Text>
                <Text style={s.templateCount}>{c.count} templates</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </TouchableOpacity>
      ))}
    </ScreenShell>
  );
}

// ── CONTRACTS SCREEN ─────────────────────────────────────────
export function ContractsScreen({ navigation }: any) {
  return (
    <ScreenShell title="Contract Analyzer" navigation={navigation}>
      <EmptyState
        icon="🔍"
        title="Contract Analyzer"
        subtitle="Upload or paste a contract to get AI-powered risk analysis, clause extraction, and recommendations."
      />
      <GoldButton label="Go to Document Analyzer" onPress={() => navigation.navigate('Documents')} style={{ marginTop: Spacing.md }} />
    </ScreenShell>
  );
}

// ── SHARED STYLES ────────────────────────────────────────────
const shell = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontFamily: Typography.serif, fontSize: 22, color: Colors.textPrimary },
});

const s = StyleSheet.create({
  label: { fontFamily: Typography.sansMedium, fontSize: 12, color: Colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  sectionTitle: { fontFamily: Typography.serif, fontSize: 18, color: Colors.textPrimary, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  chipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold },
  chipText: { fontFamily: Typography.sansMedium, fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.gold },
  textarea: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary },
  resultText: { fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  caseTitle: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.textPrimary },
  planName: { fontFamily: Typography.serif, fontSize: 20, color: Colors.textPrimary },
  planPrice: { fontFamily: Typography.sansBold, fontSize: 16, color: Colors.gold, marginTop: 2 },
  featureText: { fontFamily: Typography.sans, fontSize: 14, color: Colors.textSecondary },
  planBtn: { marginTop: Spacing.md, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 1, alignItems: 'center' },
  planBtnText: { fontFamily: Typography.sansMedium, fontSize: 14 },
  disclaimer: { fontFamily: Typography.sans, fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.gold, marginBottom: Spacing.sm },
  portalName: { fontFamily: Typography.serif, fontSize: 22, color: Colors.textPrimary },
  portalItem: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.textPrimary },
  portalCount: { fontFamily: Typography.sansBold, fontSize: 14, color: Colors.gold },
  forgot: { fontFamily: Typography.sans, fontSize: 14, color: Colors.textSecondary },
  settingsSection: { fontFamily: Typography.sansBold, fontSize: 12, color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  settingLabel: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.textPrimary },
  version: { fontFamily: Typography.sans, fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
  templateName: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.textPrimary },
  templateCount: { fontFamily: Typography.sans, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
