import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, user } = useAppStore();
  
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = useMemo(() => getStyles(colors), [colors]);

  const toggleTheme = () => {
    setTheme(activeTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={styles.container}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Appearance & Experience */}
        <Text style={styles.sectionTitle}>Appearance & Experience</Text>
        <View style={styles.sectionBox}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Feather name={activeTheme === 'dark' ? 'moon' : 'sun'} size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={activeTheme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Feather name="type" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.settingValueBox}>
              <Text style={styles.settingValue}>English</Text>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Reading Preferences */}
        <Text style={styles.sectionTitle}>Reading Preferences</Text>
        <View style={styles.sectionBox}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Feather name="book-open" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Translation</Text>
            </View>
            <View style={styles.settingValueBox}>
              <Text style={styles.settingValue}>Sahih International</Text>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Feather name="headphones" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Audio Reciter</Text>
            </View>
            <View style={styles.settingValueBox}>
              <Text style={styles.settingValue}>Mishary Al-Afasy</Text>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Feather name="edit-3" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Arabic Script</Text>
            </View>
            <View style={styles.settingValueBox}>
              <Text style={styles.settingValue}>Uthmani</Text>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        </View>

        {/* API & Advanced */}
        <Text style={styles.sectionTitle}>Advanced</Text>
        <View style={styles.sectionBox}>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.settingTextContent}>
              <Feather name="key" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Groq API Key</Text>
            </View>
            <View style={styles.settingValueBox}>
              <Text style={[styles.settingValue, { color: user.groqApiKey ? colors.gold : colors.mutedForeground }]}>
                {user.groqApiKey ? 'Configured' : 'Not Set'}
              </Text>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About Maqam</Text>
        <View style={styles.sectionBox}>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/privacy' as any)}>
            <View style={styles.settingTextContent}>
              <Feather name="shield" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/terms' as any)}>
            <View style={styles.settingTextContent}>
              <Feather name="file-text" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Terms & Conditions</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Feather name="help-circle" size={20} color={colors.foreground} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Help & Support</Text>
            </View>
            <Feather name="external-link" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.appVersion}>Maqam v1.0.0</Text>
          <Text style={styles.madeWith}>Built for the Quran Foundation Hackathon</Text>
        </View>
        <View style={{ height: 60 }} />
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 8,
  },
  sectionBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingTextContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 14,
  },
  settingLabel: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '500',
  },
  settingValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50, // aligns with text
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  madeWith: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
});
