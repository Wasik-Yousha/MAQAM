import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from 'expo-router';

export default function HalakaDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchGroupDetails();
    }, [id])
  );

  const fetchGroupDetails = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('halaka_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setGroup(data);
    }
    setLoading(false);
  };

  const handleCopyCode = () => {
    // In a full environment, import * as Clipboard from 'expo-clipboard' 
    // and use Clipboard.setStringAsync(group.id). 
    Alert.alert('Invite Code', `Your invite code is: \n\n${group?.id}\n\n(Select and copy this UUID)`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !group ? (
        <View style={styles.centerBox}>
          <Text style={{ color: colors.foreground }}>Group not found</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{group.member_ids?.length || 0} Members</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: colors.gold }]}>⚡ {group.group_streak || 0} Week Streak</Text>
              </View>
            </View>
          </View>

          <View style={styles.inviteCard}>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteLabel}>Invite Friends</Text>
              <Text style={styles.inviteDesc}>Share this code so they can join your circle.</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText} selectable>{group.id}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
              <Feather name="copy" size={20} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reflections</Text>
            <TouchableOpacity>
              <Text style={styles.writeButton}>Write</Text>
            </TouchableOpacity>
          </View>

          {/* Placeholders for multiplayer reflections. We will wire this to Halaka Reflections table later */}
          <View style={styles.emptyState}>
            <Feather name="message-square" size={32} color={colors.mutedForeground} style={{marginBottom: 16, opacity: 0.5}} />
            <Text style={styles.emptyText}>No reflections posted yet this week.</Text>
            <Text style={styles.emptySubText}>Be the first to share what you learned!</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 32,
  },
  groupName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  inviteCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  inviteContent: {
    flex: 1,
  },
  inviteLabel: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  inviteDesc: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginBottom: 12,
  },
  codeRow: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  codeText: {
    color: colors.gold,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  copyBtn: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
  },
  writeButton: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubText: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
});
