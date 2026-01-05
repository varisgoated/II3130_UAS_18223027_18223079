// vls-expo/src/screens/TasksScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Modal, Alert, RefreshControl, SafeAreaView 
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
  const [isSubmitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      let query = supabase.from('tasks').select('*');
      
      // Jika user login, kita filter tugas mereka. 
      // Jika bypass (session null), kita munculkan semua buat ngetes.
      if (session?.user?.id) {
        query = query.eq('assignee_id', session.user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      Alert.alert("Error", "Gagal memuat tugas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // FUNGSI TUTUP MODAL & RESET STATE (PENTING BIAR GAK NYANGKUT)
  const handleCloseModal = () => {
    setSubmitModalVisible(false);
    setSelectedFile(null);
    setSelectedTask(null);
    setUploading(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal pilih file');
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedFile || !selectedTask) {
      Alert.alert('Peringatan', 'Pilih file dulu!');
      return;
    }

    try {
      setUploading(true);
      
      // Mengonversi file ke Base64 (Proses ini bisa lambat tergantung ukuran file)
      const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

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

      Alert.alert('Berhasil', 'Tugas berhasil diunggah!');
      handleCloseModal(); // Reset semua di sini
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
        <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.statusText, item.status === 'done' && { color: COLORS.low }]}>
            ● {item.status === 'done' ? 'Selesai' : 'Belum Selesai'}
          </Text>
          
          {item.status !== 'done' && (
            <TouchableOpacity onPress={() => { setSelectedTask(item); setSubmitModalVisible(true); }}>
              <LinearGradient colors={[COLORS.primary, '#7e22ce']} style={styles.submitBtnAction}>
                <Text style={styles.submitBtnText}>Upload File</Text>
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
        <Text style={styles.headerTitle}>Tugas Saya</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />}
            ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tugas.</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Modal visible={isSubmitModalVisible} animationType="fade" transparent={true}>
          <View style={styles.centerOverlay}>
            <View style={styles.submitPopup}>
              <Text style={styles.popupTitle}>Upload: {selectedTask?.title}</Text>
              
              <TouchableOpacity 
                style={[styles.filePicker, selectedFile && { borderColor: COLORS.low, backgroundColor: '#F0FDF4' }]} 
                onPress={pickDocument}
                disabled={uploading}
              >
                <Ionicons 
                  name={selectedFile ? "checkmark-circle" : "cloud-upload-outline"} 
                  size={32} 
                  color={selectedFile ? COLORS.low : COLORS.primary} 
                />
                <Text style={[styles.filePickerText, selectedFile && { color: COLORS.low }]}>
                  {selectedFile ? selectedFile.name : "Klik untuk pilih file"}
                </Text>
              </TouchableOpacity>

              <View style={styles.popupButtons}>
                <TouchableOpacity 
                  style={styles.btnBatal} 
                  onPress={handleCloseModal}
                  disabled={uploading}
                >
                  <Text>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btnKirim, uploading && { opacity: 0.7 }]} 
                  onPress={handleSubmitTask}
                  disabled={uploading}
                >
                  {uploading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Kirim</Text>}
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
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  taskCard: { backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: 'bold' },
  taskDescription: { color: COLORS.textSub, marginVertical: 10, fontSize: 13 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSub },
  submitBtnAction: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 25 },
  submitPopup: { backgroundColor: 'white', borderRadius: 25, padding: 25 },
  popupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filePicker: { borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.border, borderRadius: 15, padding: 20, alignItems: 'center' },
  filePickerText: { marginTop: 10, fontSize: 13, color: COLORS.textSub, textAlign: 'center' },
  popupButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnBatal: { flex: 0.45, padding: 15, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  btnKirim: { flex: 0.45, padding: 15, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 30, color: COLORS.textSub }
});