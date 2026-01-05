import 'react-native-gesture-handler'; // <--- Add this at the very top
import { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabaseClient';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      console.log('🔗 Incoming Deep Link:', url);

      // 1. Try standard parsing first
      let { queryParams } = Linking.parse(url);
      
      // 2. If that failed, manually check for the Hash (#)
      if (!queryParams?.access_token && url.includes('#')) {
        const hashIndex = url.indexOf('#');
        const hashString = url.substring(hashIndex + 1); // Get everything after '#'
        
        // Manual parsing: "key=value&key2=value2" -> Object
        const hashParams: Record<string, string> = {};
        hashString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) hashParams[key] = decodeURIComponent(value);
        });
        
        console.log('wc Manual Hash Parse Result:', hashParams);
        queryParams = hashParams; // Override with our manual result
      }

      console.log('🧩 Final Params:', queryParams);

      // 3. Set Session if we found the tokens
      if (queryParams?.access_token && queryParams?.refresh_token) {
        console.log('✅ Tokens found! Setting session...');
        
        supabase.auth.setSession({
          access_token: queryParams.access_token as string,
          refresh_token: queryParams.refresh_token as string,
        });
      } else {
        console.log('⚠️ App opened, but still no tokens found.');
      }
    }
  }, [url]);

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