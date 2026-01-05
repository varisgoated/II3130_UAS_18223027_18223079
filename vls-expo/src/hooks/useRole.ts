// vls-expo/src/hooks/useRole.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          
          setRole(data?.role || 'user');
        } catch (err) {
          console.error('Error fetching user role:', err);
          setRole('user'); // Default to 'user' on error
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setRole(null);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
};
