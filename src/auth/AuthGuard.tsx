'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import AuthLoading from './AuthLoading';

interface AuthGuardProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

interface JWTPayload {
  id: string;
  userLevel: string;
  seasonId: string;
  today: number;
  todayPlace: string;
  iat?: number;
  exp?: number;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const getUserId = (): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return decoded.id;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  };
  const userId = getUserId();

  // Запрос данных пользователя (оставляем как есть)
  const { data, loading } = useQuery(queries.GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  useEffect(() => {
    const checkAuth = () => {
      if (!userId) {
        router.push('/login');
        return;
      }

      if (!user && data?.user) {
        setUser(data.user);
      }

      if (allowedRoles && data?.user && !allowedRoles.includes(data.user.userLevel)) {
        router.push('/not-found');
        return;
      }

      if (data?.user || user) {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [user, data, allowedRoles, router, userId, setUser]);

  if (isAuthorized === null || loading) return <AuthLoading />;

  return <>{children}</>;
};
