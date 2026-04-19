import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

function TabIcon({ name, label, focused }: { name: React.ComponentProps<typeof Feather>['name']; label: string; focused: boolean }) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.tabItem}>
      <Feather
        name={name}
        size={24}
        color={focused ? colors.gold : colors.tabIconDefault}
      />
      <Text style={[
        styles.tabLabel, 
        { color: focused ? colors.gold : colors.tabIconDefault },
        focused && styles.tabLabelActive
      ]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerLeft: () => (
          <Feather 
            name="menu" 
            size={24} 
            color={colors.foreground} 
            style={{ marginLeft: 20 }}
            // We use require to avoid cyclical import if needed, but direct import is fine. 
            // In a real app we might just wrap in TouchableOpacity:
            onPress={() => require('@/stores/appStore').useAppStore.getState().setSidebarOpen(true)}
          />
        ),
        headerRight: () => {
          const router = require('expo-router').useRouter();
          return (
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Feather 
                name="bell" 
                size={22} 
                color={colors.foreground} 
                style={{ marginRight: 20 }}
              />
            </TouchableOpacity>
          );
        },
        tabBarStyle: {
          backgroundColor: colors.deepGreen,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          title: 'Read',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="book-open" label="Read" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: 'Companion',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="message-circle" label="Companion" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="halaka"
        options={{
          title: 'Halaka',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" label="Halaka" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="barakah"
        options={{
          title: 'Barakah',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="award" label="Barakah" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null as any,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
});
