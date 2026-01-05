// vls-expo/src/components/KanbanColumn.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Task } from '../types/supabase';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onMoveTask: (task: Task, newStatus: 'todo' | 'inprogress' | 'done') => void;
}

export default function KanbanColumn({ title, tasks, onMoveTask }: KanbanColumnProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => <KanbanCard task={item} onMoveTask={onMoveTask} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
