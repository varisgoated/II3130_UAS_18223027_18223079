// vls-expo/src/components/KanbanCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types/supabase';

interface KanbanCardProps {
  task: Task;
  onMoveTask?: (task: Task, newStatus: 'todo' | 'in_progress' | 'done') => void;
}

const statusColors = {
    todo: '#ffcdd2',
    in_progress: '#bbdefb',
    done: '#c8e6c9',
};

const nextStatus = {
    todo: 'in_progress',
    in_progress: 'done',
    done: null, // No next status
};

export default function KanbanCard({ task, onMoveTask }: KanbanCardProps) {
  const handleMove = () => {
    const newStatus = nextStatus[task.status];
    if (newStatus && onMoveTask) {
      onMoveTask(task, newStatus as 'todo' | 'in_progress' | 'done');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: statusColors[task.status] }]}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.priority}>{task.priority}</Text>
        {nextStatus[task.status] && (
          <TouchableOpacity onPress={handleMove} style={styles.moveButton}>
            <Text style={styles.moveButtonText}>Move to {nextStatus[task.status]}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priority: {
    fontWeight: 'bold',
    color: '#555',
  },
  moveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  moveButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
