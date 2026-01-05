import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Library ikon bawaan Expo

// Import Screens
import TasksScreen from '../screens/TasksScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen'; // Dashboard/Pengumuman
import CTFNavigator from './CTFNavigator';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4F46E5',   // Indigo-600 (Sesuai web UTS)
  inactive: '#94A3B8',  // Slate-400
  background: '#FFFFFF',
  shadow: '#4F46E5',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          // Logika Ikon Otomatis
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'checkbox' : 'checkbox-outline';
            } else if (route.name === 'Schedule') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Lab') {
              iconName = focused ? 'flask' : 'flask-outline';
            } else if (route.name === 'Ranking') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={AnnouncementsScreen} 
          options={{ tabBarLabel: 'Beranda' }} 
        />
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
          name="Lab" 
          component={CTFNavigator} 
          options={{ tabBarLabel: 'Lab CTF' }} 
        />
        <Tab.Screen 
          name="Ranking" 
          component={LeaderboardScreen} 
          options={{ tabBarLabel: 'Peringkat' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 12,
    
    // Shadow untuk Android
    elevation: 15,
    
    // Shadow untuk iOS
    shadowColor: COLORS.shadow,
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