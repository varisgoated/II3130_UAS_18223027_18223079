import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Warna yang konsisten dengan tema Indigo-Purple UTS
const COLORS = {
  primary: '#4F46E5',
  secondary: '#7E22CE',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  accent: '#EEF2FF'
};

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ tasks: 0, points: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Hitung jumlah task user (Sesuai tabel tasks)
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 2. Ambil poin dari leaderboard
        const { data: profile } = await supabase
          .from('leaderboard')
          .select('total_points')
          .eq('id', user.id)
          .single();

        setStats({ 
          tasks: count || 0, 
          points: profile?.total_points || 0 
        });
      }

      // 3. Ambil 3 pengumuman terbaru
      const { data: ann } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setAnnouncements(ann || []);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Selamat Datang,</Text>
          <Text style={styles.title}>Virtual Lab Dashboard</Text>
        </View>

        {/* Stats Cards - Mengikuti gaya visual UTS */}
        <View style={styles.statsRow}>
          <LinearGradient colors={[COLORS.primary, '#3730a3']} style={styles.statCard}>
            <Ionicons name="checkbox-outline" size={24} color="white" />
            <Text style={styles.statNumber}>{stats.tasks}</Text>
            <Text style={styles.statLabel}>Tugas Aktif</Text>
          </LinearGradient>

          <LinearGradient colors={[COLORS.secondary, '#6b21a8']} style={styles.statCard}>
            <Ionicons name="trophy-outline" size={24} color="white" />
            <Text style={styles.statNumber}>{stats.points}</Text>
            <Text style={styles.statLabel}>Poin CTF</Text>
          </LinearGradient>
        </View>

        {/* Announcements Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          announcements.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <View style={styles.announcementBadge}>
                <Text style={styles.badgeText}>PENGUMUMAN</Text>
              </View>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.announcementContent} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.announcementDate}>
                {new Date(item.created_at).toLocaleDateString('id-ID')}
              </Text>
            </View>
          ))
        )}

        {announcements.length === 0 && !loading && (
          <Text style={styles.emptyText}>Tidak ada pengumuman baru.</Text>
        )}
        
        {/* Tambahkan padding ekstra di bawah agar tidak tertutup TabBar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  header: { marginBottom: 25, marginTop: 10 },
  welcomeText: { fontSize: 16, color: COLORS.textSub, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textMain },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { 
    flex: 0.48, 
    padding: 20, 
    borderRadius: 24, 
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statNumber: { color: 'white', fontSize: 28, fontWeight: '800', marginTop: 10 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
  announcementCard: { 
    backgroundColor: COLORS.card, 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    elevation: 2,
  },
  announcementBadge: { 
    backgroundColor: COLORS.accent, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6, 
    alignSelf: 'flex-start',
    marginBottom: 10 
  },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  announcementTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, marginBottom: 5 },
  announcementContent: { fontSize: 14, color: COLORS.textSub, lineHeight: 20 },
  announcementDate: { fontSize: 11, color: '#94A3B8', marginTop: 12, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: COLORS.textSub, marginTop: 20 },
});