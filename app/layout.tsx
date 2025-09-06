import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NetworkStatus from '@/components/NetworkStatus';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFTix - Blockchain Event Ticketing',
  description: 'Secure, transparent, and fraud-proof NFT tickets on the Somnia blockchain',
  icons: {
    icon: '/icon2.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <NetworkStatus /> */}
        {children}
      </body>
    </html>
  );
}