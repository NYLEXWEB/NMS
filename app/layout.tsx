import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NMS — NYLEX Management System',
  description: 'Internal management system for NYLEX',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
