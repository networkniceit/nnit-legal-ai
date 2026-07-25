import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, addHours } from 'date-fns';
import { scheduleMeetingReminder, sendLocalNotification } from '../services/notifications';
import { Card, GoldButton, GhostButton, GoldDivider, Badge } from '../components/UI';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

interface Meeting {
  id: string;
  title: string;
  roomName: string;
  scheduledAt: Date;
  duration: number;
  status: 'upcoming' | 'live' | 'ended';
  participants?: number;
}

const DEMO_MEETINGS: Meeting[] = [
  { id: '1', title: 'Contract Review with Client A', roomName: 'nnit-contract-review-a1', scheduledAt: addHours(new Date(), 1), duration: 60, status: 'upcoming', participants: 3 },
  { id: '2', title: 'GDPR Compliance Briefing', roomName: 'nnit-gdpr-briefing-2024', scheduledAt: addHours(new Date(), -2), duration: 90, status: 'ended', participants: 8 },
  { id: '3', title: 'Case Strategy Session', roomName: 'nnit-case-strategy-q4', scheduledAt: addHours(new Date(), 3), duration: 45, status: 'upcoming', participants: 2 },
];

export default function MeetingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'upcoming' | 'schedule' | 'history'>('upcoming');
  const [meetings, setMeetings] = useState<Meeting[]>(DEMO_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('60');
  const [scheduling, setScheduling] = useState(false);

  function joinMeeting(meeting: Meeting) {
    setActiveMeeting(meeting);
  }

  function startInstantMeeting() {
    const instant: Meeting = {
      id: Date.now().toString(),
      title: 'Instant Legal Meeting',
      roomName: `nnit-instant-${Date.now()}`,
      scheduledAt: new Date(),
      duration: 60,
      status: 'live',
    };
    setActiveMeeting(instant);
  }

  async function scheduleMeeting() {
    if (!newTitle.trim()) return;
    setScheduling(true);

    const dateStr = newDate || format(addHours(new Date(), 24), 'yyyy-MM-dd');
    const timeStr = newTime || '10:00';
    const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);

    const meeting: Meeting = {
      id: Date.now().toString(),
      title: newTitle,
      roomName: `nnit-${newTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      scheduledAt,
      duration: parseInt(newDuration) || 60,
      status: 'upcoming',
    };

    await scheduleMeetingReminder(meeting.title, scheduledAt);
    setMeetings([...meetings, meeting]);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setScheduling(false);

    await sendLocalNotification('📅 Meeting Scheduled', `${meeting.title} — ${format(scheduledAt, 'MMM d, HH:mm')}`);
    Alert.alert('✅ Scheduled', `Meeting scheduled for ${format(scheduledAt, 'MMM d at HH:mm')}\nReminder set for 15 min before.`);
    setTab('upcoming');
  }

  const jitsiUrl = (room: string) =>
    `https://meet.jit.si/${room}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=NNIT+User`;

  if (activeMeeting) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={[styles.meetingBar, { paddingTop: insets.top }]}>
          <View>
            <Text style={styles.meetingTitle}>{activeMeeting.title}</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.endBtn}
            onPress={() => { setActiveMeeting(null); setTab('history'); }}
          >
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>

        <WebView
          source={{ uri: jitsiUrl(activeMeeting.roomName) }}
          style={{ flex: 1 }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
        />
      </View>
    );
  }

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming' || m.status === 'live');
  const pastMeetings = meetings.filter((m) => m.status === 'ended');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A0E1A', '#070B14']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Meetings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Instant meeting */}
      <TouchableOpacity style={styles.instantCard} onPress={startInstantMeeting} activeOpacity={0.88}>
        <LinearGradient colors={['rgba(229,62,62,0.2)', 'rgba(229,62,62,0.05)']} style={styles.instantInner}>
          <View style={styles.instantLeft}>
            <View style={styles.liveIndicator}><View style={styles.liveDot} /></View>
            <View>
              <Text style={styles.instantTitle}>Start Instant Meeting</Text>
              <Text style={styles.instantSub}>Free · Unlimited · Jitsi powered</Text>
            </View>
          </View>
          <Ionicons name="videocam" size={24} color='#E53E3E' />
        </LinearGradient>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'schedule', 'history'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'upcoming' ? '📅 Upcoming' : t === 'schedule' ? '➕ Schedule' : '📋 History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}>
        {tab === 'upcoming' && (
          upcomingMeetings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No upcoming meetings</Text>
              <Text style={styles.emptySub}>Schedule one or start an instant meeting</Text>
            </View>
          ) : upcomingMeetings.map((m) => (
            <Card key={m.id} style={{ marginBottom: Spacing.sm }}>
              <View style={styles.meetingRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.mTitle}>{m.title}</Text>
                  <Text style={styles.mMeta}>
                    {format(m.scheduledAt, 'MMM d, yyyy — HH:mm')} · {m.duration}min
                  </Text>
                  {m.participants && (
                    <Text style={styles.mMeta}>👥 {m.participants} participants</Text>
                  )}
                </View>
                <GoldButton label="Join" onPress={() => joinMeeting(m)} style={{ minWidth: 70 }} />
              </View>
            </Card>
          ))
        )}

        {tab === 'schedule' && (
          <View style={{ gap: Spacing.md }}>
            <Text style={styles.fieldLabel}>Meeting Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Contract Review" placeholderTextColor={Colors.textMuted}
              value={newTitle} onChangeText={setNewTitle} />

            <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder={format(addHours(new Date(), 24), 'yyyy-MM-dd')}
              placeholderTextColor={Colors.textMuted} value={newDate} onChangeText={setNewDate} />

            <Text style={styles.fieldLabel}>Time (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="10:00" placeholderTextColor={Colors.textMuted}
              value={newTime} onChangeText={setNewTime} />

            <Text style={styles.fieldLabel}>Duration (minutes)</Text>
            <TextInput style={styles.input} placeholder="60" placeholderTextColor={Colors.textMuted}
              value={newDuration} onChangeText={setNewDuration} keyboardType="numeric" />

            <GoldButton
              label={scheduling ? 'Scheduling...' : '📅 Schedule Meeting'}
              onPress={scheduleMeeting}
              loading={scheduling}
              disabled={!newTitle.trim()}
            />
          </View>
        )}

        {tab === 'history' && (
          pastMeetings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No past meetings</Text>
            </View>
          ) : pastMeetings.map((m) => (
            <Card key={m.id} style={{ marginBottom: Spacing.sm }}>
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.mTitle}>{m.title}</Text>
                  <Badge label="Ended" color={Colors.textMuted} />
                </View>
                <Text style={styles.mMeta}>{format(m.scheduledAt, 'MMM d, yyyy — HH:mm')} · {m.duration}min</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
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
  instantCard: { margin: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(229,62,62,0.3)' },
  instantInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  instantLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveIndicator: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(229,62,62,0.15)', alignItems: 'center', justifyContent: 'center' },
  instantTitle: { fontFamily: Typography.sansBold, fontSize: 16, color: Colors.textPrimary },
  instantSub: { fontFamily: Typography.sans, fontSize: 12, color: Colors.textSecondary },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(229,62,62,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53E3E' },
  liveText: { fontFamily: Typography.sansBold, fontSize: 10, color: '#E53E3E', letterSpacing: 1 },
  meetingBar: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: 'rgba(0,0,0,0.8)',
  },
  meetingTitle: { fontFamily: Typography.serif, fontSize: 16, color: Colors.textPrimary },
  endBtn: { backgroundColor: '#E53E3E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  endBtnText: { fontFamily: Typography.sansBold, fontSize: 13, color: '#fff' },
  tabs: { flexDirection: 'row', padding: Spacing.sm, gap: Spacing.sm, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.goldMuted, borderWidth: 1, borderColor: Colors.border },
  tabText: { fontFamily: Typography.sansMedium, fontSize: 12, color: Colors.textSecondary },
  tabTextActive: { color: Colors.gold },
  meetingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mTitle: { fontFamily: Typography.sansMedium, fontSize: 15, color: Colors.textPrimary },
  mMeta: { fontFamily: Typography.sans, fontSize: 12, color: Colors.textSecondary },
  fieldLabel: { fontFamily: Typography.sansMedium, fontSize: 12, color: Colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: Typography.serif, fontSize: 20, color: Colors.textPrimary },
  emptySub: { fontFamily: Typography.sans, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
