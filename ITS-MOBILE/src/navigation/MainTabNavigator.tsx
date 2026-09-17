import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { ContactsScreen } from '../screens/contacts/ContactsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useNotificationsStore } from '../store/useNotificationsStore';
import {
  TaskClipboardIcon,
  PhoneHandsetIcon,
  BellIcon,
  UserIcon,
} from '../components/icons/SvgIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_FAMILY } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { unreadCount, fetchNotifications } = useNotificationsStore();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 14);
  const tabHeight = 62 + bottomInset;

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Tab.Navigator
      initialRouteName="TasksTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0090e7',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{
          tabBarLabel: 'NHIỆM VỤ',
          tabBarIcon: ({ color }) => (
            <TaskClipboardIcon size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ContactsTab"
        component={ContactsScreen}
        options={{
          tabBarLabel: 'LIÊN LẠC',
          tabBarIcon: ({ color }) => (
            <PhoneHandsetIcon size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'THÔNG BÁO',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <BellIcon size={24} color={color} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'TÔI',
          tabBarIcon: ({ color }) => (
            <UserIcon size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontFamily: FONT_FAMILY,
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
});
