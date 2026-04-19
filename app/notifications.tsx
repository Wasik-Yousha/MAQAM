import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import React, { useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = useMemo(() => getStyles(colors), [colors]);

  const notifications = [
    { id: '1', title: 'Daily Reminder', message: 'Alhamdulillah, taking 10 minutes to read the Quran today will maintain your streak!', type: 'reminder', time: '2h ago', read: false },
    { id: '2', title: 'New Halaka Goal', message: 'Your family circle has set Surah Ar-Rahman for this week.', type: 'group', time: '5h ago', read: false },
    { id: '3', title: 'Barakah Milestone', message: 'MashaAllah! You reached 100 Barakah points. Keep it up!', type: 'milestone', time: '1d ago', read: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {notifications.map(note => (
          <TouchableOpacity key={note.id} style={[styles.notificationCard, !note.read && styles.unreadCard]}>
            <View style={styles.iconContainer}>
              <Feather 
                name={note.type === 'reminder' ? 'bell' : note.type === 'group' ? 'users' : 'award'} 
                size={24} 
                color={!note.read ? colors.gold : colors.mutedForeground} 
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !note.read && styles.unreadText]}>{note.title}</Text>
                <Text style={styles.time}>{note.time}</Text>
              </View>
              <Text style={styles.message}>{note.message}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyMessage}>No new notifications.</Text>
          </View>
        )}
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
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  unreadText: {
    color: colors.gold,
    fontWeight: '700',
  },
  time: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  message: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyMessage: {
    color: colors.mutedForeground,
    fontSize: 16,
  },
});
