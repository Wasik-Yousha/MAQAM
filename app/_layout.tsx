import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { CompanionSheet } from '@/components/CompanionSheet';
import { Sidebar } from '@/components/Sidebar';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

export default function RootLayout() {
  const { theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => { subscription.unsubscribe() };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    const routeUser = async () => {
      if (!session && !inAuthGroup && segments[0] !== 'onboarding') {
        router.replace('/(auth)/login');
      } else if (session && inAuthGroup) {
        // Inspect the DB to see if the user needs Onboarding and sync profile
        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (data) {
          let friendCode = '';
          // Fetch or generate their unique friend code
          const { data: netData } = await supabase.from('halaka_groups')
            .select('id')
            .eq('created_by', session.user.id)
            .limit(1);
            
          if (!netData || netData.length === 0) {
            const { data: newNet } = await supabase.from('halaka_groups')
              .insert({ name: 'My Network', created_by: session.user.id, member_ids: [session.user.id] })
              .select('id');
            if (newNet && newNet.length > 0) friendCode = newNet[0].id;
          } else {
            friendCode = netData[0].id;
          }

          useAppStore.setState(state => ({
            user: {
              ...state.user,
              id: session.user.id,
              friendCode,
              name: data.name || session.user.email?.split('@')[0] || 'Seeker',
              email: session.user.email || '',
              ramadanBaselineVerses: data.ramadan_baseline_verses || 0,
              readingGoal: data.reading_goal || 'consistent',
              notificationTime: data.notification_time || '08:00',
            }
          }));
          
          if (data.ramadan_baseline_verses === 0) {
            router.replace('/onboarding');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/onboarding');
        }
      }
    };

    routeUser();
  }, [session, initialized, segments]);

  if (!initialized) return null; // Blank while checking session

  return (
    <View style={styles.container}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
      </Stack>
      {session && (
        <>
          <CompanionSheet />
          <Sidebar />
        </>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
