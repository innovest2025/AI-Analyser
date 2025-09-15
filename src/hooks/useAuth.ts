import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  display_name: string | null;
  role: 'admin' | 'manager' | 'operator';
  department: string | null;
  district_access: string[];
  email_notifications: boolean;
  sms_notifications: boolean;
  phone_number: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user signs in
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile({
          ...data,
          role: data.role as 'admin' | 'manager' | 'operator'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        role: data.role as 'admin' | 'manager' | 'operator'
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    return { error };
  };

  const logActivity = async (action: string, description?: string, unitId?: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('user-activities', {
        body: {
          action: 'log',
          userId: user.id,
          unitId,
          activityAction: action,
          description,
          metadata,
          ipAddress: null, // Would be populated server-side in production
          userAgent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    updateProfile,
    signOut,
    logActivity,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager' || profile?.role === 'admin',
    hasDistrictAccess: (district: string) => 
      profile?.role === 'admin' || 
      profile?.district_access.length === 0 || 
      profile?.district_access.includes(district)
  };
};