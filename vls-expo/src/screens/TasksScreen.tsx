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
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

// Definisi tipe data sesuai lib/supabaseTypes.ts
export interface Task {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
}

const COLORS = {
  primary: '#4F46E5', // Indigo dari landing page
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  border: '#E2E8F0',
  // Warna Prioritas Sesuai Permintaan
  high: '#EF4444',   // Merah
  medium: '#F59E0B', // Kuning/Amber
  low: '#10B981',    // Hijau
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

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
      setRefreshing(false);
    }
  }

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Peringatan', 'Judul tugas tidak boleh kosong');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Silakan login terlebih dahulu');

      // Insert data sesuai schema API tasks/create
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: newTitle, 
            description: newDescription, 
            status: 'todo', // Default status
            priority: newPriority,
            user_id: user.id 
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setTasks([data[0], ...tasks]);
        setModalVisible(false);
        resetForm();
      }
    } catch (err: any) {
      Alert.alert('Gagal Menambah Tugas', err.message);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
      default: return COLORS.textSub;
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.taskDescription} numberOfLines={3}>
        {item.description || 'Tidak ada deskripsi'}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>● {item.status.replace('_', ' ')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daftar Tugas</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <LinearGradient colors={['#4f46e5', '#7e22ce']} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Tambah</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tugas untuk ditampilkan</Text>}
          />
        )}

        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Buat Tugas Baru</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Judul Tugas" 
                value={newTitle} 
                onChangeText={setNewTitle} 
              />
              <TextInput 
                style={[styles.input, { height: 80 }]} 
                placeholder="Deskripsi (Opsional)" 
                multiline 
                value={newDescription} 
                onChangeText={setNewDescription} 
              />

              <Text style={styles.label}>Tingkat Prioritas:</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity 
                    key={p}
                    style={[
                      styles.priorityOption, 
                      { borderColor: getPriorityColor(p) },
                      newPriority === p && { backgroundColor: getPriorityColor(p) }
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={[
                      styles.priorityOptionText, 
                      { color: getPriorityColor(p) },
                      newPriority === p && { color: '#fff' }
                    ]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: '#F1F5F9' }]} 
                  onPress={() => { setModalVisible(false); resetForm(); }}
                >
                  <Text style={{ color: COLORS.textMain }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: COLORS.primary }]} 
                  onPress={handleAddTask}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Simpan Tugas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textMain },
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  taskCard: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 18, 
    marginBottom: 16, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, flex: 1, marginRight: 10 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '900' },
  taskDescription: { color: COLORS.textSub, fontSize: 14, marginVertical: 12, lineHeight: 20 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  statusText: { fontSize: 12, fontWeight: '800', color: COLORS.primary, textTransform: 'capitalize' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25 
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  input: { 
    backgroundColor: '#F8FAFC',
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 18,
    fontSize: 15
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 12, color: COLORS.textMain },
  prioritySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  priorityOption: { 
    flex: 0.3, 
    paddingVertical: 12, 
    borderWidth: 2, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  priorityOptionText: { fontSize: 11, fontWeight: '800' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 0.48, padding: 16, borderRadius: 14, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.textSub, marginTop: 40, fontSize: 16 }
});