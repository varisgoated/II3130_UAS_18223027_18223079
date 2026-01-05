import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';
import { useRole } from '../hooks/useRole';

// Import Screens & Navigators
import TasksScreen from '../screens/TasksScreen';
import KanbanScreen from '../screens/KanbanScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import CTFNavigator from './CTFNavigator';
import AdminNavigator from './AdminNavigator';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4F46E5', // Indigo Utama
  inactive: '#94A3B8', // Slate (Abu-abu modern)
  background: '#FFFFFF',
  border: '#E2E8F0',
};

export default function AppNavigator() {
  const { role } = useRole();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarShowLabel: true, // Set false jika ingin hanya icon (lebih minimalis)
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen 
          name="Tasks" 
          component={TasksScreen} 
          options={{
            tabBarLabel: 'Tugas',
            // Kamu bisa menambahkan icon di sini nanti menggunakan library @expo/vector-icons
          }}
        />
        <Tab.Screen 
          name="Kanban" 
          component={KanbanScreen} 
          options={{ tabBarLabel: 'Board' }}
        />
        <Tab.Screen 
          name="Schedule" 
          component={ScheduleScreen} 
          options={{ tabBarLabel: 'Jadwal' }}
        />
        <Tab.Screen 
          name="CTF" 
          component={CTFNavigator} 
          options={{ tabBarLabel: 'Lab/CTF' }}
        />
        <Tab.Screen 
          name="Leaderboard" 
          component={LeaderboardScreen} 
          options={{ tabBarLabel: 'Ranking' }}
        />
        
        {role === 'admin' && (
          <Tab.Screen 
            name="Admin" 
            component={AdminNavigator} 
            options={{ tabBarLabel: 'Panel' }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Membuat tab bar melayang
    bottom: 15,
    left: 15,
    right: 15,
    height: 70,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 0, // Hapus garis atas standar
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 12,
    
    // Shadow untuk Android
    elevation: 10,
    
    // Shadow untuk iOS
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});