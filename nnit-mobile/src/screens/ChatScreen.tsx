import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { sendLegalChat, Message } from '../services/api';
import { ChatCache } from '../services/storage';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'nl', label: 'NL', name: 'Nederlands' },
  { code: 'pl', label: 'PL', name: 'Polski' },
  { code: 'sv', label: 'SV', name: 'Svenska' },
  { code: 'no', label: 'NO', name: 'Norsk' },
  { code: 'fi', label: 'FI', name: 'Suomi' },
  { code: 'da', label: 'DA', name: 'Dansk' },
];

const SUGGESTIONS = [
  'Review this contract for risks',
  'Explain GDPR compliance',
  'Draft an NDA template',
  'What is force majeure?',
];

export default function ChatScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [speaking, setSpeaking] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const cached = await ChatCache.load() as Message[];
    if (cached.length > 0) setMessages(cached);
  }

  async function send() {
    if (!input.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() + (selectedLang !== 'en' ? `\n\n[Respond in ${LANGUAGES.find(l => l.code === selectedLang)?.name}]` : ''),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setOffline(false);

    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    const reply = await sendLegalChat(newMessages, () => setOffline(true));
    setLoading(false);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: reply,
      timestamp: Date.now(),
      offline: offline,
    };

    setMessages([...newMessages, assistantMsg]);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function speak(text: string, id: string) {
    if (speaking === id) {
      Speech.stop();
      setSpeaking(null);
      return;
    }
    setSpeaking(id);
    Speech.speak(text, {
      language: selectedLang,
      pitch: 1,
      rate: 0.9,
      onDone: () => setSpeaking(null),
      onError: () => setSpeaking(null),
    });
  }

  function clearChat() {
    Alert.alert('Clear Chat', 'Delete all messages?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => {
        setMessages([]);
        ChatCache.save([]);
      }},
    ]);
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 14 }}>⚖️</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          {item.offline && (
            <Text style={styles.offlineTag}>📡 Cached response</Text>
          )}
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content.replace(/\n\n\[Respond in.*?\]$/, '')}
          </Text>
          {!isUser && (
            <TouchableOpacity
              style={styles.speakBtn}
              onPress={() => speak(item.content, item.id)}
            >
              <Ionicons
                name={speaking === item.id ? 'volume-high' : 'volume-medium-outline'}
                size={14}
                color={speaking === item.id ? Colors.gold : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom + 60}
    >
      {/* Header */}
      <LinearGradient colors={['#111827', '#0A0E1A']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Legal AI Chat</Text>
          {offline && <Text style={styles.offlineBadge}>● Offline mode</Text>}
        </View>
        <TouchableOpacity onPress={clearChat}>
          <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Language selector */}
      <FlatList
        horizontal
        data={LANGUAGES}
        keyExtractor={(l) => l.code}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.langBar}
        renderItem={({ item: l }) => (
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === l.code && styles.langBtnActive]}
            onPress={() => setSelectedLang(l.code)}
          >
            <Text style={[styles.langText, selectedLang === l.code && styles.langTextActive]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.suggestions}>
          <Text style={styles.suggestTitle}>Try asking...</Text>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestChip}
              onPress={() => { setInput(s); }}
            >
              <Text style={styles.suggestText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={Colors.gold} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Input */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          placeholder="Ask a legal question..."
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
        >
          <LinearGradient
            colors={Colors.gradientGold}
            style={styles.sendBtnInner}
          >
            {loading
              ? <ActivityIndicator size="small" color={Colors.bg} />
              : <Ionicons name="send" size={18} color={Colors.bg} />
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontFamily: Typography.serif, fontSize: 20, color: Colors.textPrimary },
  offlineBadge: { fontFamily: Typography.sans, fontSize: 11, color: Colors.warning, marginTop: 2 },
  langBar: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 6, backgroundColor: Colors.bgCard },
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  langBtnActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold },
  langText: { fontFamily: Typography.sansMedium, fontSize: 12, color: Colors.textSecondary },
  langTextActive: { color: Colors.gold },
  suggestions: { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  suggestTitle: { fontFamily: Typography.serif, fontSize: 18, color: Colors.textSecondary, marginBottom: 8 },
  suggestChip: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  suggestText: { fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary },
  messageList: { padding: Spacing.md, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  bubble: {
    maxWidth: '80%', borderRadius: Radius.lg,
    padding: Spacing.md, gap: 8,
  },
  bubbleUser: { backgroundColor: Colors.goldMuted, borderWidth: 1, borderColor: Colors.gold },
  bubbleAI: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderSubtle },
  bubbleText: { fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  bubbleTextUser: { color: Colors.goldLight },
  offlineTag: { fontFamily: Typography.sans, fontSize: 10, color: Colors.warning },
  speakBtn: { alignSelf: 'flex-end' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.md },
  typingText: { fontFamily: Typography.sans, fontSize: 13, color: Colors.textSecondary },
  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: Colors.bgElevated, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 10,
    fontFamily: Typography.sans, fontSize: 14, color: Colors.textPrimary,
  },
  sendBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnInner: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
