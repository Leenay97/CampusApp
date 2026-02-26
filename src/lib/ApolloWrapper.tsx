'use client';

import { ReactNode, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client, setGlobalErrorHandler } from './apollo';
import { ErrorProvider, useGlobalError } from './ErrorProvider';

function ApolloWithError({ children }: { children: ReactNode }) {
  const { showError } = useGlobalError();

  useEffect(() => {
    setGlobalErrorHandler(showError);
  }, [showError]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <ApolloWithError>{children}</ApolloWithError>
    </ErrorProvider>
  );
}
