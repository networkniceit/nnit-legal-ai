import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../utils/ThemeContext';
import { Typography, Spacing, Radius } from '../utils/theme';
import { sendLocalNotification } from '../services/notifications';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'individual' | 'corporate' | 'ngo';
  status: 'active' | 'pending' | 'inactive';
  cases: number;
  documents: number;
  joinedDate: string;
  lastContact: string;
  notes: string;
  tags: string[];
  avatar: string;
}

const DEMO_CLIENTS: Client[] = [
  { id: '1', name: 'Klaus Weber', email: 'k.weber@techcorp.de', phone: '+49 30 1234567', company: 'TechCorp GmbH', type: 'corporate', status: 'active', cases: 3, documents: 12, joinedDate: 'Jan 2025', lastContact: 'Mar 25, 2026', notes: 'Key corporate client. Ongoing NDA review.', tags: ['Corporate', 'NDA', 'High Value'], avatar: '🏢' },
  { id: '2', name: 'Sophie Müller', email: 's.mueller@email.com', phone: '+49 89 9876543', company: '', type: 'individual', status: 'active', cases: 1, documents: 5, joinedDate: 'Mar 2025', lastContact: 'Mar 20, 2026', notes: 'Employment dispute case.', tags: ['Employment', 'Dispute'], avatar: '👤' },
  { id: '3', name: 'Green Future NGO', email: 'legal@greenfuture.org', phone: '+49 40 5551234', company: 'Green Future e.V.', type: 'ngo', status: 'pending', cases: 0, documents: 2, joinedDate: 'Mar 2026', lastContact: 'Mar 28, 2026', notes: 'New client. Awaiting intake docs.', tags: ['NGO', 'New Client'], avatar: '🌿' },
  { id: '4', name: 'Hans Becker', email: 'h.becker@startup.io', phone: '+49 69 7778888', company: 'Startup IO', type: 'corporate', status: 'active', cases: 2, documents: 8, joinedDate: 'Nov 2024', lastContact: 'Mar 15, 2026', notes: 'IP and patent filings ongoing.', tags: ['IP', 'Startup', 'Patent'], avatar: '🚀' },
  { id: '5', name: 'Maria Schmidt', email: 'm.schmidt@corp.com', phone: '+49 211 3334455', company: 'Schmidt Corp', type: 'corporate', status: 'inactive', cases: 0, documents: 3, joinedDate: 'Jun 2024', lastContact: 'Jan 10, 2026', notes: 'Matter concluded. Archive.', tags: ['Archived'], avatar: '📁' },
];

const EMPTY_CLIENT: Omit<Client, 'id'> = {
  name: '', email: '', phone: '', company: '', type: 'individual',
  status: 'pending', cases: 0, documents: 0,
  joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  lastContact: 'Today', notes: '', tags: [], avatar: '👤',
};

