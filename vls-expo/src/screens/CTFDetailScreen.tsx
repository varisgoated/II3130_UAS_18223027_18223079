import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto'; // Library Hashing Expo

export default function CTFDetailScreen({ route, navigation }: any) {
  const challenge = route.params?.challenge || null;
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Error', 'Mohon masukkan flag terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      // 1. Cek User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      // 2. Ambil Hash Asli dari Database (Logika UTS)
      // Kita perlu mengambil ulang data challenge untuk memastikan hashnya ada/aman
      const { data: challengeData, error: fetchError } = await supabase
        .from('ctf_challenges')
        .select('flag_hash')
        .eq('id', challenge.id)
        .single();

      if (fetchError || !challengeData) throw new Error('Gagal mengambil data validasi challenge.');

      // 3. Hash Input User (SHA-256) - Menggantikan 'crypto' nodejs di UTS
      const submittedFlag = flag.trim();
      const submittedHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        submittedFlag
      );

      // 4. Bandingkan Hash
      const isCorrect = challengeData.flag_hash === submittedHash;

      // 5. Simpan Submission ke Database (Logika UTS)
      const { error: insertError } = await supabase
        .from('ctf_submissions')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          submitted_flag: submittedHash, // Kita simpan hash-nya saja demi keamanan
          correct: isCorrect,
        });

      if (insertError) throw insertError;

      // 6. Update Poin di Leaderboard (Opsional/Jika belum otomatis via trigger)
      // Di UTS ini biasanya ditangani trigger database, tapi kita biarkan dulu.

      // 7. Feedback UI
      if (isCorrect) {
        Alert.alert('🎉 Benar!', `Selamat! Flag valid. Anda mendapatkan ${challenge.points} poin.`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('❌ Salah', 'Flag tidak cocok. Coba lagi!');
      }

    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Terjadi kesalahan saat submit.');
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