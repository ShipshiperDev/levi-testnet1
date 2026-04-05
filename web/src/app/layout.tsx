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
