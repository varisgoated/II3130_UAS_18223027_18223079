// vls-expo/src/screens/LeaderboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  RefreshControl
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
  
  // PERBAIKAN WARNA DI SINI:
  gold: '#FFD700',    // Emas Kuning Terang (Standard Web Gold)
  silver: '#E5E4E2',  // Platinum / Silver Terang (Lebih mengkilap)
  bronze: '#CD7F32'   // Perunggu
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
      // Mengambil dari view/tabel leaderboard, sesuaikan dengan schema DB Anda
      // Di sini kita ambil user_id, score/total_points, dan join users untuk nama
      const { data, error } = await supabase
        .from('leaderboard') 
        .select(`
          id, 
          score,
          users (full_name, email)
        `)
        .order('score', { ascending: false });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Helper untuk nama
  const getDisplayName = (item: any) => {
    if (item.users?.full_name) return item.users.full_name;
    if (item.users?.email) return item.users.email.split('@')[0];
    return 'Mahasiswa';
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Style Dinamis Berdasarkan Rank
    let borderStyle = {};
    let rankColor = COLORS.textSub;
    let rankSize = 16;
    let icon = (index + 1).toString();

    if (index === 0) {
      // JUARA 1: Emas Terang
      borderStyle = { borderWidth: 2, borderColor: COLORS.gold, backgroundColor: '#FFFAEB' };
      rankColor = COLORS.gold;
      rankSize = 28;
      icon = '🥇';
    } else if (index === 1) {
      // JUARA 2: Silver Terang
      borderStyle = { borderWidth: 2, borderColor: COLORS.silver, backgroundColor: '#F9FAFB' };
      rankColor = '#94A3B8'; // Teks rank tetap abu agar kontras dengan silver terang
      rankSize = 24;
      icon = '🥈';
    } else if (index === 2) {
      // JUARA 3: Perunggu
      borderStyle = { borderWidth: 2, borderColor: COLORS.bronze, backgroundColor: '#FFF5EB' };
      rankColor = COLORS.bronze;
      rankSize = 22;
      icon = '🥉';
    }

    return (
      <View style={[styles.card, borderStyle]}>
        <View style={styles.rankSection}>
          <Text style={[styles.rankText, { color: rankColor, fontSize: rankSize }]}>
            {icon}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.usernameText} numberOfLines={1}>
            {getDisplayName(item)}
          </Text>
          <Text style={styles.idText}>
            {item.users?.email || '-'}
          </Text>
        </View>

        <View style={styles.pointsSection}>
          {/* Pastikan menggunakan property yang benar: item.score atau item.total_points */}
          <Text style={styles.pointsText}>{item.score || item.total_points || 0}</Text>
          <Text style={styles.ptsLabel}>PTS</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Top Hackers & Engineers</Text>
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
              <Text style={styles.emptyText}>Belum ada data peringkat.</Text>
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
  rankSection: { width: 50, alignItems: 'center' },
  rankText: { fontWeight: '900' },
  infoSection: { flex: 1, marginLeft: 10, marginRight: 10 },
  usernameText: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  idText: { fontSize: 11, color: COLORS.textSub, marginTop: 2 },
  pointsSection: { 
    alignItems: 'center', 
    backgroundColor: COLORS.accent, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    minWidth: 70 
  },
  pointsText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  ptsLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textSub },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textSub },
});