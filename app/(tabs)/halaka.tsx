import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/services/supabase';

export default function HalakaScreen() {
  const router = useRouter();
  const { halakaGroups, theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync groups from Database
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const fetchGroups = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data, error } = await supabase
      .from('halaka_groups')
      .select('*')
      .contains('member_ids', [session.user.id]);
      
    if (data) {
      useAppStore.setState({ halakaGroups: data.map(d => ({
        id: d.id,
        name: d.name,
        memberCount: d.member_ids?.length || 0,
        currentSurah: 'Active',
        currentSurahNumber: d.current_week_surah || 1,
        groupStreak: d.group_streak || 0,
      }))});
    }
  };

  const openModal = (mode: 'create' | 'join') => {
    setModalMode(mode);
    setInputValue('');
    setIsModalOpen(true);
  };

  const submitAction = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (modalMode === 'create') {
      const { error } = await supabase.from('halaka_groups').insert({
        name: inputValue.trim(),
        created_by: session.user.id,
        member_ids: [session.user.id]
      });
      if (error) Alert.alert('Error', error.message);
    } else {
      // JOIN MODE: Uses PostgreSQL RPC function to bypass RLS and append to array
      const { error } = await supabase.rpc('join_halaka', { 
        group_id: inputValue.trim(), 
        joining_user_id: session.user.id 
      });
      if (error) {
        Alert.alert('Error joining', 'Make sure the invite code is exactly correct! (' + error.message + ')');
      } else {
        Alert.alert('Success', 'Welcome to the circle!');
      }
    }

    await fetchGroups();
    setIsModalOpen(false);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Halaka</Text>
          <Text style={styles.subtitle}>Your study circles</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal('create')}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {halakaGroups.map(group => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupCard}
            onPress={() => router.push(`/halaka/${group.id}` as any)}
          >
            <View style={styles.groupIcon}>
              <Text style={styles.groupIconText}>👥</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDetail}>
                {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
              </Text>
              <View style={styles.streakRow}>
                <Text style={styles.streakIcon}>⚡</Text>
                <Text style={styles.streakText}>{group.groupStreak} week streak</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {halakaGroups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No circles yet</Text>
            <Text style={styles.emptyVerse}>
              "And cooperate in righteousness and piety" — Al-Ma'idah 5:2
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => openModal('create')}>
              <Text style={styles.createButtonText}>Create your first Halaka</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.createButton, {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 12}]} onPress={() => openModal('join')}>
              <Text style={[styles.createButtonText, {color: colors.foreground}]}>Have an invite code? Add Friend</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Dynamic Action Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalTabs}>
              <TouchableOpacity onPress={() => setModalMode('create')} style={[styles.tabBtn, modalMode === 'create' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, modalMode === 'create' && styles.tabTextActive]}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalMode('join')} style={[styles.tabBtn, modalMode === 'join' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, modalMode === 'join' && styles.tabTextActive]}>Add Friend</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>
              {modalMode === 'create' ? 'Name your new circle' : "Enter friend's invite code"}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder={modalMode === 'create' ? "e.g. Fajr Family" : "Paste their UUID code"}
              placeholderTextColor={colors.muted || '#5A7A6A'}
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />
            
            <TouchableOpacity style={styles.createSubmitButton} onPress={submitAction} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primary} /> : (
                <Text style={styles.createSubmitText}>{modalMode === 'create' ? 'Create' : 'Add Friend'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addIcon: {
    color: colors.primaryForeground,
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 26,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  groupIconText: {
    fontSize: 20,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  groupDetail: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 3,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    color: colors.mutedForeground,
    fontSize: 24,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyVerse: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    height: '50%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: colors.border,
  },
  tabText: {
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.foreground,
  },
  modalTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.foreground,
    fontSize: 16,
    marginBottom: 16,
  },
  createSubmitButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  createSubmitText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
