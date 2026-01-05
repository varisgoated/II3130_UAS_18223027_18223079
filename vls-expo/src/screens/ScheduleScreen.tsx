import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl 
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { CalendarEvent } from '../types/supabase';
import CalendarView from '../components/CalendarView';
import NewEventModal from '../components/NewEventModal';

const courses = [
  "Semua Mata Kuliah",
  "Jaringan Komputer",
  "Sistem Operasi",
  "Sistem dan Arsitektur Komputer",
  "Organisasi dan Arsitektur komputer",
  "Teknologi Platform",
  "Sistem Paralel dan Terdistribusi",
  "Lainnya"
];

// Warna Kategori (Sesuai UTS)
const categoryColors: { [key: string]: { bg: string, text: string } } = {
  "Deadline Mahasiswa": { bg: '#fee2e2', text: '#991b1b' }, // red-100, red-800
  "Tugas Asisten": { bg: '#dbeafe', text: '#1e40af' },      // blue-100, blue-800
  "Praktikum": { bg: '#dcfce7', text: '#166534' },          // green-100, green-800
  "Rapat": { bg: '#f3e8ff', text: '#6b21a8' },              // purple-100, purple-800
  "Lainnya": { bg: '#f3f4f6', text: '#1f2937' },            // gray-100, gray-800
};

export default function ScheduleScreen() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('Semua Mata Kuliah');
  const [currentDate, setCurrentDate] = useState(new Date()); 

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAllEvents(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      const newEvent = {
        title: formData.title,
        category: formData.category,
        course: formData.course,
        start_time: formData.start_time,
        assignee: formData.assignee || null,
        created_by: user.id,
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert(newEvent);

      if (error) throw error;
      
      setModalVisible(false);
      Alert.alert('Success', 'Event created successfully');
      fetchEvents();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const filteredEvents = useMemo(() => {
    if (selectedCourse === 'Semua Mata Kuliah') {
      return allEvents;
    }
    return allEvents.filter(event => event.course === selectedCourse);
  }, [allEvents, selectedCourse]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter(event => new Date(event.start_time) >= now)
      .slice(0, 5);
  }, [filteredEvents]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Penjadwalan</Text>
          <Text style={styles.subtitle}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {courses.map(course => (
            <TouchableOpacity
              key={course}
              onPress={() => setSelectedCourse(course)}
              style={[
                styles.filterChip,
                selectedCourse === course && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedCourse === course && styles.filterTextActive
              ]}>
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEvents} />}
        showsVerticalScrollIndicator={false}
      >
        <CalendarView 
          month={currentDate.getMonth()} 
          year={currentDate.getFullYear()} 
          events={filteredEvents} 
        />

        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Agenda Mendatang</Text>
          {upcomingEvents.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada agenda mendatang</Text>
          ) : (
            upcomingEvents.map(event => {
              // Ambil warna berdasarkan kategori (default ke Lainnya jika tidak ada)
              const colors = categoryColors[event.category] || categoryColors['Lainnya'];
              
              return (
                <View key={event.id} style={styles.eventCard}>
                  {/* Badge Kategori */}
                  <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.categoryText, { color: colors.text }]}>
                      {event.category}
                    </Text>
                  </View>
                  
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  <Text style={styles.eventDate}>
                    {new Date(event.start_time).toLocaleDateString('id-ID', { 
                      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                    })}
                  </Text>
                  
                  {/* Mata Kuliah (Mengikuti Warna Kategori) */}
                  <Text style={[styles.eventCourse, { color: colors.text }]}>
                    {event.course}
                  </Text>
                  
                  {event.assignee && (
                    <Text style={styles.eventAssignee}>Oleh: {event.assignee}</Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <NewEventModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleCreateEvent} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    height: 50,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginLeft: 4,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90, // Ruang extra agar tidak tertutup navbar
  },
  upcomingSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 10,
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventCourse: {
    fontSize: 12,
    // Warna di-override via inline style (menggunakan warna kategori)
    fontWeight: '600',
    marginBottom: 2,
  },
  eventAssignee: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});