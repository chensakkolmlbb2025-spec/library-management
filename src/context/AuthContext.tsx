import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, type Profile as DBProfile } from '@/lib/database';

export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextType {
  user: DBProfile | null;
  profile: Profile | null;
  session: { user: DBProfile } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'glasslib_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DBProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<{ user: DBProfile } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkSession = () => {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          setUser(parsedSession.user);
          setProfile({
            id: parsedSession.user.id,
            email: parsedSession.user.email,
            full_name: parsedSession.user.full_name,
            role: parsedSession.user.role,
          });
          setSession(parsedSession);
        } catch (error) {
          console.error('Error parsing session:', error);
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, error } = await db.login(email, password);

      if (error || !loggedInUser) {
        throw error || new Error('Login failed');
      }

      const newSession = { user: loggedInUser };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

      setUser(loggedInUser);
      setProfile({
        id: loggedInUser.id,
        email: loggedInUser.email,
        full_name: loggedInUser.full_name,
        role: loggedInUser.role,
      });
      setSession(newSession);
    } catch (err) {
      const e = err as Error;
      throw new Error(e?.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { user: newUser, error } = await db.signup(email, password, fullName, role);

      if (error || !newUser) {
        throw error || new Error('Signup failed');
      }

      const newSession = { user: newUser };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

      setUser(newUser);
      setProfile({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      });
      setSession(newSession);
    } catch (err) {
      const e = err as Error;
      throw new Error(e?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        session, 
        login,
        signup, 
        logout, 
        isAuthenticated: !!user,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
