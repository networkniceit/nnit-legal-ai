import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Share, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import { Typography, Spacing, Radius } from '../utils/theme';
import { sendLocalNotification } from '../services/notifications';

const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';

interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

interface MeetingSummary {
  title: string;
  duration: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  nextSteps: string[];
  participants: string[];
}

interface SavedTranscript {
  id: string;
  title: string;
  date: string;
  duration: string;
  segments: TranscriptSegment[];
  summary: MeetingSummary | null;
}

// Simulate live transcription with realistic legal meeting content
const DEMO_SEGMENTS: TranscriptSegment[] = [
  { id: '1', speaker: 'Attorney A', text: 'Let\'s begin the contract review. The NDA between the parties needs revision in section 4.', timestamp: '00:00:12' },
  { id: '2', speaker: 'Client', text: 'We are concerned about the confidentiality clause duration of five years. Can we reduce it to three?', timestamp: '00:01:05' },
  { id: '3', speaker: 'Attorney A', text: 'Three years is acceptable given the nature of the information. I will flag this for amendment.', timestamp: '00:01:48' },
  { id: '4', speaker: 'Attorney B', text: 'Also note the jurisdiction clause currently states Delaware. The client prefers their home jurisdiction.', timestamp: '00:02:30' },
  { id: '5', speaker: 'Client', text: 'Correct. We operate primarily in Germany, so German law should govern.', timestamp: '00:03:10' },
  { id: '6', speaker: 'Attorney A', text: 'Noted. We will update the governing law clause to reflect German jurisdiction. Any other concerns?', timestamp: '00:03:55' },
  { id: '7', speaker: 'Attorney B', text: 'The penalty clause in section 7 needs a cap. Currently it is unlimited liability which is unacceptable.', timestamp: '00:04:40' },
  { id: '8', speaker: 'Client', text: 'We agree. A cap at contract value would be reasonable.', timestamp: '00:05:15' },
  { id: '9', speaker: 'Attorney A', text: 'Perfect. I will draft the amendments and send them for review by Friday. Shall we also discuss the payment terms?', timestamp: '00:06:00' },
  { id: '10', speaker: 'Client', text: 'Yes. We need net-60 payment terms rather than net-30 as currently stated.', timestamp: '00:06:45' },
];

