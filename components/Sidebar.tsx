import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.60, 320);

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, user, theme, setTheme } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];
  const router = useRouter();

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const opacity = useSharedValue(0);

  // Sync reanimated values with Zustand state
  useAnimatedReaction(
    () => sidebarOpen,
    (isOpen) => {
      translateX.value = withTiming(isOpen ? 0 : -SIDEBAR_WIDTH, {
        duration: 300,
        easing: Easing.out(Easing.poly(3)),
      });
      opacity.value = withTiming(isOpen ? 1 : 0, {
        duration: 300,
      });
    }
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: sidebarOpen ? 'auto' : 'none',
  }));

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navToProfile = () => {
    closeSidebar();
    router.push('/(tabs)/profile');
  };

  const navToSettings = () => {
    closeSidebar();
    router.push('/settings' as any);
  };

  const navToPrivacy = () => {
    closeSidebar();
    router.push('/privacy' as any);
  };

  const navToTerms = () => {
    closeSidebar();
    router.push('/terms' as any);
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const handleSignOut = async () => {
    closeSidebar();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return 'moon';
    if (theme === 'light') return 'sun';
    return 'monitor';
  };

  const getThemeText = () => {
    if (theme === 'dark') return 'Dark Mode';
    if (theme === 'light') return 'Light Mode';
    return 'System Theme';
  };

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: sidebarOpen ? 'auto' : 'none', elevation: 999, zIndex: 999 }]}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={styles.backdropButton} onPress={closeSidebar} activeOpacity={1} />
      </Animated.View>

      {/* Sidebar Content */}
      <Animated.View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border, width: SIDEBAR_WIDTH }, sidebarStyle]}>
        <TouchableOpacity style={styles.profileHeader} onPress={navToProfile}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.userGoal, { color: colors.gold }]}>Goal: {user.readingGoal}</Text>
        </TouchableOpacity>

        <View style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem} onPress={navToProfile}>
            <Feather name="user" size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navToSettings}>
            <Feather name="settings" size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navToPrivacy}>
            <Feather name="shield" size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navToTerms}>
            <Feather name="file-text" size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <TouchableOpacity style={styles.menuItem} onPress={cycleTheme}>
            <Feather name={getThemeIcon()} size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>{getThemeText()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Feather name="log-out" size={20} color={colors.foreground} />
            <Text style={[styles.menuText, { color: colors.foreground }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.closeButton, { borderTopColor: colors.border }]} onPress={closeSidebar}>
          <Feather name="x" size={20} color={colors.mutedForeground} />
          <Text style={[styles.closeText, { color: colors.mutedForeground }]}>Close Menu</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropButton: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    // width is set inline to respect dynamic caps
    borderRightWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    display: 'flex',
    flexDirection: 'column',
  },
  profileHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userGoal: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  menuItems: {
    padding: 16,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 16,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
