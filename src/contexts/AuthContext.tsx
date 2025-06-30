import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { AuthService } from '../lib/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<User>;
  signOut: () => Promise<void>;
  registerCompany: (companyData: any, userData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to normalize user role to lowercase
  const normalizeUserRole = (user: User): User => {
    if (user && user.role) {
      return { ...user, role: user.role.toLowerCase() as UserRole };
    }
    return user;
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(normalizeUserRole(currentUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear any invalid stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      const user = await AuthService.signIn(email, password);
      const normalizedUser = normalizeUserRole(user);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<User> => {
    try {
      setLoading(true);
      const user = await AuthService.signUp(email, password, userData);
      const normalizedUser = normalizeUserRole(user);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registerCompany = async (companyData: any, userData: any): Promise<User> => {
    try {
      setLoading(true);
      const user = await AuthService.registerCompany(companyData, userData);
      const normalizedUser = normalizeUserRole(user);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error('Company registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    registerCompany
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};