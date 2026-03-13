'use client';
import { Place } from '@/app/types';
import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQuery, useLazyQuery } from '@apollo/client';
import queries from '@/graphql/queries';

export type AppValueContextType = {
  seasonId: string;
  today: number;
  todayPlace?: Place | null;
};

interface JWTPayload {
  seasonId: string;
  id: string;
}

interface GroupPlace {
  date: number;
  placeId: string;
}

interface AppContextType {
  app: AppValueContextType | null;
  setApp: (app: AppValueContextType | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<AppValueContextType | null>(null);

  // Refs
  const tokenProcessed = useRef(false);
  const userDataProcessed = useRef(false);
  const placeIdRef = useRef<string | null>(null);
  const todayRef = useRef<number>(Date.now());

  // Lazy query для получения места
  const [getPlace, { data: placeData }] = useLazyQuery(queries.GET_PLACE);

  // Получение userId из токена (синхронно)
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

  // Запрос данных пользователя
  const { data: userData } = useQuery(queries.GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  // ИНИЦИАЛИЗАЦИЯ APP: синхронно во время рендера!
  if (!tokenProcessed.current && typeof window !== 'undefined' && !app) {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);

        setApp({
          seasonId: decoded.seasonId,
          today: todayRef.current,
        });
        console.log('AppContext initialized with seasonId:', decoded.seasonId);

        tokenProcessed.current = true;
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }

  // ОБРАБОТКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ: синхронно во время рендера!
  if (userData && !userDataProcessed.current && app) {
    try {
      if (userData?.user?.group?.places) {
        const places = JSON.parse(userData.user.group.places) as GroupPlace[];
        const todayStart = new Date(todayRef.current).setHours(0, 0, 0, 0);

        const todayPlaceData = places.find((p) => {
          const placeDate = new Date(p.date).setHours(0, 0, 0, 0);
          return placeDate === todayStart;
        });

        if (todayPlaceData?.placeId) {
          placeIdRef.current = todayPlaceData.placeId;
          // Запускаем запрос места (это не setState, это вызов функции)
          getPlace({ variables: { id: todayPlaceData.placeId } });
        }
      }

      userDataProcessed.current = true;
    } catch (e) {
      console.error('Error parsing places', e);
      userDataProcessed.current = true;
    }
  }

  // ОБРАБОТКА ДАННЫХ МЕСТА: синхронно во время рендера!
  if (placeData?.place && app && !app.todayPlace) {
    setApp({
      ...app,
      todayPlace: placeData.place,
    });
    console.log('AppContext updated with full place:', placeData.place.name);
  }

  return <AppContext.Provider value={{ app, setApp }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
