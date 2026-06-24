'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ModalError from '@components/ModalError/ModalError';

type ErrorContextType = {
  showError: (message: string) => void;
};

type ErrorProviderProps = {
  children: ReactNode;
};

const ErrorContext = createContext<ErrorContextType | null>(null);

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<string | null>(null);

  function showError(message: string) {
    setError(message);
  }

  function closeError() {
    setError(null);
  }

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <ModalError text={error || ''} isOpen={!!error} onClose={closeError} />
    </ErrorContext.Provider>
  );
}

export function useGlobalError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used inside ErrorProvider');
  }
  return context;
}
