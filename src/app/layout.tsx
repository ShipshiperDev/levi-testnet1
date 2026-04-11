import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'LEVI — Onchain Research AI',
  description: 'An AI-powered onchain research agent built for Tempo. Turning blockchain data into real-time intelligence.',
  openGraph: {
    title: 'LEVI — Onchain Research AI',
    description: 'An AI-powered onchain research agent built for Tempo. Turning blockchain data into real-time intelligence.',
    type: 'website',
  },
  themeColor: '#07070a',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
