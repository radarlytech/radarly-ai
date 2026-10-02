'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthUser, UserProfile } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  updateUserPlan: (plan: AuthUser['plan']) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Vance',
  role: 'Full Stack & AI Engineer',
  skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python', 'AI Agents'],
  portfolioUrl: 'https://github.com',
  turnaround: '24 - 48 Hours',
  pricingAnchor: '$4,000 / project ($85/hr)',
  customPitchInstructions: 'Highlight immediate availability, technical confidence, and proven production work.'
};

const DEFAULT_DEMO_USER: AuthUser = {
  id: 'usr_founder_demo',
  name: 'Alex Vance',
  email: 'alex@radarly.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  plan: 'pro',
  createdAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth
  useEffect(() => {
    const supabase = createClient();

    if (supabase) {
      // 1. Supabase Live Backend Mode
      const fetchSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Member',
              avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
              plan: 'pro',
              createdAt: session.user.created_at
            };
            setUser(authUser);

            // Fetch profile data from table
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfile({
                name: profileData.name || authUser.name,
                role: profileData.role || DEFAULT_PROFILE.role,
                skills: profileData.skills || DEFAULT_PROFILE.skills,
                portfolioUrl: profileData.portfolio_url || DEFAULT_PROFILE.portfolioUrl,
                turnaround: profileData.turnaround || DEFAULT_PROFILE.turnaround,
                pricingAnchor: profileData.pricing_anchor || DEFAULT_PROFILE.pricingAnchor,
                customPitchInstructions: profileData.custom_pitch_instructions || DEFAULT_PROFILE.customPitchInstructions
              });
              if (profileData.plan) {
                setUser((prev) => (prev ? { ...prev, plan: profileData.plan } : prev));
              }
            }
          }
        } catch (err) {
          console.warn('Error fetching Supabase session:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Member',
            avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || session.user.id)}`,
            plan: 'pro',
            createdAt: session.user.created_at
          };
          setUser(authUser);

          // Fetch profile asynchronously
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfile({
                name: profileData.name || authUser.name,
                role: profileData.role || DEFAULT_PROFILE.role,
                skills: profileData.skills || DEFAULT_PROFILE.skills,
                portfolioUrl: profileData.portfolio_url || DEFAULT_PROFILE.portfolioUrl,
                turnaround: profileData.turnaround || DEFAULT_PROFILE.turnaround,
                pricingAnchor: profileData.pricing_anchor || DEFAULT_PROFILE.pricingAnchor,
                customPitchInstructions: profileData.custom_pitch_instructions || DEFAULT_PROFILE.customPitchInstructions
              });
              if (profileData.plan) {
                setUser((prev) => (prev ? { ...prev, plan: profileData.plan } : prev));
              }
            }
          } catch (e) {
            console.warn('Could not fetch updated profile:', e);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Local Session Storage Fallback Mode
      try {
        const savedUser = localStorage.getItem('Radarly_auth_user');
        const savedProfile = localStorage.getItem('Radarly_profile');

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(DEFAULT_DEMO_USER);
        }

        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (err) {
        setUser(DEFAULT_DEMO_USER);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Sign In
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient();
    setIsLoading(true);

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      setIsLoading(false);
      if (error) return { success: false, error: error.message };

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
          plan: 'pro',
          createdAt: data.user.created_at
        };
        setUser(authUser);
      }
      return { success: true };
    } else {
      // Local fallback signin
      const authUser: AuthUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        plan: 'pro',
        createdAt: new Date().toISOString()
      };
      setUser(authUser);
      setProfile((prev) => ({ ...prev, name: authUser.name }));
      localStorage.setItem('Radarly_auth_user', JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true };
    }
  };

  // Sign Up
  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient();
    setIsLoading(true);

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
          }
        }
      });
      setIsLoading(false);
      if (error) return { success: false, error: error.message };

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: name || email.split('@')[0],
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          plan: 'free',
          createdAt: data.user.created_at
        };
        setUser(authUser);
      }
      return { success: true };
    } else {
      // Local fallback signup
      const authUser: AuthUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        name: name || email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        plan: 'pro',
        createdAt: new Date().toISOString()
      };
      setUser(authUser);
      setProfile((prev) => ({ ...prev, name: authUser.name }));
      localStorage.setItem('Radarly_auth_user', JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true };
    }
  };

  // Google OAuth
  const signInWithGoogle = async () => {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        throw error;
      }
    } else {
      const googleUser: AuthUser = {
        id: 'usr_google_' + Math.random().toString(36).substring(2, 8),
        name: 'Google User',
        email: 'alex.google@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        plan: 'founder',
        createdAt: new Date().toISOString()
      };
      setUser(googleUser);
      localStorage.setItem('Radarly_auth_user', JSON.stringify(googleUser));
    }
  };

  // Sign Out
  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    try {
      localStorage.removeItem('Radarly_auth_user');
    } catch (e) {}
  };

  // Update Profile
  const updateProfile = async (updated: Partial<UserProfile>) => {
    const nextProfile = { ...profile, ...updated };
    setProfile(nextProfile);

    try {
      localStorage.setItem('Radarly_profile', JSON.stringify(nextProfile));
    } catch (e) {}

    const supabase = createClient();
    if (supabase && user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: nextProfile.name,
        role: nextProfile.role,
        skills: nextProfile.skills,
        portfolio_url: nextProfile.portfolioUrl,
        turnaround: nextProfile.turnaround,
        pricing_anchor: nextProfile.pricingAnchor,
        custom_pitch_instructions: nextProfile.customPitchInstructions,
        updated_at: new Date().toISOString()
      });
    }
  };

  // Update Plan
  const updateUserPlan = (plan: AuthUser['plan']) => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      try {
        localStorage.setItem('Radarly_auth_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        updateUserPlan
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
