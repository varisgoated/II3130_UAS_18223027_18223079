// vls-expo/src/navigation/AdminNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageChallengesScreen from '../screens/admin/ManageChallengesScreen';
import EditChallengeScreen from '../screens/admin/EditChallengeScreen';

export type AdminStackParamList = {
    AdminDashboard: undefined;
    ManageChallenges: undefined;
    EditChallenge: { challengeId: number | undefined };
};

const Stack = createStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="ManageChallenges" component={ManageChallengesScreen} options={{ title: 'Manage Challenges' }} />
            <Stack.Screen name="EditChallenge" component={EditChallengeScreen} options={{ title: 'Edit Challenge' }} />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
