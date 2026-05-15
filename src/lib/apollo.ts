import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';

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

console.log(process.env.NEXT_PUBLIC_API_URL);

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL + '/graphql',
  credentials: 'same-origin',
});

export const client = new ApolloClient({
  link: from([errorLink, uploadLink]),
  cache: new InMemoryCache(),
});
