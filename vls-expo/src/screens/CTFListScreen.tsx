// vls-expo/src/screens/CTFListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  border: '#E2E8F0',
};

const difficultyColors: { [key: string]: string } = {
  Easy: '#10B981',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

export default function CTFListScreen({ navigation }: any) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function fetchChallenges() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ctf_challenges')
        .select('id, title, category, difficulty, points')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CTFDetail', { challengeId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.category}>{item.category}</Text>
        <View style={[styles.diffBadge, { backgroundColor: difficultyColors[item.difficulty] + '20' }]}>
          <Text style={[styles.diffText, { color: difficultyColors[item.difficulty] }]}>{item.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>{item.title}</Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.points}>💎 {item.points} Points</Text>
        <Text style={styles.actionText}>Solve Challenge →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>CTF Challenges</Text>
        {loading && !refreshing ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchChallenges} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  category: { fontSize: 12, fontWeight: '700', color: COLORS.textSub, textTransform: 'uppercase' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  diffText: { fontSize: 10, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  points: { fontWeight: '700', color: COLORS.primary },
  actionText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' }
});