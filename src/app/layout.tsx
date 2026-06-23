'use client';
import './globals.css';
import { roboto } from './fonts';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <link rel="preload" href="/bg-colored.png" as="image" />
      </head>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
