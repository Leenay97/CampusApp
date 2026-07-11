'use client';
import { User } from '@/app/types';
import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

type UserProviderProps = {
  children: ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: UserProviderProps) {
  // Пользователь не хранится в localStorage — после перезагрузки страницы
  // его заново загружает AuthGuard через GET_USER.
  const [user, setUser] = useState<User | null>(null);

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
