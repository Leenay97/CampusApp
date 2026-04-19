declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client';

  export interface UploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: Record<string, string>;
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
}
