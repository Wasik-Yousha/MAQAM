import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/services/supabase';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, stats, setGroqApiKey, lastAttendanceDate, markHardCopyAttendance, theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [generating, setGenerating] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isAttendanceMarkedToday = lastAttendanceDate === today;

  const forceGenerateCode = async () => {
    setGenerating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setGenerating(false);
      return;
    }

    const { data: newNet, error: insErr } = await supabase.from('halaka_groups')
      .insert({ name: 'My Network', created_by: session.user.id, member_ids: [session.user.id] })
      .select('id');
      
    if (insErr) {
      Alert.alert('Database Error', 'Make sure you ran the fix_friend_code.sql file! Details: ' + insErr.message);
    } else if (newNet && newNet.length > 0) {
      useAppStore.setState(state => ({
        user: { ...state.user, friendCode: newNet[0].id }
      }));
    }
    setGenerating(false);
  };

  const cycleTheme = () => {
    const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    useAppStore.setState({ theme: nextTheme });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name[0]}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email || 'No email set'}</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakIcon}>⚡</Text>
          <Text style={styles.streakText}>{stats.currentStreak} days</Text>
        </View>
      </View>

      {/* Your Journey Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Journey</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Barakah Score</Text>
          <Text style={styles.scoreValue}>{stats.barakahScore}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(stats.barakahScore, 100)}%` }]} />
        </View>
        <Text style={styles.startToday}>Start today</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalVerses}</Text>
            <Text style={styles.statLabel}>total verses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.daysRead}</Text>
            <Text style={styles.statLabel}>days this week</Text>
          </View>
        </View>
      </View>

      {/* Daily Attendance Sleek Design */}
      <TouchableOpacity 
        style={[styles.sleekAttendance, isAttendanceMarkedToday && styles.sleekAttendanceMarked]}
        onPress={() => {
          if (!isAttendanceMarkedToday) {
            markHardCopyAttendance();
          }
        }}
        activeOpacity={0.9}
        disabled={isAttendanceMarkedToday}
      >
        <View style={styles.sleekLeft}>
          <Text style={[styles.sleekLabel, isAttendanceMarkedToday && styles.sleekLabelMarked]}>
            Physical Quran Reading
          </Text>
          <Text style={styles.sleekSub}>
            {isAttendanceMarkedToday ? "Session marked for today." : "Tap to log today's offline session"}
          </Text>
        </View>
        <View style={[styles.sleekCheckbox, isAttendanceMarkedToday && styles.sleekCheckboxMarked]}>
           {isAttendanceMarkedToday && <Text style={styles.sleekCheckmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Unique Friend Code */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Unique Friend Code</Text>
        <Text style={{color: colors.mutedForeground, fontSize: 13, marginBottom: 16}}>
          This code was generated when you created your profile. Share it with your friends so they can add you to their Barakah board!
        </Text>
        <View style={[styles.friendCodeContainer, !user.friendCode && { borderColor: colors.primary }]}>
          {user.friendCode ? (
            <Text style={styles.friendCodeValue} selectable>{user.friendCode}</Text>
          ) : (
            <TouchableOpacity onPress={forceGenerateCode} disabled={generating} style={{flexDirection: 'row', alignItems: 'center'}}>
              {generating ? <ActivityIndicator color={colors.gold} style={{marginRight: 8}} /> : null}
              <Text style={[styles.friendCodeValue, { color: colors.primary }]}>Tap to Generate Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingRowCompact}>
          <Text style={styles.settingLabelInline}>Reading Goal</Text>
          <View style={styles.settingValueInlineWrap}>
            <Text style={styles.settingValueInline}>
              {user.readingGoal === 'khatam' ? 'Complete Khatam' :
               user.readingGoal === 'consistent' ? 'Read consistently' :
               'Understand deeper'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.settingRowCompact}>
          <Text style={styles.settingLabelInline}>Ramadan Baseline</Text>
          <View style={styles.settingValueInlineWrap}>
            <Text style={styles.settingValueInline}>{user.ramadanBaselineVerses} verses/day</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.settingRowCompact} onPress={cycleTheme}>
          <Text style={styles.settingLabelInline}>Appearance</Text>
          <View style={styles.settingValueInlineWrap}>
            <Text style={styles.settingValueInline}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: colors.primaryForeground,
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: '700',
  },
  email: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  streakText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  friendCodeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendCodeValue: {
    color: colors.gold,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  scoreValue: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.muted,
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
    marginBottom: 16,
  },
  sleekAttendance: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sleekAttendanceMarked: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  sleekLeft: {
    flex: 1,
    paddingRight: 20,
  },
  sleekLabel: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  sleekLabelMarked: {
    color: colors.gold,
  },
  sleekSub: {
    color: colors.mutedForeground,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  sleekCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.mutedForeground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleekCheckboxMarked: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  sleekCheckmark: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 4,
  },
  settingRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabelInline: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '500',
  },
  settingValueInlineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueInline: {
    color: colors.mutedForeground,
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    color: colors.mutedForeground,
    fontSize: 22,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
});
