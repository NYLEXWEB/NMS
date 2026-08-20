import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'NMS — NYLEX Management System',
  description: 'Internal management system for NYLEX',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
