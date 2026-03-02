'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedToken = localStorage.getItem('token');
    console.log('Token:', storedToken);
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      return { ...JSON.parse(storedUser), token: storedToken };
    }
    return null;
  });
  console.log(user);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
