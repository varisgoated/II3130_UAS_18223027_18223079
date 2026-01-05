// vls-expo/src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  RefreshControl,
  Image
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#4F46E5',
  secondary: '#7E22CE',
  background: '#F8FAFC',
  card: '#FFFFFF',
  accent: '#EEF2FF',
  textMain: '#1E293B',
  textSub: '#64748B',
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#B45309'
};

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      // Logika UTS: Mengambil dari view 'leaderboard' yang berisi username dan total_points
      const { data, error } = await supabase
        .from('leaderboard') 
        .select('id, username, total_points')
        .order('total_points', { ascending: false });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isTopThree = index < 3;
    const getRankStyle = () => {
      if (index === 0) return { color: COLORS.gold, fontSize: 28 };
      if (index === 1) return { color: COLORS.silver, fontSize: 24 };
      if (index === 2) return { color: COLORS.bronze, fontSize: 22 };
      return { color: COLORS.textSub, fontSize: 16 };
    };

    return (
      <View style={[styles.card, index === 0 && styles.topCard]}>
        <View style={styles.rankSection}>
          <Text style={[styles.rankText, getRankStyle()]}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.usernameText}>{item.username || 'Anonymous Hacker'}</Text>
          <Text style={styles.idText}>UUID: {item.id.substring(0, 8)}...</Text>
        </View>

        <View style={styles.pointsSection}>
          <Text style={styles.pointsText}>{item.total_points || 0}</Text>
          <Text style={styles.ptsLabel}>PTS</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Virtual Lab Distributed System</Text>
      </LinearGradient>

      <View style={styles.container}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Belum ada data peringkat saat ini.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 30, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  container: { flex: 1, marginTop: -25 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  topCard: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: '#FFFBEB',
  },
  rankSection: { width: 50, alignItems: 'center' },
  rankText: { fontWeight: '900' },
  infoSection: { flex: 1, marginLeft: 10 },
  usernameText: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  idText: { fontSize: 10, color: COLORS.textSub, marginTop: 2, textTransform: 'uppercase' },
  pointsSection: { alignItems: 'center', backgroundColor: COLORS.accent, padding: 8, borderRadius: 12, minWidth: 60 },
  pointsText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  ptsLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textSub },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textSub },
});