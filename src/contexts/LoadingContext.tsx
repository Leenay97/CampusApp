'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { LoadingType } from '@/app/types';

type LoadingContextType = {
  showLoading: (state?: LoadingType) => void;
  hideLoading: () => void;
  loadingState: LoadingType | null;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

type LoadingProviderProps = {
  children: ReactNode;
};

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingType | null>(null);

  function showLoading(state: LoadingType = 'LOADING') {
    setLoadingState(state);
  }
  function hideLoading() {
    setLoadingState(null);
  }

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, loadingState }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
}
