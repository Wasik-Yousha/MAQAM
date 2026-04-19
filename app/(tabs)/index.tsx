import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { SURAHS, POPULAR_SURAHS } from '@/data/surahs';
import { fetchRandomVerse } from '@/services/quranApi';
import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, stats, lastRead, theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  const ramadanPace = user.ramadanBaselineVerses > 0
    ? Math.round((stats.versesThisWeek / 7 / user.ramadanBaselineVerses) * 100)
    : 0;

  const quickReadSurahs = POPULAR_SURAHS.map(n => SURAHS.find(s => s.number === n)!);

  // Verse of the Day — fetched from API
  const [verseOfDay, setVerseOfDay] = useState({
    ref: 'Al-Baqarah : 286',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const verse = await fetchRandomVerse();
        if (!cancelled && verse) {
          const translationText = verse.translations?.[0]?.text || '';
          const cleanTranslation = translationText.replace(/<[^>]*>/g, '').trim();
          setVerseOfDay({
            ref: verse.verse_key,
            arabic: verse.text_uthmani,
            translation: cleanTranslation,
            loading: false,
          });
        }
      } catch (err) {
        console.warn('[Home] Failed to fetch random verse:', err);
        setVerseOfDay(prev => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>As-salamu alaykum, {user.name}</Text>
          <Text style={styles.date}>{dayName} {dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.streakBadge}>
          <Text style={styles.streakIcon}>⚡</Text>
          <Text style={styles.streakText}>{stats.currentStreak} days</Text>
        </TouchableOpacity>
      </View>

      {/* Spiritual GPS Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spiritual GPS</Text>
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
            <Text style={styles.statValue}>{stats.versesThisWeek}</Text>
            <Text style={styles.statLabel}>verses this week</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.daysRead}</Text>
            <Text style={styles.statLabel}>days read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{ramadanPace}%</Text>
            <Text style={styles.statLabel}>of Ramadan pace</Text>
          </View>
        </View>
      </View>

      {/* Continue Reading */}
      {lastRead && (
        <View style={styles.continueCard}>
          <View style={styles.continueContent}>
            <View>
              <Text style={styles.continueLabel}>Continue Reading</Text>
              <Text style={styles.continueSurah}>{lastRead.name}</Text>
              <Text style={styles.continueAyah}>Ayah {lastRead.ayah}</Text>
            </View>
            <TouchableOpacity 
              style={styles.continuePlayBtn}
              onPress={() => router.push(`/read/${lastRead.surah}?ayah=${lastRead.ayah}` as any)}
            >
              <Feather name="play" size={24} color="#0D2818" style={{marginLeft: 2}} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Verse of the Day */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verse of the Day</Text>
        <Text style={styles.settingsIcon}>⚙️</Text>
      </View>
      <View style={styles.verseCard}>
        <Text style={styles.verseRef}>{verseOfDay.ref}</Text>
        {verseOfDay.loading ? (
          <ActivityIndicator size="small" color={colors.gold} style={{ paddingVertical: 20 }} />
        ) : (
          <>
            <Text style={styles.verseArabic}>
              {verseOfDay.arabic}
            </Text>
            <Text style={styles.verseTranslation}>
              <Text style={styles.italicText}>{verseOfDay.translation}</Text>
            </Text>
          </>
        )}
      </View>

      {/* Haven't read today prompt */}
      <Text style={styles.sectionTitle}>Haven't read today?</Text>
      <TouchableOpacity style={styles.companionPrompt} onPress={() => useAppStore.getState().setCompanionOpen(true)}>
        <Text style={styles.companionIcon}>💬</Text>
        <View style={styles.companionTextWrap}>
          <Text style={styles.companionTitle}>Talk to your companion</Text>
          <Text style={styles.companionSubtitle}>It's okay — let's understand what came up</Text>
        </View>
        <Text style={styles.companionArrow}>›</Text>
      </TouchableOpacity>

      {/* Quick Read */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Read</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/read')}>
          <Text style={styles.allSurahsLink}>All Surahs</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickReadScroll}>
        {quickReadSurahs.map(surah => (
          <TouchableOpacity
            key={surah.number}
            style={styles.quickReadCard}
            onPress={() => router.push(`/read/${surah.number}` as any)}
          >
            <View style={styles.quickReadNumber}>
              <Text style={styles.quickReadNumberText}>{surah.number}</Text>
            </View>
            <Text style={styles.quickReadName}>{surah.name}</Text>
            <Text style={styles.quickReadVerses}>{surah.versesCount}v</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
  },
  date: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
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
    marginBottom: 16,
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
  continueCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  continueContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueLabel: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginBottom: 4,
  },
  continueSurah: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  continueAyah: {
    color: colors.gold,
    fontSize: 14,
  },
  continuePlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingsIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  verseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    alignItems: 'center',
  },
  verseRef: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  verseArabic: {
    color: colors.foreground,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 16,
  },
  verseTranslation: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  italicText: {
    fontStyle: 'italic',
  },
  companionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  companionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  companionTextWrap: {
    flex: 1,
  },
  companionTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  companionSubtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },
  companionArrow: {
    color: colors.mutedForeground,
    fontSize: 24,
    fontWeight: '300',
  },
  allSurahsLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickReadScroll: {
    marginLeft: -4,
  },
  quickReadCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickReadNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickReadNumberText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  quickReadName: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickReadVerses: {
    color: colors.mutedForeground,
    fontSize: 11,
  },
});
