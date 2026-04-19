import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SURAHS } from '@/data/surahs';
import { fetchChapters, ApiChapter } from '@/services/quranApi';
import { useAppStore } from '@/stores/appStore';

interface DisplaySurah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  versesCount: number;
  revelationType: string;
}

function mapApiChapter(ch: ApiChapter): DisplaySurah {
  return {
    number: ch.id,
    name: ch.name_simple,
    arabicName: ch.name_arabic,
    englishName: ch.translated_name?.name || ch.name_simple,
    versesCount: ch.verses_count,
    revelationType: ch.revelation_place,
  };
}

export default function ReadScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [surahs, setSurahs] = useState<DisplaySurah[]>(
    SURAHS.map(s => ({
      number: s.number,
      name: s.name,
      arabicName: s.arabicName,
      englishName: s.englishName,
      versesCount: s.versesCount,
      revelationType: s.revelationType,
    }))
  );
  const [loading, setLoading] = useState(true);
  const { theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiChapters = await fetchChapters();
        if (!cancelled) {
          setSurahs(apiChapters.map(mapApiChapter));
        }
      } catch (err) {
        console.warn('[Read] Failed to fetch chapters from API, using static data:', err);
        // Static SURAHS data is already set as default
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredSurahs = surahs.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.arabicName.includes(search) ||
    s.number.toString().includes(search)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quran</Text>
        <Text style={styles.subtitle}>114 Surahs</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search surahs..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.loadingText}>Loading from Quran.Foundation...</Text>
        </View>
      )}

      {/* Surah List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredSurahs.map(surah => (
          <TouchableOpacity
            key={surah.number}
            style={styles.surahItem}
            onPress={() => router.push(`/read/${surah.number}` as any)}
          >
            <View style={styles.surahNumber}>
              <Text style={styles.surahNumberText}>{surah.number}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{surah.name}</Text>
              <Text style={styles.surahDetail}>
                {surah.englishName} · {surah.versesCount} verses · {surah.revelationType}
              </Text>
            </View>
            <Text style={styles.surahArabic}>{surah.arabicName}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.foreground,
    fontSize: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  surahNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  surahNumberText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  surahDetail: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 3,
  },
  surahArabic: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '400',
  },
});
