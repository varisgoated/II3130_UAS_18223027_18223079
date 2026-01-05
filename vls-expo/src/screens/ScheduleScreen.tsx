// vls-expo/src/screens/ScheduleScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { supabase } from '../lib/supabaseClient';

const COLORS = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  border: '#E2E8F0',
  accent: '#EEF2FF'
};

export default function ScheduleScreen() {
  const [calendar_events, setcalendar_events] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); 
  const [time, setTime] = useState(''); 

  useEffect(() => {
    fetchcalendar_events();
  }, []);

  async function fetchcalendar_events() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setcalendar_events(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSchedule() {
    if (!title || !date) {
      Alert.alert('Peringatan', 'Judul dan Tanggal harus diisi');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ title, date, time }])
        .select();

      if (error) throw error;

      if (data) {
        setcalendar_events(prev => [...prev, data[0]].sort((a, b) => a.date.localeCompare(b.date)));
      }
      
      setModalVisible(false);
      setTitle('');
      setDate('');
      setTime('');
    } catch (err: any) {
      Alert.alert('Gagal Simpan', err.message);
    }
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{item.time || '--:--'}</Text>
        <View style={styles.verticalLine} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.scheduleTitle}>{item.title}</Text>
        <View style={styles.dateBadge}>
          <Text style={styles.scheduleDate}>📅 {new Date(item.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
          })}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Agenda Virtual Lab</Text>
          <Text style={styles.title}>Jadwal</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Jadwal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={calendar_events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada jadwal tersimpan.</Text>}
        />
      )}

      {/* MODAL INPUT */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Agenda Baru</Text>
            
            <Text style={styles.label}>Nama Kegiatan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Praktikum Jaringan"
              value={title}
              onChangeText={setTitle}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '48%' }}>
                <Text style={styles.label}>Tanggal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.label}>Jam</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: '#F1F5F9' }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: COLORS.textMain, fontWeight: '600' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: COLORS.primary }]} 
                onPress={handleAddSchedule}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  welcomeText: { fontSize: 13, color: COLORS.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textMain, marginTop: 2 },
  addButton: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, elevation: 4 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  scheduleCard: { 
    flexDirection: 'row',
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  timeContainer: { alignItems: 'center', width: 50, justifyContent: 'flex-start' },
  timeText: { fontWeight: '800', color: COLORS.primary, fontSize: 15 },
  verticalLine: { width: 3, flex: 1, backgroundColor: COLORS.accent, marginTop: 8, borderRadius: 2 },
  contentContainer: { flex: 1, marginLeft: 15 },
  scheduleTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  dateBadge: { backgroundColor: COLORS.background, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scheduleDate: { fontSize: 13, color: COLORS.textSub, fontWeight: '500' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.textSub, marginTop: 50, fontSize: 16 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSub, marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 15, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textMain },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 0.48, padding: 16, borderRadius: 16, alignItems: 'center' }
});