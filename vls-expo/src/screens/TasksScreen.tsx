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
  Alert,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

// Tipe data disesuaikan dengan lib/supabaseTypes.ts
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
      if (!user) throw new Error('User tidak ditemukan');

      // Menambahkan tugas dengan prioritas pilihan user
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: newTitle, 
            description: newDescription, 
            status: 'todo',
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
      Alert.alert('Gagal', err.message);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return COLORS.danger;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
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
      <Text style={styles.taskDescription}>{item.description || 'Tidak ada deskripsi'}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>● {item.status}</Text>
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

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />}
          ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Tidak ada tugas</Text> : null}
        />

        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tugas Baru</Text>
              
              <TextInput style={styles.input} placeholder="Judul Tugas" value={newTitle} onChangeText={setNewTitle} />
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Deskripsi" multiline value={newDescription} onChangeText={setNewDescription} />

              <Text style={styles.label}>Pilih Prioritas:</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity 
                    key={p}
                    style={[
                      styles.priorityOption, 
                      newPriority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) }
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={[styles.priorityOptionText, newPriority === p && { color: '#fff' }]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#E2E8F0' }]} onPress={() => setModalVisible(false)}>
                  <Text>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={handleAddTask}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Simpan</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textMain },
  addButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, flex: 1 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '800' },
  taskDescription: { color: COLORS.textSub, marginVertical: 10 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 10, color: COLORS.textMain },
  prioritySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  priorityOption: { flex: 0.3, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, alignItems: 'center' },
  priorityOptionText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSub },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.textSub, marginTop: 20 }
});