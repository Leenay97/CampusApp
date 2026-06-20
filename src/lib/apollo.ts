import { ApolloClient, InMemoryCache, from, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

let globalErrorHandler: ((message: string) => void) | null = null;

export const setGlobalErrorHandler = (handler: (message: string) => void) => {
  globalErrorHandler = handler;
};

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

let wsLink: GraphQLWsLink | null = null;
if (typeof window !== 'undefined' && typeof WebSocket !== 'undefined') {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const urlObj = new URL(apiUrl);
    const wsProtocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = urlObj.host;
    const wsUrl = `${wsProtocol}//${wsHost}/api/graphql`;

    wsLink = new GraphQLWsLink(
      createClient({
        url: wsUrl,
      }),
    );
  } catch (e) {
    console.error('Не удалось создать wsLink:', e);
    wsLink = null;
  }
}

const link = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      from([errorLink, uploadLink]),
    )
  : from([errorLink, uploadLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
