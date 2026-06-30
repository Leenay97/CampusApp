import { ApolloClient, InMemoryCache, from, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';

if (process.env.NODE_ENV !== 'production') {
  loadDevMessages();
  loadErrorMessages();
}

let globalErrorHandler: ((message: string) => void) | null = null;

export function setGlobalErrorHandler(handler: (message: string) => void) {
  globalErrorHandler = handler;
}

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((err) => {
      globalErrorHandler?.(err.message);
    });
  }

  if (networkError) {
    globalErrorHandler?.('Ошибка сети. Проверьте подключение.');
  }
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL + '/graphql',
  credentials: 'same-origin',
});

// Replace http→ws and https→wss so both dev (http) and prod (https) work correctly.
const wsUrl =
  (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/^https/, 'wss').replace(/^http/, 'ws') + '/ws';

export const wsClient = createClient({
  url: wsUrl,
  // Only connect when there's an active subscription — prevents a WS handshake
  // on every page load and avoids iOS PWA blocking navigation with an open socket.
  lazy: true,
  connectionParams: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { authorization: `Bearer ${token}` } : {};
  },
  // Ping every 25s so Nginx's 30s proxy_read_timeout doesn't kill the connection.
  keepAlive: 25_000,
  retryAttempts: 5,
  shouldRetry: () => true,
});

const wsLink = new GraphQLWsLink(wsClient);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  uploadLink,
);

export const client = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache(),
});
