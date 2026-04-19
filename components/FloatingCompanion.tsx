import { TouchableOpacity, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';

export function FloatingCompanion() {
  const { companionOpen, setCompanionOpen, theme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  if (companionOpen) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCompanionOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>💬</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 24,
  },
});
