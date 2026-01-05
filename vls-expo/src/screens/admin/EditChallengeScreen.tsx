// vls-expo/src/screens/admin/EditChallengeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { AdminStackParamList } from '../../types/navigation';

type EditChallengeRouteProp = RouteProp<AdminStackParamList, 'EditChallenge'>;

const EditChallengeScreen = () => {
    const route = useRoute<EditChallengeRouteProp>();
    const navigation = useNavigation();
    const challengeId = route.params?.challengeId;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [points, setPoints] = useState('');
    const [flag, setFlag] = useState(''); // For creating/updating the flag hash

    useEffect(() => {
        if (challengeId) {
            const fetchChallenge = async () => {
                const { data, error } = await supabase
                    .from('ctf_challenges')
                    .select('*')
                    .eq('id', challengeId)
                    .single();
                if (data) {
                    setTitle(data.title);
                    setDescription(data.description);
                    setCategory(data.category);
                    setDifficulty(data.difficulty);
                    setPoints(data.points.toString());
                    // Flag is not fetched for security reasons
                } else if (error) {
                    Alert.alert('Error', 'Failed to fetch challenge details.');
                }
            };
            fetchChallenge();
        }
    }, [challengeId]);

    const handleSave = async () => {
        const challengeData = {
            title,
            description,
            category,
            difficulty,
            points: parseInt(points, 10),
            // IMPORTANT: In a real app, you'd hash the flag on the server.
            // For simplicity here, we'll just store it. This is NOT secure.
            // A Supabase Edge Function would be the correct way to handle this.
            flag_hash: flag, // Storing plain text flag for simplicity.
        };

        if (challengeId) {
            // Update existing challenge
            const { error } = await supabase.from('ctf_challenges').update(challengeData).eq('id', challengeId);
            if (error) Alert.alert('Error', error.message);
            else {
                Alert.alert('Success', 'Challenge updated!');
                navigation.goBack();
            }
        } else {
            // Create new challenge
            const { error } = await supabase.from('ctf_challenges').insert(challengeData);
            if (error) Alert.alert('Error', error.message);
            else {
                Alert.alert('Success', 'Challenge created!');
                navigation.goBack();
            }
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Category</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} />

            <Text style={styles.label}>Difficulty</Text>
            {/* In a real app, this would be a picker */}
            <TextInput style={styles.input} value={difficulty} onChangeText={(text) => setDifficulty(text as 'Easy' | 'Medium' | 'Hard')} />

            <Text style={styles.label}>Points</Text>
            <TextInput style={styles.input} value={points} onChangeText={setPoints} keyboardType="numeric" />
            
            <Text style={styles.label}>Flag (leave blank if not changing)</Text>
            <TextInput style={styles.input} value={flag} onChangeText={setFlag} />

            <Button title={challengeId ? "Update Challenge" : "Create Challenge"} onPress={handleSave} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginTop: 5, marginBottom: 15 },
});

export default EditChallengeScreen;
