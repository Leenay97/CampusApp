'use client';
import './globals.css';
import { ApolloWrapper } from '@/lib/ApolloWrapper';
import { UserProvider } from '@/contexts/UserContext';
import { AppProvider } from '@/contexts/AppContext';
import ModalLoading from '@/components/ModalLoading/ModalLoading';
import { useLoading } from '@/contexts/LoadingContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { roboto } from './fonts';

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  function ModalLoadingWrapper() {
    const { loadingState, hideLoading } = useLoading();

    if (!loadingState) return null;

    return <ModalLoading loadingState={loadingState} onClose={hideLoading} />;
  }

  return (
    <html lang="en" className={roboto.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <link rel="preload" href="/bg-colored.png" as="image" />
      </head>
      <body className={`antialiased`}>
        <ApolloWrapper>
          <LoadingProvider>
            <UserProvider>
              <AppProvider>
                {children}
                <ModalLoadingWrapper />
                <div id="modal-root" />
              </AppProvider>
            </UserProvider>
          </LoadingProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
