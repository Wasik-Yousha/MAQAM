import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const colors = Colors[theme === 'system' ? 'dark' : theme];
  
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const normalizeTestEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;

    const safeLocalPart = trimmed.replace(/[^a-z0-9._-]/g, '');
    return `${safeLocalPart || 'tester'}@test.maqam.local`;
  };

  const normalizeTestPassword = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length >= 6) return trimmed;
    return `${trimmed}maqam_test`;
  };

  const syncUserProfile = async (userId: string, userEmail: string) => {
    await supabase.from('users').upsert(
      {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
      },
      { onConflict: 'id' }
    );
  };

  const handleSubmit = async () => {
    const rawEmail = email.trim();
    const rawPassword = password.trim();

    if (!rawEmail || !rawPassword) return Alert.alert('Error', 'Please fill all fields');

    if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('replace-with-your-project')) {
      return Alert.alert('Setup Required', 'Please add your real Supabase URL and Anon Key to the .env file then rebuild the app.');
    }

    const authEmail = normalizeTestEmail(rawEmail);
    const authPassword = normalizeTestPassword(rawPassword);

    setLoading(true);
    try {
      if (isLogin) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (!signInError && signInData.user) {
          await syncUserProfile(signInData.user.id, signInData.user.email ?? authEmail);
          router.replace('/(tabs)');
          return;
        }

        // For testing, auto-create the account on first login attempt.
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

        if (signUpError || !signUpData.user) {
          Alert.alert('Sign In Error', signInError?.message || signUpError?.message || 'Unable to sign in');
          return;
        }

        await syncUserProfile(signUpData.user.id, signUpData.user.email ?? authEmail);

        if (!signUpData.session) {
          const { error: retrySignInError } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
          });

          if (retrySignInError) {
            Alert.alert('Sign In Error', retrySignInError.message);
            return;
          }
        }

        router.replace('/onboarding');
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

        if (signUpError || !signUpData.user) {
          Alert.alert('Sign Up Error', signUpError?.message || 'Unable to create account');
          return;
        }

        await syncUserProfile(signUpData.user.id, signUpData.user.email ?? authEmail);
        router.replace('/onboarding');
      }
    } catch (error: any) {
      Alert.alert(isLogin ? 'Sign In Error' : 'Sign Up Error', error?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مقام</Text>
      <Text style={styles.subtitle}>M A Q A M</Text>
      <Text style={styles.caption}>The Quran Habit Companion</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={colors.mutedForeground}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.testingHint} numberOfLines={1}>
          (for testing, any email and password works; no real email needed)
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsLogin(!isLogin)} 
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    color: colors.foreground,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 48,
    fontStyle: 'italic',
  },
  form: {
    gap: 16,
  },
  input: {
    height: 54,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.foreground,
    fontSize: 16,
  },
  testingHint: {
    marginTop: -4,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontSize: 12,
  },
  button: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  switchText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  }
});
