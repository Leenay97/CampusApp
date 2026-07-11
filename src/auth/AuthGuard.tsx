'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '@/contexts/UserContext';
import { useApp } from '@/contexts/AppContext';
import { useQuery, useLazyQuery } from '@apollo/client';
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

interface GroupPlace {
  date: number;
  placeId: string;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { user, setUser } = useUser();
  const { app, setApp } = useApp();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [getPlace, { data: placeData }] = useLazyQuery(queries.GET_PLACE);

  function getUserId(): string | null {
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
  }

  const userId = getUserId();

  const { data, loading, error } = useQuery(queries.GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  // Синхронизируем контекст при каждом обновлении данных (не только при первом):
  // так монеты/жизни в шапке подхватывают изменения кэша после мутаций.
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  // Токен есть, но сервер пользователя не отдал (истёк/отозван токен, юзер
  // удалён) — разлогиниваем вместо вечного спиннера. Чистые сетевые сбои
  // не трогаем, чтобы не выкидывать офлайн-пользователя.
  useEffect(() => {
    if (!userId || loading) return;

    const authFailed = error && error.graphQLErrors.length > 0;
    const userMissing = !error && data && !data.user;

    if (authFailed || userMissing) {
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login');
    }
  }, [userId, loading, error, data, setUser, router]);

  useEffect(() => {
    if (user && !app?.todayPlace && user.group?.places) {
      try {
        const places = JSON.parse(user.group.places) as GroupPlace[];
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const todayPlaceData = places.find((p) => {
          const placeDate = new Date(p.date).setHours(0, 0, 0, 0);
          return placeDate === todayStart;
        });

        if (todayPlaceData?.placeId) {
          getPlace({ variables: { id: todayPlaceData.placeId } });
        }
      } catch (e) {
        console.error('Error parsing places', e);
      }
    }
  }, [user, app?.todayPlace, getPlace]);

  useEffect(() => {
    if (placeData?.place && app && !app.todayPlace) {
      setApp({
        ...app,
        todayPlace: placeData.place,
      });
    }
  }, [placeData, app, setApp]);

  useEffect(() => {
    function checkAuth() {
      if (!userId) {
        router.push('/login');
        return;
      }

      if (user && allowedRoles && !allowedRoles.includes(user.userLevel)) {
        router.push('/not-found');
        return;
      }

      if (user) {
        setIsAuthorized(true);
      }
    }

    checkAuth();
  }, [user, allowedRoles, router, userId]);

  if (isAuthorized === null || loading) return <AuthLoading />;

  return <>{children}</>;
}
