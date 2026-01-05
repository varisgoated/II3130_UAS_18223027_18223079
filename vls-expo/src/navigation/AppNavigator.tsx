import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Library ikon bawaan Expo
// NavigationContainer dihapus dari sini karena sudah ada di App.tsx
import { useRole } from '../hooks/useRole';


// Import Screens
import TasksScreen from '../screens/TasksScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen'; // Dashboard/Pengumuman
import CTFNavigator from './CTFNavigator';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4F46E5',   // Indigo-600 (Sesuai web UTS)
  inactive: '#94A3B8',  // Slate-400
  background: '#FFFFFF',
  shadow: '#4F46E5',
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        // LOGIKA ICON GLOBAL
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Tasks':
              iconName = focused ? 'checkbox' : 'checkbox-outline';
              break;
            case 'Schedule':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'CTF':
              iconName = focused ? 'flag' : 'flag-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Admin':
              iconName = focused ? 'shield' : 'shield-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ tabBarLabel: 'Tugas' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen} 
        options={{ tabBarLabel: 'Jadwal' }}
      />
      <Tab.Screen 
        name="CTF" 
        component={CTFNavigator} 
        options={{ tabBarLabel: 'CTF' }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen} 
        options={{ tabBarLabel: 'Ranking' }}
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profil' }} 
      />
      
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    height: 70,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 12,
    
    // Shadow Android
    elevation: 10,
    
    // Shadow iOS
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: -5,
    marginBottom: 5,
  },
});