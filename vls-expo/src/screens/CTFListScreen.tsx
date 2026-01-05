// vls-expo/src/screens/CTFListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { CTFChallenge } from '../types/supabase';
import { useNavigation } from '@react-navigation/native';
import { CTFListScreenProps } from '../types/navigation';

type NavigationProp = CTFListScreenProps['navigation'];

const difficultyColors: { [key: string]: string } = {
    Easy: '#4caf50',
    Medium: '#ff9800',
    Hard: '#f44336',
};

export default function CTFListScreen() {
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function fetchChallenges() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ctf_challenges')
        .select('id, created_at, title, description, category, difficulty, points')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.challengeItem}
            onPress={() => navigation.navigate('CTFDetail', { challengeId: item.id, challengeTitle: item.title })}
          >
            <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <Text style={styles.challengePoints}>{item.points} pts</Text>
            </View>
            <View style={styles.challengeFooter}>
                <Text style={styles.challengeCategory}>{item.category}</Text>
                <Text style={{ color: difficultyColors[item.difficulty] || '#000', fontWeight: 'bold' }}>{item.difficulty}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    challengeItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        elevation: 3,
    },
    challengeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    challengeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    challengePoints: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
    },
    challengeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    challengeCategory: {
        fontSize: 14,
        color: '#666',
    },
});
