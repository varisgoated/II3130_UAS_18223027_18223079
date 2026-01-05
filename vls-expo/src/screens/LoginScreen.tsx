import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import * as Linking from 'expo-linking'; // <--- Added this import

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    setLoading(true);

    // 1. Create the URL dynamically (works for both Dev and Production)
    const redirectUrl = Linking.createURL('login');
    console.log('Redirecting to:', redirectUrl);

    // 2. Send the Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    // 3. Handle the result (Restored this logic)
    if (error) {
      Alert.alert('Error sending magic link', error.message);
    } else {
      Alert.alert('Check your email!', 'A magic link has been sent to your email address.');
    }
    setLoading(false);
  }; // <--- This closing brace was missing in your snippet

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtual Lab SISTER</Text>
      <Text style={styles.subtitle}>Sign in with a magic link</Text>
      <TextInput
        style={styles.input}
        placeholder="Your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button
        title={loading ? 'Sending...' : 'Send Magic Link'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: 'gray',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default LoginScreen;