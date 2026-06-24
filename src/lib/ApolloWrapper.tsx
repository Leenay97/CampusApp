'use client';

import { ReactNode, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client, setGlobalErrorHandler } from './apollo';
import { ErrorProvider, useGlobalError } from './ErrorProvider';

type ApolloWrapperProps = {
  children: ReactNode;
};

function ApolloWithError({ children }: ApolloWrapperProps) {
  const { showError } = useGlobalError();

  useEffect(() => {
    setGlobalErrorHandler(showError);
  }, [showError]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ErrorProvider>
      <ApolloWithError>{children}</ApolloWithError>
    </ErrorProvider>
  );
}
