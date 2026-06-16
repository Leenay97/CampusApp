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

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') + '/graphql',
  }),
);

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
