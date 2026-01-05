// vls-expo/src/screens/CTFDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { CTFChallenge } from '../types/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CTFDetailScreenProps } from '../types/navigation';

type RouteProp = CTFDetailScreenProps['route'];
type NavigationProp = CTFDetailScreenProps['navigation'];

export default function CTFDetailScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { challengeId } = route.params;

  const [challenge, setChallenge] = useState<CTFChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flag, setFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  async function fetchChallenge() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ctf_challenges')
        .select('id, created_at, title, description, category, difficulty, points')
        .eq('id', challengeId)
        .single();

      if (error) throw error;
      setChallenge(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch challenge details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitFlag() {
    if (!flag.trim()) {
        Alert.alert('Empty Flag', 'Please enter a flag to submit.');
        return;
    }
    setIsSubmitting(true);
    try {
        const { data, error } = await supabase.rpc('submit_flag', {
            p_challenge_id: challengeId,
            p_submitted_flag: flag.trim(),
        });

        if (error) throw error;

        if (data === true) {
            Alert.alert('Correct!', 'Congratulations, you have captured the flag!', [
                { text: 'OK', onPress: () => navigation.goBack() } // Go back on success
            ]);
        } else {
            Alert.alert('Incorrect', 'That is not the correct flag. Keep trying!');
        }
    } catch (err: any) {
        Alert.alert('Error', err.message || 'An error occurred while submitting the flag.');
    } finally {
        setIsSubmitting(false);
        setFlag(''); // Clear input
    }
  }

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error || !challenge) {
    return <Text style={styles.errorText}>{error || 'Challenge not found.'}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{challenge.title}</Text>
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Category: {challenge.category}</Text>
        <Text style={styles.metaText}>Difficulty: {challenge.difficulty}</Text>
        <Text style={styles.metaText}>Points: {challenge.points}</Text>
      </View>
      <Text style={styles.description}>{challenge.description}</Text>
      
      <View style={styles.submitContainer}>
        <TextInput
            style={styles.input}
            placeholder="Enter flag here"
            value={flag}
            onChangeText={setFlag}
            autoCapitalize="none"
        />
        <Button
            title={isSubmitting ? 'Submitting...' : 'Submit Flag'}
            onPress={handleSubmitFlag}
            disabled={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 15,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    metaText: {
        fontSize: 14,
        color: '#444',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
    },
    submitContainer: {
        marginTop: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    }
});
