// vls-expo/src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useRole } from '../hooks/useRole';

import TasksScreen from '../screens/TasksScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import KanbanScreen from '../screens/KanbanScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import CTFNavigator from './CTFNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import AdminNavigator from './AdminNavigator'; // Import the Admin navigator

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { role } = useRole();

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Kanban" component={KanbanScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="CTF" component={CTFNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        {role === 'admin' && (
          <Tab.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