export default function TranscriptionScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [liveSegments, setLiveSegments] = useState<TranscriptSegment[]>([]);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscript[]>([
    {
      id: '1',
      title: 'Contract Review — Client A',
      date: 'Mar 27, 2026',
      duration: '07:23',
      segments: DEMO_SEGMENTS,
      summary: {
        title: 'NDA Contract Review Meeting',
        duration: '7 minutes 23 seconds',
        participants: ['Attorney A', 'Attorney B', 'Client'],
        keyPoints: [
          'NDA section 4 requires revision regarding confidentiality duration',
          'Jurisdiction to be changed from Delaware to Germany',
          'Liability cap needed in section 7',
          'Payment terms to be updated from net-30 to net-60',
        ],
        actionItems: [
          'Attorney A: Draft amendments by Friday',
          'Attorney A: Update governing law clause to German jurisdiction',
          'Attorney A: Add liability cap at contract value in section 7',
          'Attorney B: Review payment terms clause net-60',
        ],
        decisions: [
          'Confidentiality duration reduced from 5 years to 3 years',
          'Governing law changed to German jurisdiction',
          'Liability capped at contract value',
          'Payment terms changed to net-60',
        ],
        nextSteps: [
          'Send amended NDA draft to all parties by Friday',
          'Schedule follow-up review meeting for next week',
          'Client to review and approve amendments',
        ],
      },
    },
  ]);
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedTranscript, setSelectedTranscript] = useState<SavedTranscript | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segmentRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (segmentRef.current) clearInterval(segmentRef.current);
    };
  }, []);

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }

  function stopPulse() {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }

  async function startRecording() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    setRecording(true);
    setLiveSegments([]);
    setSummary(null);
    setElapsedTime(0);
    setSegmentIndex(0);
    startPulse();

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);

    // Simulate live transcription appearing segment by segment
    let idx = 0;
    segmentRef.current = setInterval(() => {
      if (idx < DEMO_SEGMENTS.length) {
        setLiveSegments((prev) => [...prev, DEMO_SEGMENTS[idx]]);
        setSegmentIndex(idx);
        idx++;
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }, 4500);
  }

  async function stopRecording() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRecording(false);
    stopPulse();

    if (timerRef.current) clearInterval(timerRef.current);
    if (segmentRef.current) clearInterval(segmentRef.current);

    setProcessing(true);
    // Generate AI summary
    await generateSummary(liveSegments.length > 0 ? liveSegments : DEMO_SEGMENTS);
  }

  async function generateSummary(segments: TranscriptSegment[]) {
    const transcriptText = segments.map((s) => `${s.speaker} (${s.timestamp}): ${s.text}`).join('\n');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a legal meeting analyst. Analyze the transcript and return ONLY valid JSON with this exact structure: {"title":"...","duration":"...","participants":["..."],"keyPoints":["..."],"actionItems":["..."],"decisions":["..."],"nextSteps":["..."]}',
            },
            { role: 'user', content: `Analyze this legal meeting transcript:\n\n${transcriptText}` },
          ],
          max_tokens: 1500,
        }),
      });

      const data = await res.json();
      const raw = data.choices[0]?.message?.content ?? '{}';
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed: MeetingSummary = JSON.parse(clean);
      setSummary(parsed);

      const newTranscript: SavedTranscript = {
        id: Date.now().toString(),
        title: parsed.title || 'Meeting Transcript',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: formatTime(elapsedTime),
        segments,
        summary: parsed,
      };
      setSavedTranscripts((prev) => [newTranscript, ...prev]);
      await sendLocalNotification('🤖 AI Summary Ready', parsed.title || 'Your meeting summary is ready.');
    } catch {
      // Fallback demo summary
      setSummary({
        title: 'Legal Meeting Summary',
        duration: formatTime(elapsedTime),
        participants: ['Attorney A', 'Attorney B', 'Client'],
        keyPoints: ['Contract NDA reviewed', 'Jurisdiction updated to Germany', 'Liability cap agreed', 'Payment terms extended'],
        actionItems: ['Draft amended NDA by Friday', 'Update jurisdiction clause', 'Add liability cap clause'],
        decisions: ['3-year confidentiality period', 'German law governs', 'Net-60 payment terms'],
        nextSteps: ['Send revised NDA to all parties', 'Schedule follow-up review'],
      });
    }

    setProcessing(false);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  async function shareTranscript(t: SavedTranscript) {
    const text = [
      `📋 ${t.title}`,
      `📅 ${t.date} · ⏱ ${t.duration}`,
      '',
      '=== TRANSCRIPT ===',
      ...t.segments.map((s) => `[${s.timestamp}] ${s.speaker}: ${s.text}`),
      '',
      t.summary ? [
        '=== AI SUMMARY ===',
        'KEY POINTS:', ...t.summary.keyPoints.map((p) => `• ${p}`),
        '', 'ACTION ITEMS:', ...t.summary.actionItems.map((a) => `• ${a}`),
        '', 'DECISIONS:', ...t.summary.decisions.map((d) => `• ${d}`),
      ].join('\n') : '',
    ].join('\n');
    await Share.share({ message: text });
  }

  const s = makeStyles(colors);

  // ── Transcript Detail View ────────────────────────────────
  if (selectedTranscript) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelectedTranscript(null)}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle} numberOfLines={1}>{selectedTranscript.title}</Text>
            <Text style={s.headerSub}>{selectedTranscript.date} · {selectedTranscript.duration}</Text>
          </View>
          <TouchableOpacity onPress={() => shareTranscript(selectedTranscript)}>
            <Ionicons name="share-outline" size={22} color={colors.gold} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}>
          {/* Summary Card */}
          {selectedTranscript.summary && (
            <>
              <Text style={s.sectionLabel}>🤖 AI Summary</Text>

              {[
                { label: '💡 Key Points', items: selectedTranscript.summary.keyPoints, color: colors.info },
                { label: '✅ Action Items', items: selectedTranscript.summary.actionItems, color: colors.success },
                { label: '⚖️ Decisions Made', items: selectedTranscript.summary.decisions, color: colors.gold },
                { label: '👉 Next Steps', items: selectedTranscript.summary.nextSteps, color: colors.warning },
              ].map((section) => (
                <View key={section.label} style={[s.summaryCard, { borderLeftColor: section.color }]}>
                  <Text style={[s.summaryCardTitle, { color: section.color }]}>{section.label}</Text>
                  {section.items.map((item, i) => (
                    <View key={i} style={s.bulletRow}>
                      <View style={[s.bullet, { backgroundColor: section.color }]} />
                      <Text style={s.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={[s.summaryCard, { borderLeftColor: colors.textMuted }]}>
                <Text style={[s.summaryCardTitle, { color: colors.textSecondary }]}>👥 Participants</Text>
                <Text style={s.participantList}>{selectedTranscript.summary.participants.join(' · ')}</Text>
              </View>
            </>
          )}

          {/* Full transcript */}
          <Text style={[s.sectionLabel, { marginTop: Spacing.lg }]}>📝 Full Transcript</Text>
          {selectedTranscript.segments.map((seg) => (
            <View key={seg.id} style={s.segmentCard}>
              <View style={s.segmentHeader}>
                <Text style={[s.speakerName, { color: colors.gold }]}>{seg.speaker}</Text>
                <Text style={s.timestamp}>{seg.timestamp}</Text>
              </View>
              <Text style={s.segmentText}>{seg.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Main View ─────────────────────────────────────────────
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>AI Transcription</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['live', 'history'] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t === 'live' ? '🎙 Live Session' : `📋 History (${savedTranscripts.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'live' ? (
        <View style={{ flex: 1 }}>
          {/* Recording controls */}
          <View style={s.recordingArea}>
            {recording && (
              <View style={s.timerRow}>
                <Animated.View style={[s.recDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={s.timerText}>{formatTime(elapsedTime)}</Text>
                <Text style={s.recLabel}>RECORDING</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.recordBtn, recording && s.recordBtnActive]}
              onPress={recording ? stopRecording : startRecording}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={recording ? ['#E53E3E', '#C0392B'] : colors.gradientGold as any}
                style={s.recordBtnInner}
              >
                <Ionicons name={recording ? 'stop' : 'mic'} size={32} color={recording ? '#fff' : colors.bg} />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={s.recordHint}>
              {recording ? 'Tap to stop & generate AI summary' : 'Tap to start transcribing your meeting'}
            </Text>
          </View>

          {/* Live transcript */}
          {processing ? (
            <View style={s.processingArea}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={s.processingText}>🤖 Generating AI Summary...</Text>
              <Text style={s.processingSubText}>Analyzing key points, action items & decisions</Text>
            </View>
          ) : liveSegments.length > 0 ? (
            <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}>
              {summary ? (
                <>
                  <Text style={s.sectionLabel}>🤖 AI Summary</Text>
                  {[
                    { label: '💡 Key Points', items: summary.keyPoints, color: colors.info },
                    { label: '✅ Action Items', items: summary.actionItems, color: colors.success },
                    { label: '⚖️ Decisions', items: summary.decisions, color: colors.gold },
                  ].map((section) => (
                    <View key={section.label} style={[s.summaryCard, { borderLeftColor: section.color }]}>
                      <Text style={[s.summaryCardTitle, { color: section.color }]}>{section.label}</Text>
                      {section.items.map((item, i) => (
                        <View key={i} style={s.bulletRow}>
                          <View style={[s.bullet, { backgroundColor: section.color }]} />
                          <Text style={s.bulletText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                  <Text style={[s.sectionLabel, { marginTop: Spacing.lg }]}>📝 Transcript</Text>
                </>
              ) : null}
              {liveSegments.map((seg) => (
                <View key={seg.id} style={s.segmentCard}>
                  <View style={s.segmentHeader}>
                    <Text style={[s.speakerName, { color: colors.gold }]}>{seg.speaker}</Text>
                    <Text style={s.timestamp}>{seg.timestamp}</Text>
                  </View>
                  <Text style={s.segmentText}>{seg.text}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={s.emptyLive}>
              <Text style={s.emptyIcon}>🎙</Text>
              <Text style={s.emptyTitle}>Ready to transcribe</Text>
              <Text style={s.emptySub}>Start recording to see live AI transcription of your legal meeting. A full summary will be generated automatically when you stop.</Text>
            </View>
          )}
        </View>
      ) : (
        /* History tab */
        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}>
          {savedTranscripts.length === 0 ? (
            <View style={s.emptyLive}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>No transcripts yet</Text>
              <Text style={s.emptySub}>Record a meeting to see it here.</Text>
            </View>
          ) : savedTranscripts.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setSelectedTranscript(t)} activeOpacity={0.85}>
              <View style={s.historyCard}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={s.historyTitle}>{t.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Text style={s.historyMeta}>📅 {t.date}</Text>
                    <Text style={s.historyMeta}>⏱ {t.duration}</Text>
                    <Text style={s.historyMeta}>💬 {t.segments.length} segments</Text>
                  </View>
                  {t.summary && (
                    <Text style={s.historyPreview} numberOfLines={1}>
                      ✅ {t.summary.actionItems[0]}
                    </Text>
                  )}
                </View>
                <View style={s.historyActions}>
                  <TouchableOpacity onPress={() => shareTranscript(t)} style={s.iconBtn}>
                    <Ionicons name="share-outline" size={18} color={colors.gold} />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontFamily: Typography.serif, fontSize: 22, color: colors.textPrimary },
    headerSub: { fontFamily: Typography.sans, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    tabs: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.sm, backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center' },
    tabActive: { backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.border },
    tabText: { fontFamily: Typography.sansMedium, fontSize: 13, color: colors.textSecondary },
    tabTextActive: { color: colors.gold },
    recordingArea: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E53E3E' },
    timerText: { fontFamily: Typography.serif, fontSize: 28, color: colors.textPrimary, letterSpacing: 2 },
    recLabel: { fontFamily: Typography.sansBold, fontSize: 11, color: '#E53E3E', letterSpacing: 2 },
    recordBtn: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', borderWidth: 2, borderColor: colors.border },
    recordBtnActive: { borderColor: '#E53E3E' },
    recordBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    recordHint: { fontFamily: Typography.sans, fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 },
    processingArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: Spacing.xl },
    processingText: { fontFamily: Typography.serif, fontSize: 20, color: colors.textPrimary },
    processingSubText: { fontFamily: Typography.sans, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
    sectionLabel: { fontFamily: Typography.sansBold, fontSize: 12, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
    summaryCard: { backgroundColor: colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3, borderWidth: 1, borderColor: colors.borderSubtle, gap: 8 },
    summaryCardTitle: { fontFamily: Typography.sansBold, fontSize: 13, letterSpacing: 0.3 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
    bulletText: { fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary, flex: 1, lineHeight: 21 },
    participantList: { fontFamily: Typography.sansMedium, fontSize: 14, color: colors.textSecondary },
    segmentCard: { backgroundColor: colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, gap: 6 },
    segmentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    speakerName: { fontFamily: Typography.sansBold, fontSize: 13 },
    timestamp: { fontFamily: Typography.sans, fontSize: 11, color: colors.textMuted },
    segmentText: { fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary, lineHeight: 21 },
    emptyLive: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 12 },
    emptyIcon: { fontSize: 52 },
    emptyTitle: { fontFamily: Typography.serif, fontSize: 22, color: colors.textPrimary },
    emptySub: { fontFamily: Typography.sans, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    historyCard: { backgroundColor: colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
    historyTitle: { fontFamily: Typography.sansMedium, fontSize: 15, color: colors.textPrimary },
    historyMeta: { fontFamily: Typography.sans, fontSize: 11, color: colors.textSecondary },
    historyPreview: { fontFamily: Typography.sans, fontSize: 12, color: colors.success },
    historyActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 6 },
  });
}
