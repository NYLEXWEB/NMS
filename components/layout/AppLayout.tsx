'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from 'sonner';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
            {/* Desktop Sidebar (hidden on mobile) */}
            <div className="hidden lg:block shrink-0">
                <Sidebar />
            </div>

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
                <Header />
                <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
};
