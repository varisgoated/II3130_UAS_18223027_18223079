// vls-expo/src/screens/CTFDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function CTFDetailScreen({ route, navigation }: any) {
  const { challenge } = route.params;
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    checkIfSolved();
  }, []);

  const checkIfSolved = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('ctf_submissions')
      .select('*')
      .eq('challenge_id', challenge.id)
      .eq('user_id', session.user.id)
      .eq('correct', true)
      .single();

    if (data) setIsSolved(true);
  };

  const handleSubmit = async () => {
    if (!flag.trim()) {
      const msg = 'Masukkan flag terlebih dahulu!';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Peringatan', msg);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sesi berakhir, silakan login kembali.');

      const isCorrect = flag.trim() === challenge.flag;

      // 1. Simpan Submisi
      const { error: subError } = await supabase
        .from('ctf_submissions')
        .insert([{
          challenge_id: challenge.id,
          user_id: session.user.id,
          flag_submitted: flag.trim(),
          correct: isCorrect
        }]);

      if (subError) throw subError;

      if (isCorrect) {
        // 2. Update Score di Leaderboard jika benar
        // Asumsi kamu punya fungsi RPC atau increment score di tabel leaderboard
        await supabase.rpc('increment_score', { 
          user_id_param: session.user.id, 
          points: challenge.points 
        });

        const successMsg = `Selamat! Flag benar. +${challenge.points} poin.`;
        Platform.OS === 'web' ? window.alert(successMsg) : Alert.alert('Berhasil', successMsg);
        setIsSolved(true);
      } else {
        const failMsg = 'Flag salah, coba lagi!';
        Platform.OS === 'web' ? window.alert(failMsg) : Alert.alert('Gagal', failMsg);
      }
    } catch (err: any) {
      Platform.OS === 'web' ? window.alert(err.message) : Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setFlag('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{challenge.title}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.pointBadge}>
            <Text style={styles.pointText}>{challenge.points} pts</Text>
          </View>
          <Text style={styles.categoryText}>{challenge.category}</Text>
        </View>

        <Text style={styles.description}>{challenge.description}</Text>
        
        {challenge.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Petunjuk:</Text>
            <Text style={styles.hintText}>{challenge.hint}</Text>
          </View>
        )}

        {isSolved ? (
          <View style={styles.solvedBox}>
            <Ionicons name="checkmark-circle" size={40} color="#10b981" />
            <Text style={styles.solvedText}>Tantangan Selesai</Text>
          </View>
        ) : (
          <View style={styles.actionBox}>
            <TextInput
              style={styles.input}
              placeholder="VLS{flag_anda_disini}"
              value={flag}
              onChangeText={setFlag}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Flag</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  pointBadge: { backgroundColor: '#4f46e5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pointText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  categoryText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  description: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 20 },
  hintBox: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, marginBottom: 25 },
  hintTitle: { fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  hintText: { color: '#64748b', fontStyle: 'italic' },
  solvedBox: { alignItems: 'center', padding: 20, backgroundColor: '#dcfce7', borderRadius: 15 },
  solvedText: { color: '#10b981', fontWeight: 'bold', marginTop: 10 },
  actionBox: { marginTop: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
  submitBtn: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});