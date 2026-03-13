'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/ApolloWrapper';
import { UserProvider } from '@/contexts/UserContext';
import { AppProvider } from '@/contexts/AppContext';
import ModalLoading from '@/components/ModalLoading/ModalLoading';
import { useLoading } from '@/contexts/LoadingContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  function ModalLoadingWrapper() {
    const { loadingState, hideLoading } = useLoading();

    if (!loadingState) return null;

    return <ModalLoading loadingState={loadingState} onClose={hideLoading} />;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/bg-colored.png" as="image" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
