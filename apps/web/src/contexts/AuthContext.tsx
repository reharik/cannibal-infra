import { useQuery } from '@apollo/client/react';
import type { User } from '@packages/contracts';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ViewerDocument } from '../graphql/generated/types';
import { useApiFetchBase } from '../hooks/apiFetch/useApiFetch';

type AuthActionResult = { ok: true } | { ok: false; message: string };

interface AuthContextType {
  user: User | undefined;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthActionResult>;

  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('authToken'));
  const { apiFetch } = useApiFetchBase();

  const {
    data: viewerData,
    loading: viewerLoading,
    error: viewerError,
    refetch: refetchViewer,
  } = useQuery(ViewerDocument, {
    skip: !hasToken,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (viewerData?.viewer) {
      setUser({
        id: viewerData.viewer.id,
        firstName: viewerData.viewer.firstName,
        lastName: viewerData.viewer.lastName,
      } as User);
    } else if (!viewerLoading && !viewerData?.viewer && hasToken) {
      setUser(undefined);
      localStorage.removeItem('authToken');
      setHasToken(false);
    }
  }, [viewerData, viewerLoading, hasToken]);

  useEffect(() => {
    if (viewerError) {
      console.error('Viewer query failed:', viewerError);
      localStorage.removeItem('authToken');
      setHasToken(false);
      setUser(undefined);
    }
  }, [viewerError]);

  const login = async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const data = await apiFetch<{ user: User; token: string }>(`/auth/login`, {
        method: 'POST',
        body: { email, password },
      });

      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        setHasToken(true);
        await refetchViewer();
        return { ok: true };
      }
      return { ok: false, message: data.error };
    } catch (error) {
      console.error('Login failed:', error);
      return { ok: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<AuthActionResult> => {
    try {
      const data = await apiFetch<{ user: User; token: string }>(`/auth/signup`, {
        method: 'POST',
        body: { email, password, name },
      });

      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        setHasToken(true);
        await refetchViewer();
        return { ok: true };
      }
      return { ok: false, message: data.error };
    } catch (error) {
      console.error('Signup exception:', error);
      return { ok: false, message: error instanceof Error ? error.message : 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(undefined);
    setHasToken(false);
    localStorage.removeItem('authToken');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading: viewerLoading,
    isAuthenticated: !!viewerData?.viewer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
