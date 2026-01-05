import { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabaseClient';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const url = Linking.useURL();

if (url) {
  const { hostname, path, queryParams } = Linking.parse(url);
  
  if (hostname === 'login' && queryParams?.access_token && queryParams?.refresh_token) {
    supabase.auth.setSession({
      access_token: queryParams.access_token as string,
      refresh_token: queryParams.refresh_token as string,
    });
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    session && session.user ? <AppNavigator /> : <LoginScreen />
  );
}


