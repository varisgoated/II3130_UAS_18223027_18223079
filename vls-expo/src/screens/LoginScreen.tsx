import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Image, KeyboardAvoidingView, ScrollView, Animated
} from 'react-native';
import { supabase } from '../lib/supabaseClient';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animasi Value
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sent) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [sent]);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Mohon masukkan email Anda.');
      return;
    }
    
    setFormLoading(true);
    setError(null);

    try {
      let redirectUrl = '';
      if (Platform.OS === 'web') {
        redirectUrl = typeof window !== 'undefined' ? window.location.origin : ''; 
      } else {
        redirectUrl = Linking.createURL('login'); 
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl, 
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      setSent(true);
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
      if (Platform.OS !== 'web') {
        Alert.alert('Login Error', err.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../assets/appicon.png')} 
            style={styles.logo} // Ukuran diubah di styles
            resizeMode="contain"
          />
          {/* Perubahan Text: SISTER -> Sister */}
          <Text style={styles.appName}>Virtual Lab Sister 23</Text>
          <Text style={styles.appDesc}>Platform Asisten & Praktikum Sistem Terdistribusi</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {sent ? (
            <View style={styles.centerContent}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
                <Ionicons name="checkmark-circle" size={100} color="#16a34a" />
              </Animated.View>
              
              <Text style={styles.successTitle}>Email Terkirim!</Text>
              <Text style={styles.successText}>
                Cek inbox email Anda ({email}). Klik link tersebut untuk masuk.
              </Text>
              <TouchableOpacity onPress={() => setSent(false)} style={styles.textLink}>
                <Text style={styles.linkText}>Bukan email Anda? Ulangi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.formTitle}>Masuk ke Akun</Text>
              <Text style={styles.formSubtitle}>Gunakan email mahasiswa/asisten Anda</Text>

              <TextInput
                style={styles.input}
                placeholder="mahasiswa@std.stei.itb.ac.id"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!formLoading}
              />

              <TouchableOpacity
                style={[styles.button, formLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Kirim Link Login</Text>
                )}
              </TouchableOpacity>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Footer: Tahun 2026 */}
        <Text style={styles.footerText}>© 2026 Laboratorium Sistem Terdistribusi ITB</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { 
    width: 200, // DIPERBESAR (sebelumnya 80/100)
    height: 100, // DIPERBESAR
  },
  appName: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  appDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 300 },
  card: { width: '100%', maxWidth: 360, backgroundColor: 'white', borderRadius: 16, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 8, textAlign: 'center' },
  formSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, marginBottom: 20, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb' },
  button: { width: '100%', height: 50, backgroundColor: '#4f46e5', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  errorContainer: { marginTop: 12, padding: 12, backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 8 },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  centerContent: { alignItems: 'center', paddingVertical: 10 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#16a34a', marginBottom: 12, marginTop: 16 },
  successText: { fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  textLink: { padding: 8 },
  linkText: { color: '#4f46e5', fontSize: 14, fontWeight: '600' },
  footerText: { marginTop: 40, fontSize: 12, color: '#9ca3af' },
});

export default LoginScreen;