import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CalendarEvent } from '../types/supabase';

// Warna kategori sesuai UTS
const categoryColors: { [key: string]: { bg: string, text: string } } = {
  "Deadline Mahasiswa": { bg: '#fee2e2', text: '#991b1b' },
  "Tugas Asisten": { bg: '#dbeafe', text: '#1e40af' },
  "Praktikum": { bg: '#dcfce7', text: '#166534' },
  "Rapat": { bg: '#f3e8ff', text: '#6b21a8' },
  "Lainnya": { bg: '#f3f4f6', text: '#1f2937' },
};

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// PERBAIKAN LEBAR:
// Screen Width
// - 40 (Padding Screen kiri kanan 20+20)
// - 24 (Padding Calendar Container kiri kanan 12+12)
// - 2 (Safety margin untuk border rounding)
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_WIDTH = (SCREEN_WIDTH - 66) / 7; 

interface CalendarViewProps {
  month: number;
  year: number;
  events: CalendarEvent[];
}

export default function CalendarView({ month, year, events }: CalendarViewProps) {
  
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let days: { key: string; date: Date | null; events: CalendarEvent[] }[] = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ key: `empty-${i}`, date: null, events: [] });
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const eventsForDay = events.filter(e => {
        const eventDate = new Date(e.start_time);
        return eventDate.getDate() === day &&
               eventDate.getMonth() === month &&
               eventDate.getFullYear() === year;
      });
      days.push({ key: `day-${day}`, date, events: eventsForDay });
    }
    return days;
  }, [month, year, events]);

  return (
    <View style={styles.container}>
      {/* Header Days */}
      <View style={styles.row}>
        {DAY_NAMES.map(day => (
          <View key={day} style={styles.headerCell}>
            <Text style={styles.headerText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {calendarGrid.map(cell => (
          <View key={cell.key} style={[styles.cell, !cell.date && styles.emptyCell]}>
            {cell.date && (
              <>
                <Text style={styles.dateText}>{cell.date.getDate()}</Text>
                <View style={styles.eventContainer}>
                  {cell.events.slice(0, 3).map((event, index) => { 
                    const colors = categoryColors[event.category] || categoryColors.Lainnya;
                    return (
                      <View 
                        key={index} 
                        style={[styles.eventDot, { backgroundColor: colors.text }]} 
                      />
                    );
                  })}
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12, // Disesuaikan dengan perhitungan CELL_WIDTH
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    // Pastikan header juga mengikuti lebar grid
    justifyContent: 'flex-start',
  },
  headerCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // alignContent: 'flex-start' penting agar tidak ada gap aneh
    alignContent: 'flex-start',
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH, // Kotak persegi
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    paddingTop: 4,
  },
  emptyCell: {
    backgroundColor: '#f9fafb',
    borderWidth: 0,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  eventContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});