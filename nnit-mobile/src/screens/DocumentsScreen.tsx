import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { generateDocument, analyzeDocument } from '../services/api';
import { sendLocalNotification } from '../services/notifications';
import { Card, GoldButton, GhostButton, GoldDivider, Badge } from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

const DOC_TYPES = [
  { id: 'nda', label: 'NDA', icon: '🔐', desc: 'Non-Disclosure Agreement' },
  { id: 'contract', label: 'Contract', icon: '📝', desc: 'Service Agreement' },
  { id: 'will', label: 'Will', icon: '📜', desc: 'Last Will & Testament' },
  { id: 'lease', label: 'Lease', icon: '🏠', desc: 'Rental Agreement' },
  { id: 'invoice', label: 'Invoice', icon: '💰', desc: 'Legal Invoice' },
  { id: 'privacy', label: 'Privacy Policy', icon: '🔒', desc: 'GDPR Privacy Policy' },
  { id: 'terms', label: 'Terms of Service', icon: '📋', desc: 'ToS Document' },
  { id: 'employment', label: 'Employment', icon: '👔', desc: 'Employment Contract' },
  { id: 'partnership', label: 'Partnership', icon: '🤝', desc: 'Partnership Agreement' },
  { id: 'llc', label: 'LLC Agreement', icon: '🏢', desc: 'Operating Agreement' },
];

export default function DocumentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'generate' | 'analyze'>('generate');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [analyzeText, setAnalyzeText] = useState('');

  async function handleGenerate() {
    if (!selectedType || !details.trim()) return;
    setLoading(true);
    const doc = DOC_TYPES.find((d) => d.id === selectedType);
    const text = await generateDocument(doc?.label ?? selectedType, details);
    setResult(text);
    setModalVisible(true);
    setLoading(false);
    await sendLocalNotification('📄 Document Ready', `Your ${doc?.label} has been generated.`);
  }

  async function handleAnalyze() {
    if (!analyzeText.trim()) return;
    setLoading(true);
    const analysis = await analyzeDocument(analyzeText);
    setResult(analysis);
    setModalVisible(true);
    setLoading(false);
  }

  async function pickDocument() {
    const picked = await DocumentPicker.getDocumentAsync({ type: 'text/*' });
    if (!picked.canceled && picked.assets[0]) {
      const content = await FileSystem.readAsStringAsync(picked.assets[0].uri);
      setAnalyzeText(content.slice(0, 8000));
    }
  }

  async function shareResult() {
    await Share.share({ message: result });
  }

  async function saveResult() {
    const filename = `nnit_doc_${Date.now()}.txt`;
    const path = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(path, result);
    await Sharing.shareAsync(path);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E1A', '#070B14']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['generate', 'analyze'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'generate' ? '📄 Generate' : '🔍 Analyze'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
      >
        {tab === 'generate' ? (
          <>
            <Text style={styles.sectionLabel}>Select Document Type</Text>
            <View style={styles.docGrid}>
              {DOC_TYPES.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.docCard, selectedType === d.id && styles.docCardActive]}
                  onPress={() => setSelectedType(d.id)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.docIcon}>{d.icon}</Text>
                  <Text style={[styles.docLabel, selectedType === d.id && styles.docLabelActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <GoldDivider />

            <Text style={styles.sectionLabel}>Details & Instructions</Text>
            <TextInput
              style={styles.textarea}
              placeholder={`Describe what you need...\n\nE.g.: NDA between Company A and Company B, effective Jan 2025, covering software development...`}
              placeholderTextColor={Colors.textMuted}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <GoldButton
              label={loading ? 'Generating...' : 'Generate Document'}
              onPress={handleGenerate}
              loading={loading}
              disabled={!selectedType || !details.trim()}
              style={{ marginTop: Spacing.md }}
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Paste or Upload Contract</Text>
            <TextInput
              style={[styles.textarea, { minHeight: 200 }]}
              placeholder="Paste contract text here..."
              placeholderTextColor={Colors.textMuted}
              value={analyzeText}
              onChangeText={setAnalyzeText}
              multiline
              textAlignVertical="top"
            />

            <GhostButton
              label="📁 Upload Text File"
              onPress={pickDocument}
              style={{ marginVertical: Spacing.sm }}
            />

            <GoldButton
              label={loading ? 'Analyzing...' : 'Analyze Contract'}
              onPress={handleAnalyze}
              loading={loading}
              disabled={!analyzeText.trim()}
            />
          </>
        )}
      </ScrollView>

      {/* Result Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <LinearGradient colors={['#111827', '#0A0E1A']} style={StyleSheet.absoluteFill} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {tab === 'generate' ? '📄 Generated Document' : '🔍 Analysis Report'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: Spacing.md }}>
            <Text style={styles.resultText}>{result}</Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <GhostButton label="Share" onPress={shareResult} style={{ flex: 1 }}
              icon={<Ionicons name="share-outline" size={16} color={Colors.gold} />} />
            <GoldButton label="Save & Export" onPress={saveResult} style={{ flex: 1 }}
              icon={<Ionicons name="download-outline" size={16} color={Colors.bg} />} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontFamily: Typography.serif, fontSize: 22, color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row', padding: Spacing.sm, gap: Spacing.sm,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.goldMuted, borderWidth: 1, borderColor: Colors.border },
  tabText: { fontFamily: Typography.sansMedium, fontSize: 14, color: Colors.textSecondary },
  tabTextActive: { color: Colors.gold },
  sectionLabel: {
    fontFamily: Typography.sansMedium, fontSize: 13, color: Colors.textSecondary,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 4,
  },
  docGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  docCard: {
    width: '18.5%', aspectRatio: 1, borderRadius: Radius.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderSubtle,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  docCardActive: { borderColor: Colors.gold, backgroundColor: Colors.goldMuted },
  docIcon: { fontSize: 22 },
  docLabel: { fontFamily: Typography.sans, fontSize: 9, color: Colors.textSecondary, textAlign: 'center' },
  docLabelActive: { color: Colors.gold },
  textarea: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, minHeight: 120,
    fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary,
    lineHeight: 22,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, paddingTop: Spacing.xl,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontFamily: Typography.serif, fontSize: 20, color: Colors.textPrimary },
  resultText: {
    fontFamily: Typography.sans, fontSize: 14,
    color: Colors.textPrimary, lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row', gap: Spacing.sm,
    padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
