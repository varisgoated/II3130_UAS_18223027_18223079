import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking'; // Import Linking

// Components & Navigators
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // 1. Cek sesi saat aplikasi dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user.id);
      setLoading(false);
    });

    // 2. Dengarkan perubahan sesi (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    // 3. (BARU) Dengarkan Deep Link dari Email
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      console.log("🔗 Incoming URL:", url);
      
      // Jika URL mengandung token (biasanya di hash fragment #access_token=...)
      if (url && (url.includes('access_token') || url.includes('refresh_token'))) {
        // Ambil bagian setelah '#'
        const hash = url.split('#')[1];
        if (hash) {
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
                supabase.auth.setSession({
                    access_token,
                    refresh_token,
                }).then(() => {
                    console.log("✅ Session restored from URL");
                });
            }
        }
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Simulasi loading aset
    setTimeout(() => {
      setAppReady(true);
    }, 2000);

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const checkUserRole = async (userId: string | undefined) => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data?.role === 'dosen' || data?.role === 'kordas') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.log('Error checking role:', e);
    }
  };

  if (!appReady || loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {session && session.user ? (
        isAdmin ? <AdminNavigator /> : <AppNavigator />
      ) : (
        <LoginScreen /> 
      )}
    </NavigationContainer>
  );
}