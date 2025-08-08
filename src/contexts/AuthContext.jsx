import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInWithGoogle, signOutUser } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInAsRole = async (role) => {
    try {
      // For professor login, we'll use a simple role-based authentication
      // For student login, we'll set the role without requiring authentication
      if (role === 'professor') {
        // Create a mock user for professor
        const mockUser = {
          id: 'professor-1',
          email: 'aniket@2004',
          role: 'professor'
        };
        setUser(mockUser);
        setUserRole('professor');
        return mockUser;
      } else if (role === 'student') {
        // Create a mock user for student
        const mockUser = {
          id: 'student-1',
          email: 'student@example.com',
          role: 'student'
        };
        setUser(mockUser);
        setUserRole('student');
        return mockUser;
      }
    } catch (error) {
      console.error('Sign in as role error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUserRole(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    signIn,
    signInAsRole,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 