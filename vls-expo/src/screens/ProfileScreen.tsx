import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, RefreshControl
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    rank: '-',
    totalSubmissions: 0,
    successCount: 0,
    successRate: 0,
    failRate: 0
  });

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil data user
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      setProfile(userData);
      setNewName(userData?.full_name || '');

      // Ambil Leaderboard Rank
      const { data: leaderboardData } = await supabase
        .from('leaderboard')
        .select('user_id')
        .order('score', { ascending: false });

      const myRank = leaderboardData 
        ? leaderboardData.findIndex((item: any) => item.user_id === user.id) + 1 
        : 0;

      // Hitung Statistik
      const { data: submissions } = await supabase
        .from('ctf_submissions')
        .select('correct')
        .eq('user_id', user.id);

      const total = submissions?.length || 0;
      const success = submissions?.filter((s: any) => s.correct).length || 0;
      
      // Jika belum ada submisi, set rate 0 agar tidak error/aneh
      const successPct = total > 0 ? (success / total) * 100 : 0;
      const failPct = total > 0 ? 100 - successPct : 0; 

      setStats({
        rank: myRank > 0 ? `#${myRank}` : '-',
        totalSubmissions: total,
        successCount: success,
        successRate: parseFloat(successPct.toFixed(1)),
        failRate: parseFloat(failPct.toFixed(1))
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('users')
        .update({ full_name: newName.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, full_name: newName.trim() });
      setIsEditing(false);
      Alert.alert('Sukses', 'Nama berhasil diubah.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Keluar', 
        style: 'destructive', 
        onPress: async () => {
          await supabase.auth.signOut();
        }
      }
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfileData(); }} />}
      >
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Edit Nama Section */}
          <View style={styles.nameContainer}>
            {isEditing ? (
              <View style={styles.editRow}>
                <TextInput 
                  style={styles.nameInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Nama Lengkap"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#4f46e5" /> : <Ionicons name="checkmark-circle" size={28} color="#16a34a" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close-circle" size={28} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
                </Text>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editIcon}>
                  <Ionicons name="pencil" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Email Full (Tidak disingkat) */}
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        {/* Content Statik */}
        <View style={styles.content}>
          <View style={styles.rankCard}>
            <Text style={styles.rankLabel}>Peringkat Leaderboard</Text>
            <Text style={styles.rankValue}>{stats.rank}</Text>
          </View>

          {/* Statistik Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Statistik Submisi</Text>
              <Text style={styles.statsSubtitle}>{stats.totalSubmissions} Total Percobaan</Text>
            </View>

            {/* Bar Persentase Logic */}
            <View style={styles.barContainer}>
              {stats.totalSubmissions === 0 ? (
                <View style={[styles.barSegment, { flex: 1, backgroundColor: '#e5e7eb' }]} />
              ) : (
                <>
                  {stats.successRate > 0 && (
                    <View style={[styles.barSegment, { flex: stats.successRate, backgroundColor: '#10b981' }]} />
                  )}
                  {stats.failRate > 0 && (
                    <View style={[styles.barSegment, { flex: stats.failRate, backgroundColor: '#ef4444' }]} />
                  )}
                </>
              )}
            </View>

            <View style={styles.statsLegend}>
              {stats.totalSubmissions === 0 ? (
                <Text style={[styles.legendText, { color: '#9ca3af' }]}>Belum ada data</Text>
              ) : (
                <>
                  <Text style={[styles.legendText, { color: '#10b981' }]}>Sukses: {stats.successRate}%</Text>
                  <Text style={[styles.legendText, { color: '#ef4444' }]}>Gagal: {stats.failRate}%</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 120 }, // Jarak aman dari navbar 90+
  header: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 32 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#4f46e5' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#4f46e5' },
  nameContainer: { alignItems: 'center', marginBottom: 4, width: '100%' },
  nameDisplayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' },
  nameInput: { borderBottomWidth: 1, borderBottomColor: '#4f46e5', fontSize: 18, paddingVertical: 4, width: 200, textAlign: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  editIcon: { padding: 4 },
  email: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  content: { paddingHorizontal: 20, flex: 1 },
  rankCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rankLabel: { fontSize: 14, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  rankValue: { fontSize: 48, fontWeight: '900', color: '#4f46e5' },
  statsContainer: { marginBottom: 30 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  statsTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statsSubtitle: { fontSize: 12, color: '#6b7280' },
  barContainer: { height: 24, flexDirection: 'row', borderRadius: 12, overflow: 'hidden', backgroundColor: '#e5e7eb' },
  barSegment: { height: '100%' },
  statsLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendText: { fontSize: 13, fontWeight: '600' },
  logoutButton: { backgroundColor: '#fee2e2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca', marginHorizontal: 20 },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 16 },
});