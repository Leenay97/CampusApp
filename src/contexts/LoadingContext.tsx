'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { LoadingType } from '@/app/types';

type LoadingContextType = {
  showLoading: (state?: LoadingType) => void;
  hideLoading: () => void;
  loadingState: LoadingType | null;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingState, setLoadingState] = useState<LoadingType | null>(null);

  const showLoading = (state: LoadingType = 'LOADING') => setLoadingState(state);
  const hideLoading = () => setLoadingState(null);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, loadingState }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};
