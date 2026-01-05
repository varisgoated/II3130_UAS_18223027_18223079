// vls-expo/src/screens/CTFDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

export default function CTFDetailScreen({ route, navigation }: any) {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState<any>(null);
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, []);

  async function fetchDetail() {
    const { data } = await supabase.from('ctf_challenges').select('*').eq('id', challengeId).single();
    setChallenge(data);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!flag) return Alert.alert('Error', 'Masukkan flag!');
    setSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Menggunakan RPC sesuai kode asli Anda, pastikan p_user_id dikirim jika dibutuhkan DB
      const { data, error } = await supabase.rpc('submit_flag', {
        p_challenge_id: challengeId,
        p_submitted_flag: flag.trim(),
        p_user_id: user?.id
      });

      if (error) throw error;

      if (data) {
        Alert.alert('🎉 Berhasil!', 'Flag benar! Poin telah ditambahkan.', [
          { text: 'Lanjut', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('❌ Gagal', 'Flag salah. Coba lagi!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerCard}>
        <Text style={styles.category}>{challenge.category}</Text>
        <Text style={styles.title}>{challenge.title}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>💎 {challenge.points} Points</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Deskripsi</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{challenge.description}</Text>
      </View>

      <Text style={styles.sectionTitle}>Submit Flag</Text>
      <TextInput
        style={styles.input}
        placeholder="vls_flag{...}"
        value={flag}
        onChangeText={setFlag}
        autoCapitalize="none"
      />

      <TouchableOpacity disabled={submitting} onPress={handleSubmit}>
        <LinearGradient colors={['#4f46e5', '#7e22ce']} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>{submitting ? 'Checking...' : 'Submit Flag'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  headerCard: { backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center', marginBottom: 25, elevation: 2 },
  category: { color: '#64748B', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 15 },
  pointsBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  pointsText: { color: '#4F46E5', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 10, marginLeft: 5 },
  descriptionContainer: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 25 },
  description: { fontSize: 15, color: '#475569', lineHeight: 24 },
  input: { backgroundColor: 'white', borderRadius: 15, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, marginBottom: 20 },
  submitBtn: { padding: 18, borderRadius: 15, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});