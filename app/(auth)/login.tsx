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

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) Alert.alert('Sign In Error', error.message);
      else router.replace('/(tabs)');
    } else {
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        Alert.alert('Sign Up Error', error.message);
      } else if (user) {
        // Create user profile record required by DB schema
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          name: email.split('@')[0],
        });
        router.replace('/onboarding');
      }
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
