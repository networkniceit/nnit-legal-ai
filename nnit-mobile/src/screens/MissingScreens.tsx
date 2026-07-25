import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, FlatList, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../utils/ThemeContext';
import { Typography, Spacing, Radius } from '../utils/theme';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = 'YOUR_GROQ_API_KEY';

async function groq(system: string, user: string): Promise<string> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: 'llama3-70b-8192', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 2000 }),
    });
    const d = await res.json();
    return d.choices[0]?.message?.content ?? 'No response.';
  } catch {
    return '[Offline] Unable to reach AI. Check your connection.';
  }
}

// ── Shell wrapper ─────────────────────────────────────────────
function Shell({ title, subtitle, navigation, children }: { title: string; subtitle?: string; navigation: any; children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontFamily: Typography.serif, fontSize: 21, color: colors.textPrimary }}>{title}</Text>
          {subtitle && <Text style={{ fontFamily: Typography.sans, fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{subtitle}</Text>}
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}>
        {children}
      </ScrollView>
    </View>
  );
}

// Shared textarea + button pattern
function AIToolScreen({ title, subtitle, navigation, systemPrompt, inputPlaceholder, buttonLabel, resultLabel }: any) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  async function pickFile() {
    const picked = await DocumentPicker.getDocumentAsync({ type: 'text/*' });
    if (!picked.canceled && picked.assets[0]) {
      const content = await FileSystem.readAsStringAsync(picked.assets[0].uri);
      setText(content.slice(0, 8000));
    }
  }

  async function run() {
    if (!text.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const res = await groq(systemPrompt, text);
    setResult(res);
    setLoading(false);
  }

  const s = makeS(colors);
  return (
    <Shell title={title} subtitle={subtitle} navigation={navigation}>
      <TouchableOpacity style={s.uploadRow} onPress={pickFile}>
        <Ionicons name="attach-outline" size={18} color={colors.gold} />
        <Text style={s.uploadLabel}>📎 Upload document to analyze</Text>
      </TouchableOpacity>

      <Text style={s.fieldLabel}>Or paste text</Text>
      <TextInput
        style={[s.textarea, { minHeight: 180 }]}
        placeholder={inputPlaceholder}
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[s.goldBtn, (!text.trim() || loading) && s.disabled]}
        onPress={run}
        disabled={!text.trim() || loading}
      >
        <LinearGradient colors={colors.gradientGold as any} style={s.goldBtnInner}>
          <Text style={s.goldBtnText}>{loading ? 'Analyzing...' : buttonLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {!!result && (
        <View style={s.resultBox}>
          <View style={s.resultHeader}>
            <Text style={s.resultLabel}>{resultLabel}</Text>
            <TouchableOpacity onPress={() => Share.share({ message: result })}>
              <Ionicons name="share-outline" size={18} color={colors.gold} />
            </TouchableOpacity>
          </View>
          <Text style={s.resultText}>{result}</Text>
        </View>
      )}
    </Shell>
  );
}

// ── RISK ASSESSMENT ───────────────────────────────────────────
export function RiskAssessmentScreen({ navigation }: any) {
  return (
    <AIToolScreen
      title="⚠️ Risk Assessment"
      subtitle="AI-powered legal risk analysis"
      navigation={navigation}
      systemPrompt="You are a legal risk analyst. Analyze the provided document or text and produce a detailed Risk Assessment Report with: Overall Risk Score (0-100), Risk Level (Low/Medium/High/Critical), Top Risks identified (numbered list), Risk Categories (contractual, regulatory, financial, operational), Mitigation Recommendations, and Summary. Format clearly with sections."
      inputPlaceholder="Paste contract, policy, or legal document text to assess risks..."
      buttonLabel="⚠️ Run Risk Assessment"
      resultLabel="⚠️ Risk Assessment Report"
    />
  );
}

// ── EXTRACT DEADLINES ─────────────────────────────────────────
export function DeadlinesScreen({ navigation }: any) {
  return (
    <AIToolScreen
      title="📅 Extract Deadlines"
      subtitle="Find all dates and deadlines automatically"
      navigation={navigation}
      systemPrompt="You are a legal document analyst specializing in deadline extraction. Extract ALL dates, deadlines, time limits, and time-sensitive obligations from the provided text. Format as a structured table with: Date/Deadline, Description of Obligation, Party Responsible, Consequence of Missing, and Priority Level (High/Medium/Low). List in chronological order. Also add a summary of the most critical upcoming deadlines."
      inputPlaceholder="Paste contract or legal document to extract all deadlines and dates..."
      buttonLabel="📅 Extract All Deadlines"
      resultLabel="📅 Extracted Deadlines"
    />
  );
}

