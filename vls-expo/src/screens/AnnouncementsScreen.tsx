// vls-expo/src/screens/AnnouncementsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  SafeAreaView,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Announcement } from '../types/supabase';
import { Ionicons } from '@expo/vector-icons';
import NewEventModal from '../components/NewEventModal'; // Menggunakan modal yang sudah ada

const COLORS = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  border: '#E2E8F0',
  accent: '#EEF2FF'
};

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal memuat pengumuman');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleCreateAnnouncement = async (data: any) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([
          {
            title: data.title,
            content: `Kategori: ${data.category}\nMatkul: ${data.course}\n${data.assignee ? 'Ditugaskan: ' + data.assignee : ''}`,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      Alert.alert('Berhasil', 'Pengumuman baru telah diterbitkan!');
      setModalVisible(false);
      fetchAnnouncements();
    } catch (err: any) {
      Alert.alert('Gagal', err.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    <View style={styles.announcementCard}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>INFO</Text>
      </View>
      <Text style={styles.announcementTitle}>{item.title}</Text>
      <Text style={styles.announcementContent}>{item.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.announcementDate}>
          📅 {new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Informasi Terbaru</Text>
            <Text style={styles.title}>Pengumuman</Text>
          </View>
          
          {/* Tombol Tambah Pengumuman */}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={45} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Belum ada pengumuman.</Text>
              </View>
            }
          />
        )}

        <NewEventModal 
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleCreateAnnouncement}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20 },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 20, 
    marginBottom: 25 
  },
  headerText: { flex: 1 },
  addButton: { padding: 5 },
  welcomeText: { fontSize: 13, color: COLORS.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textMain, marginTop: 2 },
  listContent: { paddingBottom: 30 },
  announcementCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  badge: { 
    backgroundColor: COLORS.accent, 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginBottom: 12 
  },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  announcementTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  announcementContent: { fontSize: 15, color: COLORS.textSub, lineHeight: 22, marginBottom: 15 },
  footer: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, alignItems: 'flex-end' },
  announcementDate: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.textSub, fontSize: 16 },
});