export default function ClientManagementScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<Client[]>(DEMO_CLIENTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>(EMPTY_CLIENT);
  const [tagInput, setTagInput] = useState('');

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const statusColor: Record<string, string> = {
    active: colors.success,
    pending: colors.warning,
    inactive: colors.textMuted,
  };
  const typeIcon: Record<string, string> = { individual: '👤', corporate: '🏢', ngo: '🌿' };

  async function addClient() {
    if (!newClient.name.trim() || !newClient.email.trim()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const client: Client = { ...newClient, id: Date.now().toString() };
    setClients([client, ...clients]);
    setShowAddModal(false);
    setNewClient(EMPTY_CLIENT);
    await sendLocalNotification('👤 New Client Added', `${client.name} has been added to your client list.`);
  }

  function addTag() {
    if (!tagInput.trim()) return;
    setNewClient({ ...newClient, tags: [...newClient.tags, tagInput.trim()] });
    setTagInput('');
  }

  function removeTag(tag: string) {
    setNewClient({ ...newClient, tags: newClient.tags.filter((t) => t !== tag) });
  }

  function deleteClient(id: string) {
    Alert.alert('Delete Client', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setClients(clients.filter((c) => c.id !== id));
        setSelectedClient(null);
      }},
    ]);
  }

  const s = makeStyles(colors);

  // ── Client Detail View ─────────────────────────────────────
  if (selectedClient) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />

        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelectedClient(null)}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Client Profile</Text>
          <TouchableOpacity onPress={() => deleteClient(selectedClient.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}>
          {/* Profile header */}
          <View style={s.profileCard}>
            <LinearGradient colors={colors.gradientCard as any} style={s.profileCardInner}>
              <View style={s.avatarCircle}>
                <Text style={{ fontSize: 36 }}>{selectedClient.avatar}</Text>
              </View>
              <Text style={s.clientName}>{selectedClient.name}</Text>
              {selectedClient.company && <Text style={s.clientCompany}>{selectedClient.company}</Text>}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <View style={[s.statusBadge, { borderColor: statusColor[selectedClient.status], backgroundColor: `${statusColor[selectedClient.status]}18` }]}>
                  <View style={[s.statusDot, { backgroundColor: statusColor[selectedClient.status] }]} />
                  <Text style={[s.statusText, { color: statusColor[selectedClient.status] }]}>{selectedClient.status.toUpperCase()}</Text>
                </View>
                <View style={s.typeBadge}>
                  <Text style={s.typeBadgeText}>{typeIcon[selectedClient.type]} {selectedClient.type}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            {[
              { label: 'Cases', value: selectedClient.cases, icon: '⚖️' },
              { label: 'Documents', value: selectedClient.documents, icon: '📄' },
              { label: 'Since', value: selectedClient.joinedDate, icon: '📅' },
            ].map((stat) => (
              <View key={stat.label} style={s.statBox}>
                <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Contact info */}
          <Text style={s.sectionLabel}>Contact Information</Text>
          {[
            { icon: 'mail-outline', value: selectedClient.email },
            { icon: 'call-outline', value: selectedClient.phone },
            { icon: 'time-outline', value: `Last contact: ${selectedClient.lastContact}` },
          ].map((item) => (
            <View key={item.value} style={s.contactRow}>
              <Ionicons name={item.icon as any} size={18} color={colors.gold} />
              <Text style={s.contactValue}>{item.value}</Text>
            </View>
          ))}

          {/* Tags */}
          {selectedClient.tags.length > 0 && (
            <>
              <Text style={s.sectionLabel}>Tags</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {selectedClient.tags.map((tag) => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          {selectedClient.notes && (
            <>
              <Text style={s.sectionLabel}>Notes</Text>
              <View style={s.notesBox}>
                <Text style={s.notesText}>{selectedClient.notes}</Text>
              </View>
            </>
          )}

          {/* Quick actions */}
          <Text style={s.sectionLabel}>Quick Actions</Text>
          <View style={{ gap: Spacing.sm }}>
            {[
              { icon: '💬', label: 'Start AI Chat about this client', onPress: () => navigation.navigate('Chat') },
              { icon: '📄', label: 'Generate document for client', onPress: () => navigation.navigate('Documents') },
              { icon: '📹', label: 'Schedule meeting with client', onPress: () => navigation.navigate('Meetings') },
              { icon: '⚖️', label: 'Create case for client', onPress: () => navigation.navigate('Cases') },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={s.actionRow} onPress={action.onPress}>
                <Text style={{ fontSize: 20 }}>{action.icon}</Text>
                <Text style={s.actionLabel}>{action.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Main List View ─────────────────────────────────────────
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>Client Management</Text>
          <Text style={s.headerSub}>{clients.length} clients total</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add" size={20} color={colors.bg} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search clients..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar}>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md }}>
          {(['all', 'active', 'pending', 'inactive'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filter === f && s.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                {f === 'all' ? `All (${clients.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${clients.filter((c) => c.status === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Client list */}
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={s.emptyText}>No clients found</Text>
          </View>
        }
        renderItem={({ item: client }) => (
          <TouchableOpacity onPress={() => setSelectedClient(client)} activeOpacity={0.85}>
            <View style={s.clientCard}>
              <View style={s.clientAvatarArea}>
                <Text style={{ fontSize: 28 }}>{client.avatar}</Text>
                <View style={[s.statusIndicator, { backgroundColor: statusColor[client.status] }]} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.clientCardName}>{client.name}</Text>
                {client.company && <Text style={s.clientCardCompany}>{client.company}</Text>}
                <Text style={s.clientCardEmail}>{client.email}</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                  {client.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={s.miniTag}>
                      <Text style={s.miniTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={s.lastContact}>{client.lastContact.split(',')[0]}</Text>
                <Text style={s.caseCount}>⚖️ {client.cases}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Client Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <LinearGradient colors={colors.gradientBg as any} style={StyleSheet.absoluteFill} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add New Client</Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); setNewClient(EMPTY_CLIENT); }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
            {[
              { label: 'Full Name *', key: 'name', placeholder: 'Klaus Weber', keyboard: 'default' as const },
              { label: 'Email *', key: 'email', placeholder: 'k.weber@company.de', keyboard: 'email-address' as const },
              { label: 'Phone', key: 'phone', placeholder: '+49 30 1234567', keyboard: 'phone-pad' as const },
              { label: 'Company / Organization', key: 'company', placeholder: 'TechCorp GmbH', keyboard: 'default' as const },
            ].map((field) => (
              <View key={field.key}>
                <Text style={s.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={s.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={(newClient as any)[field.key]}
                  onChangeText={(v) => setNewClient({ ...newClient, [field.key]: v })}
                  keyboardType={field.keyboard}
                  autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                />
              </View>
            ))}

            <Text style={s.fieldLabel}>Client Type</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['individual', 'corporate', 'ngo'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, newClient.type === t && s.typeChipActive]}
                  onPress={() => setNewClient({ ...newClient, type: t })}
                >
                  <Text style={[s.typeChipText, newClient.type === t && s.typeChipTextActive]}>
                    {typeIcon[t]} {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>Notes</Text>
            <TextInput
              style={[s.input, { minHeight: 80 }]}
              placeholder="Add any notes about this client..."
              placeholderTextColor={colors.textMuted}
              value={newClient.notes}
              onChangeText={(v) => setNewClient({ ...newClient, notes: v })}
              multiline
              textAlignVertical="top"
            />

            <Text style={s.fieldLabel}>Tags</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Add tag..."
                placeholderTextColor={colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={s.tagAddBtn} onPress={addTag}>
                <Ionicons name="add" size={20} color={colors.bg} />
              </TouchableOpacity>
            </View>
            {newClient.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {newClient.tags.map((tag) => (
                  <TouchableOpacity key={tag} style={s.removableTag} onPress={() => removeTag(tag)}>
                    <Text style={s.tagText}>{tag}</Text>
                    <Ionicons name="close" size={12} color={colors.gold} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[s.saveBtn, (!newClient.name.trim() || !newClient.email.trim()) && s.saveBtnDisabled]}
              onPress={addClient}
              disabled={!newClient.name.trim() || !newClient.email.trim()}
            >
              <LinearGradient colors={colors.gradientGold as any} style={s.saveBtnInner}>
                <Text style={s.saveBtnText}>Save Client</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontFamily: Typography.serif, fontSize: 22, color: colors.textPrimary },
    headerSub: { fontFamily: Typography.sans, fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: Spacing.md, backgroundColor: colors.bgCard, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 10 },
    searchInput: { flex: 1, fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary },
    filterBar: { maxHeight: 44, marginBottom: Spacing.sm },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
    filterChipActive: { backgroundColor: colors.goldMuted, borderColor: colors.gold },
    filterText: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textSecondary },
    filterTextActive: { color: colors.gold },
    clientCard: { backgroundColor: colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    clientAvatarArea: { position: 'relative' },
    clientCardName: { fontFamily: Typography.sansBold, fontSize: 15, color: colors.textPrimary },
    clientCardCompany: { fontFamily: Typography.sans, fontSize: 12, color: colors.gold },
    clientCardEmail: { fontFamily: Typography.sans, fontSize: 12, color: colors.textSecondary },
    statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: colors.bgCard },
    lastContact: { fontFamily: Typography.sans, fontSize: 11, color: colors.textMuted },
    caseCount: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textSecondary },
    miniTag: { backgroundColor: colors.goldMuted, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: colors.border },
    miniTagText: { fontFamily: Typography.sans, fontSize: 10, color: colors.gold },
    empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { fontFamily: Typography.serif, fontSize: 20, color: colors.textSecondary },
    profileCard: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: Spacing.md },
    profileCardInner: { alignItems: 'center', padding: Spacing.xl },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.gold, marginBottom: Spacing.sm },
    clientName: { fontFamily: Typography.serif, fontSize: 26, color: colors.textPrimary },
    clientCompany: { fontFamily: Typography.sans, fontSize: 14, color: colors.gold, marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontFamily: Typography.sansBold, fontSize: 11, letterSpacing: 1 },
    typeBadge: { backgroundColor: colors.bgElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: colors.borderSubtle },
    typeBadgeText: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textSecondary },
    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    statBox: { flex: 1, backgroundColor: colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.borderSubtle },
    statValue: { fontFamily: Typography.serif, fontSize: 20, color: colors.gold },
    statLabel: { fontFamily: Typography.sans, fontSize: 11, color: colors.textSecondary },
    sectionLabel: { fontFamily: Typography.sansBold, fontSize: 12, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: Spacing.md },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
    contactValue: { fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary },
    tag: { backgroundColor: colors.goldMuted, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
    tagText: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.gold },
    notesBox: { backgroundColor: colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.borderSubtle },
    notesText: { fontFamily: Typography.sans, fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
    actionRow: { backgroundColor: colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.borderSubtle },
    actionLabel: { flex: 1, fontFamily: Typography.sansMedium, fontSize: 14, color: colors.textPrimary },
    modal: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, paddingTop: Spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontFamily: Typography.serif, fontSize: 22, color: colors.textPrimary },
    fieldLabel: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
    input: { backgroundColor: colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, padding: Spacing.md, fontFamily: Typography.sans, fontSize: 14, color: colors.textPrimary },
    typeChip: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    typeChipActive: { backgroundColor: colors.goldMuted, borderColor: colors.gold },
    typeChipText: { fontFamily: Typography.sansMedium, fontSize: 12, color: colors.textSecondary },
    typeChipTextActive: { color: colors.gold },
    tagAddBtn: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
    removableTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.goldMuted, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
    saveBtn: { borderRadius: Radius.full, overflow: 'hidden', marginTop: Spacing.md },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnInner: { paddingVertical: 16, alignItems: 'center' },
    saveBtnText: { fontFamily: Typography.sansBold, fontSize: 16, color: colors.bg },
  });
}
