// vls-expo/src/screens/KanbanScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Task } from '../types/supabase';
import KanbanColumn from '../components/KanbanColumn';

export default function KanbanScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      // No need to set loading to true here, to avoid screen flicker on refresh
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }

  const handleMoveTask = async (task: Task, newStatus: 'todo' | 'inprogress' | 'done') => {
    // Optimistic UI update
    const originalTasks = tasks;
    setTasks(currentTasks =>
      currentTasks.map(t => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      Alert.alert('Error', 'Failed to move task. Please try again.');
      console.error('Error moving task:', error);
      // Revert UI on failure
      setTasks(originalTasks);
    }
    // No need to call fetchTasks() again due to optimistic update
  };

  const { todoTasks, inprogressTasks, doneTasks } = useMemo(() => {
    return {
      todoTasks: tasks.filter(t => t.status === 'todo'),
      inprogressTasks: tasks.filter(t => t.status === 'inprogress'),
      doneTasks: tasks.filter(t => t.status === 'done'),
    };
  }, [tasks]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Kanban Board...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={styles.board}
      showsHorizontalScrollIndicator={false}
    >
      <KanbanColumn title="To Do" tasks={todoTasks} onMoveTask={handleMoveTask} />
      <KanbanColumn title="In Progress" tasks={inprogressTasks} onMoveTask={handleMoveTask} />
      <KanbanColumn title="Done" tasks={doneTasks} onMoveTask={handleMoveTask} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#e9e9ef',
  },
  board: {
    padding: 10,
    flexDirection: 'row',
  },
  errorText: {
    color: 'red',
  },
});
