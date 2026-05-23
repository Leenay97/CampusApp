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
  seasonId: string;
  today: number;
  todayPlace: string;
  iat?: number;
  exp?: number;
}

interface GroupPlace {
  date: number;
  placeId: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const { user, setUser } = useUser();
  const { app, setApp } = useApp();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [getPlace, { data: placeData }] = useLazyQuery(queries.GET_PLACE);

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

  const { data, loading } = useQuery(queries.GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  useEffect(() => {
    if (data?.user && !user) {
      setUser(data.user);
    }
  }, [data, user, setUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !app) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setApp({
          seasonId: decoded.seasonId,
          today: Date.now(),
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [app, setApp]);

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
    const checkAuth = () => {
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
    };

    checkAuth();
  }, [user, allowedRoles, router, userId]);

  if (isAuthorized === null || loading) return <AuthLoading />;

  return <>{children}</>;
};
