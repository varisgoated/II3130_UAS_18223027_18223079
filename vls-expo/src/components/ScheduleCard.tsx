// vls-expo/src/components/ScheduleCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#4F46E5',
  card: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  accent: '#EEF2FF',
  background: '#F8FAFC',
};

export const ScheduleCard = ({ item }: { item: any }) => (
  <View style={styles.scheduleCard}>
    <View style={styles.timeContainer}>
      <Text style={styles.timeText}>{item.time || '--:--'}</Text>
      <View style={styles.verticalLine} />
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.scheduleTitle}>{item.title}</Text>
      <View style={styles.dateBadge}>
        <Text style={styles.scheduleDate}>
          📅 {new Date(item.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
          })}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scheduleCard: { 
    flexDirection: 'row',
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 16,
    elevation: 3,
  },
  timeContainer: { alignItems: 'center', width: 50 },
  timeText: { fontWeight: '800', color: COLORS.primary, fontSize: 15 },
  verticalLine: { width: 3, flex: 1, backgroundColor: COLORS.accent, marginTop: 8, borderRadius: 2 },
  contentContainer: { flex: 1, marginLeft: 15 },
  scheduleTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  dateBadge: { backgroundColor: COLORS.background, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scheduleDate: { fontSize: 13, color: COLORS.textSub, fontWeight: '500' },
});