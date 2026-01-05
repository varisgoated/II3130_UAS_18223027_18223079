// vls-expo/src/screens/TasksScreen.tsx
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
  Alert
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Task } from '../types/supabase';

const COLORS = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E2E8F0',
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State untuk Form Tugas Baru
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  // FUNGSI UNTUK MASUK KE DB
  async function handleAddTask() {
    if (!newTitle.trim()) {
      Alert.alert('Peringatan', 'Judul tugas tidak boleh kosong');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: newTitle, 
            description: newDescription, 
            status: 'todo', // default status sesuai struktur tabel
            priority: 'medium' // default priority
          }
        ])
        .select();

      if (error) throw error;

      // Jika berhasil, update list dan tutup modal
      setTasks([data[0], ...tasks]);
      setModalVisible(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err: any) {
      Alert.alert('Gagal menambah tugas', err.message);
    }
  }

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.priorityText, { color: COLORS.warning }]}>{item.priority}</Text>
        </View>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>● {item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daftar Tugas</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* MODAL UNTUK INPUT TUGAS BARU */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buat Tugas Baru</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Judul Tugas"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Deskripsi (Opsional)"
              multiline
              value={newDescription}
              onChangeText={setNewDescription}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: '#E2E8F0' }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: COLORS.textMain }}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: COLORS.primary }]} 
                onPress={handleAddTask}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Simpan ke DB</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textMain },
  addButton: { backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  taskCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  taskTitle: { fontSize: 16, fontWeight: 'bold' },
  priorityBadge: { padding: 4, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: 'bold' },
  taskDescription: { color: COLORS.textSub, marginBottom: 10 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  statusText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' }
});