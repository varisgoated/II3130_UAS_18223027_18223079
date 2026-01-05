import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface NewEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const courses = [
  "Jaringan Komputer", "Sistem Operasi", "Sistem dan Arsitektur Komputer",
  "Organisasi dan Arsitektur komputer", "Teknologi Platform",
  "Sistem Paralel dan Terdistribusi", "Lainnya"
];

const categories = [
  "Deadline Mahasiswa", "Tugas Asisten", "Praktikum", "Rapat", "Lainnya"
];

export default function NewEventModal({ visible, onClose, onSubmit }: NewEventModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [course, setCourse] = useState(courses[0]);
  const [assignee, setAssignee] = useState('');

  // Date & Time States
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hour, setHour] = useState('09'); // Default jam
  const [minute, setMinute] = useState('00'); // Default menit

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (value: string, type: 'hour' | 'minute') => {
    // Hanya izinkan angka
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (type === 'hour') {
      // Validasi jam 0-23
      if (parseInt(numericValue) > 23) return; 
      setHour(numericValue);
    } else {
      // Validasi menit 0-59
      if (parseInt(numericValue) > 59) return;
      setMinute(numericValue);
    }
  };

  const handleSubmit = async () => {
    if (!title || !hour || !minute) {
      Alert.alert('Error', 'Mohon isi nama event dan waktu dengan lengkap.');
      return;
    }

    setLoading(true);
    try {
      // Gabungkan Date + Manual Time menjadi ISO String
      const finalDate = new Date(date);
      finalDate.setHours(parseInt(hour) || 0);
      finalDate.setMinutes(parseInt(minute) || 0);
      finalDate.setSeconds(0);

      await onSubmit({
        title,
        category,
        course,
        start_time: finalDate.toISOString(),
        assignee
      });

      // Reset form
      setTitle('');
      setHour('09');
      setMinute('00');
      setAssignee('');
    } catch (e) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tambah Event Baru</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {/* Nama Event */}
            <Text style={styles.label}>Nama Event</Text>
            <TextInput 
              style={styles.input} 
              placeholder="cth: Rapat Koordinasi" 
              value={title} 
              onChangeText={setTitle} 
            />

            {/* Kategori (Chips) */}
            <Text style={styles.label}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {categories.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Mata Kuliah (Chips) */}
            <Text style={styles.label}>Mata Kuliah</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {courses.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.chip, course === c && styles.chipActive]}
                  onPress={() => setCourse(c)}
                >
                  <Text style={[styles.chipText, course === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* WAKTU MULAI (CUSTOM INPUT) */}
            <Text style={styles.label}>Waktu Mulai</Text>
            <View style={styles.dateTimeRow}>
              
              {/* 1. Date Picker Button */}
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </TouchableOpacity>

              {/* 2. Manual Time Inputs (HH : MM) */}
              <View style={styles.timeContainer}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="HH"
                  value={hour}
                  onChangeText={(v) => handleTimeChange(v, 'hour')}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="MM"
                  value={minute}
                  onChangeText={(v) => handleTimeChange(v, 'minute')}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>
            </View>

            {/* Native Date Picker Modal (Hidden until clicked) */}
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}

            {/* Ditugaskan Ke */}
            <Text style={styles.label}>Ditugaskan Ke (Opsional)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="cth: Budi Santoso" 
              value={assignee} 
              onChangeText={setAssignee} 
            />
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Tambah Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeText: {
    fontSize: 20,
    color: '#9ca3af',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  chipText: {
    fontSize: 12,
    color: '#374151',
  },
  chipTextActive: {
    color: 'white',
  },
  // DATE TIME STYLES
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeInput: {
    width: 50,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#fff',
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});