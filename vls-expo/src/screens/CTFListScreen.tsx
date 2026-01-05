import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// Hapus LinearGradient karena kita ingin gaya minimalis

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
    case 'medium': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
    case 'hard': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
    default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  }
};

export default function CTFListScreen({ navigation }: any) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [])
  );

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('ctf_challenges')
        .select('*')
        .order('points', { ascending: true });

      if (error) throw error;
      setChallenges(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const colors = getDifficultyColor(item.difficulty);

    return (
      <TouchableOpacity 
        style={[styles.card, { borderColor: colors.border, backgroundColor: 'white' }]} 
        onPress={() => navigation.navigate('CTFDetail', { challenge: item })}
      >
        <View style={[styles.cardHeader, { backgroundColor: colors.bg }]}>
          <Text style={[styles.difficultyBadge, { color: colors.text }]}>
            {item.difficulty?.toUpperCase()}
          </Text>
          <View style={styles.pointsBadge}>
            <Ionicons name="diamond" size={12} color="#4f46e5" />
            <Text style={styles.pointsText}>{item.points}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER: Format seperti Penjadwalan (Clean) */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CTF Arena</Text>
          <Text style={styles.headerSubtitle}>Capture The Flag Challenges</Text>
        </View>
        {/* Icon Tambahan jika perlu */}
      </View>

      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChallenges(); }} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Belum ada challenge tersedia.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 50, // Safe Area padding seperti ScheduleScreen
  },
  // Header Style Simple
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  difficultyBadge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#94a3b8',
  },
});