// vls-expo/src/screens/admin/ManageChallengesScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { CTFChallenge } from '../../types/supabase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../types/navigation';

type ManageChallengesNavigationProp = StackNavigationProp<AdminStackParamList, 'ManageChallenges'>;

const ManageChallengesScreen = () => {
    const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
    const navigation = useNavigation<ManageChallengesNavigationProp>();

    useEffect(() => {
        fetchChallenges();
        const subscription = supabase
            .channel('ctf_challenges_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ctf_challenges' }, fetchChallenges)
            .subscribe();
        
        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchChallenges = async () => {
        const { data, error } = await supabase.from('ctf_challenges').select('*');
        if (error) Alert.alert('Error fetching challenges', error.message);
        else setChallenges(data || []);
    };

    const deleteChallenge = async (id: number) => {
        const { error } = await supabase.from('ctf_challenges').delete().eq('id', id);
        if (error) Alert.alert('Error deleting challenge', error.message);
        else Alert.alert('Success', 'Challenge deleted successfully.');
    };

    return (
        <View style={styles.container}>
            <Button
                title="Add New Challenge"
                onPress={() => navigation.navigate('EditChallenge', { challengeId: undefined })}
            />
            <FlatList
                data={challenges}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate('EditChallenge', { challengeId: item.id })}>
                                <Text style={styles.editButton}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => Alert.alert(
                                'Delete Challenge',
                                `Are you sure you want to delete "${item.title}"?`,
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: () => deleteChallenge(item.id) },
                                ]
                            )}>
                                <Text style={styles.deleteButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    itemTitle: { fontSize: 16 },
    buttonContainer: { flexDirection: 'row' },
    editButton: { color: 'blue', marginRight: 15 },
    deleteButton: { color: 'red' },
});

export default ManageChallengesScreen;
