import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function PrivacyScreen() {
  const router = useRouter();
  const { theme } = useAppStore();
  
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Your Privacy Matters</Text>
        <Text style={styles.paragraph}>
          At Maqam, we are committed to protecting your privacy and ensuring a safe, secure experience while keeping track of your Quran reading goals. This Privacy Policy details how we handle the information collected within the app.
        </Text>

        <Text style={styles.subheading}>Data Collection & Local Storage</Text>
        <Text style={styles.paragraph}>
          Maqam is built with privacy-first principles. Your daily reading streaks, Barakah scores, and halaka participation are primarily stored locally on your device. We ask for your name to personalize your experience, which is also kept locally securely. 
        </Text>

        <Text style={styles.subheading}>AI Companion & Third-Party Services</Text>
        <Text style={styles.paragraph}>
          To provide the AI Companion feature, Maqam integrates with the Groq API. When you interact with the companion, your chat logs are transmitted dynamically to large language models for processing. Please note that we rely on you directly providing your API key, meaning you have full control over your billing and usage constraints via Groq's dashboard directly. We do not store your chat histories on external servers under our control.
        </Text>

        <Text style={styles.subheading}>Quran API Details</Text>
        <Text style={styles.paragraph}>
          Maqam utilizes the official Quran Foundation API to serve verified verses, translations, and audio. Simple analytics queries may be established directly by the Quran Foundation in accordance with their developer service agreement.
        </Text>

        <Text style={styles.subheading}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or feedback about this privacy policy, please reach out to the Maqam hackathon development team. 
        </Text>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heading: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    lineHeight: 34,
  },
  subheading: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 12,
  },
  paragraph: {
    color: colors.mutedForeground,
    fontSize: 16,
    lineHeight: 26,
  },
});
