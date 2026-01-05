// vls-expo/src/screens/TasksScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, TextInput, Modal, Alert, RefreshControl, 
  SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#4F46E5',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  border: '#E2E8F0',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal States
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isSubmitModalVisible, setSubmitModalVisible] = useState(false);

  // Form Tambah Tugas
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  // State Submit File
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

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
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // FUNGSI BUAT TUGAS BARU
  const handleCreateTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Peringatan', 'Judul tugas harus diisi');
      return;
    }

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          status: 'todo',
          assignee_id: session?.user?.id,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      Alert.alert('Berhasil', 'Tugas baru telah ditambahkan');
      setAddModalVisible(false);
      setNewTitle('');
      setNewDescription('');
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Gagal', err.message);
    } finally {
      setUploading(false);
    }
  };

  // FUNGSI PILIH FILE
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled && result.assets) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal memilih file');
    }
  };

  // FUNGSI SUBMIT TUGAS (UPLOAD) - FIX UNTUK WEB & MOBILE
  const handleSubmitTask = async () => {
    if (!selectedFile || !selectedTask) return;

    try {
      setUploading(true);
      let base64Data = "";

      if (Platform.OS === 'web') {
        // Logika khusus Web menggunakan FileReader standar
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Ambil data base64 setelah header data:
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Logika Mobile menggunakan FileSystem
        base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const fileJson = {
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
        size: selectedFile.size || 0,
        data: `data:${selectedFile.mimeType};base64,${base64Data}`
      };

      const { error } = await supabase
        .from('tasks')
        .update({ 
          file_url: JSON.stringify(fileJson),
          status: 'done' 
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      Alert.alert('Berhasil', 'Tugas berhasil dikumpulkan!');
      setSubmitModalVisible(false);
      setSelectedFile(null);
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Gagal', err.message);
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const p = item.priority?.toLowerCase();
    const pColor = p === 'high' ? COLORS.high : p === 'low' ? COLORS.low : COLORS.medium;

    return (
      <View style={styles.taskCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: pColor + '20' }]}>
            <Text style={[styles.priorityText, { color: pColor }]}>{item.priority?.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.taskDesc}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.statusText, item.status === 'done' && { color: COLORS.low }]}>
            ● {item.status === 'done' ? 'Selesai' : 'Belum Selesai'}
          </Text>
          {item.status !== 'done' && (
            <TouchableOpacity onPress={() => { setSelectedTask(item); setSubmitModalVisible(true); }}>
              <LinearGradient colors={[COLORS.primary, '#7e22ce']} style={styles.btnAction}>
                <Text style={styles.btnActionText}>Upload</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Tugas Saya</Text>
          <TouchableOpacity onPress={() => setAddModalVisible(true)}>
            <LinearGradient colors={[COLORS.primary, '#7e22ce']} style={styles.btnAdd}>
              <Ionicons name="add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Belum ada tugas.</Text>}
        />

        {/* MODAL TAMBAH TUGAS */}
        <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Buat Tugas Baru</Text>
              <TextInput style={styles.input} placeholder="Judul Tugas" value={newTitle} onChangeText={setNewTitle} />
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Deskripsi" multiline value={newDescription} onChangeText={setNewDescription} />
              
              <Text style={styles.label}>Prioritas:</Text>
              <View style={styles.prioritySelector}>
                {['Low', 'Medium', 'High'].map((p) => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.pOption, newPriority === p && { backgroundColor: COLORS.primary }]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text style={{ color: newPriority === p ? 'white' : COLORS.textMain }}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setAddModalVisible(false)}><Text>Batal</Text></TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmit} onPress={handleCreateTask}>
                  {uploading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white' }}>Simpan</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* MODAL UPLOAD FILE */}
        <Modal visible={isSubmitModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Kumpulkan Tugas</Text>
              <TouchableOpacity style={styles.picker} onPress={pickDocument}>
                <Ionicons name="document-outline" size={32} color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>{selectedFile ? selectedFile.name : "Pilih File"}</Text>
              </TouchableOpacity>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setSubmitModalVisible(false)}><Text>Batal</Text></TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmitTask}>
                  {uploading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white' }}>Kirim</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textMain },
  btnAdd: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  taskCard: { backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: 'bold' },
  taskDesc: { color: COLORS.textSub, marginVertical: 10, fontSize: 13 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { fontSize: 11, fontWeight: 'bold', color: COLORS.textSub },
  btnAction: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnActionText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  prioritySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pOption: { flex: 0.3, padding: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, alignItems: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  btnCancel: { flex: 0.45, padding: 12, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 10 },
  btnSubmit: { flex: 0.45, padding: 12, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10 },
  picker: { borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.border, borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 20 }
});