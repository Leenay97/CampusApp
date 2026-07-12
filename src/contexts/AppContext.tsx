'use client';
import { Place } from '@/app/types';
import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQuery, useLazyQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { useUser } from '@/contexts/UserContext';

export type AppValueContextType = {
  seasonId: string;
  today: number;
  todayPlace?: Place | null;
};

interface JWTPayload {
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

type AppProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: AppProviderProps) {
  const [app, setApp] = useState<AppValueContextType | null>(null);

  const userDataProcessed = useRef(false);
  const placeIdRef = useRef<string | null>(null);
  const todayRef = useRef<number>(Date.now());

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

  // Токен читается из localStorage только при рендере, а корневой провайдер
  // при soft-навигации Next.js не перерендеривается — после логина он бы так
  // и не узнал о токене. Подписка на UserContext (setUser вызывают логин-
  // страница и AuthGuard) даёт ре-рендер, на котором токен перечитывается.
  const { user } = useUser();
  const userId = user?.id ?? getUserId();

  const { data: userData } = useQuery(queries.GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  // Сезон берём с сервера, а не из JWT: токен мог быть выдан до смены сезона,
  // а токены регистрации вообще не содержат seasonId.
  const { data: seasonData, error: seasonError } = useQuery(queries.GET_ACTIVE_SEASON, {
    skip: !userId,
  });

  // Ошибка запроса (нет активного сезона) тоже завершает инициализацию —
  // app создаётся с пустым seasonId, зависимые страницы просто скипают запросы.
  if (!app && userId && (seasonData || seasonError)) {
    setApp({
      seasonId: seasonData?.activeSeason?.id ?? '',
      today: todayRef.current,
    });
  }

  if (userData && !userDataProcessed.current && app) {
    try {
      if (userData?.user?.group?.places) {
        const places = JSON.parse(userData.user.group.places) as GroupPlace[];
        const todayStart = new Date(todayRef.current).setHours(0, 0, 0, 0);

        const todayPlaceData = places.find((p) => {
          const placeDate = new Date(p.date).setHours(0, 0, 0, 0);
          return placeDate === todayStart;
        });

        if (todayPlaceData?.placeId && !placeIdRef.current) {
          placeIdRef.current = todayPlaceData.placeId;
          getPlace({ variables: { id: todayPlaceData.placeId } });
        }
      }

      userDataProcessed.current = true;
    } catch (e) {
      console.error('Error parsing places', e);
      userDataProcessed.current = true;
    }
  }

  if (placeData?.place && app && !app.todayPlace) {
    setApp({
      ...app,
      todayPlace: placeData.place,
    });
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
