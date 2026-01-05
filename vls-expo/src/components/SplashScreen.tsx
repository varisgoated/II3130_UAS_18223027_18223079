import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Pastikan appicon.png ada di folder assets di root project */}
      <Image 
        source={require('../../assets/appicon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#4f46e5" style={styles.spinner} />
      <Text style={styles.text}>Memuat Virtual Lab...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Background putih bersih
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#6b7280', // Gray-500
    fontWeight: '500',
  },
});

export default SplashScreen;