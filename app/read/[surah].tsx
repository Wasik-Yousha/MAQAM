import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SURAHS, SAMPLE_VERSES } from '@/data/surahs';
import { fetchVersesByChapter, ApiVerse } from '@/services/quranApi';
import { useAppStore } from '@/stores/appStore';

import { Audio, AVPlaybackStatus } from 'expo-av';

interface DisplayVerse {
  number: number;
  arabic: string;
  translation: string;
  audioUrl?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function mapApiVerse(v: ApiVerse): DisplayVerse {
  const translationText = v.translations?.[0]?.text || `Verse ${v.verse_number}`;
  return {
    number: v.verse_number,
    arabic: v.text_uthmani || '',
    translation: stripHtml(translationText),
    audioUrl: v.audio?.url,
  };
}

export default function SurahReaderScreen() {
  const { surah } = useLocalSearchParams<{ surah: string }>();
  const router = useRouter();
  const { theme, setLastRead } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const surahNumber = parseInt(surah || '1');
  const surahData = SURAHS.find(s => s.number === surahNumber) || SURAHS[0];

  // Static fallback verses
  const staticVerses: DisplayVerse[] = SAMPLE_VERSES[surahNumber]
    ? SAMPLE_VERSES[surahNumber].map(v => ({ number: v.number, arabic: v.arabic, translation: v.translation }))
    : Array.from({ length: Math.min(surahData.versesCount, 10) }, (_, i) => ({
        number: i + 1,
        arabic: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ',
        translation: `Verse ${i + 1} of Surah ${surahData.name}`,
      }));

  const [verses, setVerses] = useState<DisplayVerse[]>(staticVerses);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [surahName, setSurahName] = useState(surahData.name);
  const [totalVerses, setTotalVerses] = useState(surahData.versesCount);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Audio Playback Handler
  const playAudio = async (verseNumber: number, url?: string) => {
    if (!url) return;
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Toggle off if currently playing
      if (playingAudioId === verseNumber) {
        setPlayingAudioId(null);
        return;
      }

      setPlayingAudioId(verseNumber);
      // Quran Foundation Audio returns relative paths like 'AbdulBaset/Mujawwad/mp3/001001.mp3'
      const fullUrl = url.startsWith('http') 
        ? url 
        : url.startsWith('//') 
          ? `https:${url}` 
          : `https://audio.qurancdn.com/${url}`;
          
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setPlayingAudioId(null);
        }
      });
    } catch (e) {
      console.warn("[Reader] Audio play failed:", e);
      setPlayingAudioId(null);
    }
  };

  useEffect(() => {
    return sound
      ? () => { sound.unloadAsync(); }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetchVersesByChapter(surahNumber, 1, 50);
        if (!cancelled) {
          setVerses(response.verses.map(mapApiVerse));
          setTotalPages(response.pagination.total_pages);
          setCurrentPage(1);
          setTotalVerses(response.pagination.total_records);
          // Update last read
          setLastRead(surahNumber, 1, surahData.name);
        }
      } catch (err: any) {
        setApiError(err.message || 'Unknown network error');
        console.warn('[Reader] Failed to fetch verses from API, using static data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [surahNumber]);

  const loadMore = async () => {
    if (loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetchVersesByChapter(surahNumber, nextPage, 50);
      setVerses(prev => [...prev, ...response.verses.map(mapApiVerse)]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.warn('[Reader] Failed to load more verses:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const showBismillah = surahNumber !== 9 && surahNumber !== 1;

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 200) {
      loadMore();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{surahName}</Text>
          <Text style={styles.headerSubtitle}>{totalVerses} verses</Text>
        </View>
        <View style={styles.readCounter}>
          <Text style={styles.readCounterValue}>{verses.length}</Text>
          <Text style={styles.readCounterLabel}>loaded</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.loadingText}>Loading verses...</Text>
          </View>
        )}

        {/* API Error Banner */}
        {apiError && (
          <View style={{ backgroundColor: '#c0392b', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>⚠️ API Error Detected</Text>
            <Text style={{ color: 'white', marginTop: 4 }}>{apiError}</Text>
          </View>
        )}

        {/* Bismillah */}
        {showBismillah && !loading && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillahText}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ</Text>
          </View>
        )}

        {/* Verse Cards */}
        {!loading && verses.map((verse) => (
          <View key={verse.number} style={styles.verseCard}>
            <View style={styles.verseNumberBadge}>
              <Text style={styles.verseNumberText}>{verse.number}</Text>
            </View>
            <Text style={styles.verseArabic}>{verse.arabic}</Text>
            <Text style={styles.verseTranslation}>{verse.translation}</Text>
            
            {verse.audioUrl && (
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={() => playAudio(verse.number, verse.audioUrl)}
              >
                <Text style={styles.playButtonText}>
                  {playingAudioId === verse.number ? '⏸ Stop' : '▶️ Play'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Load More indicator */}
        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.gold} />
            <Text style={styles.loadingText}>Loading more verses...</Text>
          </View>
        )}

        {/* End indicator */}
        {!loading && currentPage >= totalPages && verses.length > 0 && (
          <View style={styles.endContainer}>
            <Text style={styles.endText}>صَدَقَ اللهُ الْعَظِيم</Text>
            <Text style={styles.endSubtext}>Allah the Almighty has spoken the truth</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: colors.foreground,
    fontSize: 24,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  readCounter: {
    alignItems: 'center',
    width: 40,
  },
  readCounterValue: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '700',
  },
  readCounterLabel: {
    color: colors.gold,
    fontSize: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  bismillahContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  bismillahText: {
    color: colors.foreground,
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 52,
  },
  verseCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verseNumberBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.gold,
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
  },
  verseArabic: {
    color: colors.foreground,
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 12,
    paddingRight: 30,
  },
  verseTranslation: {
    color: colors.mutedForeground,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  endContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  endText: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '600',
  },
  endSubtext: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
