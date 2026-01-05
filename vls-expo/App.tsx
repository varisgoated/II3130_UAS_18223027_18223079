import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

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
    // 1. Fungsi untuk mengecek peran user
    const checkUserRole = async (userId: string) => {
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

    // 2. Ambil sesi saat ini (Initial Session)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user.id);
      setLoading(false);
    });

    // 3. Dengarkan perubahan status autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      setSession(session);
      
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setIsAdmin(false);
      }

      // Khusus Web: Jika berhasil SIGNED_IN dari magic link, bersihkan hash di URL
      if (event === 'SIGNED_IN' && Platform.OS === 'web') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    // 4. KHUSUS WEB: Tangkap token Magic Link dari URL Fragment (#)
    if (Platform.OS === 'web') {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
        // Biarkan Supabase menangani token di URL secara otomatis melalui getSession
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            checkUserRole(session.user.id);
          }
        });
      }
    }

    // 5. MOBILE: Dengarkan Deep Link (Android/iOS)
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url && (url.includes('access_token') || url.includes('refresh_token'))) {
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
              console.log("✅ Session restored from Deep Link");
            });
          }
        }
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Simulasi loading Splash Screen
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 2000);

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
      clearTimeout(timer);
    };
  }, []);

  if (!appReady || loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {session && session.user ? (
        <AppNavigator />
      ) : (
        <LoginScreen /> 
      )}
    </NavigationContainer>
  );
}