// ── IDENTIFY PARTIES ──────────────────────────────────────────
export function PartiesScreen({ navigation }: any) {
  return (
    <AIToolScreen
      title="👥 Identify Parties"
      subtitle="Extract all parties, roles and obligations"
      navigation={navigation}
      systemPrompt="You are a legal document analyst. Identify and extract ALL parties mentioned in the document. For each party provide: Full Legal Name, Role/Title in agreement, Contact details if present, Key Obligations, Key Rights, Signature requirements, and any defined terms used to refer to them. Also identify any third parties, beneficiaries, or referenced entities. Format clearly with a section per party."
      inputPlaceholder="Paste contract or agreement to identify all parties and their roles..."
      buttonLabel="👥 Identify All Parties"
      resultLabel="👥 Parties Identified"
    />
  );
}

// ── UPLOAD DOCUMENTS ─────────────────────────────────────────
export function UploadScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string; date: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');

  async function pickAndUpload() {
    const picked = await DocumentPicker.getDocumentAsync({ type: 'text/*' });
    if (!picked.canceled && picked.assets[0]) {
      const content = await FileSystem.readAsStringAsync(picked.assets[0].uri);
      setUploadedFiles((prev) => [{ name: picked.assets[0].name, content: content.slice(0, 8000), date: 'Just now' }, ...prev]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Uploaded', `${picked.assets[0].name} uploaded successfully.`);
    }
  }

  async function analyzeFile(file: { name: string; content: string }) {
    setSelectedFile(file.name);
    setAnalyzing(true);
    setAnalysis('');
    const res = await groq(
      'You are a legal document analyst. Provide a comprehensive analysis: Summary, Contract Type, Key Clauses, Risks, Missing Provisions, and Recommendations.',
      `Analyze: ${file.content}`
    );
    setAnalysis(res);
    setAnalyzing(false);
  }

  const s = makeS(colors);
  return (
    <Shell title="📎 Upload Documents" subtitle="Upload contracts for AI risk analysis" navigation={navigation}>
      <TouchableOpacity style={s.uploadBigBtn} onPress={pickAndUpload}>
        <LinearGradient colors={colors.gradientCard as any} style={s.uploadBigInner}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📎</Text>
          <Text style={s.uploadBigTitle}>Upload Document</Text>
          <Text style={s.uploadBigSub}>Tap to select a file from your device</Text>
          <Text style={s.uploadBigSub}>Supports: .txt, .doc, .pdf text</Text>
        </LinearGradient>
      </TouchableOpacity>

      {uploadedFiles.length > 0 && (
        <>
          <Text style={[s.fieldLabel, { marginTop: Spacing.lg }]}>Uploaded Files</Text>
          {uploadedFiles.map((file) => (
            <View key={file.name} style={s.fileCard}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.fileName}>{file.name}</Text>
                <Text style={s.fileMeta}>{file.date} · {file.content.length.toLocaleString()} chars</Text>
              </View>
              <TouchableOpacity
                style={s.analyzeBtn}
                onPress={() => analyzeFile(file)}
                disabled={analyzing}
              >
                <Text style={s.analyzeBtnText}>{analyzing && selectedFile === file.name ? '...' : 'Analyze'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {!!analysis && (
        <View style={s.resultBox}>
          <View style={s.resultHeader}>
            <Text style={s.resultLabel}>🔍 Analysis: {selectedFile}</Text>
            <TouchableOpacity onPress={() => Share.share({ message: analysis })}>
              <Ionicons name="share-outline" size={18} color={colors.gold} />
            </TouchableOpacity>
          </View>
          <Text style={s.resultText}>{analysis}</Text>
        </View>
      )}

      {uploadedFiles.length === 0 && (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📁</Text>
          <Text style={s.emptyTitle}>No files uploaded yet</Text>
          <Text style={s.emptySub}>Upload a contract or legal document to get instant AI-powered risk analysis.</Text>
        </View>
      )}
    </Shell>
  );
}

// ── CAMERA SCANNER ────────────────────────────────────────────
export function CameraScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [scannedText, setScannedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');

  async function simulateScan() {
    // Real implementation would use expo-camera + OCR
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      '📷 Camera Scanner',
      'Point your camera at a physical document. The app will scan and extract text automatically.\n\nNote: Ensure good lighting for best OCR results.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Demo Text', onPress: () => setScannedText('NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into as of January 1, 2025 between NNIT Legal AI ("Disclosing Party") and the undersigned recipient ("Receiving Party").\n\n1. CONFIDENTIAL INFORMATION\nThe Receiving Party agrees to keep confidential all information disclosed by the Disclosing Party...\n\n2. TERM\nThis Agreement shall remain in effect for a period of three (3) years from the date of execution.') },
      ]
    );
  }

  async function analyzeScanned() {
    if (!scannedText.trim()) return;
    setAnalyzing(true);
    const res = await groq('You are a legal document analyst. Analyze the scanned document and provide: Document Type, Summary, Key Clauses, Parties, Dates, and any Actions Required.', scannedText);
    setAnalysis(res);
    setAnalyzing(false);
  }

  const s = makeS(colors);
  return (
    <Shell title="📷 Camera Scanner" subtitle="Scan physical legal documents" navigation={navigation}>
      <TouchableOpacity style={s.uploadBigBtn} onPress={simulateScan}>
        <LinearGradient colors={colors.gradientCard as any} style={s.uploadBigInner}>
          <Text style={{ fontSize: 44, marginBottom: 8 }}>📷</Text>
          <Text style={s.uploadBigTitle}>Scan Document</Text>
          <Text style={s.uploadBigSub}>Tap to open camera and scan</Text>
          <Text style={s.uploadBigSub}>Physical documents, printed contracts</Text>
        </LinearGradient>
      </TouchableOpacity>

      {!!scannedText && (
        <>
          <Text style={s.fieldLabel}>Scanned Text</Text>
          <TextInput
            style={[s.textarea, { minHeight: 140 }]}
            value={scannedText}
            onChangeText={setScannedText}
            multiline
            textAlignVertical="top"
            placeholder="Scanned text will appear here..."
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[s.goldBtn, analyzing && s.disabled]}
            onPress={analyzeScanned}
            disabled={analyzing}
          >
            <LinearGradient colors={colors.gradientGold as any} style={s.goldBtnInner}>
              <Text style={s.goldBtnText}>{analyzing ? 'Analyzing...' : '🔍 Analyze Scanned Document'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      {!!analysis && (
        <View style={s.resultBox}>
          <Text style={s.resultLabel}>📋 Analysis Result</Text>
          <Text style={s.resultText}>{analysis}</Text>
        </View>
      )}
    </Shell>
  );
}

// ── VOICE READER ──────────────────────────────────────────────
export function VoiceReaderScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [rate, setRate] = useState(0.9);

  const langs = [
    { code: 'en-US', flag: '🇬🇧', label: 'English' },
    { code: 'de-DE', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'fr-FR', flag: '🇫🇷', label: 'Français' },
    { code: 'es-ES', flag: '🇪🇸', label: 'Español' },
    { code: 'it-IT', flag: '🇮🇹', label: 'Italiano' },
    { code: 'nl-NL', flag: '🇳🇱', label: 'Nederlands' },
  ];

  function speak() {
    if (!text.trim()) return;
    setSpeaking(true);
    Speech.speak(text, { language: lang, rate, pitch: 1, onDone: () => setSpeaking(false), onError: () => setSpeaking(false) });
  }

  function stop() { Speech.stop(); setSpeaking(false); }

  const s = makeS(colors);
  return (
    <Shell title="🔊 Voice Reader" subtitle="Listen to legal documents read aloud" navigation={navigation}>
      <Text style={s.fieldLabel}>Select Language</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md }}>
        {langs.map((l) => (
          <TouchableOpacity key={l.code} style={[s.chip, lang === l.code && s.chipActive]} onPress={() => setLang(l.code)}>
            <Text style={s.chipText}>{l.flag} {l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.fieldLabel}>Text to Read</Text>
      <TextInput
        style={[s.textarea, { minHeight: 220 }]}
        placeholder="Paste legal text to read aloud..."
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
      />

      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
        {speaking ? (
          <TouchableOpacity style={[s.goldBtn, { flex: 1 }]} onPress={stop}>
            <LinearGradient colors={['#E53E3E', '#C0392B']} style={s.goldBtnInner}>
              <Text style={s.goldBtnText}>⏹ Stop Reading</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.goldBtn, { flex: 1 }, !text.trim() && s.disabled]} onPress={speak} disabled={!text.trim()}>
            <LinearGradient colors={colors.gradientGold as any} style={s.goldBtnInner}>
              <Text style={s.goldBtnText}>🔊 Read Aloud</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.clearBtn} onPress={() => { setText(''); Speech.stop(); setSpeaking(false); }}>
          <Text style={s.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </Shell>
  );
}

// ── SAVED DOCUMENTS ───────────────────────────────────────────
export function SavedDocsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [docs] = useState([
    { id: '1', title: 'NDA — TechCorp GmbH', type: 'NDA', date: 'Mar 25, 2026', size: '4.2 KB', icon: '🔐' },
    { id: '2', title: 'Employment Contract — Schmidt', type: 'Contract', date: 'Mar 20, 2026', size: '6.8 KB', icon: '👔' },
    { id: '3', title: 'GDPR Privacy Policy v2', type: 'Policy', date: 'Mar 15, 2026', size: '12.1 KB', icon: '🔒' },
    { id: '4', title: 'Lease Agreement — Office Berlin', type: 'Lease', date: 'Mar 10, 2026', size: '8.3 KB', icon: '🏠' },
    { id: '5', title: 'Partnership Agreement — StartupIO', type: 'Partnership', date: 'Mar 5, 2026', size: '5.7 KB', icon: '🤝' },
    { id: '6', title: 'Risk Assessment — Q1 2026', type: 'Report', date: 'Feb 28, 2026', size: '3.4 KB', icon: '⚠️' },
  ]);
  const [search, setSearch] = useState('');
  const filtered = docs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase()));

  const s = makeS(colors);
  return (
    <Shell title="💾 Saved Documents" subtitle={`${docs.length} documents saved`} navigation={navigation}>
      <View style={s.searchBar}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput style={s.searchInput} placeholder="Search documents..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
      </View>

      {filtered.map((doc) => (
        <TouchableOpacity key={doc.id} activeOpacity={0.82} onPress={() => Alert.alert(doc.title, `Type: ${doc.type}\nDate: ${doc.date}\nSize: ${doc.size}`, [
          { text: 'Share', onPress: () => Share.share({ message: `${doc.title}\n${doc.type}` }) },
          { text: 'Close', style: 'cancel' },
        ])}>
          <View style={s.docCard}>
            <View style={s.docIconBox}>
              <Text style={{ fontSize: 26 }}>{doc.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.docTitle}>{doc.title}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={s.docMeta}>{doc.type}</Text>
                <Text style={s.docMeta}>·</Text>
                <Text style={s.docMeta}>{doc.date}</Text>
                <Text style={s.docMeta}>·</Text>
                <Text style={s.docMeta}>{doc.size}</Text>
              </View>
            </View>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      ))}

      {filtered.length === 0 && (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>💾</Text>
          <Text style={s.emptyTitle}>No documents found</Text>
          <Text style={s.emptySub}>Generate or upload documents to see them here.</Text>
        </View>
      )}
    </Shell>
  );
}

// ── SCHEDULE MEETING (standalone) ─────────────────────────────
export function ScheduleScreen({ navigation }: any) {
  navigation.navigate('Meetings');
  return null;
}

// ── MEETING HISTORY (standalone) ──────────────────────────────
export function MeetingHistoryScreen({ navigation }: any) {
  navigation.navigate('Meetings');
  return null;
}

// ── Shared styles ─────────────────────────────────────────────
function makeS(colors: any) {
  return StyleSheet.create({
    fieldLabel: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
    textarea: { backgroundColor: colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, padding: Spacing.md, fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary, lineHeight: 22, marginBottom: Spacing.md },
    goldBtn: { borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.md },
    goldBtnInner: { paddingVertical: 15, alignItems: 'center' },
    goldBtnText: { fontFamily: Typography.sansBold, fontSize: 15, color: colors.bg },
    disabled: { opacity: 0.5 },
    resultBox: { backgroundColor: colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: Spacing.sm },
    resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    resultLabel: { fontFamily: Typography.sansBold, fontSize: 13, color: colors.gold, letterSpacing: 0.3 },
    resultText: { fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
    uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.goldMuted, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: Spacing.md },
    uploadLabel: { fontFamily: Typography.sansMedium, fontSize: 14, color: colors.gold },
    uploadBigBtn: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.border, marginBottom: Spacing.lg, borderStyle: 'dashed' },
    uploadBigInner: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 4 },
    uploadBigTitle: { fontFamily: Typography.serif, fontSize: 20, color: colors.textPrimary },
    uploadBigSub: { fontFamily: Typography.sans, fontSize: 13, color: colors.textSecondary },
    fileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, marginBottom: Spacing.sm },
    fileName: { fontFamily: Typography.sansMedium, fontSize: 14, color: colors.textPrimary },
    fileMeta: { fontFamily: Typography.sans, fontSize: 12, color: colors.textSecondary },
    analyzeBtn: { backgroundColor: colors.goldMuted, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border },
    analyzeBtnText: { fontFamily: Typography.sansMedium, fontSize: 13, color: colors.gold },
    emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontFamily: Typography.serif, fontSize: 20, color: colors.textPrimary },
    emptySub: { fontFamily: Typography.sans, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
    chipActive: { backgroundColor: colors.goldMuted, borderColor: colors.gold },
    chipText: { fontFamily: Typography.sansMedium, fontSize: 13, color: colors.textSecondary },
    clearBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center' },
    clearBtnText: { fontFamily: Typography.sansMedium, fontSize: 14, color: colors.textSecondary },
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bgCard, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 10, marginBottom: Spacing.md },
    searchInput: { flex: 1, fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary },
    docCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, marginBottom: Spacing.sm },
    docIconBox: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontFamily: Typography.sansMedium, fontSize: 14, color: colors.textPrimary },
    docMeta: { fontFamily: Typography.sans, fontSize: 11, color: colors.textSecondary },
    xxl: 48,
  });
}
