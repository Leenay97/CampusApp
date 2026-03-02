'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

interface JWTPayload {
  userId: string;
  userLevel: string;
  iat?: number;
  exp?: number;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      try {
        const token = localStorage.getItem('token');
        console.log(token);
        if (!token) {
          console.log('NO TOKEN');
          router.push('/login');
          return;
        }

        const decoded = jwtDecode<JWTPayload>(token);
        console.log('User is authorized:', decoded);
        console.log(allowedRoles, decoded.userLevel);

        if (allowedRoles && !allowedRoles.includes(decoded.userLevel)) {
          router.push('/not-found');
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('Invalid token', err);
        localStorage.removeItem('token');
        router.push('/');
      }
    };

    checkAuth();
  }, [allowedRoles, router]);

  if (isAuthorized === null) return <p>Проверка доступа...</p>;

  return <>{children}</>;
};
