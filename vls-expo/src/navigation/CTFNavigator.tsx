// vls-expo/src/navigation/CTFNavigator.tsx
import React from 'react';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import CTFListScreen from '../screens/CTFListScreen';
import CTFDetailScreen from '../screens/CTFDetailScreen';
import { CTFStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<CTFStackParamList>();

type Props = StackScreenProps<CTFStackParamList, 'CTFDetail'>;

export default function CTFNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CTFList" 
        component={CTFListScreen} 
        options={{ title: 'CTF Challenges' }} 
      />
      <Stack.Screen 
        name="CTFDetail" 
        component={CTFDetailScreen} 
        options={({ route }: { route: Props['route'] }) => ({ title: route.params.challengeTitle })}
      />
    </Stack.Navigator>
  );
}
