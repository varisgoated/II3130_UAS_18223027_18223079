// vls-expo/src/screens/admin/AdminDashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../types/navigation';

type AdminDashboardNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const AdminDashboardScreen = () => {
    const navigation = useNavigation<AdminDashboardNavigationProp>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Button
                title="Manage CTF Challenges"
                onPress={() => navigation.navigate('ManageChallenges')}
            />
            {/* Add more buttons for other admin tasks later */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default AdminDashboardScreen;
