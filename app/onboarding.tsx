import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/services/supabase';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<'khatam' | 'consistent' | 'understand'>('consistent');
  const [baseline, setBaseline] = useState('10');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const theme = useAppStore((s) => s.theme);
  const colors = Colors[theme === 'system' ? 'dark' : theme];
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const handleComplete = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('users').update({
        name: name || 'Seeker',
        reading_goal: goal,
        ramadan_baseline_verses: parseInt(baseline) || 10,
        notification_time: '08:00', // Default
      }).eq('id', session.user.id);
      
      // Update local store to instantly reflect the new values immediately
      useAppStore.setState({
        user: { ...useAppStore.getState().user, name: name || 'Seeker', ramadanBaselineVerses: parseInt(baseline) || 10, readingGoal: goal }
      });
    }
    setLoading(false);
    router.replace('/(tabs)');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.header}>Welcome to Maqam</Text>
      <Text style={styles.subHeader}>What should we call you?</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Name (e.g. Ahmad)"
        placeholderTextColor={colors.mutedForeground}
        value={name}
        onChangeText={setName}
      />
      <Text style={[styles.subHeader, { marginTop: 32 }]}>What is your primary goal?</Text>
      
      <TouchableOpacity 
        style={[styles.goalOption, goal === 'khatam' && styles.goalSelected]}
        onPress={() => setGoal('khatam')}
      >
        <Text style={[styles.goalTitle, goal === 'khatam' && styles.goalTextSelected]}>Khatam (Completion)</Text>
        <Text style={[styles.goalDesc, goal === 'khatam' && styles.goalTextSelected]}>I want to finish reading the entire Quran</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.goalOption, goal === 'consistent' && styles.goalSelected]}
        onPress={() => setGoal('consistent')}
      >
        <Text style={[styles.goalTitle, goal === 'consistent' && styles.goalTextSelected]}>Consistency</Text>
        <Text style={[styles.goalDesc, goal === 'consistent' && styles.goalTextSelected]}>I want to build a daily habit, no matter how small</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.goalOption, goal === 'understand' && styles.goalSelected]}
        onPress={() => setGoal('understand')}
      >
        <Text style={[styles.goalTitle, goal === 'understand' && styles.goalTextSelected]}>Understanding</Text>
        <Text style={[styles.goalDesc, goal === 'understand' && styles.goalTextSelected]}>I want to study tafsir and reflect on meanings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
        <Text style={styles.nextText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.header}>Your Baseline</Text>
      <Text style={styles.subHeader}>How many verses do you typically read per week right now? Be honest!</Text>
      <Text style={styles.caption}>This creates your "Ramadan baseline", powering the Spiritual GPS logic to track your Barakah acceleration accurately.</Text>
      
      <TextInput
        style={[styles.input, { fontSize: 32, textAlign: 'center', marginVertical: 32, height: 70 }]}
        placeholder="10"
        placeholderTextColor={colors.mutedForeground}
        value={baseline}
        onChangeText={setBaseline}
        keyboardType="numeric"
      />
      
      <TouchableOpacity style={styles.nextButton} onPress={handleComplete} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.nextText}>Finish Setup</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)} disabled={loading}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
      </View>
      {step === 1 ? renderStep1() : renderStep2()}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.card,
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 40,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  stepContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 18,
    color: colors.foreground,
    marginBottom: 16,
  },
  caption: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    color: colors.foreground,
    fontSize: 16,
  },
  goalOption: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.primary,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  goalDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  goalTextSelected: {
    color: colors.primaryForeground,
  },
  nextButton: {
    backgroundColor: colors.gold,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  nextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  backText: {
    color: colors.mutedForeground,
    fontSize: 16,
  }
});
