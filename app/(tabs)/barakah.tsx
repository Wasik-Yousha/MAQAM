import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Modal, KeyboardAvoidingView, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from 'expo-router';

export default function BarakahScreen() {
  const { stats, barakahRankings, theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('join');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  const fetchLeaderboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Get all groups this user is in
    const { data: myGroups } = await supabase
      .from('halaka_groups')
      .select('*')
      .contains('member_ids', [session.user.id]);
      
    if (myGroups && myGroups.length > 0) {
      // flatten unique members
      const allMemberIds = new Set<string>();
      myGroups.forEach(g => g.member_ids.forEach((id: string) => allMemberIds.add(id)));
      
      const { data: members } = await supabase
        .from('users')
        .select('id, name, ramadan_baseline_verses')
        .in('id', Array.from(allMemberIds));
        
      if (members) {
        let rankings = members.map((m) => {
          // Placeholder math for live scores based on baseline
          const calculatedScore = m.ramadan_baseline_verses * 7 + 10;
          return {
            rank: 0,
            name: m.name,
            initial: m.name.charAt(0),
            streak: m.ramadan_baseline_verses, // temporary proxy for visualization
            badge: calculatedScore >= 100 ? 'Diamond' : calculatedScore > 50 ? 'Gold' : 'Silver',
            score: calculatedScore,
          };
        }).sort((a,b) => b.score - a.score);
        
        rankings = rankings.map((r, idx) => ({ ...r, rank: idx + 1 }));
        useAppStore.setState({ barakahRankings: rankings });
      }
    }
  };

  const openModal = () => {
    setInputValue('');
    setIsModalOpen(true);
  };

  const submitAction = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.rpc('join_halaka', { 
      group_id: inputValue.trim(), 
      joining_user_id: session.user.id 
    });
    if (error) Alert.alert('Error joining', error.message);
    else Alert.alert('Success', 'Friend added! They will now appear on your Barakah board.');

    await fetchLeaderboard();
    setIsModalOpen(false);
    setLoading(false);
  };

  const streakScore = 0;
  const reflectionScore = 0;
  const halakaScore = 10;

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Diamond': return Colors.diamond;
      case 'Gold': return Colors.goldBadge;
      case 'Silver': return Colors.silver;
      case 'Bronze': return Colors.bronze;
      default: return Colors.textSecondary;
    }
  };

  const getRankLabel = (score: number) => {
    if (score >= 90) return 'Diamond';
    if (score >= 70) return 'Gold';
    if (score >= 50) return 'Silver';
    if (score >= 30) return 'Bronze';
    return 'Seedling';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Barakah Board</Text>
        <Text style={styles.subtitle}>Weekly spiritual leaderboard</Text>
      </View>

      {/* Personal Score Card */}
      <View style={styles.card}>
        <View style={styles.scoreHeader}>
          <View>
            <Text style={styles.yourScore}>Your Score</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{getRankLabel(stats.barakahScore)}</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>⚡</Text>
            <Text style={styles.streakText}>{stats.currentStreak} days</Text>
          </View>
        </View>

        <View style={styles.weekScore}>
          <Text style={styles.weekLabel}>This Week</Text>
          <Text style={styles.weekValue}>{stats.barakahScore}</Text>
        </View>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(stats.barakahScore, 100)}%` }]} />
        </View>
        <Text style={styles.startToday}>Start today</Text>

        <Text style={styles.breakdownTitle}>SCORE BREAKDOWN</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>{streakScore}</Text>
            <Text style={styles.breakdownLabel}>Streak (40%)</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>{reflectionScore}</Text>
            <Text style={styles.breakdownLabel}>Reflections (30%)</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>{halakaScore}</Text>
            <Text style={styles.breakdownLabel}>Halaka (30%)</Text>
          </View>
        </View>
      </View>

      {/* Community Rankings Header Sleek */}
      <View style={styles.rankingsHeaderRow}>
        <Text style={styles.rankingsTitle}>Community Rankings</Text>
        <TouchableOpacity style={styles.sleekInviteBtn} onPress={openModal}>
          <Feather name="user-plus" size={14} color={colors.gold} />
          <Text style={styles.sleekInviteText}>Add Friends</Text>
        </TouchableOpacity>
      </View>

      {barakahRankings.map(member => (
        <View key={member.rank} style={styles.rankingItem}>
          <Text style={styles.rankNumber}>{member.rank}</Text>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{member.initial}</Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankName}>{member.name}</Text>
            <View style={styles.rankMeta}>
              <Text style={styles.rankStreak}>⚡ {member.streak}d streak</Text>
              <View style={[styles.badgeTag, { backgroundColor: `${getBadgeColor(member.badge)}30` }]}>
                <Text style={[styles.badgeTagText, { color: getBadgeColor(member.badge) }]}>
                  {member.badge}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.rankScore}>{member.score}</Text>
        </View>
      ))}

      <View style={{ height: 100 }} />

      {/* Embedded Action Modal for Slick Linking */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>
              Add Friend
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Paste friend's invite code"
              placeholderTextColor={colors.muted || '#5A7A6A'}
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />
            
            <TouchableOpacity style={styles.createSubmitButton} onPress={submitAction} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primary} /> : (
                <Text style={styles.createSubmitText}>Add Friend</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  yourScore: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginBottom: 6,
  },
  rankBadge: {
    backgroundColor: colors.deepGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankBadgeText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.deepGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  weekScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekLabel: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  weekValue: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.deepGreen,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.gold,
    borderRadius: 3,
    minWidth: 20,
  },
  startToday: {
    color: colors.gold,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 20,
  },
  breakdownTitle: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: '700',
  },
  breakdownLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 4,
  },
  rankingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  rankingsTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
  },
  sleekInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 6,
  },
  sleekInviteText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankNumber: {
    color: colors.mutedForeground,
    fontSize: 16,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatarText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  rankMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  rankStreak: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rankScore: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '700',
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
