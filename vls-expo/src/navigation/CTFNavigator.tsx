import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CTFListScreen from '../screens/CTFListScreen';
import CTFDetailScreen from '../screens/CTFDetailScreen';

const Stack = createStackNavigator();

export default function CTFNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false // PENTING: Hilangkan header bawaan stack
      }}
    >
      <Stack.Screen name="CTFList" component={CTFListScreen} />
      <Stack.Screen 
        name="CTFDetail" 
        component={CTFDetailScreen} 
        options={{
          headerShown: true, // Detail page boleh punya header (back button)
          title: 'Challenge Detail',
          headerBackTitleVisible: false,
          headerTintColor: '#4f46e5',
        }}
      />
    </Stack.Navigator>
  );
}