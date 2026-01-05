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
  
  // Modals
  const [isSubmitModalVisible, setSubmitModalVisible] = useState(false);
  
  // States
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      
      // 1. Ambil session user terlebih dahulu
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // 2. CEK: Jika userId tidak ada, jangan jalankan query (cegah error UUID undefined)
      if (!userId) {
        console.log("User belum login atau session kosong");
        setTasks([]);
        return;
      }

      // 3. Jalankan query hanya jika userId valid
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId) // Sesuai kolom SQL kamu
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      // Jangan Alert setiap saat agar tidak mengganggu UI jika session transisi
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal memilih dokumen');
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedFile || !selectedTask) {
      Alert.alert('Peringatan', 'Pilih file terlebih dahulu');
      return;
    }

    try {
      setUploading(true);
      
      // Membaca file dan convert ke Base64
      const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Format JSON sesuai database UTS kamu
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
      setSubmitModalVisible(false);
      setSelectedFile(null);
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Gagal Mengumpul', err.message);
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    // Normalisasi case priority dari database (High/Medium/Low)
    const priority = item.priority?.toLowerCase();
    const pColor = priority === 'high' ? COLORS.high : priority === 'low' ? COLORS.low : COLORS.medium;

    return (
      <View style={styles.taskCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: pColor + '20' }]}>
            <Text style={[styles.priorityText, { color: pColor }]}>
              {item.priority?.toUpperCase() || 'MEDIUM'}
            </Text>
          </View>
        </View>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description || "Tidak ada deskripsi."}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'done' ? COLORS.low : COLORS.primary }]} />
            <Text style={[styles.statusText, item.status === 'done' && { color: COLORS.low }]}>
              {item.status === 'done' ? 'Selesai' : 'Perlu Dikerjakan'}
            </Text>
          </View>
          
          {item.status !== 'done' && (
            <TouchableOpacity onPress={() => { setSelectedTask(item); setSubmitModalVisible(true); }}>
              <LinearGradient colors={[COLORS.primary, '#7e22ce']} style={styles.submitBtnAction}>
                <Text style={styles.submitBtnText}>Upload</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Tampilan jika sedang loading awal
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textSub }}>Memuat tugas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tugas Saya</Text>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: COLORS.textSub }}>Tidak ada tugas ditemukan.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchTasks(); }} 
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* MODAL UPLOAD */}
        <Modal visible={isSubmitModalVisible} animationType="fade" transparent={true}>
          <View style={styles.centerOverlay}>
            <View style={styles.submitPopup}>
              <Text style={styles.popupTitle}>Upload Tugas</Text>
              <Text style={styles.subTitle}>{selectedTask?.title}</Text>
              
              <TouchableOpacity style={styles.filePicker} onPress={pickDocument}>
                <Ionicons name="document-attach-outline" size={40} color={COLORS.primary} />
                <Text style={styles.filePickerText}>
                  {selectedFile ? selectedFile.name : "Pilih File dari HP (PDF/Doc/Zip)"}
                </Text>
              </TouchableOpacity>

              <View style={styles.popupButtons}>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: '#F1F5F9' }]} 
                  onPress={() => { setSubmitModalVisible(false); setSelectedFile(null); }}
                  disabled={uploading}
                >
                  <Text>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, { backgroundColor: COLORS.primary }]} 
                  onPress={handleSubmitTask}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Kirim</Text>
                  )}
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 25 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textMain },
  taskCard: { backgroundColor: 'white', padding: 18, borderRadius: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, flex: 1, marginRight: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '900' },
  taskDescription: { color: COLORS.textSub, fontSize: 14, marginVertical: 12, lineHeight: 20 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.textSub },
  submitBtnAction: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  submitPopup: { backgroundColor: 'white', borderRadius: 25, padding: 25 },
  popupTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  subTitle: { fontSize: 14, color: COLORS.textSub, textAlign: 'center', marginBottom: 20 },
  filePicker: { borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.border, borderRadius: 15, padding: 30, alignItems: 'center', marginBottom: 20, backgroundColor: '#F8FAFC' },
  filePickerText: { marginTop: 10, color: COLORS.primary, fontWeight: '600', textAlign: 'center' },
  popupButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});