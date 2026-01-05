import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function CTFDetailScreen({ route, navigation }: any) {
  // Fallback aman jika params kosong
  const challenge = route.params?.challenge || null;
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);

  // Jika data challenge tidak ada (error navigasi), tampilkan loading/error state
  if (!challenge) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#64748b' }}>Data challenge tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={{ color: '#4f46e5', fontWeight: 'bold' }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!flag.trim()) {
      Alert.alert('Error', 'Please enter a flag');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      // Menggunakan RPC 'submit_flag'
      const { data, error } = await supabase.rpc('submit_flag', {
        p_challenge_id: challenge.id,
        p_flag: flag.trim(),
        p_user_id: user.id
      });

      if (error) throw error;

      if (data && data.success) {
        Alert.alert('🎉 Correct!', `Selamat! Anda mendapatkan ${challenge.points} poin.`);
        navigation.goBack();
      } else {
        Alert.alert('❌ Incorrect', 'Flag salah. Coba lagi!');
      }

    } catch (err: any) {
      if (err.message.includes('function') || err.code === 'PGRST202') {
         Alert.alert('Error', 'Sistem validasi flag belum siap di database.');
      } else {
         Alert.alert('Result', err.message || 'Incorrect Flag');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{challenge.category}</Text>
          </View>
          <View style={styles.diffPointRow}>
             <Text style={styles.diffText}>{challenge.difficulty} • </Text>
             <Ionicons name="diamond" size={14} color="#4f46e5" />
             <Text style={styles.pointsText}> {challenge.points} pts</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{challenge.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{challenge.description}</Text>
      </View>

      {/* Submission Area */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Submit Flag</Text>
        <TextInput 
          style={styles.input} 
          placeholder="FLAG{...}" 
          placeholderTextColor="#94a3b8"
          value={flag} 
          onChangeText={setFlag}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Flag 🚀</Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc', flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  diffPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diffText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});