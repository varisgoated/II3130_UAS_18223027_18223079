// vls-expo/src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LeaderboardEntry } from '../types/supabase';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      // Assuming you have a 'leaderboard' table or a view
      // that might need a join with a 'profiles' table to get names.
      // This is a simplified example. You might need to use an RPC call
      // for complex queries.
      const { data, error } = await supabase
        .from('leaderboard') // Replace with your actual table/view name
        .select('user_id, score, profiles(full_name)') // Example of a join
        .order('score', { ascending: false });

      if (error) throw error;
      
      // The data structure might be different depending on your join
      // We'll adapt it here for the FlatList
      const formattedData = data.map((item: any) => ({
        user_id: item.user_id,
        score: item.score,
        full_name: item.profiles?.full_name || 'Anonymous',
      }));

      setLeaderboard(formattedData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item, index }) => (
          <View style={styles.entryItem}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.score}>{item.score} pts</Text>
          </View>
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
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
  },
  name: {
    fontSize: 18,
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

