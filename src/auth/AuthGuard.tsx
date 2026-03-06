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
  iat?: number;
  exp?: number;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Получаем userId из токена
  let userId: string | null = null;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        console.log(decoded);
        userId = decoded.id;
      } catch {
        localStorage.removeItem('token');
      }
    }
  }

  // Запрос user только если есть userId
  const { data, loading } = useQuery(queries.GET_USER, {
    variables: { id: userId },
    skip: !userId, // пропускаем запрос если userId нет
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
