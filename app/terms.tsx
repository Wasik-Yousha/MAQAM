import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TermsScreen() {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Terms of Service</Text>
        
        <Text style={styles.paragraph}>
          Welcome to Maqam. By using our mobile application, you agree to comply with and be bound by the following terms and conditions of use. Please review the following terms carefully.
        </Text>

        <Text style={styles.subheading}>1. Acceptance of Agreement</Text>
        <Text style={styles.paragraph}>
          You agree to the terms and conditions outlined in this Terms of Use Agreement with respect to our application. This Agreement constitutes the entire and only agreement between us and you regarding the usage of the application.
        </Text>

        <Text style={styles.subheading}>2. Fair Usage of APIs</Text>
        <Text style={styles.paragraph}>
          The Maqam app implements features that rely on providing your own Groq API keys to interact with language models. You agree that you are solely responsible for managing, paying for, and appropriately securing your API keys. We are not liable for any third-party credential leaks caused by unsafe device setups or usage out of limits.
        </Text>
        
        <Text style={styles.subheading}>3. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          Maqam was built for the Quran Foundation Hackathon. The layout, logic, algorithms, and design are intellectual property of the developers, and the core verified Quranic content (translations, audios, script text) belongs to The Quran Foundation and its respective scholarly bodies.
        </Text>

        <Text style={styles.subheading}>4. User Conduct in Halakas</Text>
        <Text style={styles.paragraph}>
          You agree to maintain adab (polite manners) and respect while participating in Halaka groups. Reflections should remain appropriate and related to mutual spiritual growth. We are not actively monitoring the peer-to-peer reflections in the local scope but request responsible use.
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
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 10,
  },
  paragraph: {
    color: colors.mutedForeground,
    fontSize: 15,
    lineHeight: 24,
  },
});
