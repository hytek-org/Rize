import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { auth } from '../../firebase.config';
import { signInWithGoogle } from './google-auth';
import * as service from './auth-service';
import type { AuthContextValue } from './auth-types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setIsLoading(false);
  }), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: user !== null,
    signInWithEmail: async (email, password) => { await service.signInWithEmail(email, password); },
    signUpWithEmail: async (email, password) => { await service.signUpWithEmail(email, password); },
    signInWithGoogle,
    signOut: service.signOut,
    sendPasswordReset: async (email) => { await service.sendPasswordReset(email); },
  }), [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}